/**
 * 補助金解説スライド動画 完全自動生成スクリプト（HeyGen Video Agent API）
 * 実行: npx tsx scripts/heygen/generate-heygen-agent.ts [subsidyId]
 *
 * 処理フロー:
 *   1. DB から補助金データを取得
 *   2. 6シーン分のスライドSVGを生成 → PNG化（Resvg）
 *   3. PNG を HeyGen Assets API にアップロード → asset_id 取得
 *   4. 固定ナレーション原稿 + asset_id を Video Agent API に送信
 *   5. 桜庭さんの voice_id を指定
 *   6. ポーリングして video_url を取得・表示
 *
 * 必要な環境変数:
 *   HEYGEN_API_KEY   — HeyGen API キー
 */

import * as dotenv from "dotenv";
import * as path from "path";
import fs from "node:fs/promises";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { Resvg } from "@resvg/resvg-js";
import QRCode from "qrcode";
import { prisma } from "@/lib/db/prisma";
import { cleanSubsidyName, cleanSubsidyDescription } from "@/lib/subsidyCheckResultHelpers";
import { resolveVideoFontPath } from "@/lib/video/fonts";

// ─────────────────────────────────────────────────────────────
// 設定
// ─────────────────────────────────────────────────────────────
const API_KEY = process.env.HEYGEN_API_KEY ?? "";
if (!API_KEY) {
  console.error("❌ HEYGEN_API_KEY が .env に設定されていません。");
  process.exit(1);
}

/** 桜庭さんのボイスクローン（HeyGen） */
const SAKURABA_VOICE_ID = "6c2b2c234a604057a90578e18e10c211";

/** 遷移先（QR・表示）— 正しい本番URL */
const SITE_URL_FULL = "https://subsidy-nts-v2.vercel.app/subsidies";
const SITE_URL_DISPLAY = "subsidy-nts-v2.vercel.app/subsidies";

const HEYGEN_BASE = "https://api.heygen.com";
const HEADERS_JSON = {
  "X-Api-Key": API_KEY,
  "Content-Type": "application/json",
} as const;

const W = 1280;
const H = 720;
const FONT = "Noto Sans CJK JP";

// ─────────────────────────────────────────────────────────────
// ヘルパー
// ─────────────────────────────────────────────────────────────
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

function toJaDate(value: unknown): string | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

/** 申請期限を整形（ISO・RFC・通常ラベル・Date すべてに対応） */
function normalizeDeadline(label: string | null, deadline: Date | null): string {
  if (label) {
    const trimmed = label.trim();
    // ISO風（2025-05-19T...）
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      const ja = toJaDate(trimmed);
      if (ja) return ja;
    }
    // RFC 2822 形式（"Fri, 06 Feb 2026 07:55:38 +0000" 等）
    else if (/^\w{3,},\s+\d{1,2}\s+\w{3,}\s+\d{4}/.test(trimmed)) {
      const parsed = new Date(trimmed);
      if (!isNaN(parsed.getTime())) {
        const ja = toJaDate(parsed);
        if (ja) return ja;
      }
    }
    // 「2025年5月19日まで」等の人間向けラベルはそのまま
    else {
      return trimmed;
    }
  }
  return toJaDate(deadline) || "公募中";
}

/** 表示・音声で共通の日本語表記ゆれ・TTS誤読を正規化する */
function normalizeJaText(s: string): string {
  if (!s) return s;
  return s
    .replace(/中小・小規模/g, "中小規模")
    .replace(/高止まり/g, "高騰");
}

/** 金額表示用: "3,000,000円" → "300万円" に変換してすっきり見せる */
function formatAmountDisp(amount: string): string {
  return amount.replace(/\s/g, "").replace(/([\d,]+)\s*円/g, (_, n: string) => {
    const num = parseInt(n.replace(/,/g, ""), 10);
    if (Number.isFinite(num) && num >= 10_000) {
      const man = Math.floor(num / 10_000);
      const rem = num % 10_000;
      return rem > 0 ? `${man}万${rem.toLocaleString("ja-JP")}円` : `${man}万円`;
    }
    return n + "円";
  });
}

/** 概要を文の途中で切らずに整形する */
function trimDescription(desc: string, maxLen: number): string {
  if (desc.length <= maxLen) return desc;
  const slice = desc.slice(0, maxLen);
  const lastPeriod = slice.lastIndexOf("。");
  if (lastPeriod > maxLen * 0.5) return slice.slice(0, lastPeriod + 1);
  return slice + "…";
}

/** 句読点・最大文字数で改行する */
function wrapTextByChars(text: string, maxChars: number): string[] {
  if (!text) return [];
  const out: string[] = [];
  let row = "";
  for (const ch of text) {
    row += ch;
    if (row.length >= maxChars || /[、。]/.test(ch)) {
      out.push(row);
      row = "";
    }
  }
  if (row) out.push(row);
  return out;
}

// ─────────────────────────────────────────────────────────────
// ひらがな読み変換ヘルパー
// ─────────────────────────────────────────────────────────────

/** 正の整数をひらがな読みに変換（億・万・千・百・十・一まで対応） */
function numToJaReading(n: number): string {
  if (n === 0) return "ぜろ";
  if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n)) return String(n);

  const ONES = ["", "いち", "に", "さん", "よん", "ご", "ろく", "なな", "はち", "きゅう"];
  let result = "";
  let rem = n;

  // 億の位
  const oku = Math.floor(rem / 100_000_000);
  if (oku > 0) { result += ONES[oku] + "おく"; rem %= 100_000_000; }

  // 万の位（1万以上は再帰）
  const man = Math.floor(rem / 10_000);
  if (man > 0) { result += (man === 1 ? "いち" : numToJaReading(man)) + "まん"; rem %= 10_000; }

  // 千の位（特殊読み）
  const sen = Math.floor(rem / 1_000);
  if (sen > 0) {
    if (sen === 1) result += "せん";
    else if (sen === 3) result += "さんぜん";
    else if (sen === 8) result += "はっせん";
    else result += ONES[sen] + "せん";
    rem %= 1_000;
  }

  // 百の位（特殊読み）
  const hyaku = Math.floor(rem / 100);
  if (hyaku > 0) {
    if (hyaku === 1) result += "ひゃく";
    else if (hyaku === 3) result += "さんびゃく";
    else if (hyaku === 6) result += "ろっぴゃく";
    else if (hyaku === 8) result += "はっぴゃく";
    else result += ONES[hyaku] + "ひゃく";
    rem %= 100;
  }

  // 十の位
  const ju = Math.floor(rem / 10);
  if (ju > 0) { result += ju === 1 ? "じゅう" : ONES[ju] + "じゅう"; rem %= 10; }

  // 一の位
  if (rem > 0) result += ONES[rem];

  return result;
}

/** 金額文字列中の "N万円" / "N円" をひらがな読みに置換する
 *  例: "最大 300万円"     → "最大さんびゃくまんえん"
 *      "最大 1,500万円"   → "最大せんごひゃくまんえん"
 *      "最大3,000,000円"  → "最大さんびゃくまんえん"（万円換算）
 */
function amountToNarration(amount: string): string {
  return amount
    // 万円パターンを先に処理
    .replace(/([\d,]+)\s*万円/g, (_, numStr: string) => {
      const n = parseInt(numStr.replace(/,/g, ""), 10);
      return Number.isFinite(n) && n > 0 ? numToJaReading(n) + "まんえん" : numStr + "まんえん";
    })
    // 円パターン（10,000以上は万円に換算してから読む）
    .replace(/([\d,]+)\s*円/g, (_, numStr: string) => {
      const n = parseInt(numStr.replace(/,/g, ""), 10);
      if (!Number.isFinite(n) || n <= 0) return numStr + "えん";
      if (n >= 10_000) {
        const man = Math.floor(n / 10_000);
        const rem  = n % 10_000;
        return numToJaReading(man) + "まん" + (rem > 0 ? numToJaReading(rem) : "") + "えん";
      }
      return numToJaReading(n) + "えん";
    })
    .replace(/\s+/g, "");
}

/** 日にちの和語読み（ついたち・なのか・はつか 等の正しい読みに対応） */
function dayToReading(day: number): string {
  const SPECIAL: Record<number, string> = {
    1: "ついたち", 2: "ふつか", 3: "みっか", 4: "よっか", 5: "いつか",
    6: "むいか", 7: "なのか", 8: "ようか", 9: "ここのか", 10: "とおか",
    14: "じゅうよっか", 17: "じゅうしちにち", 19: "じゅうくにち", 20: "はつか",
    24: "にじゅうよっか", 27: "にじゅうしちにち", 29: "にじゅうくにち",
  };
  if (SPECIAL[day]) return SPECIAL[day];
  return numToJaReading(day) + "にち";
}

/** 申請期限ラベルをナレーション用ひらがな文に変換する
 *  例: "申請期限: 2026年6月7日" → "こうぼのしめきりは、にせんにじゅうろくねん、ろくがつ、なのかです"
 */
function deadlineToNarration(deadlineLabel: string): string {
  const MONTHS = [
    "", "いちがつ", "にがつ", "さんがつ", "しがつ", "ごがつ", "ろくがつ",
    "しちがつ", "はちがつ", "くがつ", "じゅうがつ", "じゅういちがつ", "じゅうにがつ",
  ];
  const raw = deadlineLabel.replace(/^申請期限[：:]\s*/, "").trim();

  // YYYY年M月D日（読点で区切って聞き取りやすく）
  const mD = raw.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
  if (mD) {
    const yr = numToJaReading(parseInt(mD[1])) + "ねん";
    const mo = MONTHS[parseInt(mD[2])];
    const dy = dayToReading(parseInt(mD[3]));
    return `こうぼのしめきりは、${yr}、${mo}、${dy}です`;
  }

  // YYYY年M月末
  const mM = raw.match(/(\d{4})年(\d{1,2})月末/);
  if (mM) {
    const yr = numToJaReading(parseInt(mM[1])) + "ねん";
    const mo = MONTHS[parseInt(mM[2])];
    return `こうぼのしめきりは、${yr}${mo}まつです`;
  }

  if (/^(公募中|随時)$/.test(raw)) return "げんざいこうぼちゅうです";
  return `こうぼのしめきりは${raw}です`;
}

/** 補助率（小数）→ 表示ラベル・ひらがな読み・割合値 に変換
 *  例: 0.5 → { label: "1/2", reading: "にぶんのいち", frac: 0.5 }
 */
function rateToInfo(rateRaw: unknown): { label: string; reading: string; frac: number } | null {
  if (rateRaw == null) return null;
  let frac = Number(rateRaw);
  if (!Number.isFinite(frac) || frac <= 0) return null;
  if (frac > 1) frac = frac / 100; // 50.00 のように%表記で入っている場合
  if (frac > 1) return null;

  const KNOWN: [number, string, string][] = [
    [1,      "全額",  "ぜんがく"],
    [9 / 10, "9/10", "じゅうぶんのきゅう"],
    [5 / 6,  "5/6",  "ろくぶんのご"],
    [4 / 5,  "4/5",  "ごぶんのよん"],
    [3 / 4,  "3/4",  "よんぶんのさん"],
    [2 / 3,  "2/3",  "さんぶんのに"],
    [3 / 5,  "3/5",  "ごぶんのさん"],
    [1 / 2,  "1/2",  "にぶんのいち"],
    [2 / 5,  "2/5",  "ごぶんのに"],
    [1 / 3,  "1/3",  "さんぶんのいち"],
    [1 / 4,  "1/4",  "よんぶんのいち"],
    [1 / 5,  "1/5",  "ごぶんのいち"],
  ];
  for (const [v, label, reading] of KNOWN) {
    if (Math.abs(frac - v) < 0.015) return { label, reading, frac: v };
  }
  const pct = Math.round(frac * 100);
  return { label: `${pct}%`, reading: `${numToJaReading(pct)}ぱーせんと`, frac };
}

// ─────────────────────────────────────────────────────────────
// DB 取得
// ─────────────────────────────────────────────────────────────
type Grant = {
  id: string;
  name: string | null;
  description: string | null;
  maxAmountLabel: string | null;
  subsidyAmount: bigint | null;
  subsidyRate: unknown | null;   // Prisma Decimal
  targetIndustryNote: string | null;
  targetIndustries: string[];
  deadlineLabel: string | null;
  deadline: Date | null;
};

async function fetchGrant(subsidyId?: string, skip = 0): Promise<Grant> {
  const sel = {
    id: true, name: true, description: true,
    maxAmountLabel: true, subsidyAmount: true, subsidyRate: true,
    targetIndustryNote: true, targetIndustries: true,
    deadlineLabel: true, deadline: true,
  } as const;

  if (subsidyId) {
    const g = await prisma.subsidyGrant.findUnique({ where: { id: subsidyId }, select: sel });
    if (!g) throw new Error(`SubsidyGrant not found: ${subsidyId}`);
    return g;
  }
  const grants = await prisma.subsidyGrant.findMany({
    where: { status: { in: ["open", "upcoming"] } },
    orderBy: [{ deadline: "asc" }, { syncedAt: "desc" }],
    select: sel,
    skip,
    take: 1,
  });
  if (grants.length === 0) throw new Error(`公募中の補助金が DB に見つかりませんでした（skip=${skip}）。`);
  return grants[0];
}

// ─────────────────────────────────────────────────────────────
// 補助金データ → 表示テキスト整形
// ─────────────────────────────────────────────────────────────
type SlideData = {
  name: string;
  nameReading: string;     // ナレーション用（長い名前は短縮）
  description: string;
  amount: string;
  deadline: string;
  industries: string;
  useCase1: string;        // 活用例①
  useCase2: string;        // 活用例②
  examples: string[];      // 具体例（最大3件）
  pains: string[];         // 導入前の課題（Before/After用・最大3件）
  rateLabel: string | null;   // 補助率 表示用（例 "1/2"）
  rateReading: string | null; // 補助率 ナレーション用（例 "にぶんのいち"）
  rateFrac: number | null;    // 補助率 数値（棒グラフ用）
  siteUrl: string;
  siteUrlDisplay: string;
};

/** 業種から活用例・具体例・導入前課題を構築 */
function buildUseCases(name: string, industries: string): {
  useCase1: string;
  useCase2: string;
  examples: string[];
  pains: string[];
} {
  const text = name + " " + industries;
  const hasCons = /建設|土木|工事/.test(text);
  const hasTrans = /運輸|物流|運送|倉庫/.test(text);
  const hasMfg = /製造|工場|生産/.test(text);
  const hasRetail = /小売|飲食|宿泊|サービス|店舗/.test(text);

  if (hasCons) {
    return {
      useCase1: "施工管理・図面共有システムの導入費用に活用",
      useCase2: "勤怠・原価管理のデジタル化に活用",
      examples: [
        "クラウド型の施工管理システムで現場とオフィスを連携",
        "ドローン測量や3次元データで測量・検査を効率化",
        "勤怠・原価をデジタル管理し、利益率を見える化",
      ],
      pains: [
        "紙の図面・FAXでのやり取り",
        "現場と事務所の情報共有に時間",
        "原価・勤怠の管理が手作業",
      ],
    };
  }
  if (hasTrans) {
    return {
      useCase1: "配送・運行管理システムの導入費用に活用",
      useCase2: "倉庫管理（WMS）の導入に活用",
      examples: [
        "運行管理システムで配車・ルートを最適化",
        "デジタコや位置情報で稼働状況を見える化",
        "倉庫管理システムで在庫・入出庫を効率化",
      ],
      pains: [
        "配車・ルート組みが属人化",
        "車両の稼働状況が見えない",
        "在庫・入出庫の管理が手作業",
      ],
    };
  }
  if (hasMfg) {
    return {
      useCase1: "生産設備・IoT機器の導入費用に活用",
      useCase2: "自動化・省人化ラインの構築に活用",
      examples: [
        "生産管理システムで工程・在庫を一元管理",
        "IoTセンサーで設備の稼働状況を見える化",
        "ロボット・自動化機器で省人化を実現",
      ],
      pains: [
        "生産工程・在庫が見えにくい",
        "設備の稼働状況がわからない",
        "人手に頼る工程が多い",
      ],
    };
  }
  if (hasRetail) {
    return {
      useCase1: "POS・予約システムの導入費用に活用",
      useCase2: "ECサイト構築・キャッシュレス対応に活用",
      examples: [
        "POSレジで売上・在庫をリアルタイム管理",
        "予約・順番待ちシステムで顧客体験を改善",
        "ECサイトやキャッシュレスで販路を拡大",
      ],
      pains: [
        "売上・在庫の管理が手作業",
        "電話予約の対応に追われる",
        "現金会計のみで機会損失",
      ],
    };
  }
  // デフォルト（IT・DX全般）
  return {
    useCase1: "業務システム・クラウドツールの導入費用に活用",
    useCase2: "RPA・省力化ツールによる業務自動化に活用",
    examples: [
      "会計・在庫・顧客管理などの業務システムを導入",
      "受発注や予約をオンライン化し、手作業を削減",
      "RPAやクラウドツールで定型業務を自動化",
    ],
    pains: [
      "手作業・二重入力が多い",
      "情報が属人化している",
      "人手不足で業務が回らない",
    ],
  };
}

function buildSlideData(g: Grant): SlideData {
  const fullName = normalizeJaText(cleanSubsidyName(g.name ?? "補助金制度"));
  const description = normalizeJaText(
    trimDescription(
      cleanSubsidyDescription(g.description) || "中小企業の経営課題解決を支援する補助制度です。",
      120,
    ),
  );

  const amount = g.maxAmountLabel
    ? (g.maxAmountLabel.startsWith("最大") ? g.maxAmountLabel : `最大 ${g.maxAmountLabel}`)
    : g.subsidyAmount
      ? `最大 ${Math.round(Number(g.subsidyAmount) / 10_000).toLocaleString("ja-JP")}万円`
      : "最大数百万円規模";

  const deadline = normalizeDeadline(g.deadlineLabel, g.deadline);

  // 対象説明が長い場合は先頭の句から要約（例: 荷主事業者又は運送事業者（単独枠）、… → 荷主事業者又は運送事業者など）
  const noteFirstClause = g.targetIndustryNote
    ? g.targetIndustryNote.replace(/[（(][^）)]*[）)]/g, "").split(/[、。]/)[0].trim()
    : "";

  const industries = normalizeJaText(
    (g.targetIndustryNote && g.targetIndustryNote.length < 50)
      ? g.targetIndustryNote
      : noteFirstClause.length >= 4 && noteFirstClause.length <= 24
        ? `${noteFirstClause}など`
        : g.targetIndustries.length > 0
          ? g.targetIndustries.slice(0, 3).join("・") + "など"
          : "中小企業全般",
  );

  const { useCase1, useCase2, examples, pains } = buildUseCases(fullName, industries);

  // 補助率（あれば棒グラフ・ナレーションに使用）
  const rateInfo = rateToInfo(g.subsidyRate);

  // ナレーション用の名前（長すぎる場合は要点のみ）
  const nameReading = fullName.length > 24 ? fullName.slice(0, 24) : fullName;

  return {
    name: fullName.slice(0, 38),
    nameReading,
    description,
    amount,
    deadline: `申請期限: ${deadline}`,
    industries: `対象: ${industries.slice(0, 34)}`,
    useCase1,
    useCase2,
    examples,
    pains,
    rateLabel: rateInfo?.label ?? null,
    rateReading: rateInfo?.reading ?? null,
    rateFrac: rateInfo?.frac ?? null,
    siteUrl: SITE_URL_FULL,
    siteUrlDisplay: SITE_URL_DISPLAY,
  };
}

// ─────────────────────────────────────────────────────────────
// ナレーション原稿（6シーン固定・ひらがな読み対応）
// ─────────────────────────────────────────────────────────────

/** ナレーション専用のTTS誤読修正（表示テキストには適用しない） */
function toNarrationText(s: string): string {
  return s.replace(/採択/g, "さいたく");
}

function buildNarrations(d: SlideData): string[] {
  // 金額をひらがなに変換してTTS誤読を防止
  const amountReading = amountToNarration(d.amount);
  // 概要が体言止めで終わる場合は「です。」で締めて自然な読み上げにする
  const descBody = toNarrationText(d.description).replace(/[、。…]+$/, "");
  const descSentence = /(です|ます)$/.test(descBody) ? `${descBody}。` : `${descBody}です。`;

  return [
    // 1. Intro
    `本動画では、${d.nameReading}について、わかりやすくご説明します。`,
    // 2. What
    `こちらの制度は、${descSentence}`,
    // 3. Numbers（読み上げは補助上限のみ・期限と対象は画面で提示）
    `数字でご説明します。補助の上限は${amountReading}です。公募期限と対象は、ご覧のとおりです。詳細は、にほんていけいしえんまで、ご連絡ください。`,
    // 4. Flow（日本提携支援のサポートの流れ）
    `にほんていけいしえんのサポートの流れをご紹介します。まずは無料相談で現状をお伺いし、経営課題を特定。御社に最適な補助金をご紹介し、さいたくまで専門家がサポートします。さらにさいたく後の活用設計から、その後の伴走まで、一貫してご支援しますのでご安心ください。`,
    // 5. Before/After（活用イメージ）
    `${toNarrationText(d.useCase1)}。また、${toNarrationText(d.useCase2)}など、手作業や属人化といった導入前の課題を大きく改善できます。御社の状況に合わせて、最適な使い方をご提案します。`,
    // 6. CTA（固有名詞・英数字をすべてひらがな化）
    `補助金のご相談は、にほんていけいしえんまで、お気軽にどうぞ。画面のきゅーあーるこーどをスマホで読み取り、むりょうしんだんぺーじへどうぞ。`,
  ];
}

// ─────────────────────────────────────────────────────────────
// スライドSVG生成（6シーン）
// ─────────────────────────────────────────────────────────────
function fontFace(fontPath: string | null): string {
  if (!fontPath) return "";
  const { pathToFileURL } = require("url") as typeof import("url");
  return `<style>
@font-face {
  font-family: '${FONT}';
  src: url('${pathToFileURL(fontPath).href}') format('opentype');
}
</style>`;
}

// ─── 共通デザインパーツ ───
const NAVY = "#0f2451";
const TOTAL_SLIDES = 6;

/** ライト系スライド共通の背景（グラデーション＋ドットグリッド＋影＋罫線グラデ定義） */
function lightBase(): string {
  return `<defs>
    <linearGradient id="bgr" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f4f8fc"/>
      <stop offset="100%" stop-color="#e8f0f8"/>
    </linearGradient>
    <linearGradient id="rule" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#1d6fd8"/>
      <stop offset="55%" stop-color="#17a4c9"/>
      <stop offset="100%" stop-color="transparent"/>
    </linearGradient>
    <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#1d6fd8"/>
      <stop offset="100%" stop-color="#17a4c9"/>
    </linearGradient>
    <filter id="sh"><feDropShadow dx="0" dy="10" stdDeviation="20" flood-color="#0f2451" flood-opacity="0.08"/></filter>
    <pattern id="dots" width="30" height="30" patternUnits="userSpaceOnUse">
      <circle cx="1.5" cy="1.5" r="1.5" fill="rgba(15,36,81,0.045)"/>
    </pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bgr)"/>
  <rect width="${W}" height="${H}" fill="url(#dots)"/>`;
}

/** ライト系スライド共通のヘッダー（バッジ＋タイトル＋罫線） */
function lightHeader(badge: string, badgeW: number, title: string, ruleW: number): string {
  return `<rect x="57" y="46" width="${badgeW}" height="38" rx="19" fill="${NAVY}"/>
  <text x="${57 + badgeW / 2}" y="71" text-anchor="middle" font-family="${FONT},sans-serif" font-size="15" font-weight="900" fill="#fff" letter-spacing="4">${esc(badge)}</text>
  <text x="57" y="130" font-family="${FONT},sans-serif" font-size="38" font-weight="900" fill="${NAVY}">${esc(title)}</text>
  <rect x="57" y="144" width="${ruleW}" height="4" rx="2" fill="url(#rule)"/>`;
}

/** ページドット＋ブランド表記（page は 0 始まり） */
function slideFooter(page: number, dark = false): string {
  const on = dark ? "#ffffff" : NAVY;
  const off = dark ? "rgba(255,255,255,0.30)" : "rgba(15,36,81,0.18)";
  const brand = dark ? "rgba(255,255,255,0.45)" : "rgba(15,36,81,0.28)";
  const startX = W / 2 - ((TOTAL_SLIDES - 1) * 22) / 2;
  const dots = Array.from({ length: TOTAL_SLIDES }, (_, i) =>
    `<circle cx="${startX + i * 22}" cy="686" r="${i === page ? 5 : 3.5}" fill="${i === page ? on : off}"/>`,
  ).join("");
  return `${dots}
  <text x="${W - 57}" y="692" text-anchor="end" font-family="${FONT},sans-serif" font-size="16" fill="${brand}">NTS 日本提携支援</text>`;
}

/** フロー図用の白抜きアイコン（色付き円の上に重ねる） */
function flowGlyph(kind: string, cx: number, cy: number, color: string): string {
  switch (kind) {
    case "chat":
      return `<rect x="${cx - 17}" y="${cy - 15}" width="34" height="23" rx="7" fill="#fff"/>
  <path d="M ${cx - 6} ${cy + 7} L ${cx - 1} ${cy + 16} L ${cx + 5} ${cy + 7} Z" fill="#fff"/>
  <circle cx="${cx - 8}" cy="${cy - 3.5}" r="2.4" fill="${color}"/><circle cx="${cx}" cy="${cy - 3.5}" r="2.4" fill="${color}"/><circle cx="${cx + 8}" cy="${cy - 3.5}" r="2.4" fill="${color}"/>`;
    case "doc":
      return `<rect x="${cx - 13}" y="${cy - 17}" width="26" height="34" rx="3" fill="#fff"/>
  <rect x="${cx - 7}" y="${cy - 9}" width="14" height="3" rx="1.5" fill="${color}"/>
  <rect x="${cx - 7}" y="${cy - 1}" width="14" height="3" rx="1.5" fill="${color}"/>
  <rect x="${cx - 7}" y="${cy + 7}" width="9" height="3" rx="1.5" fill="${color}"/>`;
    case "check":
      return `<path d="M ${cx - 13} ${cy} l 9 10 l 17 -20" stroke="#fff" stroke-width="6.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    case "monitor":
      return `<rect x="${cx - 16}" y="${cy - 14}" width="32" height="21" rx="3" fill="#fff"/>
  <rect x="${cx - 3.5}" y="${cy + 7}" width="7" height="6" fill="#fff"/>
  <rect x="${cx - 10}" y="${cy + 13}" width="20" height="3.5" rx="1.75" fill="#fff"/>`;
    case "yen":
      return `<text x="${cx}" y="${cy + 12}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="34" font-weight="900" fill="#fff">¥</text>`;
    case "search":
      return `<circle cx="${cx - 4}" cy="${cy - 4}" r="11" stroke="#fff" stroke-width="5" fill="none"/>
  <line x1="${cx + 5}" y1="${cy + 5}" x2="${cx + 14}" y2="${cy + 14}" stroke="#fff" stroke-width="5.5" stroke-linecap="round"/>`;
    case "gift":
      return `<rect x="${cx - 15}" y="${cy - 6}" width="30" height="21" rx="3" fill="#fff"/>
  <rect x="${cx - 17}" y="${cy - 13}" width="34" height="9" rx="2.5" fill="#fff"/>
  <rect x="${cx - 2.5}" y="${cy - 13}" width="5" height="28" fill="${color}"/>`;
    case "compass":
      return `<circle cx="${cx}" cy="${cy}" r="15" stroke="#fff" stroke-width="4.5" fill="none"/>
  <path d="M ${cx + 6} ${cy - 6} L ${cx + 2} ${cy + 2} L ${cx - 6} ${cy + 6} L ${cx - 2} ${cy - 2} Z" fill="#fff"/>`;
    case "people":
      return `<circle cx="${cx - 8}" cy="${cy - 6}" r="7" fill="#fff"/>
  <path d="M ${cx - 18} ${cy + 15} a 10 10 0 0 1 20 0 Z" fill="#fff"/>
  <circle cx="${cx + 9}" cy="${cy - 4}" r="6" fill="#fff"/>
  <path d="M ${cx + 1} ${cy + 15} a 8.5 8.5 0 0 1 17 0 Z" fill="#fff"/>`;
    default:
      return "";
  }
}

// 1. Intro（ダーク・補助上限を先出しして引きをつくる）
function slide1Intro(d: SlideData, ff: string): string {
  const amountDisp = formatAmountDisp(d.amount);
  const chipW = Math.min(680, 230 + amountDisp.length * 44);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${ff}
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f2451"/>
      <stop offset="100%" stop-color="#1a3a7a"/>
    </linearGradient>
    <filter id="sh"><feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000" flood-opacity="0.25"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <circle cx="1100" cy="130" r="300" fill="#2563eb" opacity="0.18"/>
  <circle cx="1200" cy="80" r="140" fill="#60a5fa" opacity="0.12"/>
  <rect x="57" y="46" width="190" height="44" rx="22" fill="#2563eb"/>
  <text x="152" y="75" text-anchor="middle" font-family="${FONT},sans-serif" font-size="18" font-weight="800" fill="#fff">NTS 日本提携支援</text>
  <text x="57" y="218" font-family="${FONT},sans-serif" font-size="30" font-weight="700" fill="#bfdbfe" filter="url(#sh)">この動画で解説する補助金</text>
  ${wrapTextByChars(d.name, 13).slice(0, 2).map((line, i) =>
    `<text x="57" y="${298 + i * 62}" font-family="${FONT},sans-serif" font-size="46" font-weight="900" fill="#ffffff" filter="url(#sh)">${esc(line)}</text>`
  ).join("\n  ")}
  <rect x="57" y="448" width="${chipW}" height="92" rx="18" fill="rgba(96,165,250,0.14)" stroke="rgba(147,197,253,0.55)" stroke-width="1.5"/>
  <text x="93" y="505" font-family="${FONT},sans-serif" font-size="22" font-weight="700" fill="#93c5fd">補助上限</text>
  <text x="208" y="512" font-family="${FONT},sans-serif" font-size="48" font-weight="900" fill="#ffffff" letter-spacing="-1">${esc(amountDisp)}</text>
  <text x="57" y="628" font-family="${FONT},sans-serif" font-size="20" font-weight="600" fill="rgba(255,255,255,0.55)">対象・金額・期限・活用の流れを約1分で解説</text>
  ${slideFooter(0, true)}
</svg>`;
}

// 2. What（制度概要）
function slide2What(d: SlideData, ff: string): string {
  const desc2 = wrapTextByChars(d.description, 24).slice(0, 5);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${ff}
  ${lightBase()}
  ${lightHeader("WHAT", 118, d.name.slice(0, 24), 900)}
  ${desc2.map((l, i) => `<text x="57" y="${252 + i * 56}" font-family="${FONT},sans-serif" font-size="27" fill="#334155">${esc(l)}</text>`).join("\n  ")}
  ${slideFooter(1)}
</svg>`;
}

// 3. Numbers（補助上限・公募期限・対象を3カード＋補助率バー）
function slide3Numbers(d: SlideData, ff: string): string {
  // カード共通寸法
  const CW = 376;
  const CH = 352;
  const CY = 160;
  const GAP = 18;
  const X1 = 57;
  const X2 = X1 + CW + GAP;
  const X3 = X2 + CW + GAP;
  const cx1 = X1 + CW / 2;
  const cx2 = X2 + CW / 2;
  const cx3 = X3 + CW / 2;

  // ── 補助上限 ────────────────────────────────────────────────
  // 「最大」プレフィックスと表示値を分割
  const amountNorm = d.amount.replace(/\s/g, "");
  const amountMatch = amountNorm.match(/^(最大)?(.+)$/);
  const amtPrefix  = amountMatch?.[1] ?? "";
  // 表示用: 3,000,000円 → 300万円 に換算してすっきり見せる
  const amtValueRaw = amountMatch?.[2] ?? d.amount;
  const amtValue = amtValueRaw.replace(/([\d,]+)\s*円/g, (_, n: string) => {
    const num = parseInt(n.replace(/,/g, ""), 10);
    if (num >= 10_000) {
      const man = Math.floor(num / 10_000);
      const rem = num % 10_000;
      return rem > 0 ? `${man}万${rem}円` : `${man}万円`;
    }
    return n + "円";
  });

  // ── 公募期限 ────────────────────────────────────────────────
  const deadlineVal = d.deadline.replace(/^申請期限[：:]\s*/, "");
  // "2025年5月19日" → ["2025年", "5月19日"] と自然に分割
  const yearDateMatch = deadlineVal.match(/^(\d{4}年)(\d{1,2}月\d{1,2}日.*)$/);
  const dlLines: string[] = yearDateMatch
    ? [yearDateMatch[1], yearDateMatch[2]]
    : wrapTextByChars(deadlineVal, 10).slice(0, 2);

  // ── 対象 ────────────────────────────────────────────────────
  const targetRaw = d.industries.replace(/^対象[：:]\s*/, "");
  // 括弧書き除去 → 20文字以内でカード表示
  const targetForCard = targetRaw
    .replace(/[（(][^）)]*[）)]/g, "")
    .replace(/\s+/g, "")
    .trim()
    .slice(0, 20);
  // 11文字以内なら1行・それ以上は中央で均等に2行へ分割（語中での不自然な改行を回避）
  const tgLines = targetForCard.length <= 11
    ? [targetForCard]
    : [
        targetForCard.slice(0, Math.ceil(targetForCard.length / 2)),
        targetForCard.slice(Math.ceil(targetForCard.length / 2)),
      ];

  // ── カードSVGビルダー ────────────────────────────────────────
  function card(
    x: number, cx: number,
    accentColor: string, bgTint: string, labelColor: string,
    label: string, valueSvg: string, note: string,
  ): string {
    return `
  <rect x="${x}" y="${CY}" width="${CW}" height="${CH}" rx="22" fill="#fff" filter="url(#sh)"/>
  <rect x="${x + 2}" y="${CY + 2}" width="${CW - 4}" height="10" rx="4" fill="${accentColor}"/>
  <text x="${cx}" y="${CY + 52}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="19" font-weight="800" fill="${labelColor}" letter-spacing="1">${esc(label)}</text>
  <line x1="${x + 32}" y1="${CY + 62}" x2="${x + CW - 32}" y2="${CY + 62}" stroke="${accentColor}" stroke-width="1.5" opacity="0.25"/>
  <rect x="${x + 20}" y="${CY + 82}" width="${CW - 40}" height="170" rx="14" fill="${bgTint}"/>
${valueSvg}
  <text x="${cx}" y="${CY + CH - 22}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="14" fill="#9ca3af">${esc(note)}</text>`;
  }

  // ── カード1：補助上限（アンバー）───────────────────────────
  const amtSvg = [
    amtPrefix
      ? `  <text x="${cx1}" y="${CY + 130}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="21" font-weight="700" fill="#b45309">${esc(amtPrefix)}</text>`
      : "",
    `  <text x="${cx1}" y="${CY + (amtPrefix ? 208 : 188)}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="46" font-weight="900" fill="#d97706" letter-spacing="-1">${esc(amtValue)}</text>`,
  ].filter(Boolean).join("\n");

  // ── カード2：公募期限（インディゴ）─────────────────────────
  // 年 (小さめ) + 月日 (大きめ) で上下に並べる
  const hasYearDate = yearDateMatch !== null;
  const dlSvg = hasYearDate
    ? [
        `  <text x="${cx2}" y="${CY + 130}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="24" font-weight="700" fill="#6366f1">${esc(dlLines[0])}</text>`,
        `  <text x="${cx2}" y="${CY + 198}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="40" font-weight="900" fill="#4338ca">${esc(dlLines[1])}</text>`,
      ].join("\n")
    : dlLines.map((line, i) =>
        `  <text x="${cx2}" y="${CY + (dlLines.length === 1 ? 182 : 132 + i * 62)}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="${dlLines.length === 1 ? 36 : 32}" font-weight="900" fill="#4338ca">${esc(line)}</text>`,
      ).join("\n");

  // ── カード3：対象（グリーン）───────────────────────────────
  const tgSvg = tgLines.map((line, i) =>
    `  <text x="${cx3}" y="${CY + (tgLines.length === 1 ? 182 : 132 + i * 58)}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="${tgLines.length === 1 ? 30 : 27}" font-weight="900" fill="#15803d">${esc(line)}</text>`,
  ).join("\n");

  // ── 補助率バー（A-2: 自己負担 vs 補助の図解。rate があるときのみ） ──
  const BAR_X = X1;
  const BAR_W = X3 + CW - X1;
  let rateBarSvg = "";
  if (d.rateFrac != null && d.rateLabel) {
    const subW = Math.round(BAR_W * d.rateFrac);
    const restW = BAR_W - subW;
    const subLabel = subW > 250 ? `<text x="${BAR_X + subW / 2}" y="${591}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="16" font-weight="800" fill="#fff">補助でカバー ${esc(d.rateLabel)}</text>` : "";
    const restLabel = restW > 170 ? `<text x="${BAR_X + subW + restW / 2}" y="${591}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="15" font-weight="700" fill="#475569">自己負担</text>` : "";
    rateBarSvg = `
  <text x="${BAR_X}" y="${552}" font-family="${FONT},sans-serif" font-size="17" font-weight="800" fill="rgba(15,36,81,0.72)">費用負担のイメージ（補助率 ${esc(d.rateLabel)}）</text>
  <text x="${BAR_X + BAR_W}" y="${552}" text-anchor="end" font-family="${FONT},sans-serif" font-size="14" fill="rgba(15,36,81,0.40)">※詳細は日本提携支援までご連絡ください</text>
  <rect x="${BAR_X}" y="${568}" width="${BAR_W}" height="34" rx="9" fill="#d8e0ea"/>
  <rect x="${BAR_X}" y="${568}" width="${subW}" height="34" rx="9" fill="url(#barGrad)"/>
  ${subLabel}
  ${restLabel}`;
  } else {
    rateBarSvg = `
  <text x="${W / 2}" y="${578}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="18" fill="rgba(15,36,81,0.38)">※詳細は日本提携支援までご連絡ください</text>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${ff}
  ${lightBase()}
  ${lightHeader("NUMBERS", 148, "数字で見る制度概要", 530)}
${card(X1, cx1, "#f59e0b", "rgba(245,158,11,0.06)", "#92400e", "補助上限", amtSvg, "枠・条件により異なります")}
${card(X2, cx2, "#4f46e5", "rgba(99,102,241,0.06)", "#3730a3", "公募期限", dlSvg, "締切は変更となる場合があります")}
${card(X3, cx3, "#16a34a", "rgba(22,163,74,0.06)",  "#166534", "対象",     tgSvg, "詳細はお気軽にご相談ください")}
${rateBarSvg}
  ${slideFooter(2)}
</svg>`;
}

// 4. Flow（A-1: 日本提携支援の補助金サポートサービスの流れ・6ステップ図解）
function slide4Flow(ff: string): string {
  const steps = [
    { label: "無料相談",     sub: "まずはお気軽に",       icon: "chat",    color: "#2563eb" },
    { label: "課題特定",     sub: "経営課題を整理",       icon: "search",  color: "#0ea5e9" },
    { label: "補助金紹介",   sub: "最適な制度をご提案",   icon: "gift",    color: "#17a4c9" },
    { label: "採択サポート", sub: "申請を専門家が支援",   icon: "check",   color: "#16a34a" },
    { label: "活用設計",     sub: "採択後の活かし方を設計", icon: "compass", color: "#6366f1" },
    { label: "伴走",         sub: "採択後も1年間サポート", icon: "people",  color: "#d97706" },
  ];
  const CW2 = 172;
  const GAP2 = (1166 - CW2 * 6) / 5; // 全幅1166に6枚を等配置
  const Y0 = 206;
  const CH2 = 256;

  const cards = steps.map((s, i) => {
    const x = 57 + i * (CW2 + GAP2);
    const cx = x + CW2 / 2;
    const iconCy = Y0 + 96;
    return `
  <rect x="${x}" y="${Y0}" width="${CW2}" height="${CH2}" rx="18" fill="#fff" filter="url(#sh)"/>
  <text x="${cx}" y="${Y0 + 34}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="12" font-weight="900" fill="${s.color}" letter-spacing="2">STEP ${i + 1}</text>
  <circle cx="${cx}" cy="${iconCy}" r="33" fill="${s.color}"/>
  ${flowGlyph(s.icon, cx, iconCy, s.color)}
  <text x="${cx}" y="${Y0 + 172}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="20" font-weight="900" fill="${NAVY}">${esc(s.label)}</text>
  <text x="${cx}" y="${Y0 + 206}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="12" fill="#64748b">${esc(s.sub)}</text>`;
  }).join("\n");

  const arrows = steps.slice(0, -1).map((_, i) => {
    const ax = 57 + (i + 1) * (CW2 + GAP2) - GAP2 / 2;
    const ay = Y0 + CH2 / 2;
    return `<path d="M ${ax - 5.5} ${ay - 8} L ${ax + 5.5} ${ay} L ${ax - 5.5} ${ay + 8}" stroke="#94a3b8" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  }).join("\n  ");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${ff}
  ${lightBase()}
  ${lightHeader("FLOW", 118, "日本提携支援のサポートの流れ", 640)}
${cards}
  ${arrows}
  <rect x="57" y="508" width="1166" height="64" rx="16" fill="#eaf2fb"/>
  <text x="${W / 2}" y="${508 + 41}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="21" font-weight="700" fill="#1d4ed8">無料相談から採択後の伴走まで、一貫してサポートします</text>
  ${slideFooter(3)}
</svg>`;
}

// 5. Before/After（A-3: 導入前の課題 → 補助金活用後）
function slide5BeforeAfter(d: SlideData, ff: string): string {
  const pains = d.pains.slice(0, 3);
  const afters = [
    d.useCase1.replace(/に活用$/, ""),
    d.useCase2.replace(/に活用$/, ""),
    "生産性向上・コスト削減へ",
  ];
  const CARD_Y = 196;
  const CARD_H = 348;
  const CARD_W = 492;
  const LX = 57;
  const RX = 731;

  function items(x: number, list: string[], mark: "cross" | "check"): string {
    return list.map((t, i) => {
      const lines = wrapTextByChars(t, 19).slice(0, 2);
      const iy = CARD_Y + 110 + i * 80;
      const markSvg = mark === "cross"
        ? `<circle cx="${x + 46}" cy="${iy}" r="15" fill="#fee2e2"/>
  <path d="M ${x + 40} ${iy - 6} L ${x + 52} ${iy + 6} M ${x + 52} ${iy - 6} L ${x + 40} ${iy + 6}" stroke="#dc2626" stroke-width="3.2" stroke-linecap="round"/>`
        : `<circle cx="${x + 46}" cy="${iy}" r="15" fill="#dcfce7"/>
  <path d="M ${x + 39} ${iy} l 5 6 l 10 -12" stroke="#16a34a" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      const textColor = mark === "cross" ? "#475569" : "#1e293b";
      const textSvg = lines.map((line, j) =>
        `<text x="${x + 76}" y="${iy + (lines.length === 1 ? 7 : -5 + j * 26)}" font-family="${FONT},sans-serif" font-size="19" font-weight="600" fill="${textColor}">${esc(line)}</text>`,
      ).join("\n  ");
      return `${markSvg}\n  ${textSvg}`;
    }).join("\n  ");
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${ff}
  ${lightBase()}
  ${lightHeader("USE CASE", 152, "業務はこう変わる", 500)}
  <!-- Before -->
  <rect x="${LX}" y="${CARD_Y}" width="${CARD_W}" height="${CARD_H}" rx="20" fill="#f1f5f9" stroke="#e2e8f0" stroke-width="1.5"/>
  <text x="${LX + CARD_W / 2}" y="${CARD_Y + 46}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="22" font-weight="800" fill="#475569">導入前の課題</text>
  <line x1="${LX + 36}" y1="${CARD_Y + 64}" x2="${LX + CARD_W - 36}" y2="${CARD_Y + 64}" stroke="#cbd5e1" stroke-width="1.5"/>
  ${items(LX, pains, "cross")}
  <!-- 中央の変化矢印 -->
  <rect x="${W / 2 - 74}" y="${CARD_Y + 96}" width="148" height="40" rx="20" fill="#f59e0b"/>
  <text x="${W / 2}" y="${CARD_Y + 122}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="16" font-weight="900" fill="#fff">補助金活用</text>
  <path d="M ${W / 2 - 24} ${CARD_Y + 158} L ${W / 2 + 24} ${CARD_Y + 182} L ${W / 2 - 24} ${CARD_Y + 206} Z" fill="#1d6fd8"/>
  <!-- After -->
  <rect x="${RX}" y="${CARD_Y}" width="${CARD_W}" height="${CARD_H}" rx="20" fill="#fff" filter="url(#sh)"/>
  <rect x="${RX + 2}" y="${CARD_Y + 2}" width="${CARD_W - 4}" height="8" rx="4" fill="#1d6fd8"/>
  <text x="${RX + CARD_W / 2}" y="${CARD_Y + 48}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="22" font-weight="800" fill="#1d4ed8">補助金活用後</text>
  <line x1="${RX + 36}" y1="${CARD_Y + 66}" x2="${RX + CARD_W - 36}" y2="${CARD_Y + 66}" stroke="#bfdbfe" stroke-width="1.5"/>
  ${items(RX, afters, "check")}
  <!-- 下部注記 -->
  <text x="${W / 2}" y="${CARD_Y + CARD_H + 44}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="18" fill="rgba(15,36,81,0.45)">御社の状況に合わせて最適な使い方をご提案します</text>
  ${slideFooter(4)}
</svg>`;
}

// 6. CTA（チーム写真＋QR案内・非クリック前提）
function slide6CTA(d: SlideData, ff: string, qrDataUrl: string, photoDataUrl: string): string {
  // 左カラム: チーム写真（公式サイトのファーストビュー画像）
  const PX = 57;
  const PY = 132;
  const PW = 620;
  const PH = 296;
  const pcx = PX + PW / 2;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${ff}
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f2451"/>
      <stop offset="100%" stop-color="#1e40af"/>
    </linearGradient>
    <filter id="sh2"><feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000" flood-opacity="0.12"/></filter>
    <clipPath id="photoClip"><rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" rx="22"/></clipPath>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <circle cx="200" cy="600" r="350" fill="#3b82f6" opacity="0.15"/>
  <circle cx="1100" cy="120" r="220" fill="#60a5fa" opacity="0.12"/>
  <rect x="57" y="46" width="190" height="44" rx="22" fill="rgba(255,255,255,0.2)"/>
  <text x="152" y="75" text-anchor="middle" font-family="${FONT},sans-serif" font-size="18" font-weight="800" fill="#fff">NTS 日本提携支援</text>
  <image x="${PX}" y="${PY}" width="${PW}" height="${PH}" preserveAspectRatio="xMidYMid slice" clip-path="url(#photoClip)" xlink:href="${photoDataUrl}"/>
  <rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" rx="22" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="2"/>
  <text x="${pcx}" y="${PY + PH + 40}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="19" fill="rgba(255,255,255,0.78)">補助金の専門家チームが、御社をサポートします</text>
  <text x="${pcx}" y="${PY + PH + 104}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="44" font-weight="900" fill="#ffffff">お気軽にご相談ください</text>
  <text x="${pcx}" y="${PY + PH + 152}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="22" font-weight="700" fill="#bfdbfe">補助金のご相談は 日本提携支援まで</text>
  <line x1="740" y1="150" x2="740" y2="570" stroke="rgba(255,255,255,0.25)" stroke-width="1.5" stroke-dasharray="6,4"/>
  <rect x="820" y="160" width="320" height="320" rx="20" fill="#ffffff" filter="url(#sh2)"/>
  <image x="830" y="170" width="300" height="300" xlink:href="${qrDataUrl}"/>
  <text x="980" y="524" text-anchor="middle" font-family="${FONT},sans-serif" font-size="20" font-weight="700" fill="rgba(255,255,255,0.9)">スマホでQRを読み取り</text>
  <text x="980" y="554" text-anchor="middle" font-family="${FONT},sans-serif" font-size="16" fill="rgba(255,255,255,0.65)">そのまま無料診断ページへ</text>
  <text x="980" y="588" text-anchor="middle" font-family="${FONT},sans-serif" font-size="14" fill="rgba(255,255,255,0.45)">${esc(d.siteUrlDisplay)}</text>
  ${slideFooter(5, true)}
</svg>`;
}

// ─────────────────────────────────────────────────────────────
// SVG → PNG
// ─────────────────────────────────────────────────────────────
async function svgToPng(svg: string, fontPath: string | null): Promise<Buffer> {
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: W },
    font: {
      fontFiles: fontPath ? [fontPath] : [],
      loadSystemFonts: false,
      defaultFontFamily: FONT,
    },
  });
  return Buffer.from(resvg.render().asPng());
}

// ─────────────────────────────────────────────────────────────
// HeyGen Assets API: PNG をアップロードして asset_id と URL を取得
// ─────────────────────────────────────────────────────────────
async function uploadAsset(pngBuf: Buffer, filename: string): Promise<{ assetId: string; url: string }> {
  const formData = new FormData();
  const blob = new Blob([new Uint8Array(pngBuf)], { type: "image/png" });
  formData.append("file", blob, filename);

  const res = await fetch(`${HEYGEN_BASE}/v3/assets`, {
    method: "POST",
    headers: { "X-Api-Key": API_KEY },
    body: formData,
  });

  const json = (await res.json()) as { data?: { asset_id?: string; url?: string }; error?: unknown };
  if (!res.ok || !json.data?.asset_id) {
    throw new Error(`Assets API エラー: ${res.status} ${JSON.stringify(json)}`);
  }
  return {
    assetId: json.data.asset_id,
    url: json.data.url ?? "",
  };
}

// ─────────────────────────────────────────────────────────────
// HeyGen /v2/video.generate: スライド背景 + 桜庭ボイスのみ（アバターなし）
// ─────────────────────────────────────────────────────────────
async function generateSlideVideo(
  narrations: string[],
  assetInfos: { assetId: string; url: string }[],
): Promise<string> {
  console.log("\n━━━ Step 3: /v2/video.generate でスライド動画生成 ━━━");

  const video_inputs = narrations.map((text, i) => ({
    character: null,   // アバターなし
    voice: {
      type: "text",
      input_text: text,
      voice_id: SAKURABA_VOICE_ID,
      speed: 1.0,
    },
    background: {
      type: "image",
      // URL が取れていればURLを優先、なければ asset_id フォールバック
      ...(assetInfos[i].url
        ? { url: assetInfos[i].url }
        : { asset_id: assetInfos[i].assetId }),
    },
  }));

  const body = {
    video_inputs,
    dimension: { width: W, height: H },
    aspect_ratio: null,
  };

  console.log(`  scenes      : ${video_inputs.length}`);
  console.log(`  voice_id    : ${SAKURABA_VOICE_ID}`);

  const res = await fetch(`${HEYGEN_BASE}/v2/video/generate`, {
    method: "POST",
    headers: HEADERS_JSON,
    body: JSON.stringify(body),
  });

  const rawText = await res.text();
  console.log(`  HTTP status : ${res.status}`);
  console.log(`  raw response: ${rawText.slice(0, 500)}`);

  let json: { data?: { video_id?: string }; error?: unknown };
  try {
    json = JSON.parse(rawText);
  } catch {
    throw new Error(`/v2/video.generate が JSON でないレスポンスを返しました: ${rawText.slice(0, 300)}`);
  }
  if (!res.ok || !json.data?.video_id) {
    throw new Error(`/v2/video.generate エラー: ${res.status} ${JSON.stringify(json)}`);
  }

  const videoId = json.data.video_id;
  console.log(`✅ video_id: ${videoId}`);
  return videoId;
}

// ─────────────────────────────────────────────────────────────
// ポーリング: video_id → video_url
// ─────────────────────────────────────────────────────────────
async function pollVideo(videoId: string): Promise<void> {
  console.log(`\n━━━ Step 4: 動画レンダリング完了待ち (video_id: ${videoId}) ━━━`);
  const TIMEOUT = 15 * 60 * 1000;
  const start = Date.now();

  while (Date.now() - start < TIMEOUT) {
    await sleep(10000);
    const res = await fetch(
      `${HEYGEN_BASE}/v1/video_status.get?video_id=${videoId}`,
      { headers: { "X-Api-Key": API_KEY } },
    );
    const json = (await res.json()) as {
      data?: { status?: string; video_url?: string; thumbnail_url?: string; error?: string };
    };
    const status = json.data?.status ?? "unknown";
    const elapsed = Math.round((Date.now() - start) / 1000);
    console.log(`  [${elapsed}s] video status: ${status}`);

    if (status === "completed") {
      console.log("\n🎉 動画生成完了！");
      console.log(`  video_url     : ${json.data?.video_url ?? "(なし)"}`);
      console.log(`  thumbnail_url : ${json.data?.thumbnail_url ?? "(なし)"}`);
      console.log(`  video_id      : ${videoId}`);
      return;
    }
    if (status === "failed") {
      throw new Error(`動画生成失敗: ${json.data?.error ?? "(詳細なし)"}`);
    }
  }
  throw new Error(`タイムアウト: video_id ${videoId} を HeyGen ダッシュボードで確認してください`);
}

// ─────────────────────────────────────────────────────────────
// メイン
// ─────────────────────────────────────────────────────────────
async function main() {
  console.log("╔══════════════════════════════════════════════════════╗");
  console.log("║   HeyGen スライド動画 完全自動生成  NTS             ║");
  console.log("╚══════════════════════════════════════════════════════╝");

  const args = process.argv.slice(2);
  const subsidyId = args.find((a) => !a.startsWith("--"));
  const skipArg = args.find((a) => a.startsWith("--skip="));
  const skip = skipArg ? parseInt(skipArg.replace("--skip=", ""), 10) : 0;

  console.log("\n🔍 補助金データを取得中...");
  const grant = await fetchGrant(subsidyId, skip);
  const d = buildSlideData(grant);
  console.log(`✅ ${d.name} (id: ${grant.id})`);

  // ── Step 1: スライドPNG生成 ──
  console.log("\n━━━ Step 1: スライドPNG生成（6シーン） ━━━");
  const fontPath = resolveVideoFontPath();
  if (!fontPath) console.warn("⚠️  フォントファイルが見つかりません。文字が豆腐になる可能性があります。");
  const ff = fontFace(fontPath);

  const qrDataUrl = await QRCode.toDataURL(d.siteUrl, {
    width: 300,
    margin: 2,
    color: { dark: "#0f2451", light: "#ffffff" },
  });

  // CTA用チーム写真（公式サイトのファーストビュー画像をローカル保存したもの）
  const photoPath = path.join(process.cwd(), "scripts", "heygen", "assets", "nts-team.jpg");
  const photoBuf = await fs.readFile(photoPath);
  const photoDataUrl = `data:image/jpeg;base64,${photoBuf.toString("base64")}`;

  const svgs = [
    slide1Intro(d, ff),
    slide2What(d, ff),
    slide3Numbers(d, ff),
    slide4Flow(ff),
    slide5BeforeAfter(d, ff),
    slide6CTA(d, ff, qrDataUrl, photoDataUrl),
  ];

  const outDir = path.join(process.cwd(), "scripts", "heygen", "output");
  await fs.mkdir(outDir, { recursive: true });

  const pngs: Buffer[] = [];
  for (let i = 0; i < svgs.length; i++) {
    const png = await svgToPng(svgs[i], fontPath);
    pngs.push(png);
    const savePath = path.join(outDir, `slide-${i + 1}.png`);
    await fs.writeFile(savePath, png);
    console.log(`  Slide ${i + 1}: ${(png.length / 1024).toFixed(0)} KB → ${savePath}`);
  }

  // --dry-run: PNG生成のみで終了（スライドのプレビュー確認用）
  if (args.includes("--dry-run")) {
    console.log("\n🔍 --dry-run のためここで終了します（PNGは output/ に保存済み）");
    const narrationsPreview = buildNarrations(d);
    console.log("\n📝 ナレーション原稿:");
    narrationsPreview.forEach((n, i) => console.log(`  ${i + 1}. ${n}`));
    return;
  }

  // ── Step 2: HeyGen Assets にアップロード ──
  console.log("\n━━━ Step 2: HeyGen Assets にスライドPNGをアップロード ━━━");
  const assetInfos: { assetId: string; url: string }[] = [];
  for (let i = 0; i < pngs.length; i++) {
    const info = await uploadAsset(pngs[i], `nts-slide-${i + 1}.png`);
    assetInfos.push(info);
    console.log(`  Slide ${i + 1}: asset_id=${info.assetId} url=${info.url || "(なし)"}`);
  }

  // ── Step 3: /v2/video.generate でスライド動画生成 ──
  const narrations = buildNarrations(d);
  console.log("\n📝 ナレーション原稿:");
  narrations.forEach((n, i) => console.log(`  ${i + 1}. ${n}`));

  const videoId = await generateSlideVideo(narrations, assetInfos);

  // ── Step 4: 動画完成待ち ──
  await pollVideo(videoId);
}

main()
  .catch((err) => {
    console.error("\n❌ エラー:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
