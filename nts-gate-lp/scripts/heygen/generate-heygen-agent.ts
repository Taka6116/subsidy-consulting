/**
 * 補助金解説スライド動画 完全自動生成スクリプト（HeyGen Video Agent API）
 * 実行: npx tsx scripts/heygen/generate-heygen-agent.ts [subsidyId] [flags]
 *
 * フラグ:
 *   --dry-run        スライドPNG＋ナレーション原稿の生成のみ（HeyGen 呼び出しなし）
 *   --pattern=A|B|C|D  スライドデザインパターンを明示指定（省略時は subsidyId のハッシュで自動選択）
 *   --publish        動画完成後に S3 アップロード + GeneratedContent 登録 → /subsidies/videos に表示
 *   --skip=N         subsidyId 省略時の候補スキップ数
 *   --voice=heygen   音声を HeyGen TTS（桜庭ボイス）に切り替え（デフォルトは AWS Polly Kazuha）
 *
 * 処理フロー:
 *   1. DB から補助金データを取得・補助金名をひらがな読みに変換（kuroshiro）
 *   2. 6シーン分のスライドSVG＋サムネイルを生成 → PNG化（Resvg）
 *   3. PNG を HeyGen Assets API にアップロード → asset_id 取得
 *   4. ナレーション原稿 + asset_id で /v2/video/generate を呼び出し
 *   5. ポーリングして video_url を取得
 *   6. --publish 時: mp4/サムネイルを S3 へ、GeneratedContent を upsert
 *
 * 必要な環境変数:
 *   HEYGEN_API_KEY   — HeyGen API キー
 *   （--publish 時）VIDEO_S3_BUCKET / VIDEO_S3_REGION / VIDEO_S3_BASE_URL / AWS 認証情報
 */

import * as dotenv from "dotenv";
import * as path from "path";
import fs from "node:fs/promises";
import { exec } from "node:child_process";
import { promisify } from "node:util";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { Resvg } from "@resvg/resvg-js";
import QRCode from "qrcode";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "@/lib/db/prisma";
import { cleanSubsidyName, cleanSubsidyDescription } from "@/lib/subsidyCheckResultHelpers";
import { resolveVideoFontPath } from "@/lib/video/fonts";
import { synthesizeAndUpload } from "@/lib/aws/pollyTts";

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
const SITE_URL_FULL = "https://subsidy.nihon-teikei.co.jp/";
const SITE_URL_DISPLAY = "https://subsidy.nihon-teikei.co.jp/";

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

/**
 * 金額テキストをボックス幅に収まるフォントサイズに自動縮小する
 * @param text      表示する金額文字列（例: "最大1000万円"）
 * @param baseSize  デザイン上の基本フォントサイズ
 * @param availW    テキストを収める領域の幅(px)
 */
function scaledAmountFontSize(text: string, baseSize: number, availW: number): number {
  const clean = text.replace(/\s/g, "");
  const cjkCount = (clean.match(/[^\x00-\x7F]/g) ?? []).length;
  const asciiCount = clean.length - cjkCount;
  // CJK 文字は 1.0em, ASCII(数字・カンマ等)は 0.6em として推定
  const estimatedEm = cjkCount * 1.0 + asciiCount * 0.6;
  if (estimatedEm <= 0) return baseSize;
  const fitted = Math.floor(availW / estimatedEm);
  return Math.min(baseSize, Math.max(34, fitted));
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

/** ヒーローカード用: 金額を「最大 / 数値 / 単位」に分割 */
function parseAmountHeroParts(amount: string): { prefix: string; num: string; suffix: string } {
  const disp = formatAmountDisp(amount);
  const m = disp.match(/^(?:最大\s*)?([\d,]+)(万(?:[\d,]+)?円|円)$/);
  if (m) return { prefix: "最大", num: m[1], suffix: m[2] };
  return { prefix: "最大", num: disp.replace(/^最大\s*/, ""), suffix: "" };
}

/** 概要を文の途中で切らずに整形する */
function trimDescription(desc: string, maxLen: number): string {
  if (desc.length <= maxLen) return desc;
  const slice = desc.slice(0, maxLen);
  const lastPeriod = slice.lastIndexOf("。");
  if (lastPeriod > maxLen * 0.5) return slice.slice(0, lastPeriod + 1);
  return slice + "…";
}

/** 行頭禁則文字（これらが行頭に来てはいけない） */
const LINE_HEAD_FORBIDDEN = new Set([..."、。）」』】，．・"]);

/**
 * 自然な位置で折り返すテキストラッパー
 * - 句読点（。、）の直後を優先的な折り返しポイントとする
 * - 行頭禁則文字が先頭に来ないよう直前行に繰り越す
 * - maxChars に達した際は直前の句読点・助詞後で折り返す
 */
function wrapTextByChars(text: string, maxChars: number): string[] {
  if (!text) return [];
  const out: string[] = [];
  let row = "";

  const flush = () => {
    if (row) { out.push(row); row = ""; }
  };

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    row += ch;

    // 句読点の直後 → 即改行
    if (/[。、]/.test(ch)) {
      flush();
      continue;
    }

    // maxChars に達した
    if (row.length >= maxChars) {
      const next = text[i + 1];
      // 次の文字が行頭禁則なら今の行に含めて改行
      if (next && LINE_HEAD_FORBIDDEN.has(next)) {
        row += next;
        i++;
        flush();
        continue;
      }
      // 現在の行の中で直近の句読点・助詞後を探す
      const breakAt = (() => {
        for (let j = row.length - 1; j >= Math.floor(maxChars * 0.5); j--) {
          if (/[。、]/.test(row[j])) return j + 1;
          if (/[はがをにでとの]/.test(row[j]) && j < row.length - 1) return j + 1;
        }
        return -1;
      })();
      if (breakAt > 0) {
        out.push(row.slice(0, breakAt));
        row = row.slice(breakAt);
      } else {
        flush();
      }
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

/** 補助金名（漢字）→ ひらがな読み に変換する（kuroshiro + kuromoji）
 *  TTS が制度名の漢字を誤読するため、ナレーションのみ読みを使う。
 *  変換に失敗した場合は null を返し、呼び出し側で元の名称にフォールバックする。
 */
async function nameToKana(name: string): Promise<string | null> {
  try {
    /* eslint-disable @typescript-eslint/no-require-imports */
    const kuroshiroMod = require("kuroshiro");
    const analyzerMod = require("kuroshiro-analyzer-kuromoji");
    /* eslint-enable @typescript-eslint/no-require-imports */
    const Kuroshiro = kuroshiroMod.default ?? kuroshiroMod;
    const KuromojiAnalyzer = analyzerMod.default ?? analyzerMod;
    const kuroshiro = new Kuroshiro();
    await kuroshiro.init(new KuromojiAnalyzer());
    const kana: unknown = await kuroshiro.convert(name, { to: "hiragana" });
    if (typeof kana === "string" && kana.trim().length > 0) return kana.trim();
    return null;
  } catch (e) {
    console.warn("⚠️  補助金名の読み変換に失敗しました（漢字のまま読み上げます）:", e);
    return null;
  }
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
  nameReading: string;      // ナレーション用（kuroshiro でひらがな化された正式名）
  shortNameReading: string; // Slide1 ナレーション用の短縮名（令和〇年度等を除去）
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
      : "公募要領で確認";

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

  // ナレーション用の名前（main() で kuroshiro によりひらがな読みへ変換される）
  const nameReading = fullName;
  // Slide1 用の短縮名（令和〇年度等を除去した自然な読み上げ向け）
  const shortNameReading = shortenNameForNarration(fullName);

  return {
    name: fullName.slice(0, 38),
    nameReading,
    shortNameReading,
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

/**
 * 補助金正式名称からナレーション向けの短縮名を生成する
 *  - 「令和〇年度」「第〇回以降」等の接頭語を除去
 *  - 末尾の「補助金」「補助事業」「助成金」は残す
 *  - 括弧内の補足（共同申請者）等を除去
 *  - 結果が長すぎる場合は核心部分を残して短縮
 * 例: "令和8年度中小企業生産性向上促進事業費補助金"
 *   → "中小企業生産性向上促進のための補助金"
 */
function shortenNameForNarration(name: string): string {
  let s = name;
  // 「令和〇年度」「平成〇年度」を除去
  s = s.replace(/^(令和|平成|昭和)\d+年度\s*/g, "");
  // 「第〇回以降」「第〇期」等を除去
  s = s.replace(/^第\d+[回期次][^\s　]*\s*/g, "");
  // 「【〇〇】」「〔〇〇〕」を除去
  s = s.replace(/[【【〔]\s*[^\】\】〕]*[\】\】〕]/g, "").trim();
  // 「（〇〇申請者）」「（共同申請者）」等の括弧補足を除去
  s = s.replace(/[（(][^）)]*[）)]/g, "").trim();
  // 「〇〇事業費補助金」→「〇〇のための補助金」に読みやすく
  s = s.replace(/事業費補助金$/, "のための補助金");
  s = s.replace(/事業補助金$/, "のための補助金");
  s = s.replace(/支援補助金$/, "を支援する補助金");
  // 長すぎる場合（20文字超）は最初の区切りで短縮
  if (s.length > 20) {
    const cut = s.slice(0, 20);
    // 補助金・助成金が含まれている場合はその部分まで含める
    const m = cut.match(/^(.{8,})(補助金|助成金|補助事業)/);
    if (m) return m[1] + m[2];
    return cut + "など";
  }
  return s || name.slice(0, 20);
}

function buildNarrations(d: SlideData): string[] {
  // 金額をひらがなに変換してTTS誤読を防止
  const amountReading = amountToNarration(d.amount);
  // 概要が体言止めで終わる場合は「です。」で締めて自然な読み上げにする
  const descBody = toNarrationText(d.description).replace(/[、。…]+$/, "");
  const descSentence = /(です|ます)$/.test(descBody) ? `${descBody}。` : `${descBody}です。`;

  return [
    // 1. Intro（短縮名で自然な読み上げ）
    `本動画では、${d.shortNameReading}についてご説明します。`,
    // 2. What
    `こちらの制度は、${descSentence}`,
    // 3. Numbers（読み上げは補助上限のみ・期限と対象は画面で提示）
    `数字でご説明します。補助の上限は${amountReading}です。公募期限と対象は、ご覧のとおりです。詳細は、にほんていけいしえんまで、ご連絡ください。`,
    // 4. Flow（日本提携支援のサポートの流れ）
    `にほんていけいしえんのサポートの流れをご紹介します。まずは無料相談で現状をお伺いし、経営課題を特定。おんしゃに最適な補助金をご紹介し、さいたくまで専門家がサポートします。さらにさいたく後の活用設計から、その後の伴走まで、一貫してご支援しますのでご安心ください。`,
    // 5. Before/After（活用イメージ）
    `${toNarrationText(d.useCase1)}。また、${toNarrationText(d.useCase2)}など、手作業や属人化といった導入前の課題を大きく改善できます。おんしゃの状況に合わせて、最適な使い方をご提案します。`,
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

// ─── 共通デザインパーツ（テーマ対応） ───
const TOTAL_SLIDES = 6;

type CardTheme = { accent: string; tint: string; label: string; value: string; valueSub?: string };

/** スライドの見た目パターン定義 */
type SlideTheme = {
  id: string;
  // ダーク面（Intro / CTA）
  dark1: string;
  dark2: string;
  ctaDark2: string;
  glow1: string;
  glow2: string;
  badgeFill: string;
  badgeRadius: number;
  chipFill: string;
  chipStroke: string;
  chipLabel: string;
  introSub: string;
  introAlign: "left" | "center";
  // ライト面（What / Numbers / Flow / UseCase）
  lightIsDark: boolean;
  light1: string;
  light2: string;
  dot: string;
  ink: string;
  bodyText: string;
  noteText: string;
  rule1: string;
  rule2: string;
  headerStyle: "pill" | "underline";
  headerBadgeFill: string;
  headerBadgeText: string;
  // Numbers カード
  amount: CardTheme;
  deadline: CardTheme;
  target: CardTheme;
  barTrack: string;
  barTitleText: string;
  barRestText: string;
  // Flow
  flowColors: [string, string, string, string, string, string];
  flowBarBg: string;
  flowBarText: string;
  // Before/After
  afterAccent: string;
  afterTitle: string;
  afterLine: string;
  pillFill: string;
};

const THEMES: Record<string, SlideTheme> = {
  // A: 現行（ネイビー×ライトブルー・ピル型バッジ・左寄せイントロ）
  A: {
    id: "A",
    dark1: "#0f2451", dark2: "#1a3a7a", ctaDark2: "#1e40af",
    glow1: "#2563eb", glow2: "#60a5fa",
    badgeFill: "#2563eb", badgeRadius: 22,
    chipFill: "rgba(96,165,250,0.14)", chipStroke: "rgba(147,197,253,0.55)", chipLabel: "#93c5fd",
    introSub: "#bfdbfe", introAlign: "left",
    lightIsDark: false,
    light1: "#f4f8fc", light2: "#e8f0f8", dot: "rgba(15,36,81,0.045)",
    ink: "#0f2451", bodyText: "#334155", noteText: "rgba(15,36,81,0.40)",
    rule1: "#1d6fd8", rule2: "#17a4c9",
    headerStyle: "pill", headerBadgeFill: "#0f2451", headerBadgeText: "#ffffff",
    amount:   { accent: "#f59e0b", tint: "rgba(245,158,11,0.06)", label: "#92400e", value: "#d97706", valueSub: "#b45309" },
    deadline: { accent: "#4f46e5", tint: "rgba(99,102,241,0.06)", label: "#3730a3", value: "#4338ca", valueSub: "#6366f1" },
    target:   { accent: "#16a34a", tint: "rgba(22,163,74,0.06)",  label: "#166534", value: "#15803d" },
    barTrack: "#d8e0ea", barTitleText: "rgba(15,36,81,0.72)", barRestText: "#475569",
    flowColors: ["#2563eb", "#0ea5e9", "#17a4c9", "#16a34a", "#6366f1", "#d97706"],
    flowBarBg: "#eaf2fb", flowBarText: "#1d4ed8",
    afterAccent: "#1d6fd8", afterTitle: "#1d4ed8", afterLine: "#bfdbfe", pillFill: "#f59e0b",
  },
  // B: ディープグリーン×エメラルド・クリーム背景・中央寄せイントロ・下線型ヘッダー
  B: {
    id: "B",
    dark1: "#0b3d2e", dark2: "#14532d", ctaDark2: "#166534",
    glow1: "#10b981", glow2: "#34d399",
    badgeFill: "#059669", badgeRadius: 22,
    chipFill: "rgba(52,211,153,0.16)", chipStroke: "rgba(110,231,183,0.50)", chipLabel: "#6ee7b7",
    introSub: "#a7f3d0", introAlign: "center",
    lightIsDark: false,
    light1: "#faf8f0", light2: "#f0ebdd", dot: "rgba(20,83,45,0.05)",
    ink: "#14532d", bodyText: "#44403c", noteText: "rgba(20,83,45,0.45)",
    rule1: "#059669", rule2: "#0d9488",
    headerStyle: "underline", headerBadgeFill: "#14532d", headerBadgeText: "#ffffff",
    amount:   { accent: "#d97706", tint: "rgba(217,119,6,0.07)",  label: "#92400e", value: "#b45309", valueSub: "#b45309" },
    deadline: { accent: "#0d9488", tint: "rgba(13,148,136,0.07)", label: "#115e59", value: "#0f766e", valueSub: "#0d9488" },
    target:   { accent: "#65a30d", tint: "rgba(101,163,13,0.07)", label: "#3f6212", value: "#4d7c0f" },
    barTrack: "#e2dcc8", barTitleText: "rgba(20,83,45,0.75)", barRestText: "#57534e",
    flowColors: ["#059669", "#0d9488", "#0891b2", "#65a30d", "#d97706", "#92400e"],
    flowBarBg: "#e5f0e8", flowBarText: "#047857",
    afterAccent: "#059669", afterTitle: "#047857", afterLine: "#a7f3d0", pillFill: "#d97706",
  },
  // C: ホワイト×ゴールドブルー・明るい信頼感重視・スポットライト構成
  C: {
    id: "C",
    dark1: "#f8fbff", dark2: "#eef6ff", ctaDark2: "#f7fbff",
    glow1: "#f59e0b", glow2: "#2563eb",
    badgeFill: "#1d4ed8", badgeRadius: 16,
    chipFill: "#fff7ed", chipStroke: "#fed7aa", chipLabel: "#92400e",
    introSub: "#1d4ed8", introAlign: "left",
    lightIsDark: false,
    light1: "#fbfdff", light2: "#edf6ff", dot: "rgba(37,99,235,0.04)",
    ink: "#12324f", bodyText: "#334155", noteText: "rgba(18,50,79,0.48)",
    rule1: "#2563eb", rule2: "#f59e0b",
    headerStyle: "pill", headerBadgeFill: "#1e3a8a", headerBadgeText: "#ffffff",
    amount:   { accent: "#f59e0b", tint: "#fffaf0", label: "#92400e", value: "#b45309", valueSub: "#b45309" },
    deadline: { accent: "#2563eb", tint: "#eff6ff", label: "#1e3a8a", value: "#1d4ed8", valueSub: "#2563eb" },
    target:   { accent: "#059669", tint: "#f0fdf4", label: "#065f46", value: "#047857" },
    barTrack: "#dbeafe", barTitleText: "rgba(18,50,79,0.72)", barRestText: "#475569",
    flowColors: ["#f59e0b", "#2563eb", "#0ea5e9", "#059669", "#6366f1", "#e11d48"],
    flowBarBg: "#eff6ff", flowBarText: "#1d4ed8",
    afterAccent: "#2563eb", afterTitle: "#1d4ed8", afterLine: "#bfdbfe", pillFill: "#f59e0b",
  },
  // D: スカイブルー×コーラル・フレーム中央配置・明るいクリーン系
  D: {
    id: "D",
    dark1: "#0369a1", dark2: "#0284c7", ctaDark2: "#075985",
    glow1: "#f97316", glow2: "#fbbf24",
    badgeFill: "#f97316", badgeRadius: 24,
    chipFill: "rgba(249,115,22,0.12)", chipStroke: "rgba(249,115,22,0.40)", chipLabel: "#fed7aa",
    introSub: "#bae6fd", introAlign: "center",
    lightIsDark: false,
    light1: "#f0f9ff", light2: "#e0f2fe", dot: "rgba(3,105,161,0.04)",
    ink: "#0c4a6e", bodyText: "#1e3a5f", noteText: "rgba(12,74,110,0.45)",
    rule1: "#f97316", rule2: "#0ea5e9",
    headerStyle: "underline", headerBadgeFill: "#0c4a6e", headerBadgeText: "#ffffff",
    amount:   { accent: "#f97316", tint: "rgba(249,115,22,0.07)", label: "#9a3412", value: "#c2410c", valueSub: "#ea580c" },
    deadline: { accent: "#0284c7", tint: "rgba(2,132,199,0.07)", label: "#075985", value: "#0369a1", valueSub: "#0284c7" },
    target:   { accent: "#059669", tint: "rgba(5,150,105,0.07)", label: "#065f46", value: "#047857" },
    barTrack: "#bae6fd", barTitleText: "rgba(12,74,110,0.72)", barRestText: "#334155",
    flowColors: ["#f97316", "#0284c7", "#0ea5e9", "#059669", "#8b5cf6", "#ef4444"],
    flowBarBg: "#fff7ed", flowBarText: "#c2410c",
    afterAccent: "#f97316", afterTitle: "#c2410c", afterLine: "#fed7aa", pillFill: "#f97316",
  },
};

/** subsidyId のハッシュでテーマを決定（同じ補助金は常に同じパターン）。--pattern=A|B|C|D で上書き可 */
function pickTheme(subsidyId: string, override?: string): SlideTheme {
  if (override) {
    const t = THEMES[override.toUpperCase()];
    if (t) return t;
    console.warn(`⚠️  不明なパターン "${override}" — ハッシュ選択にフォールバックします`);
  }
  const keys = Object.keys(THEMES);
  let h = 0;
  for (const ch of subsidyId) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return THEMES[keys[h % keys.length]];
}

/** ライト系スライド共通の背景（グラデーション＋ドットグリッド＋影＋罫線グラデ定義） */
function lightBase(t: SlideTheme): string {
  return `<defs>
    <linearGradient id="bgr" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${t.light1}"/>
      <stop offset="100%" stop-color="${t.light2}"/>
    </linearGradient>
    <linearGradient id="rule" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${t.rule1}"/>
      <stop offset="55%" stop-color="${t.rule2}"/>
      <stop offset="100%" stop-color="transparent"/>
    </linearGradient>
    <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${t.rule1}"/>
      <stop offset="100%" stop-color="${t.rule2}"/>
    </linearGradient>
    <filter id="sh"><feDropShadow dx="0" dy="10" stdDeviation="20" flood-color="#000" flood-opacity="${t.lightIsDark ? 0.35 : 0.08}"/></filter>
    <pattern id="dots" width="30" height="30" patternUnits="userSpaceOnUse">
      <circle cx="1.5" cy="1.5" r="1.5" fill="${t.dot}"/>
    </pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bgr)"/>
  <rect width="${W}" height="${H}" fill="url(#dots)"/>`;
}

/** ライト系スライド共通のヘッダー（バッジ＋タイトル＋罫線） */
function lightHeader(t: SlideTheme, badge: string, badgeW: number, title: string, ruleW: number): string {
  if (t.headerStyle === "underline") {
    return `<rect x="57" y="50" width="12" height="12" fill="${t.rule1}"/>
  <text x="78" y="62" font-family="${FONT},sans-serif" font-size="15" font-weight="900" fill="${t.rule1}" letter-spacing="4">${esc(badge)}</text>
  <text x="57" y="130" font-family="${FONT},sans-serif" font-size="38" font-weight="900" fill="${t.ink}">${esc(title)}</text>
  <rect x="57" y="144" width="${ruleW}" height="4" rx="2" fill="url(#rule)"/>`;
  }
  return `<rect x="57" y="46" width="${badgeW}" height="38" rx="${Math.min(19, t.badgeRadius)}" fill="${t.headerBadgeFill}"/>
  <text x="${57 + badgeW / 2}" y="71" text-anchor="middle" font-family="${FONT},sans-serif" font-size="15" font-weight="900" fill="${t.headerBadgeText}" letter-spacing="4">${esc(badge)}</text>
  <text x="57" y="130" font-family="${FONT},sans-serif" font-size="38" font-weight="900" fill="${t.ink}">${esc(title)}</text>
  <rect x="57" y="144" width="${ruleW}" height="4" rx="2" fill="url(#rule)"/>`;
}

/** ページドット＋ブランド表記（page は 0 始まり） */
function slideFooter(t: SlideTheme, page: number, dark = t.lightIsDark): string {
  const on = dark ? "#ffffff" : t.ink;
  const off = dark ? "rgba(255,255,255,0.30)" : "rgba(0,0,0,0.15)";
  const brand = dark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.30)";
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
function slide1Intro(d: SlideData, ff: string, t: SlideTheme): string {
  const amountDisp = formatAmountDisp(d.amount);

  // ── Pattern B: 白背景＋左テキスト／右補助上限カード（グリーン系）────
  if (t.id === "B") {
    const nameLines = wrapTextByChars(d.name, 14).slice(0, 3);
    const hero = parseAmountHeroParts(d.amount);
    const greenDark = "#14532d";
    const greenMid = "#047857";
    const greenBright = "#22c55e";
    const greenSoft = "#d1fae5";
    const CX = 780;
    const CW = 440;
    const CH = 248;
    const CY = Math.round((H - CH) / 2);
    const CCX = CX + CW / 2;
    const nameY0 = 228;
    const infoY = 560;
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${ff}
  <defs>
    <filter id="sh"><feDropShadow dx="0" dy="12" stdDeviation="20" flood-color="#14532d" flood-opacity="0.10"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="#ffffff"/>
  <!-- 右側デコレーション（ソフトグリーン円＋同心円アーク） -->
  <circle cx="1080" cy="360" r="320" fill="${greenSoft}" opacity="0.55"/>
  <circle cx="1120" cy="360" r="240" fill="#ecfdf5" opacity="0.70"/>
  <circle cx="1140" cy="360" r="170" fill="none" stroke="${greenMid}" stroke-width="1.2" opacity="0.12"/>
  <circle cx="1140" cy="360" r="220" fill="none" stroke="${greenMid}" stroke-width="1" opacity="0.10"/>
  <circle cx="1140" cy="360" r="270" fill="none" stroke="${greenMid}" stroke-width="0.8" opacity="0.08"/>
  <!-- NTSバッジ -->
  <rect x="57" y="44" width="190" height="44" rx="${t.badgeRadius}" fill="${greenDark}"/>
  <text x="152" y="73" text-anchor="middle" font-family="${FONT},sans-serif" font-size="18" font-weight="800" fill="#fff">NTS 日本提携支援</text>
  <!-- この動画で解説する補助金 -->
  <text x="64" y="164" font-family="${FONT},sans-serif" font-size="20" font-weight="700" fill="${greenMid}" letter-spacing="1">この動画で解説する補助金</text>
  <line x1="64" y1="178" x2="168" y2="178" stroke="${greenMid}" stroke-width="3" stroke-linecap="round"/>
  <!-- 補助金名（左・最大3行） -->
  ${nameLines.map((line, i) =>
    `<text x="64" y="${nameY0 + i * 58}" font-family="${FONT},sans-serif" font-size="42" font-weight="900" fill="${greenDark}">${esc(line)}</text>`
  ).join("\n  ")}
  <!-- 左下：アイコン＋説明テキスト -->
  <circle cx="98" cy="${infoY}" r="34" fill="#f0fdf4" stroke="${greenMid}" stroke-width="1.5"/>
  <rect x="85" y="${infoY - 14}" width="20" height="24" rx="2.5" fill="none" stroke="${greenMid}" stroke-width="1.8"/>
  <line x1="90" y1="${infoY - 6}" x2="100" y2="${infoY - 6}" stroke="${greenMid}" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="90" y1="${infoY}" x2="100" y2="${infoY}" stroke="${greenMid}" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="90" y1="${infoY + 6}" x2="96" y2="${infoY + 6}" stroke="${greenMid}" stroke-width="1.5" stroke-linecap="round"/>
  <circle cx="108" cy="${infoY + 12}" r="7" fill="${greenMid}"/>
  <polyline points="105,${infoY + 12} 108,${infoY + 15} 113,${infoY + 9}" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
  <line x1="142" y1="${infoY - 18}" x2="142" y2="${infoY + 18}" stroke="#d1d5db" stroke-width="1.5"/>
  <text x="156" y="${infoY - 4}" font-family="${FONT},sans-serif" font-size="19" font-weight="600" fill="${t.bodyText}">対象・金額・期限・活用の流れを</text>
  <text x="156" y="${infoY + 24}" font-family="${FONT},sans-serif" font-size="19" font-weight="600" fill="${t.bodyText}">約1分で解説</text>
  <!-- ─── 右カード（縦中央） ─────────────────────────── -->
  <rect x="${CX}" y="${CY}" width="${CW}" height="${CH}" rx="22" fill="#ffffff" filter="url(#sh)"/>
  <text x="${CCX}" y="${CY + 52}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="20" font-weight="800" fill="${greenDark}" letter-spacing="6">補 助 上 限</text>
  <line x1="${CX + 36}" y1="${CY + 72}" x2="${CX + CW - 36}" y2="${CY + 72}" stroke="#d1d5db" stroke-width="1.5"/>
  <text x="${CCX}" y="${CY + 168}" text-anchor="middle" font-family="${FONT},sans-serif" font-weight="900">
    <tspan font-size="30" fill="${greenDark}">${esc(hero.prefix)}</tspan>${hero.suffix ? `<tspan font-size="78" fill="${greenBright}" dx="10">${esc(hero.num)}</tspan><tspan font-size="30" fill="${greenDark}" dx="6">${esc(hero.suffix)}</tspan>` : `<tspan font-size="56" fill="${greenBright}" dx="8">${esc(hero.num)}</tspan>`}
  </text>
  ${slideFooter(t, 0)}
</svg>`;
  }

  // ── Pattern C: 左テキスト + 右ホワイトカード（補助上限＋3アイコン）──
  if (t.id === "C") {
    // 3行まで許容して文字切れを防ぐ。3行時はフォント・行間を縮小して収める
    const nameLines = wrapTextByChars(d.name, 14).slice(0, 3);
    const nameFsC   = nameLines.length <= 2 ? 40 : 34;
    const nameLhC   = nameLines.length <= 2 ? 58 : 50;
    const descLines = wrapTextByChars(trimDescription(d.description, 42), 22).slice(0, 2);
    const targetLines = wrapTextByChars(d.industries.slice(0, 16), 8).slice(0, 2);
    const uc1Lines   = wrapTextByChars(
      d.useCase1.replace(/に活用.*$/, "").replace(/の導入費用.*$/, "").slice(0, 14),
      8
    ).slice(0, 2);
    const CX  = 658;
    const CW  = 566;
    const CCX = CX + CW / 2;                          // カード中央 X
    const amtFsC = scaledAmountFontSize(amountDisp, 70, 500);
    const nameY0  = 240;
    const sepY    = nameY0 + nameLines.length * nameLhC + 14;
    const descY0  = sepY + 42;
    const ICY     = 470;                               // アイコン円中心 Y
    const ICR     = 38;
    const COL1    = Math.round(CX + CW / 6);
    const COL2    = Math.round(CCX);
    const COL3    = Math.round(CX + CW * 5 / 6);
    const LBL_Y0  = ICY + ICR + 20;

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${ff}
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1.2" y2="1">
      <stop offset="0%" stop-color="#eef6ff"/>
      <stop offset="100%" stop-color="#dbeafe"/>
    </linearGradient>
    <filter id="sh"><feDropShadow dx="0" dy="16" stdDeviation="28" flood-color="#1e3a8a" flood-opacity="0.12"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <!-- 右上デコレーション円（ネイビー） -->
  <circle cx="1230" cy="-30" r="380" fill="#1e3a8a" opacity="0.08"/>
  <circle cx="1265" cy="25" r="230" fill="#1e3a8a" opacity="0.06"/>
  <!-- NTSバッジ -->
  <rect x="57" y="44" width="190" height="44" rx="${t.badgeRadius}" fill="${t.badgeFill}"/>
  <text x="152" y="73" text-anchor="middle" font-family="${FONT},sans-serif" font-size="18" font-weight="800" fill="#fff">NTS 日本提携支援</text>
  <!-- この動画で解説する補助金 -->
  <text x="64" y="164" font-family="${FONT},sans-serif" font-size="20" font-weight="800" fill="${t.rule1}" letter-spacing="2">この動画で解説する補助金</text>
  <!-- 補助金名（最大3行・左揃え） -->
  ${nameLines.map((line, i) =>
    `<text x="64" y="${nameY0 + i * nameLhC}" font-family="${FONT},sans-serif" font-size="${nameFsC}" font-weight="900" fill="${t.ink}">${esc(line)}</text>`
  ).join("\n  ")}
  <!-- セパレータ（短いブルーライン） -->
  <line x1="64" y1="${sepY}" x2="200" y2="${sepY}" stroke="${t.rule1}" stroke-width="3" stroke-linecap="round"/>
  <!-- 概要テキスト -->
  ${descLines.map((line, i) =>
    `<text x="64" y="${descY0 + i * 30}" font-family="${FONT},sans-serif" font-size="18" fill="${t.bodyText}">${esc(line)}</text>`
  ).join("\n  ")}
  <!-- ─── 右側ホワイトカード ─────────────────────────────── -->
  <rect x="${CX}" y="60" width="${CW}" height="600" rx="24" fill="#ffffff" filter="url(#sh)"/>
  <!-- 補助上限ヘッダー（横ライン＋テキスト） -->
  <line x1="${CX + 30}" y1="153" x2="${CCX - 74}" y2="153" stroke="#fcd34d" stroke-width="1.5"/>
  <text x="${CCX}" y="159" text-anchor="middle" font-family="${FONT},sans-serif" font-size="18" font-weight="800" fill="${t.amount.label}" letter-spacing="4">補 助 上 限</text>
  <line x1="${CCX + 74}" y1="153" x2="${CX + CW - 30}" y2="153" stroke="#fcd34d" stroke-width="1.5"/>
  <!-- 金額（大・中央） -->
  <text x="${CCX}" y="290" text-anchor="middle" font-family="${FONT},sans-serif" font-size="${amtFsC}" font-weight="900" fill="${t.amount.value}" letter-spacing="-2">${esc(amountDisp)}</text>
  <!-- 横区切りライン -->
  <line x1="${CX + 30}" y1="338" x2="${CX + CW - 30}" y2="338" stroke="#e2e8f0" stroke-width="1.5"/>
  <!-- ── アイコン1: 対象（ビルディング） ── -->
  <circle cx="${COL1}" cy="${ICY}" r="${ICR}" fill="#eff6ff" stroke="${t.rule1}" stroke-width="1.5"/>
  <g transform="translate(${COL1},${ICY})" fill="none" stroke="${t.rule1}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <rect x="-13" y="-11" width="26" height="20" rx="2"/>
    <line x1="-6" y1="9" x2="-6" y2="15"/><line x1="6" y1="9" x2="6" y2="15"/>
    <line x1="-11" y1="15" x2="11" y2="15"/>
    <line x1="-9" y1="-11" x2="-9" y2="-4"/><line x1="9" y1="-11" x2="9" y2="-4"/>
  </g>
  <text x="${COL1}" y="${LBL_Y0}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="12" font-weight="700" fill="${t.noteText}">対象：</text>
  ${targetLines.map((l, i) => `<text x="${COL1}" y="${LBL_Y0 + 16 + i * 16}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="13" font-weight="600" fill="${t.bodyText}">${esc(l)}</text>`).join("\n  ")}
  <!-- ── アイコン2: 活用例（ノートPC） ── -->
  <circle cx="${COL2}" cy="${ICY}" r="${ICR}" fill="#fffbeb" stroke="${t.rule2}" stroke-width="1.5"/>
  <g transform="translate(${COL2},${ICY})" fill="none" stroke="${t.rule2}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <rect x="-15" y="-12" width="30" height="20" rx="2.5"/>
    <line x1="-20" y1="12" x2="20" y2="12" stroke-width="2.5"/>
    <line x1="-7" y1="4" x2="7" y2="4"/>
  </g>
  <text x="${COL2}" y="${LBL_Y0}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="12" font-weight="700" fill="${t.noteText}">活用例：</text>
  ${uc1Lines.map((l, i) => `<text x="${COL2}" y="${LBL_Y0 + 16 + i * 16}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="13" font-weight="600" fill="${t.bodyText}">${esc(l)}</text>`).join("\n  ")}
  <!-- ── アイコン3: 効果（棒グラフ） ── -->
  <circle cx="${COL3}" cy="${ICY}" r="${ICR}" fill="#f0fdf4" stroke="#059669" stroke-width="1.5"/>
  <g transform="translate(${COL3},${ICY})">
    <rect x="-13" y="4" width="8" height="8" rx="1" fill="#059669" opacity="0.30"/>
    <rect x="-2.5" y="-4" width="8" height="16" rx="1" fill="#059669" opacity="0.55"/>
    <rect x="8" y="-12" width="8" height="24" rx="1" fill="#059669" opacity="0.80"/>
    <polyline points="-9,4 1.5,-3 11,-11" fill="none" stroke="#059669" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
    <polyline points="8,-11 14.5,-11 14.5,-5" fill="none" stroke="#059669" stroke-width="2.2" stroke-linecap="round"/>
  </g>
  <text x="${COL3}" y="${LBL_Y0}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="12" font-weight="700" fill="${t.noteText}">効果：</text>
  <text x="${COL3}" y="${LBL_Y0 + 16}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="13" font-weight="600" fill="${t.bodyText}">業務効率化・</text>
  <text x="${COL3}" y="${LBL_Y0 + 32}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="13" font-weight="600" fill="${t.bodyText}">生産性向上</text>
  ${slideFooter(t, 0)}
</svg>`;
  }

  // ── Pattern D: フレームヒーロー（明るい背景・中央配置・コーナーブラケット）──
  if (t.id === "D") {
    const nameLines = wrapTextByChars(d.name, 13).slice(0, 2);
    const nameY = nameLines.length === 1 ? 306 : 254;
    const amtFsD1 = scaledAmountFontSize(amountDisp, 82, 460);
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${ff}
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f0f9ff"/>
      <stop offset="100%" stop-color="#e0f2fe"/>
    </linearGradient>
    <filter id="sh"><feDropShadow dx="0" dy="14" stdDeviation="22" flood-color="#0369a1" flood-opacity="0.12"/></filter>
    <pattern id="dots" width="30" height="30" patternUnits="userSpaceOnUse">
      <circle cx="1.5" cy="1.5" r="1.5" fill="rgba(3,105,161,0.04)"/>
    </pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#dots)"/>
  <!-- デコレーション円（背景） -->
  <circle cx="1140" cy="110" r="320" fill="#bae6fd" opacity="0.30"/>
  <circle cx="160" cy="636" r="240" fill="#fed7aa" opacity="0.25"/>
  <!-- コンテンツフレーム（白カード） -->
  <rect x="120" y="72" width="1040" height="550" rx="26" fill="#ffffff" filter="url(#sh)"/>
  <rect x="120" y="72" width="1040" height="550" rx="26" fill="none" stroke="${t.rule1}" stroke-width="1.5" opacity="0.30"/>
  <!-- NTSバッジ（コーラル、中央トップ） -->
  <rect x="545" y="50" width="190" height="44" rx="22" fill="${t.badgeFill}"/>
  <text x="640" y="79" text-anchor="middle" font-family="${FONT},sans-serif" font-size="18" font-weight="800" fill="#fff">NTS 日本提携支援</text>
  <!-- サブタイトル -->
  <text x="${W / 2}" y="176" text-anchor="middle" font-family="${FONT},sans-serif" font-size="21" font-weight="600" fill="${t.noteText}">この動画で解説する補助金</text>
  <!-- 補助金名（中央・最大2行） -->
  ${nameLines.map((line, i) =>
    `<text x="${W / 2}" y="${nameY + i * 64}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="44" font-weight="900" fill="${t.ink}">${esc(line)}</text>`
  ).join("\n  ")}
  <!-- 区切りライン（コーラル） -->
  <line x1="${W / 2 - 240}" y1="384" x2="${W / 2 + 240}" y2="384" stroke="${t.rule1}" stroke-width="1.5" opacity="0.40"/>
  <!-- 補助上限ラベル -->
  <text x="${W / 2}" y="424" text-anchor="middle" font-family="${FONT},sans-serif" font-size="17" font-weight="700" fill="${t.rule1}" letter-spacing="5">補 助 上 限</text>
  <!-- 金額（大・中央） -->
  <text x="${W / 2}" y="528" text-anchor="middle" font-family="${FONT},sans-serif" font-size="${amtFsD1}" font-weight="900" fill="${t.ink}" letter-spacing="-2">${esc(amountDisp)}</text>
  <!-- 説明テキスト -->
  <text x="${W / 2}" y="588" text-anchor="middle" font-family="${FONT},sans-serif" font-size="18" fill="${t.noteText}">対象・金額・期限・活用の流れを約1分で解説</text>
  ${slideFooter(t, 0)}
</svg>`;
  }

  // ── Pattern A: 左テキスト＋右補助上限カード（ライト2分割）──────────
  // 3行まで許容して文字切れを防ぐ。3行時はフォント・行間を縮小して収める
  const nameLines = wrapTextByChars(d.name, 13).slice(0, 3);
  const nameFsA   = nameLines.length <= 2 ? 44 : 36;
  const nameLhA   = nameLines.length <= 2 ? 62 : 52;
  const nameY0 = 248;
  const CX = 696;        // 右カード X
  const CW = 528;        // 右カード 幅
  const CCX = CX + CW / 2;
  const amtFsA = scaledAmountFontSize(amountDisp, 66, 340);
  // ドット装飾グリッド（右上）
  const dotSvg = (() => {
    const dots: string[] = [];
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 8; c++) {
        dots.push(`<circle cx="${1080 + c * 24}" cy="${54 + r * 24}" r="2.8" fill="${t.rule1}" opacity="0.18"/>`);
      }
    }
    return dots.join("\n  ");
  })();
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${ff}
  ${lightBase(t)}
  <rect width="${W}" height="${H}" fill="url(#bgr)"/>
  ${dotSvg}
  <!-- NTSバッジ -->
  <rect x="57" y="46" width="190" height="44" rx="${t.badgeRadius}" fill="${t.badgeFill}"/>
  <text x="152" y="75" text-anchor="middle" font-family="${FONT},sans-serif" font-size="18" font-weight="800" fill="#fff">NTS 日本提携支援</text>
  <!-- この動画で解説する補助金 -->
  <text x="64" y="190" font-family="${FONT},sans-serif" font-size="20" font-weight="700" fill="${t.rule1}" letter-spacing="2">この動画で解説する補助金</text>
  <!-- 補助金名（左・最大3行） -->
  ${nameLines.map((line, i) =>
    `<text x="64" y="${nameY0 + i * nameLhA}" font-family="${FONT},sans-serif" font-size="${nameFsA}" font-weight="900" fill="${t.ink}">${esc(line)}</text>`
  ).join("\n  ")}
  <!-- アイコン＋説明テキスト行 -->
  <circle cx="98" cy="500" r="32" fill="#eff6ff" stroke="${t.rule1}" stroke-width="1.5"/>
  <!-- 紙アイコン -->
  <rect x="85" y="488" width="20" height="24" rx="2.5" fill="none" stroke="${t.rule1}" stroke-width="1.8"/>
  <line x1="90" y1="496" x2="100" y2="496" stroke="${t.rule1}" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="90" y1="502" x2="100" y2="502" stroke="${t.rule1}" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="90" y1="508" x2="96" y2="508" stroke="${t.rule1}" stroke-width="1.5" stroke-linecap="round"/>
  <text x="142" y="507" font-family="${FONT},sans-serif" font-size="20" font-weight="600" fill="${t.bodyText}">対象・金額・期限・活用の流れを約1分で解説</text>
  <!-- ─── 右カード（縦中央配置） ──────────────────────── -->
  <rect x="${CX}" y="252" width="${CW}" height="196" rx="22" fill="#ffffff" filter="url(#sh)" stroke="${t.rule1}" stroke-opacity="0.15" stroke-width="1.5"/>
  <!-- 「補助上限」ラベル側（左区画） -->
  <rect x="${CX}" y="252" width="152" height="196" rx="22" fill="${t.amount.tint}"/>
  <rect x="${CX + 152}" y="252" width="1" height="196" fill="${t.amount.accent}" opacity="0.20"/>
  <text x="${CX + 76}" y="358" text-anchor="middle" font-family="${FONT},sans-serif" font-size="20" font-weight="800" fill="${t.amount.label}" letter-spacing="2">補助上限</text>
  <!-- 金額（右区画・縦中央） -->
  <text x="${CCX + 76}" y="350" dominant-baseline="central" text-anchor="middle" font-family="${FONT},sans-serif" font-size="${amtFsA}" font-weight="900" fill="${t.amount.value}" letter-spacing="-2">${esc(amountDisp)}</text>
  ${slideFooter(t, 0)}
</svg>`;
}

// 2. What（制度概要）
function slide2What(d: SlideData, ff: string, t: SlideTheme): string {
  const desc2 = wrapTextByChars(trimDescription(d.description, 115), 24).slice(0, 5);

  // ── Pattern B: マガジン見出し＋左縦帯 ────────────────────────
  if (t.id === "B") {
    const shortName = d.name.slice(0, 22);
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${ff}
  ${lightBase(t)}
  <text x="57" y="102" font-family="${FONT},sans-serif" font-size="13" font-weight="900" fill="${t.rule1}" letter-spacing="6">WHAT</text>
  <text x="57" y="144" font-family="${FONT},sans-serif" font-size="40" font-weight="900" fill="${t.ink}">${esc(shortName)}</text>
  <line x1="57" y1="160" x2="${W - 57}" y2="160" stroke="${t.rule1}" stroke-width="2.5" opacity="0.55"/>
  <rect x="57" y="190" width="10" height="${desc2.length * 56 + 20}" rx="5" fill="${t.rule1}" opacity="0.75"/>
  ${desc2.map((l, i) => `<text x="84" y="${222 + i * 56}" font-family="${FONT},sans-serif" font-size="26" fill="${t.bodyText}">${esc(l)}</text>`).join("\n  ")}
  ${slideFooter(t, 1)}
</svg>`;
  }

  // ── Pattern C: 明るい制度概要カード ───────────────────────────
  if (t.id === "C") {
    const descC = wrapTextByChars(trimDescription(d.description, 105), 22).slice(0, 5);
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${ff}
  ${lightBase(t)}
  ${lightHeader(t, "WHAT", 118, "制度の概要", 440)}
  <rect x="57" y="168" width="1166" height="372" rx="22" fill="#ffffff" stroke="#dbeafe" stroke-width="1.5" filter="url(#sh)"/>
  <rect x="57" y="168" width="1166" height="8" rx="4" fill="url(#rule)"/>
  ${descC.map((l, i) => `<text x="98" y="${238 + i * 54}" font-family="${FONT},sans-serif" font-size="27" font-weight="600" fill="${t.bodyText}">${esc(l)}</text>`).join("\n  ")}
  ${slideFooter(t, 1)}
</svg>`;
  }

  // ── Pattern D: シンプルボックス＋テキスト ─────────────────────────
  if (t.id === "D") {
    const descD = wrapTextByChars(trimDescription(d.description, 145), 30).slice(0, 5);
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${ff}
  ${lightBase(t)}
  ${lightHeader(t, "WHAT", 118, d.name.slice(0, 22), 880)}
  <rect x="57" y="172" width="1166" height="${descD.length * 54 + 56}" rx="20" fill="#ffffff" stroke="#bae6fd" stroke-width="1.5" filter="url(#sh)"/>
  <rect x="57" y="172" width="1166" height="8" rx="4" fill="url(#rule)"/>
  ${descD.map((l, i) => `<text x="90" y="${240 + i * 54}" font-family="${FONT},sans-serif" font-size="27" fill="${t.bodyText}">${esc(l)}</text>`).join("\n  ")}
  ${slideFooter(t, 1)}
</svg>`;
  }

  // ── Pattern A: デフォルト ─────────────────────────────────────
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${ff}
  ${lightBase(t)}
  ${lightHeader(t, "WHAT", 118, d.name.slice(0, 24), 900)}
  ${desc2.map((l, i) => `<text x="57" y="${252 + i * 56}" font-family="${FONT},sans-serif" font-size="27" fill="${t.bodyText}">${esc(l)}</text>`).join("\n  ")}
  ${slideFooter(t, 1)}
</svg>`;
}

// 3. Numbers（補助上限・公募期限・対象を3カード＋補助率バー）
// eslint-disable-next-line complexity
function slide3Numbers(d: SlideData, ff: string, t: SlideTheme): string {
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
  // カード内金額のフォントサイズ（ボックス幅 ~300px に収まるよう動的縮小）
  const amtFsCard = scaledAmountFontSize(amtValue, 62, 300);

  // ── 公募期限 ────────────────────────────────────────────────
  const deadlineVal = d.deadline.replace(/^申請期限[：:]\s*/, "");
  // "2025年5月19日" → ["2025年", "5月19日"] と自然に分割
  const yearDateMatch = deadlineVal.match(/^(\d{4}年)(\d{1,2}月\d{1,2}日.*)$/);
  const dlLines: string[] = yearDateMatch
    ? [yearDateMatch[1], yearDateMatch[2]]
    : wrapTextByChars(deadlineVal, 10).slice(0, 2);
  const hasYearDate = yearDateMatch !== null;

  // ── 対象 ────────────────────────────────────────────────────
  const targetRaw = d.industries.replace(/^対象[：:]\s*/, "");
  // 括弧書き・空白除去し、自然な区切りで短縮
  const targetClean = targetRaw
    .replace(/[（(][^）)]*[）)]/g, "")  // 丸括弧を除去
    .replace(/[「"][^」"]*[」"]/g, (m) => m.replace(/^[「"]|[」"]$/g, ""))  // 「...」の括弧記号だけ除去・中身は残す
    .replace(/\s+/g, "")
    .trim();
  // 「・」「、」「など」「全般」等の区切りで自然に短縮（最大16文字優先）
  function shortenTarget(s: string, maxLen: number): string {
    if (s.length <= maxLen) return s;
    // 「など」「全般」の手前で切る
    const nado = s.search(/など|全般/);
    if (nado > 0 && nado <= maxLen) return s.slice(0, nado) + "など";
    // 「・」「、」の直前で切る
    for (let i = Math.min(maxLen, s.length) - 1; i >= Math.floor(maxLen * 0.5); i--) {
      if (/[・、]/.test(s[i])) return s.slice(0, i) + "など";
    }
    return s.slice(0, maxLen);
  }
  const targetForCard = shortenTarget(targetClean, 16);
  // 自然な折り返し: 8文字以内は1行、それ以上は wrapTextByChars で自然分割
  const tgLines = targetForCard.length <= 8
    ? [targetForCard]
    : wrapTextByChars(targetForCard, 9).slice(0, 2);

  // ── 全パターン共通：3列カード（Pattern A と同一レイアウト） ──────
  // ── Pattern D のみ: 3行横並び統計ロウ ────────────────────────
  if (t.id === "D") {
    const RH = 128; const RY0 = 162; const RGAP = 18;
    const LW = 224;
    const ry = (i: number) => RY0 + i * (RH + RGAP);
    // 各行の値SVG
    const amtValSvg = amtPrefix
      ? `<text x="${57 + LW + 32}" y="${ry(0) + 50}" font-family="${FONT},sans-serif" font-size="20" font-weight="700" fill="${t.amount.valueSub ?? t.amount.label}">${esc(amtPrefix)}</text>
  <text x="${57 + LW + 32}" y="${ry(0) + 106}" font-family="${FONT},sans-serif" font-size="58" font-weight="900" fill="${t.amount.value}" letter-spacing="-1">${esc(amtValue)}</text>`
      : `<text x="${57 + LW + 32}" y="${ry(0) + 88}" font-family="${FONT},sans-serif" font-size="58" font-weight="900" fill="${t.amount.value}" letter-spacing="-1">${esc(amtValue)}</text>`;
    const dlValSvg = hasYearDate
      ? `<text x="${57 + LW + 32}" y="${ry(1) + 50}" font-family="${FONT},sans-serif" font-size="20" font-weight="700" fill="${t.deadline.valueSub ?? t.deadline.label}">${esc(dlLines[0])}</text>
  <text x="${57 + LW + 32}" y="${ry(1) + 106}" font-family="${FONT},sans-serif" font-size="50" font-weight="900" fill="${t.deadline.value}">${esc(dlLines[1])}</text>`
      : `<text x="${57 + LW + 32}" y="${ry(1) + 88}" font-family="${FONT},sans-serif" font-size="42" font-weight="900" fill="${t.deadline.value}">${esc(dlLines.join(""))}</text>`;
    const tgValSvg = tgLines.map((line, i) =>
      `<text x="${57 + LW + 32}" y="${ry(2) + (tgLines.length === 1 ? 88 : 58 + i * 50)}" font-family="${FONT},sans-serif" font-size="${tgLines.length === 1 ? 38 : 32}" font-weight="900" fill="${t.target.value}">${esc(line)}</text>`
    ).join("\n  ");
    const rows = [
      { accent: t.amount.accent,   label: "補助上限", labelC: t.amount.label,   valSvg: amtValSvg },
      { accent: t.deadline.accent, label: "公募期限", labelC: t.deadline.label, valSvg: dlValSvg  },
      { accent: t.target.accent,   label: "対象",     labelC: t.target.label,   valSvg: tgValSvg  },
    ];
    const rowsSvg = rows.map((row, i) => {
      const y = ry(i);
      return `<rect x="57" y="${y}" width="1166" height="${RH}" rx="16" fill="#ffffff" stroke="#bae6fd" stroke-width="1.5"/>
  <rect x="57" y="${y}" width="6" height="${RH}" rx="3" fill="${row.accent}"/>
  <line x1="${57 + LW}" y1="${y + 18}" x2="${57 + LW}" y2="${y + RH - 18}" stroke="#e0f2fe" stroke-width="1.5"/>
  <text x="${57 + LW / 2}" y="${y + RH / 2 + 8}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="19" font-weight="900" fill="${row.labelC}" letter-spacing="1">${esc(row.label)}</text>
  ${row.valSvg}`;
    }).join("\n  ");
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${ff}
  ${lightBase(t)}
  ${lightHeader(t, "NUMBERS", 148, "数字で見る制度概要", 530)}
  ${rowsSvg}
  <text x="${W / 2}" y="${H - 44}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="16" fill="${t.noteText}">※詳細は日本提携支援までご連絡ください</text>
  ${slideFooter(t, 2)}
</svg>`;
  }

  // eslint-disable-next-line no-inner-declarations
  function card(
    x: number, cx: number,
    accentColor: string, iconBg: string, labelColor: string,
    label: string, valueSvg: string, icoPaths: string,
  ): string {
    const ICX  = x + 50;
    const ICYO = CY + 68;
    const ICR  = 34;
    const LBX  = x + 100;
    const LBY  = CY + 63;
    const LU_Y = CY + 79;
    return `
  <rect x="${x}" y="${CY}" width="${CW}" height="${CH}" rx="22" fill="#fff" filter="url(#sh)" stroke="${accentColor}" stroke-opacity="0.22" stroke-width="1.5"/>
  <circle cx="${ICX}" cy="${ICYO}" r="${ICR}" fill="${iconBg}" stroke="${accentColor}" stroke-width="1.5"/>
  ${icoPaths}
  <text x="${LBX}" y="${LBY}" font-family="${FONT},sans-serif" font-size="18" font-weight="700" fill="${labelColor}">${esc(label)}</text>
  <line x1="${LBX}" y1="${LU_Y}" x2="${x + CW - 28}" y2="${LU_Y}" stroke="${accentColor}" stroke-width="1.5" stroke-opacity="0.35"/>
${valueSvg}`;
  }

  // ── カード1：補助上限（¥ アイコン） ─────────────────────────
  const ICX1 = X1 + 50; const ICYO1 = CY + 68;
  const amtIco = `<text x="${ICX1}" y="${ICYO1 + 10}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="26" font-weight="900" fill="${t.amount.accent}">¥</text>`;
  const amtSvg = [
    amtPrefix
      ? `  <text x="${cx1}" y="${CY + 150}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="22" font-weight="700" fill="${t.amount.valueSub ?? t.amount.label}">${esc(amtPrefix)}</text>`
      : "",
    `  <text x="${cx1}" y="${CY + (amtPrefix ? 232 : 206)}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="${amtFsCard}" font-weight="900" fill="${t.amount.value}" letter-spacing="-2">${esc(amtValue)}</text>`,
  ].filter(Boolean).join("\n");

  // ── カード2：公募期限（カレンダーアイコン） ──────────────────
  const ICX2 = X2 + 50; const ICYO2 = CY + 68;
  const dlIco = `
  <rect x="${ICX2 - 12}" y="${ICYO2 - 12}" width="24" height="20" rx="3" fill="none" stroke="${t.deadline.accent}" stroke-width="1.7"/>
  <line x1="${ICX2 - 12}" y1="${ICYO2 - 4}" x2="${ICX2 + 12}" y2="${ICYO2 - 4}" stroke="${t.deadline.accent}" stroke-width="1.7"/>
  <rect x="${ICX2 - 8}" y="${ICYO2 + 1}" width="4" height="4" rx="1" fill="${t.deadline.accent}" opacity="0.70"/>
  <rect x="${ICX2 - 1}" y="${ICYO2 + 1}" width="4" height="4" rx="1" fill="${t.deadline.accent}" opacity="0.70"/>
  <rect x="${ICX2 + 6}" y="${ICYO2 + 1}" width="4" height="4" rx="1" fill="${t.deadline.accent}" opacity="0.70"/>
  <line x1="${ICX2 - 6}" y1="${ICYO2 - 16}" x2="${ICX2 - 6}" y2="${ICYO2 - 8}" stroke="${t.deadline.accent}" stroke-width="2" stroke-linecap="round"/>
  <line x1="${ICX2 + 6}" y1="${ICYO2 - 16}" x2="${ICX2 + 6}" y2="${ICYO2 - 8}" stroke="${t.deadline.accent}" stroke-width="2" stroke-linecap="round"/>`;
  const dlSvg = hasYearDate
    ? [
        `  <text x="${cx2}" y="${CY + 150}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="24" font-weight="700" fill="${t.deadline.valueSub ?? t.deadline.label}">${esc(dlLines[0])}</text>`,
        `  <text x="${cx2}" y="${CY + 234}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="54" font-weight="900" fill="${t.deadline.value}">${esc(dlLines[1])}</text>`,
      ].join("\n")
    : dlLines.map((line, i) =>
        `  <text x="${cx2}" y="${CY + (dlLines.length === 1 ? 206 : 150 + i * 72)}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="${dlLines.length === 1 ? 40 : 36}" font-weight="900" fill="${t.deadline.value}">${esc(line)}</text>`,
      ).join("\n");

  // ── カード3：対象（ビルディングアイコン） ─────────────────────
  const ICX3 = X3 + 50; const ICYO3 = CY + 68;
  const tgIco = `
  <rect x="${ICX3 - 12}" y="${ICYO3 - 12}" width="24" height="22" rx="2" fill="none" stroke="${t.target.accent}" stroke-width="1.7"/>
  <rect x="${ICX3 - 8}" y="${ICYO3 - 8}" width="5" height="5" rx="1" fill="${t.target.accent}" opacity="0.65"/>
  <rect x="${ICX3 + 3}" y="${ICYO3 - 8}" width="5" height="5" rx="1" fill="${t.target.accent}" opacity="0.65"/>
  <rect x="${ICX3 - 8}" y="${ICYO3 + 1}" width="5" height="5" rx="1" fill="${t.target.accent}" opacity="0.65"/>
  <rect x="${ICX3 + 3}" y="${ICYO3 + 1}" width="5" height="5" rx="1" fill="${t.target.accent}" opacity="0.65"/>
  <rect x="${ICX3 - 3}" y="${ICYO3 + 6}" width="6" height="4" rx="1" fill="${t.target.accent}" opacity="0.80"/>`;
  const tgFontSize = tgLines.length === 1 ? 34 : tgLines.some(l => l.length >= 8) ? 26 : 28;
  const tgSvg = tgLines.map((line, i) =>
    `  <text x="${cx3}" y="${CY + (tgLines.length === 1 ? 206 : 158 + i * 72)}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="${tgFontSize}" font-weight="900" fill="${t.target.value}">${esc(line)}</text>`,
  ).join("\n");

  // ── 補助率バー（rate があるときのみ） ─────────────────────────
  const BAR_X = X1;
  const BAR_W = X3 + CW - X1;
  let rateBarSvg = "";
  if (d.rateFrac != null && d.rateLabel) {
    const subW = Math.round(BAR_W * d.rateFrac);
    const restW = BAR_W - subW;
    const subLabel = subW > 250 ? `<text x="${BAR_X + subW / 2}" y="${591}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="16" font-weight="800" fill="#fff">補助でカバー ${esc(d.rateLabel)}</text>` : "";
    const restLabel = restW > 170 ? `<text x="${BAR_X + subW + restW / 2}" y="${591}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="15" font-weight="700" fill="${t.barRestText}">自己負担</text>` : "";
    rateBarSvg = `
  <text x="${BAR_X}" y="${552}" font-family="${FONT},sans-serif" font-size="17" font-weight="800" fill="${t.barTitleText}">費用負担のイメージ（補助率 ${esc(d.rateLabel)}）</text>
  <text x="${BAR_X + BAR_W}" y="${552}" text-anchor="end" font-family="${FONT},sans-serif" font-size="14" fill="${t.noteText}">※詳細は日本提携支援までご連絡ください</text>
  <rect x="${BAR_X}" y="${568}" width="${BAR_W}" height="34" rx="9" fill="${t.barTrack}"/>
  <rect x="${BAR_X}" y="${568}" width="${subW}" height="34" rx="9" fill="url(#barGrad)"/>
  ${subLabel}
  ${restLabel}`;
  } else {
    rateBarSvg = `
  <text x="${W / 2}" y="${578}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="18" fill="${t.noteText}">※詳細は日本提携支援までご連絡ください</text>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${ff}
  ${lightBase(t)}
  ${lightHeader(t, "NUMBERS", 148, "数字で見る制度概要", 530)}
${card(X1, cx1, t.amount.accent,   t.amount.tint,   t.amount.label,   "補助上限", amtSvg, amtIco)}
${card(X2, cx2, t.deadline.accent, t.deadline.tint, t.deadline.label, "公募期限", dlSvg,  dlIco)}
${card(X3, cx3, t.target.accent,   t.target.tint,   t.target.label,   "対象",     tgSvg,  tgIco)}
${rateBarSvg}
  ${slideFooter(t, 2)}
</svg>`;
}

// 4. Flow（A-1: 日本提携支援の補助金サポートサービスの流れ・6ステップ図解）
function slide4Flow(ff: string, t: SlideTheme): string {  // eslint-disable-line complexity
  const steps = [
    { label: "無料相談",     sub: "まずはお気軽に",       icon: "chat" },
    { label: "課題特定",     sub: "経営課題を整理",       icon: "search" },
    { label: "補助金紹介",   sub: "最適な制度をご提案",   icon: "gift" },
    { label: "採択サポート", sub: "申請を専門家が支援",   icon: "check" },
    { label: "活用設計",     sub: "採択後の活かし方を設計", icon: "compass" },
    { label: "伴走",         sub: "採択後も1年間サポート", icon: "people" },
  ].map((s, i) => ({ ...s, color: t.flowColors[i] }));

  // ── Pattern B: 縦型タイムライン（6行リスト）────────────────────
  if (t.id === "B") {
    const Y_START = 170;
    const ROW_H = 58;
    const GAP_Y = 8;
    const LINE_X = 128;
    const CARD_X = 172;
    const CARD_W = 1010;
    const arrowC = "rgba(20,83,45,0.20)";
    const rowSvg = steps.map((s, i) => {
      const y = Y_START + i * (ROW_H + GAP_Y);
      const cy = y + ROW_H / 2;
      return `
  <rect x="${CARD_X}" y="${y}" width="${CARD_W}" height="${ROW_H}" rx="14" fill="#fff" filter="url(#sh)"/>
  <rect x="${CARD_X}" y="${y}" width="7" height="${ROW_H}" rx="3.5" fill="${s.color}"/>
  <circle cx="${LINE_X}" cy="${cy}" r="20" fill="${s.color}"/>
  ${flowGlyph(s.icon, LINE_X, cy, s.color)}
  <text x="${CARD_X + 34}" y="${cy - 8}" font-family="${FONT},sans-serif" font-size="10" font-weight="900" fill="${s.color}" letter-spacing="2">STEP ${i + 1}</text>
  <text x="${CARD_X + 132}" y="${cy + 8}" font-family="${FONT},sans-serif" font-size="22" font-weight="900" fill="${t.ink}">${esc(s.label)}</text>
  <text x="${CARD_X + 360}" y="${cy + 7}" font-family="${FONT},sans-serif" font-size="15" fill="#64748b">${esc(s.sub)}</text>`;
    }).join("\n");
    const lineY1 = Y_START + ROW_H / 2;
    const lineY2 = Y_START + 5 * (ROW_H + GAP_Y) + ROW_H / 2;
    const barY = Y_START + 6 * (ROW_H + GAP_Y) + 12;
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${ff}
  ${lightBase(t)}
  ${lightHeader(t, "FLOW", 118, "日本提携支援のサポートの流れ", 640)}
  <line x1="${LINE_X}" y1="${lineY1}" x2="${LINE_X}" y2="${lineY2}" stroke="${arrowC}" stroke-width="3" stroke-dasharray="7,6"/>
${rowSvg}
  <rect x="57" y="${barY}" width="1166" height="50" rx="14" fill="${t.flowBarBg}"/>
  <text x="${W / 2}" y="${barY + 32}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="19" font-weight="700" fill="${t.flowBarText}">無料相談から採択後の伴走まで、一貫してサポートします</text>
  ${slideFooter(t, 3)}
</svg>`;
  }

  // ── Pattern C: 2列×3行グリッド ───────────────────────────────────
  if (t.id === "C") {
    const COLS = 3; const ROWS = 2;
    const GX = 16; const GY = 18;
    const CW_G = Math.floor((1166 - GX * (COLS - 1)) / COLS); // ≈ 378
    const CH_G = Math.floor((380 - GY) / ROWS); // ≈ 181
    const GY0 = 185;
    const gridSvg = steps.map((s, si) => {
      const col = si % COLS;
      const row = Math.floor(si / COLS);
      const gx = 57 + col * (CW_G + GX);
      const gy = GY0 + row * (CH_G + GY);
      const gcx = gx + CW_G / 2;
      return `
  <rect x="${gx}" y="${gy}" width="${CW_G}" height="${CH_G}" rx="16" fill="#fff" stroke="#dbeafe" stroke-width="1.5" filter="url(#sh)"/>
  <rect x="${gcx - 18}" y="${gy + 14}" width="36" height="36" rx="18" fill="url(#numBadge)"/>
  <text x="${gcx}" y="${gy + 37}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="14" font-weight="900" fill="#fff">${si + 1}</text>
  <circle cx="${gcx}" cy="${gy + 52}" r="30" fill="${s.color}" opacity="0.88"/>
  ${flowGlyph(s.icon, gcx, gy + 52, s.color)}
  <text x="${gx + CW_G / 2}" y="${gy + CH_G - 42}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="21" font-weight="900" fill="${t.ink}">${esc(s.label)}</text>
  <text x="${gx + CW_G / 2}" y="${gy + CH_G - 18}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="12" fill="${t.noteText}">${esc(s.sub)}</text>`;
    }).join("\n");
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${ff}
  ${lightBase(t)}
  <defs>
    <linearGradient id="numBadge" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1e40af"/>
      <stop offset="100%" stop-color="#2563eb"/>
    </linearGradient>
  </defs>
  ${lightHeader(t, "FLOW", 118, "日本提携支援のサポートの流れ", 640)}
${gridSvg}
  <rect x="57" y="${GY0 + ROWS * (CH_G + GY) + 8}" width="1166" height="52" rx="13" fill="${t.flowBarBg}"/>
  <text x="${W / 2}" y="${GY0 + ROWS * (CH_G + GY) + 41}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="20" font-weight="700" fill="${t.flowBarText}">無料相談から採択後の伴走まで、一貫してサポートします</text>
  ${slideFooter(t, 3)}
</svg>`;
  }

  // ── Pattern D: U字2段フロー（上段3ステップ → 下段3ステップ）─────
  if (t.id === "D") {
    const ROW_H = 216;
    const CW_D = 350;
    const GAP_D = (1166 - CW_D * 3) / 2;
    const Y_TOP = 180; const Y_BOT = Y_TOP + ROW_H + 36;
    const arrowC = "rgba(14,165,233,0.50)";
    const topSteps = steps.slice(0, 3);
    const botSteps = steps.slice(3).reverse(); // 右から左へ並べてU字に

    const makeCard = (s: typeof steps[0], i: number, rowY: number, reversed: boolean) => {
      const col = reversed ? 2 - i : i;
      const x = 57 + col * (CW_D + GAP_D);
      const cx = x + CW_D / 2;
      const stepNum = reversed ? steps.length - i : i + 1;
      return `<rect x="${x}" y="${rowY}" width="${CW_D}" height="${ROW_H}" rx="18" fill="#ffffff" stroke="#bae6fd" stroke-width="1.5"/>
  <rect x="${x}" y="${rowY}" width="${CW_D}" height="8" rx="4" fill="${s.color}"/>
  <text x="${cx}" y="${rowY + 34}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="11" font-weight="900" fill="${s.color}" letter-spacing="3">STEP ${stepNum}</text>
  <circle cx="${cx}" cy="${rowY + 100}" r="32" fill="${s.color}"/>
  ${flowGlyph(s.icon, cx, rowY + 100, s.color)}
  <text x="${cx}" y="${rowY + 160}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="19" font-weight="900" fill="${t.ink}">${esc(s.label)}</text>
  <text x="${cx}" y="${rowY + 190}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="12" fill="#64748b">${esc(s.sub)}</text>`;
    };

    const topCards = topSteps.map((s, i) => makeCard(s, i, Y_TOP, false)).join("\n  ");
    const botCards = botSteps.map((s, i) => makeCard(s, i, Y_BOT, true)).join("\n  ");

    // 上段の矢印（左→右）
    const topArrows = [0, 1].map(i => {
      const ax = 57 + (i + 1) * (CW_D + GAP_D) - GAP_D / 2;
      const ay = Y_TOP + ROW_H / 2;
      return `<path d="M ${ax - 6} ${ay - 8} L ${ax + 6} ${ay} L ${ax - 6} ${ay + 8}" stroke="${arrowC}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    }).join("\n  ");

    // U字の折り返し矢印（右端下向き）
    const turnX = 57 + 3 * CW_D + 2 * GAP_D + CW_D / 2;
    const turnArrow = `<path d="M ${turnX} ${Y_TOP + ROW_H + 4} L ${turnX} ${Y_BOT - 4}" stroke="${arrowC}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  <path d="M ${turnX - 8} ${Y_BOT - 14} L ${turnX} ${Y_BOT - 2} L ${turnX + 8} ${Y_BOT - 14}" stroke="${arrowC}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;

    // 下段の矢印（右←左、視覚的には左←右）
    const botArrows = [0, 1].map(i => {
      const ax = 57 + (2 - i) * (CW_D + GAP_D) - GAP_D / 2;
      const ay = Y_BOT + ROW_H / 2;
      return `<path d="M ${ax + 6} ${ay - 8} L ${ax - 6} ${ay} L ${ax + 6} ${ay + 8}" stroke="${arrowC}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    }).join("\n  ");

    const barY = Y_BOT + ROW_H + 14;
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${ff}
  ${lightBase(t)}
  ${lightHeader(t, "FLOW", 118, "日本提携支援のサポートの流れ", 640)}
  ${topCards}
  ${botCards}
  <rect x="57" y="${barY}" width="1166" height="56" rx="16" fill="${t.flowBarBg}"/>
  <text x="${W / 2}" y="${barY + 36}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="20" font-weight="700" fill="${t.flowBarText}">無料相談から採択後の伴走まで、一貫してサポートします</text>
  ${slideFooter(t, 3)}
</svg>`;
  }

  // ── Pattern A: 横並びカード＋矢印 ────────────────────────────────
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
  <text x="${cx}" y="${Y0 + 172}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="20" font-weight="900" fill="#1e293b">${esc(s.label)}</text>
  <text x="${cx}" y="${Y0 + 206}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="12" fill="#64748b">${esc(s.sub)}</text>`;
  }).join("\n");

  const arrowColor = t.lightIsDark ? "rgba(255,255,255,0.45)" : "#94a3b8";
  const arrows = steps.slice(0, -1).map((_, i) => {
    const ax = 57 + (i + 1) * (CW2 + GAP2) - GAP2 / 2;
    const ay = Y0 + CH2 / 2;
    return `<path d="M ${ax - 5.5} ${ay - 8} L ${ax + 5.5} ${ay} L ${ax - 5.5} ${ay + 8}" stroke="${arrowColor}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  }).join("\n  ");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${ff}
  ${lightBase(t)}
  ${lightHeader(t, "FLOW", 118, "日本提携支援のサポートの流れ", 640)}
${cards}
  ${arrows}
  <rect x="57" y="508" width="1166" height="64" rx="16" fill="${t.flowBarBg}"/>
  <text x="${W / 2}" y="${508 + 41}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="21" font-weight="700" fill="${t.flowBarText}">無料相談から採択後の伴走まで、一貫してサポートします</text>
  ${slideFooter(t, 3)}
</svg>`;
}

// 5. Before/After（A-3: 導入前の課題 → 補助金活用後）
function slide5BeforeAfter(d: SlideData, ff: string, t: SlideTheme): string {  // eslint-disable-line complexity
  const pains = d.pains.slice(0, 3);
  const afters = [
    d.useCase1.replace(/に活用$/, ""),
    d.useCase2.replace(/に活用$/, ""),
    "生産性向上・コスト削減へ",
  ];
  // ── Pattern B: 2カラム比較テーブル ──────────────────────────────
  if (t.id === "B") {
    const TBL_Y = 172;
    const HDR_H = 48;
    const ROW_H = 94;
    const TBL_W = 1166;
    const C1W = TBL_W / 2;
    const divX = 57 + C1W;
    const rows = pains.map((p, i) => ({ before: p, after: afters[i] }));
    const hdrRow = `
  <rect x="57" y="${TBL_Y}" width="${TBL_W}" height="${HDR_H}" rx="10" fill="#e5f0e8"/>
  <rect x="57" y="${TBL_Y + HDR_H - 4}" width="${TBL_W}" height="4" fill="${t.rule1}" opacity="0.55"/>
  <text x="${57 + C1W / 2}" y="${TBL_Y + 31}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="19" font-weight="800" fill="${t.ink}">導入前の課題</text>
  <text x="${divX + C1W / 2}" y="${TBL_Y + 31}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="19" font-weight="800" fill="${t.ink}">補助金活用後</text>`;
    const dataRows = rows.map((r, i) => {
      const ry = TBL_Y + HDR_H + i * ROW_H;
      const bg = i % 2 === 0 ? "#f8fafc" : "#ffffff";
      const beforeLines = wrapTextByChars(r.before, 20).slice(0, 2);
      const afterLines = wrapTextByChars(r.after, 20).slice(0, 2);
      const byCx = 57 + C1W / 2;
      const aCx = divX + C1W / 2;
      const beforeSvg = beforeLines.map((l, j) =>
        `<text x="${byCx}" y="${ry + (beforeLines.length === 1 ? 52 : 34 + j * 34)}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="19" fill="#475569">${esc(l)}</text>`
      ).join("\n  ");
      const afterSvg = afterLines.map((l, j) =>
        `<text x="${aCx}" y="${ry + (afterLines.length === 1 ? 52 : 34 + j * 34)}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="19" font-weight="700" fill="${t.afterTitle}">${esc(l)}</text>`
      ).join("\n  ");
      return `
  <rect x="57" y="${ry}" width="${TBL_W}" height="${ROW_H}" rx="0" fill="${bg}"/>
  <rect x="57" y="${ry}" width="${TBL_W}" height="1" fill="#e2e8f0"/>
  <circle cx="${divX}" cy="${ry + ROW_H / 2}" r="15" fill="${t.rule1}"/>
  <text x="${divX}" y="${ry + ROW_H / 2 + 6}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="13" font-weight="900" fill="#fff">→</text>
  <circle cx="${57 + 20}" cy="${ry + ROW_H / 2}" r="10" fill="#fee2e2"/>
  <path d="M ${57 + 14} ${ry + ROW_H / 2 - 5} L ${57 + 26} ${ry + ROW_H / 2 + 5} M ${57 + 26} ${ry + ROW_H / 2 - 5} L ${57 + 14} ${ry + ROW_H / 2 + 5}" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/>
  <circle cx="${divX + C1W - 20}" cy="${ry + ROW_H / 2}" r="10" fill="#dcfce7"/>
  <path d="M ${divX + C1W - 26} ${ry + ROW_H / 2} l 5 6 l 9 -11" stroke="#16a34a" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  ${beforeSvg}
  ${afterSvg}`;
    }).join("\n");
    const tblBotY = TBL_Y + HDR_H + rows.length * ROW_H;
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${ff}
  ${lightBase(t)}
  ${lightHeader(t, "USE CASE", 152, "業務はこう変わる", 500)}
  <rect x="57" y="${TBL_Y}" width="${TBL_W}" height="${HDR_H + rows.length * ROW_H + 2}" rx="12" fill="#f1f5f9" stroke="#e2e8f0" stroke-width="1.5"/>
  <line x1="${divX}" y1="${TBL_Y}" x2="${divX}" y2="${tblBotY}" stroke="#e2e8f0" stroke-width="1.5"/>
  ${hdrRow}
  ${dataRows}
  <rect x="57" y="${tblBotY}" width="${TBL_W}" height="1" fill="#e2e8f0"/>
  <text x="${W / 2}" y="${tblBotY + 42}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="17" fill="${t.noteText}">貴社の状況に合わせて最適な使い方をご提案します</text>
  ${slideFooter(t, 4)}
</svg>`;
  }

  // ── Pattern C: 縦積みBefore→After ────────────────────────────────
  if (t.id === "C") {
    const BEF_Y = 150; const BEF_H = 196;
    const ARR_Y = BEF_Y + BEF_H + 8; const ARR_H = 56;
    const AFT_Y = ARR_Y + ARR_H + 8; const AFT_H = 196;
    const fullW = 1166;
    function itemRowC(x: number, y: number, text: string, mark: "cross" | "check"): string {
      const lines = wrapTextByChars(text, 30).slice(0, 2);
      const markSvg = mark === "cross"
        ? `<circle cx="${x + 20}" cy="${y}" r="11" fill="#fee2e2"/><path d="M ${x + 14} ${y - 5} L ${x + 26} ${y + 5} M ${x + 26} ${y - 5} L ${x + 14} ${y + 5}" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/>`
        : `<circle cx="${x + 20}" cy="${y}" r="11" fill="#dcfce7"/><path d="M ${x + 14} ${y} l 4 5 l 8 -9" stroke="#16a34a" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
      const textSvg = lines.map((l, j) =>
        `<text x="${x + 44}" y="${y + (lines.length === 1 ? 6 : -4 + j * 22)}" font-family="${FONT},sans-serif" font-size="21" fill="${mark === "cross" ? "#475569" : "#1e293b"}">${esc(l)}</text>`
      ).join("\n  ");
      return `${markSvg}\n  ${textSvg}`;
    }
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${ff}
  ${lightBase(t)}
  ${lightHeader(t, "USE CASE", 152, "業務はこう変わる", 0)}
  <!-- Beforeセクション -->
  <rect x="57" y="${BEF_Y}" width="${fullW}" height="${BEF_H}" rx="16" fill="#f1f5f9" stroke="#e2e8f0" stroke-width="1.5"/>
  <rect x="57" y="${BEF_Y}" width="${fullW}" height="46" rx="16" fill="#e2e8f0"/>
  <rect x="57" y="${BEF_Y + 30}" width="${fullW}" height="16" fill="#e2e8f0"/>
  <text x="${57 + fullW / 2}" y="${BEF_Y + 30}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="18" font-weight="800" fill="#475569">導入前の課題</text>
  ${pains.map((p, i) => itemRowC(78, BEF_Y + 68 + i * 44, p, "cross")).join("\n  ")}
  <!-- 矢印（▼のみ） -->
  <text x="${W / 2}" y="${ARR_Y + 38}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="28" font-weight="900" fill="${t.afterAccent}">▼</text>
  <!-- Afterセクション -->
  <rect x="57" y="${AFT_Y}" width="${fullW}" height="${AFT_H}" rx="16" fill="#fff" filter="url(#sh)"/>
  <rect x="59" y="${AFT_Y}" width="${fullW - 4}" height="8" rx="4" fill="${t.afterAccent}"/>
  <text x="${57 + fullW / 2}" y="${AFT_Y + 36}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="18" font-weight="800" fill="${t.afterTitle}">補助金活用後</text>
  ${afters.map((a, i) => itemRowC(78, AFT_Y + 68 + i * 44, a, "check")).join("\n  ")}
  ${slideFooter(t, 4)}
</svg>`;
  }

  // ── Pattern A: 左右2カード＋中央矢印バッジ ──────────────────────
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
  ${lightBase(t)}
  ${lightHeader(t, "USE CASE", 152, "業務はこう変わる", 500)}
  <!-- Before -->
  <rect x="${LX}" y="${CARD_Y}" width="${CARD_W}" height="${CARD_H}" rx="20" fill="#f1f5f9" stroke="#e2e8f0" stroke-width="1.5"/>
  <text x="${LX + CARD_W / 2}" y="${CARD_Y + 46}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="22" font-weight="800" fill="#475569">導入前の課題</text>
  <line x1="${LX + 36}" y1="${CARD_Y + 64}" x2="${LX + CARD_W - 36}" y2="${CARD_Y + 64}" stroke="#cbd5e1" stroke-width="1.5"/>
  ${items(LX, pains, "cross")}
  <!-- 中央の変化矢印 -->
  <rect x="${W / 2 - 74}" y="${CARD_Y + 96}" width="148" height="40" rx="20" fill="${t.pillFill}"/>
  <text x="${W / 2}" y="${CARD_Y + 122}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="16" font-weight="900" fill="#fff">補助金活用</text>
  <path d="M ${W / 2 - 24} ${CARD_Y + 158} L ${W / 2 + 24} ${CARD_Y + 182} L ${W / 2 - 24} ${CARD_Y + 206} Z" fill="${t.afterAccent}"/>
  <!-- After -->
  <rect x="${RX}" y="${CARD_Y}" width="${CARD_W}" height="${CARD_H}" rx="20" fill="#fff" filter="url(#sh)"/>
  <rect x="${RX + 2}" y="${CARD_Y + 2}" width="${CARD_W - 4}" height="8" rx="4" fill="${t.afterAccent}"/>
  <text x="${RX + CARD_W / 2}" y="${CARD_Y + 48}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="22" font-weight="800" fill="${t.afterTitle}">補助金活用後</text>
  <line x1="${RX + 36}" y1="${CARD_Y + 66}" x2="${RX + CARD_W - 36}" y2="${CARD_Y + 66}" stroke="${t.afterLine}" stroke-width="1.5"/>
  ${items(RX, afters, "check")}
  <!-- 下部注記 -->
  <text x="${W / 2}" y="${CARD_Y + CARD_H + 44}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="18" fill="${t.noteText}">貴社の状況に合わせて最適な使い方をご提案します</text>
  ${slideFooter(t, 4)}
</svg>`;
}

// 6. CTA（チーム写真＋QR案内・非クリック前提）
function slide6CTA(d: SlideData, ff: string, qrDataUrl: string, photoDataUrl: string, t: SlideTheme): string {
  // 左カラム: チーム写真（公式サイトのファーストビュー画像）
  const PX = 57;
  const PY = 132;
  const PW = 620;
  const PH = 296;
  const pcx = PX + PW / 2;

  // ── Pattern B: 白背景＋深緑CTA／右QRカード ─────────────────────
  if (t.id === "B") {
    const greenDark = "#14532d";
    const greenMid = "#047857";
    const greenSoft = "#d1fae5";
    const bPX = 57;
    const bPY = 100;
    const bPW = 580;
    const bPH = 280;
    const iconY = bPY + bPH + 36;
    const ctaY = iconY + 86;
    const footY = ctaY + 72;
    const QX = 736;
    const QW = 430;
    const QH = 510;
    const QY = Math.round((H - QH) / 2) - 16;
    const QCX = QX + QW / 2;
    const qrSize = 280;
    const qrX = QCX - qrSize / 2;
    const qrY = QY + 48;
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${ff}
  <defs>
    <filter id="sh2"><feDropShadow dx="0" dy="12" stdDeviation="20" flood-color="#14532d" flood-opacity="0.10"/></filter>
    <clipPath id="photoClip"><rect x="${bPX}" y="${bPY}" width="${bPW}" height="${bPH}" rx="18"/></clipPath>
  </defs>
  <rect width="${W}" height="${H}" fill="#ffffff"/>
  <!-- 右側デコレーション -->
  <circle cx="1100" cy="360" r="320" fill="${greenSoft}" opacity="0.55"/>
  <circle cx="1140" cy="360" r="240" fill="#ecfdf5" opacity="0.70"/>
  <circle cx="1160" cy="360" r="170" fill="none" stroke="${greenMid}" stroke-width="1.2" opacity="0.12"/>
  <circle cx="1160" cy="360" r="220" fill="none" stroke="${greenMid}" stroke-width="1" opacity="0.10"/>
  <circle cx="1160" cy="360" r="270" fill="none" stroke="${greenMid}" stroke-width="0.8" opacity="0.08"/>
  <!-- NTSバッジ -->
  <rect x="57" y="44" width="190" height="44" rx="${t.badgeRadius}" fill="${greenDark}"/>
  <text x="152" y="73" text-anchor="middle" font-family="${FONT},sans-serif" font-size="18" font-weight="800" fill="#fff">NTS 日本提携支援</text>
  <!-- 左：チーム写真 -->
  <image x="${bPX}" y="${bPY}" width="${bPW}" height="${bPH}" preserveAspectRatio="xMidYMid slice" clip-path="url(#photoClip)" xlink:href="${photoDataUrl}"/>
  <rect x="${bPX}" y="${bPY}" width="${bPW}" height="${bPH}" rx="18" fill="none" stroke="#e5e7eb" stroke-width="1.5"/>
  <!-- 左：アイコン＋サポート文 -->
  <circle cx="88" cy="${iconY}" r="24" fill="#f0fdf4" stroke="${greenMid}" stroke-width="1.5"/>
  <g transform="translate(88,${iconY})" fill="${greenMid}">
    <circle cx="-8" cy="-5" r="5.5"/>
    <path d="M -16 10 a 8 8 0 0 1 16 0 Z"/>
    <circle cx="9" cy="-3" r="4.5"/>
    <path d="M 2 10 a 7 7 0 0 1 14 0 Z"/>
  </g>
  <text x="124" y="${iconY + 6}" font-family="${FONT},sans-serif" font-size="18" font-weight="600" fill="${t.bodyText}">日本提携支援があなたをサポートします</text>
  <!-- 左：メインCTA -->
  <text x="57" y="${ctaY}" font-family="${FONT},sans-serif" font-size="44" font-weight="900" fill="${greenDark}">「お気軽にご相談ください」</text>
  <text x="57" y="${footY}" font-family="${FONT},sans-serif" font-size="21" font-weight="700" fill="${t.bodyText}">ご相談は <tspan font-weight="900" fill="${greenDark}">日本提携支援</tspan> まで</text>
  <!-- 中央区切り（点線） -->
  <line x1="668" y1="108" x2="668" y2="612" stroke="#d1d5db" stroke-width="1.5" stroke-dasharray="5,5"/>
  <!-- 右：QRカード -->
  <rect x="${QX}" y="${QY}" width="${QW}" height="${QH}" rx="22" fill="#ffffff" filter="url(#sh2)"/>
  <rect x="${qrX}" y="${qrY}" width="${qrSize}" height="${qrSize}" rx="16" fill="#ffffff"/>
  <image x="${qrX + 8}" y="${qrY + 8}" width="${qrSize - 16}" height="${qrSize - 16}" xlink:href="${qrDataUrl}"/>
  <!-- スマホアイコン＋案内文 -->
  <g transform="translate(${QCX - 148},${qrY + qrSize + 34})">
    <rect x="0" y="0" width="16" height="24" rx="3" fill="none" stroke="${greenMid}" stroke-width="1.6"/>
    <circle cx="8" cy="20" r="1.5" fill="${greenMid}"/>
    <text x="26" y="10" font-family="${FONT},sans-serif" font-size="17" font-weight="700" fill="${greenDark}">スマホでQRを読み取り</text>
    <text x="26" y="34" font-family="${FONT},sans-serif" font-size="15" font-weight="600" fill="${t.bodyText}">そのまま無料相談ページへ</text>
  </g>
  <text x="${QCX}" y="${QY + QH - 28}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="13" font-weight="600" fill="${greenMid}">${esc(d.siteUrlDisplay)}</text>
  ${slideFooter(t, 5)}
</svg>`;
  }

  if (t.id === "C" || t.id === "D") {
    const bgFrom = t.id === "D" ? "#f0f9ff" : "#ffffff";
    const bgTo   = t.id === "D" ? "#fff7ed" : "#edf6ff";
    const frameStroke = t.id === "D" ? `${t.rule1}` : "#dbeafe";
    if (t.id === "D") {
      // Pattern D: 右側QRカード付きCTA
      const dQX = 752, dQY = 104, dQW = 471, dQH = 494;
      const dQCX = dQX + dQW / 2;
      const dQrSize = 220;
      const dQrX = dQCX - dQrSize / 2;
      const dQrY = dQY + 52;
      return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${ff}
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bgFrom}"/>
      <stop offset="100%" stop-color="${bgTo}"/>
    </linearGradient>
    <filter id="sh2"><feDropShadow dx="0" dy="10" stdDeviation="18" flood-color="${t.rule1}" flood-opacity="0.10"/></filter>
    <clipPath id="photoClip"><rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" rx="22"/></clipPath>
    <pattern id="dots" width="30" height="30" patternUnits="userSpaceOnUse">
      <circle cx="1.5" cy="1.5" r="1.5" fill="${t.dot}"/>
    </pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#dots)"/>
  <rect x="57" y="46" width="190" height="44" rx="${t.badgeRadius}" fill="${t.badgeFill}"/>
  <text x="152" y="75" text-anchor="middle" font-family="${FONT},sans-serif" font-size="18" font-weight="800" fill="#fff">NTS 日本提携支援</text>
  <image x="${PX}" y="${PY}" width="${PW}" height="${PH}" preserveAspectRatio="xMidYMid slice" clip-path="url(#photoClip)" xlink:href="${photoDataUrl}"/>
  <rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" rx="22" fill="none" stroke="${frameStroke}" stroke-width="2" opacity="0.50"/>
  <text x="${pcx}" y="${PY + PH + 42}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="19" fill="${t.noteText}">日本提携支援があなたをサポートします</text>
  <text x="${pcx}" y="${PY + PH + 104}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="42" font-weight="900" fill="${t.ink}">お気軽にご相談ください</text>
  <text x="${pcx}" y="${PY + PH + 150}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="21" font-weight="800" fill="${t.rule1}">補助金のご相談は 日本提携支援まで</text>
  <!-- 右側: QRカード -->
  <rect x="${dQX}" y="${dQY}" width="${dQW}" height="${dQH}" rx="26" fill="#ffffff" stroke="${t.rule2}" stroke-width="1.5" filter="url(#sh2)"/>
  <text x="${dQCX}" y="${dQY + 38}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="15" fill="${t.noteText}">補助金の申請をお考えなら</text>
  <rect x="${dQrX}" y="${dQrY}" width="${dQrSize}" height="${dQrSize}" rx="14" fill="#ffffff"/>
  <image x="${dQrX + 6}" y="${dQrY + 6}" width="${dQrSize - 12}" height="${dQrSize - 12}" xlink:href="${qrDataUrl}"/>
  <text x="${dQCX}" y="${dQrY + dQrSize + 44}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="19" font-weight="800" fill="${t.ink}">スマホでQRを読み取り</text>
  <text x="${dQCX}" y="${dQrY + dQrSize + 72}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="15" fill="${t.noteText}">そのまま無料相談ページへ</text>
  <text x="${dQCX}" y="${dQrY + dQrSize + 100}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="13" font-weight="600" fill="${t.rule1}">${esc(d.siteUrlDisplay)}</text>
  ${slideFooter(t, 5)}
</svg>`;
    }
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${ff}
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bgFrom}"/>
      <stop offset="100%" stop-color="${bgTo}"/>
    </linearGradient>
    <filter id="sh2"><feDropShadow dx="0" dy="10" stdDeviation="18" flood-color="${t.rule1}" flood-opacity="0.10"/></filter>
    <clipPath id="photoClip"><rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" rx="22"/></clipPath>
    <pattern id="dots" width="30" height="30" patternUnits="userSpaceOnUse">
      <circle cx="1.5" cy="1.5" r="1.5" fill="${t.dot}"/>
    </pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#dots)"/>
  <rect x="57" y="46" width="190" height="44" rx="${t.badgeRadius}" fill="${t.badgeFill}"/>
  <text x="152" y="75" text-anchor="middle" font-family="${FONT},sans-serif" font-size="18" font-weight="800" fill="#fff">NTS 日本提携支援</text>
  <image x="${PX}" y="${PY}" width="${PW}" height="${PH}" preserveAspectRatio="xMidYMid slice" clip-path="url(#photoClip)" xlink:href="${photoDataUrl}"/>
  <rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" rx="22" fill="none" stroke="${frameStroke}" stroke-width="2" opacity="0.65"/>
  <text x="${pcx}" y="${PY + PH + 42}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="19" fill="${t.noteText}">日本提携支援があなたをサポートします</text>
  <text x="${pcx}" y="${PY + PH + 104}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="42" font-weight="900" fill="${t.ink}">お気軽にご相談ください</text>
  <text x="${pcx}" y="${PY + PH + 150}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="21" font-weight="800" fill="${t.rule1}">補助金のご相談は 日本提携支援まで</text>
  <rect x="788" y="126" width="384" height="454" rx="26" fill="#ffffff" stroke="${frameStroke}" stroke-width="1.5" filter="url(#sh2)"/>
  <rect x="820" y="160" width="320" height="320" rx="20" fill="#ffffff"/>
  <image x="830" y="170" width="300" height="300" xlink:href="${qrDataUrl}"/>
  <text x="980" y="520" text-anchor="middle" font-family="${FONT},sans-serif" font-size="20" font-weight="800" fill="${t.ink}">スマホでQRを読み取り</text>
  <text x="980" y="552" text-anchor="middle" font-family="${FONT},sans-serif" font-size="16" fill="${t.noteText}">そのまま無料診断ページへ</text>
  <text x="980" y="580" text-anchor="middle" font-family="${FONT},sans-serif" font-size="14" fill="rgba(18,50,79,0.55)">${esc(d.siteUrlDisplay)}</text>
  ${slideFooter(t, 5)}
</svg>`;
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${ff}
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${t.dark1}"/>
      <stop offset="100%" stop-color="${t.ctaDark2}"/>
    </linearGradient>
    <filter id="sh2"><feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000" flood-opacity="0.12"/></filter>
    <clipPath id="photoClip"><rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" rx="22"/></clipPath>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <circle cx="200" cy="600" r="350" fill="${t.glow1}" opacity="0.15"/>
  <circle cx="1100" cy="120" r="220" fill="${t.glow2}" opacity="0.12"/>
  <rect x="57" y="46" width="190" height="44" rx="${t.badgeRadius}" fill="rgba(255,255,255,0.2)"/>
  <text x="152" y="75" text-anchor="middle" font-family="${FONT},sans-serif" font-size="18" font-weight="800" fill="#fff">NTS 日本提携支援</text>
  <image x="${PX}" y="${PY}" width="${PW}" height="${PH}" preserveAspectRatio="xMidYMid slice" clip-path="url(#photoClip)" xlink:href="${photoDataUrl}"/>
  <rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" rx="22" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="2"/>
  <text x="${pcx}" y="${PY + PH + 40}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="19" fill="rgba(255,255,255,0.78)">日本提携支援があなたをサポートします</text>
  <text x="${pcx}" y="${PY + PH + 104}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="44" font-weight="900" fill="#ffffff">お気軽にご相談ください</text>
  <text x="${pcx}" y="${PY + PH + 152}" text-anchor="middle" font-family="${FONT},sans-serif" font-size="22" font-weight="700" fill="${t.introSub}">補助金のご相談は 日本提携支援まで</text>
  <line x1="740" y1="150" x2="740" y2="570" stroke="rgba(255,255,255,0.25)" stroke-width="1.5" stroke-dasharray="6,4"/>
  <rect x="820" y="160" width="320" height="320" rx="20" fill="#ffffff" filter="url(#sh2)"/>
  <image x="830" y="170" width="300" height="300" xlink:href="${qrDataUrl}"/>
  <text x="980" y="524" text-anchor="middle" font-family="${FONT},sans-serif" font-size="20" font-weight="700" fill="rgba(255,255,255,0.9)">スマホでQRを読み取り</text>
  <text x="980" y="554" text-anchor="middle" font-family="${FONT},sans-serif" font-size="16" fill="rgba(255,255,255,0.65)">そのまま無料診断ページへ</text>
  <text x="980" y="582" text-anchor="middle" font-family="${FONT},sans-serif" font-size="14" fill="rgba(255,255,255,0.55)">${esc(d.siteUrlDisplay)}</text>
  ${slideFooter(t, 5, true)}
</svg>`;
}

// ─────────────────────────────────────────────────────────────
// 一覧カード用サムネイル（16:9・テーマ連動）
// ─────────────────────────────────────────────────────────────
function thumbnailSvg(d: SlideData, ff: string, t: SlideTheme): string {
  const amountDisp = formatAmountDisp(d.amount);
  const nameLines = wrapTextByChars(d.name, 12).slice(0, 2);
  const deadlineVal = d.deadline.replace(/^申請期限[：:]\s*/, "");

  // ── Pattern B: 左右スプリット ─────────────────────────────────
  if (t.id === "B") {
    const LP = 600;
    const rcx = LP + (W - LP) / 2;
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${ff}
  <defs>
    <filter id="tsh"><feDropShadow dx="0" dy="8" stdDeviation="14" flood-color="#000" flood-opacity="0.30"/></filter>
    <filter id="glw"><feGaussianBlur stdDeviation="36"/></filter>
  </defs>
  <rect x="0" y="0" width="${LP}" height="${H}" fill="${t.dark1}"/>
  <rect x="${LP}" y="0" width="${W - LP}" height="${H}" fill="${t.dark2}"/>
  <rect x="${LP - 3}" y="0" width="6" height="${H}" fill="${t.glow1}" opacity="0.85"/>
  <circle cx="${rcx}" cy="${H / 2}" r="200" fill="${t.glow1}" opacity="0.12" filter="url(#glw)"/>
  <rect x="64" y="56" width="206" height="48" rx="${t.badgeRadius}" fill="${t.badgeFill}"/>
  <text x="167" y="88" text-anchor="middle" font-family="${FONT},sans-serif" font-size="19" font-weight="800" fill="#fff">NTS 日本提携支援</text>
  ${nameLines.map((line, i) =>
    `<text x="64" y="${268 + i * 78}" font-family="${FONT},sans-serif" font-size="56" font-weight="900" fill="#ffffff" filter="url(#tsh)">${esc(line)}</text>`
  ).join("\n  ")}
  <text x="64" y="${H - 56}" font-family="${FONT},sans-serif" font-size="18" fill="rgba(255,255,255,0.40)">公募期限 ${esc(deadlineVal)}</text>
  <text x="${rcx}" y="248" text-anchor="middle" font-family="${FONT},sans-serif" font-size="18" font-weight="700" fill="${t.introSub}" letter-spacing="5">補 助 上 限</text>
  <line x1="${LP + 60}" y1="266" x2="${W - 60}" y2="266" stroke="${t.glow1}" stroke-width="1.5" opacity="0.35"/>
  <text x="${rcx}" y="416" text-anchor="middle" font-family="${FONT},sans-serif" font-size="80" font-weight="900" fill="#ffffff" filter="url(#tsh)" letter-spacing="-2">${esc(amountDisp)}</text>
  <rect x="${W - 304}" y="56" width="240" height="48" rx="24" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.30)" stroke-width="1.5"/>
  <path d="M ${W - 272} 70 L ${W - 272} 90 L ${W - 254} 80 Z" fill="#ffffff"/>
  <text x="${W - 178}" y="88" text-anchor="middle" font-family="${FONT},sans-serif" font-size="19" font-weight="800" fill="#ffffff">約1分で解説</text>
</svg>`;
  }

  // ── Pattern C: 中央スポットライト ───────────────────────────────
  if (t.id === "C") {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${ff}
  <defs>
    <linearGradient id="tbg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#edf6ff"/>
    </linearGradient>
    <filter id="tsh"><feDropShadow dx="0" dy="10" stdDeviation="18" flood-color="#1e3a8a" flood-opacity="0.10"/></filter>
    <pattern id="dots" width="30" height="30" patternUnits="userSpaceOnUse">
      <circle cx="1.5" cy="1.5" r="1.5" fill="rgba(37,99,235,0.045)"/>
    </pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#tbg)"/>
  <rect width="${W}" height="${H}" fill="url(#dots)"/>
  <rect x="64" y="56" width="206" height="48" rx="${t.badgeRadius}" fill="${t.badgeFill}"/>
  <text x="167" y="88" text-anchor="middle" font-family="${FONT},sans-serif" font-size="19" font-weight="800" fill="#fff">NTS 日本提携支援</text>
  <rect x="${W - 304}" y="56" width="240" height="48" rx="24" fill="#ffffff" stroke="#bfdbfe" stroke-width="1.5"/>
  <path d="M ${W - 272} 70 L ${W - 272} 90 L ${W - 254} 80 Z" fill="${t.rule1}"/>
  <text x="${W - 178}" y="88" text-anchor="middle" font-family="${FONT},sans-serif" font-size="19" font-weight="800" fill="${t.ink}">約1分で解説</text>
  ${nameLines.map((line, i) =>
    `<text x="64" y="${276 + i * 72}" font-family="${FONT},sans-serif" font-size="54" font-weight="900" fill="${t.ink}" filter="url(#tsh)">${esc(line)}</text>`
  ).join("\n  ")}
  <rect x="728" y="250" width="430" height="212" rx="24" fill="#fffaf0" stroke="#fed7aa" stroke-width="2" filter="url(#tsh)"/>
  <text x="943" y="314" text-anchor="middle" font-family="${FONT},sans-serif" font-size="18" font-weight="900" fill="${t.amount.label}" letter-spacing="4">補 助 上 限</text>
  <text x="943" y="400" text-anchor="middle" font-family="${FONT},sans-serif" font-size="76" font-weight="900" fill="${t.amount.value}" letter-spacing="-2">${esc(amountDisp)}</text>
  <text x="${W - 64}" y="668" text-anchor="end" font-family="${FONT},sans-serif" font-size="22" font-weight="700" fill="${t.noteText}">公募期限 ${esc(deadlineVal)}</text>
</svg>`;
  }

  // ── Pattern D: ライト背景＋左タイトル＋右コーラル円形バッジ ─────────
  if (t.id === "D") {
    const nameYd = nameLines.length === 1 ? 326 : 270;
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${ff}
  <defs>
    <linearGradient id="tbg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f0f9ff"/>
      <stop offset="100%" stop-color="#e0f2fe"/>
    </linearGradient>
    <filter id="tsh"><feDropShadow dx="0" dy="10" stdDeviation="18" flood-color="#0369a1" flood-opacity="0.14"/></filter>
    <pattern id="dots" width="30" height="30" patternUnits="userSpaceOnUse">
      <circle cx="1.5" cy="1.5" r="1.5" fill="rgba(3,105,161,0.04)"/>
    </pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#tbg)"/>
  <rect width="${W}" height="${H}" fill="url(#dots)"/>
  <!-- デコレーション円（左下） -->
  <circle cx="180" cy="620" r="220" fill="#bae6fd" opacity="0.35"/>
  <!-- バッジ（コーラル） -->
  <rect x="64" y="56" width="206" height="48" rx="24" fill="${t.badgeFill}"/>
  <text x="167" y="88" text-anchor="middle" font-family="${FONT},sans-serif" font-size="19" font-weight="800" fill="#fff">NTS 日本提携支援</text>
  <!-- 約1分バッジ -->
  <rect x="${W - 304}" y="56" width="240" height="48" rx="24" fill="#ffffff" stroke="${t.rule2}" stroke-width="1.5"/>
  <path d="M ${W - 272} 70 L ${W - 272} 90 L ${W - 254} 80 Z" fill="${t.rule2}"/>
  <text x="${W - 178}" y="88" text-anchor="middle" font-family="${FONT},sans-serif" font-size="19" font-weight="800" fill="${t.ink}">約1分で解説</text>
  <!-- 補助金名（左・縦中央） -->
  ${nameLines.map((line, i) =>
    `<text x="64" y="${nameYd + i * 72}" font-family="${FONT},sans-serif" font-size="54" font-weight="900" fill="${t.ink}" filter="url(#tsh)">${esc(line)}</text>`
  ).join("\n  ")}
  <!-- コーラル円形バッジ（右・補助上限） -->
  <circle cx="972" cy="380" r="230" fill="${t.rule1}" opacity="0.08"/>
  <circle cx="972" cy="380" r="180" fill="${t.rule1}" filter="url(#tsh)"/>
  <text x="972" y="332" text-anchor="middle" font-family="${FONT},sans-serif" font-size="17" font-weight="700" fill="rgba(255,255,255,0.85)" letter-spacing="4">補 助 上 限</text>
  <text x="972" y="430" text-anchor="middle" font-family="${FONT},sans-serif" font-size="62" font-weight="900" fill="#ffffff" letter-spacing="-2">${esc(amountDisp)}</text>
  <!-- 期限 -->
  <text x="${W - 64}" y="668" text-anchor="end" font-family="${FONT},sans-serif" font-size="22" font-weight="600" fill="${t.noteText}">公募期限 ${esc(deadlineVal)}</text>
</svg>`;
  }

  // ── Pattern A: デフォルト（左寄せ・チップ） ─────────────────────
  const chipW = Math.min(720, 250 + amountDisp.length * 50);
  const nameY = nameLines.length === 1 ? 330 : 286;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${ff}
  <defs>
    <linearGradient id="tbg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${t.dark1}"/>
      <stop offset="100%" stop-color="${t.dark2}"/>
    </linearGradient>
    <filter id="tsh"><feDropShadow dx="0" dy="8" stdDeviation="14" flood-color="#000" flood-opacity="0.30"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#tbg)"/>
  <circle cx="1140" cy="90" r="280" fill="${t.glow1}" opacity="0.20"/>
  <circle cx="80" cy="660" r="260" fill="${t.glow2}" opacity="0.13"/>
  <rect x="64" y="56" width="206" height="48" rx="${t.badgeRadius}" fill="${t.badgeFill}"/>
  <text x="167" y="88" text-anchor="middle" font-family="${FONT},sans-serif" font-size="19" font-weight="800" fill="#fff">NTS 日本提携支援</text>
  <rect x="${W - 304}" y="56" width="240" height="48" rx="24" fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.35)" stroke-width="1.5"/>
  <path d="M ${W - 272} 70 L ${W - 272} 90 L ${W - 254} 80 Z" fill="#ffffff"/>
  <text x="${W - 178}" y="88" text-anchor="middle" font-family="${FONT},sans-serif" font-size="19" font-weight="800" fill="#ffffff">約1分で解説</text>
  ${nameLines.map((line, i) =>
    `<text x="64" y="${nameY + i * 78}" font-family="${FONT},sans-serif" font-size="58" font-weight="900" fill="#ffffff" filter="url(#tsh)">${esc(line)}</text>`
  ).join("\n  ")}
  <rect x="64" y="490" width="${chipW}" height="120" rx="22" fill="${t.chipFill}" stroke="${t.chipStroke}" stroke-width="2"/>
  <text x="104" y="563" font-family="${FONT},sans-serif" font-size="26" font-weight="700" fill="${t.chipLabel}">補助上限</text>
  <text x="${104 + 146}" y="572" font-family="${FONT},sans-serif" font-size="60" font-weight="900" fill="#ffffff" letter-spacing="-1">${esc(amountDisp)}</text>
  <text x="${W - 64}" y="668" text-anchor="end" font-family="${FONT},sans-serif" font-size="24" font-weight="600" fill="rgba(255,255,255,0.75)">公募期限 ${esc(deadlineVal)}</text>
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
// HeyGen /v2/video.generate: スライド背景 + 音声（アバターなし）
// pollyAudioUrls が渡された場合は Polly 音声（type:"audio"）を使用
// ─────────────────────────────────────────────────────────────
async function generateSlideVideo(
  narrations: string[],
  assetInfos: { assetId: string; url: string }[],
  pollyAudioUrls?: string[],
): Promise<string> {
  console.log("\n━━━ Step 3: /v2/video.generate でスライド動画生成 ━━━");
  const usePolly = Array.isArray(pollyAudioUrls) && pollyAudioUrls.length === narrations.length;
  console.log(`  音声モード  : ${usePolly ? "AWS Polly (Kazuha)" : "HeyGen TTS (桜庭)"}`);

  const video_inputs = narrations.map((text, i) => ({
    character: null,   // アバターなし
    voice: usePolly
      ? {
          type: "audio",
          audio_url: pollyAudioUrls![i],
        }
      : {
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
async function pollVideo(videoId: string): Promise<string> {
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
      if (!json.data?.video_url) throw new Error("completed なのに video_url がありません");
      return json.data.video_url;
    }
    if (status === "failed") {
      throw new Error(`動画生成失敗: ${json.data?.error ?? "(詳細なし)"}`);
    }
  }
  throw new Error(`タイムアウト: video_id ${videoId} を HeyGen ダッシュボードで確認してください`);
}

// ─────────────────────────────────────────────────────────────
// 公開: S3 アップロード + GeneratedContent 登録（--publish）
// ─────────────────────────────────────────────────────────────
async function uploadToS3(buf: Buffer, key: string, contentType: string): Promise<string> {
  const bucket = process.env.VIDEO_S3_BUCKET;
  if (!bucket) throw new Error("VIDEO_S3_BUCKET が未設定です（--publish に必要）");
  const region = process.env.VIDEO_S3_REGION ?? process.env.AWS_REGION ?? "ap-northeast-1";
  const baseUrl = process.env.VIDEO_S3_BASE_URL;
  const s3 = new S3Client({ region });
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buf,
      ContentType: contentType,
      CacheControl: "public, max-age=86400",
    }),
  );
  return baseUrl ? `${baseUrl}/${key}` : `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

/** ffprobe で動画の長さ（秒）を取得。失敗時は null */
async function probeDurationSec(filePath: string): Promise<number | null> {
  try {
    const execAsync = promisify(exec);
    const { stdout } = await execAsync(
      `ffprobe -v error -show_entries format=duration -of csv=p=0 "${filePath}"`,
    );
    const sec = parseFloat(stdout.trim());
    return Number.isFinite(sec) ? Math.round(sec) : null;
  } catch {
    return null;
  }
}

/** 完成した動画を S3 にアップロードし GeneratedContent に登録して一覧ページに表示する */
async function publishVideo(opts: {
  grant: Grant;
  narrations: string[];
  videoUrl: string;
  thumbnailPng: Buffer;
}): Promise<void> {
  console.log("\n━━━ Step 5: 一覧ページへ公開（S3 + DB登録） ━━━");

  // 1. HeyGen から mp4 をダウンロード
  const res = await fetch(opts.videoUrl);
  if (!res.ok) throw new Error(`動画ダウンロード失敗: HTTP ${res.status}`);
  const mp4 = Buffer.from(await res.arrayBuffer());
  console.log(`  mp4 ダウンロード: ${(mp4.length / 1024 / 1024).toFixed(2)} MB`);

  // 2. duration を ffprobe で取得（ローカル一時ファイル経由）
  const outDir = path.join(process.cwd(), "scripts", "heygen", "output");
  await fs.mkdir(outDir, { recursive: true });
  const tmpMp4 = path.join(outDir, `publish-${opts.grant.id.slice(0, 8)}.mp4`);
  await fs.writeFile(tmpMp4, mp4);
  const duration = await probeDurationSec(tmpMp4);
  console.log(`  duration: ${duration ?? "?"}s`);

  // 3. S3 アップロード
  const version = Date.now();
  const mp4Url = await uploadToS3(mp4, `videos/${opts.grant.id}/heygen-${version}.mp4`, "video/mp4");
  console.log(`  mp4 → S3: ${mp4Url}`);
  const thumbUrl = await uploadToS3(
    opts.thumbnailPng,
    `videos/${opts.grant.id}/thumbnail-heygen-${version}.png`,
    "image/png",
  );
  console.log(`  thumbnail → S3: ${thumbUrl}`);

  // 4. GeneratedContent upsert（既存があれば slug を維持して更新）
  const title = cleanSubsidyName(opts.grant.name ?? "補助金制度");
  const durationLabel = duration ? `約${duration}秒` : "約1分";
  const data = {
    title,
    excerpt: `${title}の補助上限・公募期限・対象と活用イメージを${durationLabel}のスライド動画で解説します。`,
    body: opts.narrations.join("\n"),
    tags: ["スライド動画", "1分解説"],
    videoPath: mp4Url,
    thumbnailPath: thumbUrl,
    duration,
    status: "published",
  };

  const existing = await prisma.generatedContent.findFirst({
    where: { subsidyId: opts.grant.id, contentType: "video" },
    select: { id: true, slug: true },
  });
  const now = new Date();

  if (existing) {
    // publishedAt を現在時刻へ繰り上げ、一覧（publishedAt desc）の上位に表示されるようにする
    await prisma.generatedContent.update({
      where: { id: existing.id },
      data: { ...data, publishedAt: now },
    });
    console.log(`✅ GeneratedContent 更新: /subsidies/videos/${existing.slug}`);
  } else {
    const base = `video-${opts.grant.id.replace(/[^a-z0-9]/gi, "").slice(0, 10).toLowerCase() || "subsidy"}`;
    const dup = await prisma.generatedContent.findUnique({ where: { slug: base }, select: { id: true } });
    const slug = dup ? `${base}-${version.toString(36)}` : base;
    await prisma.generatedContent.create({
      data: {
        subsidyId: opts.grant.id,
        contentType: "video",
        slug,
        ...data,
        publishedAt: now,
      },
    });
    console.log(`✅ GeneratedContent 作成: /subsidies/videos/${slug}`);
  }
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
  const patternArg = args.find((a) => a.startsWith("--pattern="))?.replace("--pattern=", "");
  const shouldPublish = args.includes("--publish");
  // デフォルトは AWS Polly。HeyGen TTS を使う場合は --voice=heygen を指定
  const usePollyVoice = !args.includes("--voice=heygen");

  console.log("\n🔍 補助金データを取得中...");
  const grant = await fetchGrant(subsidyId, skip);
  const d = buildSlideData(grant);
  console.log(`✅ ${d.name} (id: ${grant.id})`);

  // ── テーマ選択（subsidyId ハッシュで決定・--pattern で上書き可） ──
  const theme = pickTheme(grant.id, patternArg);
  console.log(`🎨 スライドパターン: ${theme.id}${patternArg ? "（--pattern 指定）" : "（IDハッシュで自動選択）"}`);

  // ── 補助金名のひらがな読み変換（ナレーション用） ──
  console.log("\n🔤 補助金名の読みを生成中...");
  const kana = await nameToKana(d.nameReading);
  if (kana) {
    d.nameReading = kana;
    console.log(`  正式名読み: ${kana}`);
  } else {
    d.nameReading = d.nameReading.slice(0, 24);
  }
  // Slide1 用の短縮名もひらがな変換
  const shortKana = await nameToKana(d.shortNameReading);
  if (shortKana) {
    d.shortNameReading = shortKana;
    console.log(`  短縮名読み: ${shortKana}`);
  } else {
    d.shortNameReading = d.shortNameReading;
  }

  // ── Step 1: スライドPNG生成 ──
  console.log("\n━━━ Step 1: スライドPNG生成（6シーン＋サムネイル） ━━━");
  const fontPath = resolveVideoFontPath();
  if (!fontPath) console.warn("⚠️  フォントファイルが見つかりません。文字が豆腐になる可能性があります。");
  const ff = fontFace(fontPath);

  const qrDataUrl = await QRCode.toDataURL(d.siteUrl, {
    width: 300,
    margin: 2,
    color: { dark: theme.ink, light: "#ffffff" },
  });

  // CTA用チーム写真（公式サイトのファーストビュー画像をローカル保存したもの）
  const photoPath = path.join(process.cwd(), "scripts", "heygen", "assets", "nts-team.jpg");
  const photoBuf = await fs.readFile(photoPath);
  const photoDataUrl = `data:image/jpeg;base64,${photoBuf.toString("base64")}`;

  const svgs = [
    slide1Intro(d, ff, theme),
    slide2What(d, ff, theme),
    slide3Numbers(d, ff, theme),
    slide4Flow(ff, theme),
    slide5BeforeAfter(d, ff, theme),
    slide6CTA(d, ff, qrDataUrl, photoDataUrl, theme),
  ];

  const outDir = path.join(process.cwd(), "scripts", "heygen", "output");
  const previewPattern = patternArg?.toUpperCase();
  const customPreviewDir = args.find(a => a.startsWith("--preview-dir="))?.split("=").slice(1).join("=");
  const previewDir =
    customPreviewDir
      ? path.resolve(customPreviewDir)
      : args.includes("--dry-run") &&
        previewPattern &&
        ["A", "B", "C", "D"].includes(previewPattern)
        ? path.join(outDir, `preview-${previewPattern}`)
        : null;
  const saveDir = previewDir ?? outDir;
  await fs.mkdir(saveDir, { recursive: true });
  if (previewDir) {
    console.log(`📁 保存先: ${previewDir}`);
  }

  const pngs: Buffer[] = [];
  const savePngs = Boolean(previewDir) || args.includes("--save-png");
  for (let i = 0; i < svgs.length; i++) {
    const png = await svgToPng(svgs[i], fontPath);
    pngs.push(png);
    if (savePngs) {
      const savePath = path.join(saveDir, `slide-${i + 1}.png`);
      await fs.writeFile(savePath, png);
      console.log(`  Slide ${i + 1}: ${(png.length / 1024).toFixed(0)} KB → ${savePath}`);
    } else {
      console.log(`  Slide ${i + 1}: ${(png.length / 1024).toFixed(0)} KB`);
    }
  }

  // 一覧カード用サムネイル
  const thumbnailPng = await svgToPng(thumbnailSvg(d, ff, theme), fontPath);
  if (savePngs) {
    const thumbPath = path.join(saveDir, "thumbnail.png");
    await fs.writeFile(thumbPath, thumbnailPng);
    console.log(`  Thumbnail: ${(thumbnailPng.length / 1024).toFixed(0)} KB → ${thumbPath}`);
  } else {
    console.log(`  Thumbnail: ${(thumbnailPng.length / 1024).toFixed(0)} KB`);
  }

  // --dry-run: PNG生成のみで終了（スライドのプレビュー確認用）
  if (args.includes("--dry-run")) {
    console.log("\n🔍 --dry-run のためここで終了します（PNGは保存済み）");
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

  // ── Step 2.5: AWS Polly で音声生成（--voice=polly 時のみ） ──
  let pollyAudioUrls: string[] | undefined;
  const narrations = buildNarrations(d);
  console.log("\n📝 ナレーション原稿:");
  narrations.forEach((n, i) => console.log(`  ${i + 1}. ${n}`));

  if (usePollyVoice) {
    console.log("\n━━━ Step 2.5: AWS Polly (Kazuha) で音声生成 ━━━");
    const urls: string[] = [];
    for (let i = 0; i < narrations.length; i++) {
      const result = await synthesizeAndUpload(narrations[i], grant.id, "Kazuha", i);
      if (!result) throw new Error(`Polly 音声生成に失敗しました（スライド ${i + 1}）`);
      urls.push(result.publicUrl);
      console.log(`  Slide ${i + 1}: ${result.publicUrl} (~${result.durationSec}s)`);
    }
    pollyAudioUrls = urls;
    console.log("✅ Polly 音声生成完了");
  }

  // ── Step 3: /v2/video.generate でスライド動画生成 ──
  const videoId = await generateSlideVideo(narrations, assetInfos, pollyAudioUrls);

  // ── Step 4: 動画完成待ち ──
  const videoUrl = await pollVideo(videoId);

  // ── Step 5: 一覧ページへ公開（--publish 指定時のみ） ──
  if (shouldPublish) {
    await publishVideo({ grant, narrations, videoUrl, thumbnailPng });
  } else {
    console.log("\nℹ️  一覧ページへ公開するには --publish を付けて実行してください。");
  }
}

main()
  .catch((err) => {
    console.error("\n❌ エラー:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
