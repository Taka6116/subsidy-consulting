import { Fragment } from "react";

import { splitArticleBodyByH2 } from "@/lib/articles/splitArticleBodyByH2";

/**
 * ArticleVisualBlocks.tsx
 * 補助金記事詳細ページ用の共通図解ブロック群。
 * 画像生成・独自SVG生成は行わず、既存データからHTML/CSSで組む。
 * データ欠損時は安全なfallbackを表示する。
 */

// ── 型定義 ──────────────────────────────────────────────────
export type ArticleVisualData = {
  /** 補助金・記事タイトル */
  title: string;
  /** 補助金制度名（grant.name） */
  subsidyName?: string | null;
  /** 補助上限の表示文字列（例: "1,000万円"）*/
  maxAmount?: string | null;
  /** 申請期限の表示文字列（例: "2025年3月31日"）*/
  deadline?: string | null;
  /** 対象地域（都道府県など） */
  region?: string | null;
  /** タグ・カテゴリ */
  categories?: string[];
  /** 対象産業・業種 */
  targetIndustries?: string[];
};

export type UseCaseCardModel = {
  industryLabel: string;
  persona: string;
  before: string[];
  systems: string[];
  effects: string[];
};

// ── fallback 定数 ────────────────────────────────────────────
const FB = {
  amount: "公募要領で要確認",
  rate: "公募要領で要確認",
  deadline: "公式情報で要確認",
  region: "対象地域を確認",
  expense: "公募要領で確認",
} as const;

// ── 小部品 ──────────────────────────────────────────────────

/** セクション共通ラッパー */
function VisualSection({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`my-8 rounded-2xl border p-5 sm:p-6 ${className}`}
      style={{ borderColor: "#dbe7f3", background: "#f4f8fd" }}
    >
      {children}
    </div>
  );
}

/** セクションラベル */
function SectionLabel({ text }: { text: string }) {
  return (
    <p
      className="mb-3 text-[11px] font-bold uppercase tracking-widest"
      style={{ color: "#0e357f", opacity: 0.65 }}
    >
      {text}
    </p>
  );
}

/** カラム間矢印（PC: 横 / SP: 縦） */
function ColumnArrow() {
  return (
    <div
      className="flex shrink-0 items-center justify-center py-1 sm:py-0"
      aria-hidden
    >
      <svg
        className="hidden rotate-0 sm:block"
        width="22"
        height="22"
        viewBox="0 0 22 22"
        fill="none"
      >
        <path
          d="M4 11h14M14 7l4 4-4 4"
          stroke="#94a3b8"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <svg
        className="block sm:hidden"
        width="22"
        height="22"
        viewBox="0 0 22 22"
        fill="none"
      >
        <path
          d="M11 4v14M7 14l4 4 4-4"
          stroke="#94a3b8"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

// ── カテゴリ推定（タグ・タイトル・制度名） ────────────────────
type ArticleCategory =
  | "tourism"
  | "research"
  | "dx"
  | "equipment"
  | "export"
  | "general";

function classifyArticleCategory(data: ArticleVisualData): ArticleCategory {
  const hay = [
    data.title,
    data.subsidyName ?? "",
    ...(data.categories ?? []),
    ...(data.targetIndustries ?? []),
  ]
    .join(" ")
    .toLowerCase();

  const has = (s: string) => hay.includes(s);
  if (
    has("観光") ||
    has("地域") ||
    has("振興") ||
    has("宿泊") ||
    has("インバウンド")
  )
    return "tourism";
  if (has("研究") || has("開発") || has("r&d") || has("技術"))
    return "research";
  if (has("海外") || has("輸出") || has("展開"))
    return "export";
  if (
    has("設備") ||
    has("投資") ||
    has("省力") ||
    has("ものづくり") ||
    has("生産性")
  )
    return "equipment";
  if (
    has("dx") ||
    has("it") ||
    has("デジタル") ||
    has("システム") ||
    has("クラウド")
  )
    return "dx";
  return "general";
}

/** セクション2本文のみから【活用例】ブロックを抽出（** の有無・全角括弧差を許容） */
function extractUseCasesFromSection2Body(section2: string): UseCaseCardModel[] {
  const s = section2.trim();
  if (!s) return [];

  const chunks = s
    .split(/(?:\*\*)?【活用例】(?:\*\*)?/g)
    .map((c) => c.trim())
    .filter(Boolean);

  const out: UseCaseCardModel[] = [];
  for (const raw of chunks) {
    const bulletLines = raw
      .split("\n")
      .filter((l) => /^\s*[-*]\s/.test(l)).length;
    if (bulletLines === 0 && raw.length > 320) continue;

    const card = parseUseCaseChunk(raw);
    if (!card) continue;
    const hasContent =
      card.before.length + card.systems.length + card.effects.length > 0 ||
      card.persona.length >= 8;
    if (!hasContent) continue;
    out.push(card);
    if (out.length >= 3) break;
  }
  return out;
}

/** 全文からセクション2を推定して抽出（後方互換・フォールバック） */
function extractUseCasesFromMarkdown(body: string): UseCaseCardModel[] {
  const secs = splitArticleBodyByH2(body);
  const sec2 = secs.find((s) => s.order === 2);
  if (sec2?.body?.trim()) return extractUseCasesFromSection2Body(sec2.body);

  const split3 = body.split(/##\s*3\.\s*補助額/i);
  const before3 = split3[0] ?? "";
  const parts2 = before3.split(
    /##\s*2\.\s*活用できる企業のイメージ[【[]活用例[】\]]\s*/i,
  );
  const legacySection2 = (parts2[1] ?? "").trim();
  if (!legacySection2) return [];
  return extractUseCasesFromSection2Body(legacySection2);
}

function stripMd(s: string): string {
  return s.replace(/\*\*/g, "").replace(/^[\s\-*]+/, "").trim();
}

function parseUseCaseChunk(raw: string): UseCaseCardModel | null {
  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("##"));

  const bullets = lines
    .filter((l) => /^[-*]\s/.test(l))
    .map((l) => stripMd(l.replace(/^[-*]\s+/, "")));

  const proseLines = lines.filter((l) => !/^[-*]\s/.test(l) && !l.startsWith("#"));
  const persona =
    proseLines.join(" ").replace(/\s+/g, " ").trim().slice(0, 140) ||
    "中小企業の活用イメージの例";

  const industryGuess =
    bullets.find((b) => /(卸売|小売|製造|建設|運送|宿泊|食品|観光|サービス|物流)業/.test(b)) ??
    persona.match(/(卸売業|小売業|製造業|建設業|運送業|宿泊業|食品製造業|観光関連)/)?.[1] ??
    "中小企業";

  if (bullets.length === 0) {
    return {
      industryLabel: industryGuess.slice(0, 12),
      persona,
      before: [],
      systems: [],
      effects: [],
    };
  }

  const n = bullets.length;
  let before: string[];
  let systems: string[];
  let effects: string[];

  if (n >= 9) {
    before = bullets.slice(0, 3);
    systems = bullets.slice(3, 6);
    effects = bullets.slice(6, 9);
  } else if (n >= 6) {
    before = bullets.slice(0, 2);
    systems = bullets.slice(2, 4);
    effects = bullets.slice(4, 6);
  } else if (n >= 3) {
    before = bullets.slice(0, 1);
    systems = bullets.slice(1, 2);
    effects = bullets.slice(2, 3);
  } else if (n === 2) {
    before = [bullets[0]!];
    systems = [bullets[1]!];
    effects = [];
  } else {
    before = [bullets[0]!];
    systems = [];
    effects = [];
  }

  return {
    industryLabel: industryGuess.replace(/の例$/, "").slice(0, 12),
    persona,
    before: before.slice(0, 3),
    systems: systems.slice(0, 3),
    effects: effects.slice(0, 3),
  };
}

function buildFallbackUseCases(data: ArticleVisualData): UseCaseCardModel[] {
  const cat = classifyArticleCategory(data);
  const subsidy = data.subsidyName ?? "本制度";

  const templates: Record<ArticleCategory, UseCaseCardModel[]> = {
    tourism: [
      {
        industryLabel: "宿泊業",
        persona: "観光地で宿泊施設を運営する事業者の例",
        before: [
          "予約・客室管理が電話・紙台帳中心で、繁忙期のミスや二重予約のリスクがある",
          "客室備品・清掃の記録が属人化しており、品質のばらつきが出やすい",
        ],
        systems: [
          "予約管理・PMS（客室在庫の一元管理）",
          "モバイル端末による清掃・点検記録のデジタル化",
        ],
        effects: [
          "予約・客室情報の見える化により、運用ミスの抑制が期待できる",
          "スタッフ間の情報共有がしやすくなり、サービス品質の安定につながる可能性があります",
        ],
      },
      {
        industryLabel: "食品製造業",
        persona: "土産物・加工食品を扱う製造事業者の例",
        before: [
          "生産計画と在庫が連動しておらず、欠品や過剰在庫が発生しやすい",
        ],
        systems: [
          "生産・在庫管理の基幹システム",
          "バーコード／ラベル発行で出荷・棚卸を省力化",
        ],
        effects: [
          "在庫の把握精度向上により、ロス削減や提案力向上が期待できる",
        ],
      },
    ],
    research: [
      {
        industryLabel: "製造業",
        persona: "試作・評価工程が多い製造事業者の例",
        before: [
          "試験データがExcelや紙に分散し、再現性の確認に時間がかかる",
        ],
        systems: [
          "データ収集・可視化ツール",
          "計測機器と連携する記録システム",
        ],
        effects: [
          "開発サイクルの短縮や品質検証の効率化につながる可能性があります",
        ],
      },
      {
        industryLabel: "環境技術スタートアップ",
        persona: "新技術の実証を進める事業者の例",
        before: [
          "実証設備の導入資金と運用コストのバランスが課題",
        ],
        systems: [
          "実証用設備・計測装置",
          "遠隔監視・ログ蓄積の仕組み",
        ],
        effects: [
          "実証結果の説明資料化がしやすくなり、次の投資判断に活用しやすくなる見込みです",
        ],
      },
    ],
    dx: [
      {
        industryLabel: "卸売業",
        persona: "食品・資材などを扱う卸売業の例",
        before: [
          "商品情報や在庫情報がExcel中心で分散管理されている",
          "部門間でデータ連携ができず、在庫偏在や納期調整が発生しやすい",
          "手入力・転記作業が多く、確認工数が膨らみやすい",
        ],
        systems: [
          "基幹システム（受発注・在庫・売上データの一元管理）",
          "ハンディスキャナー（入出庫・棚卸・在庫照会を現場で即時登録）",
          "モバイルプリンター（出荷明細・ラベルを現場で即時印刷）",
        ],
        effects: [
          "入力・照合作業の省力化により、工数削減が期待できる",
          "在庫更新の即時反映により、誤出荷や在庫偏在の抑制につながる可能性があります",
          "部門間の連携改善により、提案力向上が期待できる",
        ],
      },
      {
        industryLabel: "小売業",
        persona: "複数店舗を運営する小売事業者の例",
        before: [
          "店舗ごとに売上・在庫の見え方が異なり、本部での判断が遅れがち",
        ],
        systems: [
          "POS・在庫クラウドの導入",
          "本部ダッシュボードでのKPI可視化",
        ],
        effects: [
          "欠品・過剰発注の抑制や、施策のPDCAが回しやすくなる見込みです",
        ],
      },
      {
        industryLabel: "建設業",
        persona: "現場と事務所の情報差が課題の建設事業者の例",
        before: [
          "図面・変更履歴の共有がメール依存で、現場確認に時間がかかる",
        ],
        systems: [
          "クラウド文書・図面共有",
          "モバイル端末での施工日報・写真記録",
        ],
        effects: [
          "情報共有の迅速化により、手戻り抑制や工数削減が期待できる",
        ],
      },
    ],
    equipment: [
      {
        industryLabel: "製造業",
        persona: "老朽設備の更新を検討する製造事業者の例",
        before: [
          "設備故障リスクが高く、計画生産が立てにくい",
        ],
        systems: [
          "省エネ・省力化設備の更新",
          "ライン連動の制御システム改善",
        ],
        effects: [
          "稼働率向上や保守コスト低減につながる可能性があります",
        ],
      },
      {
        industryLabel: "物流業",
        persona: "荷役・保管工程の負担が大きい事業者の例",
        before: [
          "ピッキング・搬送に人手が集中し、ピーク時の負荷が高い",
        ],
        systems: [
          "自動仕分け・搬送装置",
          "WMS（倉庫管理システム）",
        ],
        effects: [
          "作業時間の平準化やミス削減が期待できる",
        ],
      },
    ],
    export: [
      {
        industryLabel: "食品製造業",
        persona: "海外販路開拓を進める製造事業者の例",
        before: [
          "規格・ラベル・トレーサビリティ対応が手作業中心",
        ],
        systems: [
          "品質・ロット管理システム",
          "多言語ラベル・出荷帳票のテンプレート化",
        ],
        effects: [
          "輸出業務の標準化により、対応スピード向上が期待できる",
        ],
      },
      {
        industryLabel: "地域商社",
        persona: "海外見本市・商談を増やす商社の例",
        before: [
          "商談情報が個人フォルダに分散し、引き継ぎが難しい",
        ],
        systems: [
          "CRM／SFAの導入",
          "オンライン商談・資料共有の仕組み",
        ],
        effects: [
          "商談履歴の蓄積により、フォロー精度向上が期待できる",
        ],
      },
    ],
    general: [
      {
        industryLabel: "サービス業",
        persona: "バックオフィス負荷が大きい中小事業者の例",
        before: [
          "受発注・請求・勤怠が紙・Excel中心で、月次締めに時間がかかる",
        ],
        systems: [
          "クラウド会計・勤怠・受発注の連携",
        ],
        effects: [
          "定型業務の削減により、本業に使える時間の確保が期待できる",
        ],
      },
      {
        industryLabel: "運送業",
        persona: "ドライバー管理と事務作業の両立が課題の事業者の例",
        before: [
          "運行記録・労務関連の確認が事務所集中になりやすい",
        ],
        systems: [
          "デジタル運行管理・勤怠クラウド",
        ],
        effects: [
          "記録の見える化により、コンプライアンス確認がしやすくなる見込みです",
        ],
      },
    ],
  };

  const base = templates[cat];
  const third: UseCaseCardModel = {
    industryLabel: "中小企業",
    persona: `${subsidy}を活用した業務改善を検討する事業者の例`,
    before: [
      "制度の要件や対象経費が整理しきれておらず、投資判断が進みにくい",
    ],
    systems: [
      "要件整理と投資計画のドキュメント化",
      "公募要領に沿った経費・スケジュールの設計",
    ],
    effects: [
      "自社の投資判断材料が揃い、関係者合意が取りやすくなる可能性があります",
    ],
  };

  return [...base, third].slice(0, 3);
}

function mergeUseCases(
  parsed: UseCaseCardModel[],
  fallback: UseCaseCardModel[],
): UseCaseCardModel[] {
  const out: UseCaseCardModel[] = [];
  const key = (c: UseCaseCardModel) => `${c.industryLabel}|${c.persona.slice(0, 40)}`;

  for (const p of parsed) {
    if (out.length >= 3) break;
    if (p.before.length + p.systems.length + p.effects.length === 0) continue;
    if (!out.some((o) => key(o) === key(p))) out.push(p);
  }
  for (const f of fallback) {
    if (out.length >= 3) break;
    if (!out.some((o) => key(o) === key(f))) out.push(f);
  }
  if (out.length < 2) {
    for (const f of fallback) {
      if (out.length >= 2) break;
      if (!out.some((o) => key(o) === key(f))) out.push(f);
    }
  }
  return out.slice(0, 3);
}

// ────────────────────────────────────────────────────────────
// UseCaseDiagram — H2「活用できる企業のイメージ【活用例】」直下
// ────────────────────────────────────────────────────────────
export function UseCaseDiagram({
  data,
  bodyMarkdown,
  section2Markdown,
}: {
  data: ArticleVisualData;
  /** セクション2本文のみ（H2 分割挿入時はこちらを優先） */
  section2Markdown?: string;
  /** 全文（section2 が空のときのフォールバック） */
  bodyMarkdown?: string;
}) {
  const section2 = section2Markdown?.trim();
  const parsed = section2
    ? extractUseCasesFromSection2Body(section2)
    : extractUseCasesFromMarkdown(bodyMarkdown ?? "");
  const fallback = buildFallbackUseCases(data);
  const cards = mergeUseCases(parsed, fallback);

  return (
    <VisualSection className="!my-6">
      <SectionLabel text="実際に想定される活用例" />
      <h3
        className="mb-2 text-[18px] font-black leading-snug text-[#111827] sm:text-[19px]"
        style={{ fontFamily: "'Noto Sans JP', sans-serif" }}
      >
        この補助金を使うと、どんな改善ができるか
      </h3>
      <p className="mb-6 text-[16px] leading-relaxed text-slate-600">
        導入前の課題・導入する設備やシステム・導入後の効果を、業種別に整理します。
      </p>

      <div className="flex flex-col gap-6">
        {cards.map((card, idx) => (
          <div
            key={`${card.industryLabel}-${idx}`}
            className="overflow-hidden rounded-2xl border border-[#dbe7f3] bg-white shadow-sm"
          >
            <div
              className="border-b border-[#dbe7f3] px-4 py-3 sm:px-5"
              style={{ background: "#fafcff" }}
            >
              <span
                className="inline-block rounded-md px-2 py-0.5 text-[11px] font-bold"
                style={{
                  background: "rgba(14,53,127,0.08)",
                  color: "#0e357f",
                }}
              >
                {card.industryLabel}
              </span>
              <p className="mt-2 text-[16px] font-bold leading-snug text-[#111827]">
                {card.persona}
              </p>
            </div>

            <div className="flex flex-col gap-0 p-4 sm:flex-row sm:items-stretch sm:gap-0 sm:p-5">
              {/* 左: 導入前 */}
              <div
                className="flex min-h-0 flex-1 flex-col rounded-xl border border-[#dbe7f3] bg-white p-4"
                style={{ minHeight: "140px" }}
              >
                <p
                  className="mb-3 text-[12px] font-bold uppercase tracking-wider"
                  style={{ color: "#0e357f", opacity: 0.75 }}
                >
                  導入前の課題
                </p>
                <ul className="list-none space-y-2 p-0">
                  {(card.before.length
                    ? card.before
                    : [
                        "業務・データの所在が分散し、確認や手戻りが発生しやすい状態",
                      ]
                  )
                    .slice(0, 3)
                    .map((t, i) => (
                      <li
                        key={i}
                        className="relative pl-3.5 text-[16px] leading-relaxed text-slate-600 before:absolute before:left-0 before:top-[0.55em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-slate-400 before:content-['']"
                      >
                        {t}
                      </li>
                    ))}
                </ul>
              </div>

              <ColumnArrow />

              {/* 中央: 導入（強調） */}
              <div
                className="flex min-h-0 flex-1 flex-col rounded-xl border-2 p-4 shadow-md"
                style={{
                  background: "linear-gradient(180deg, #e8f4fc 0%, #dceef9 100%)",
                  borderColor: "#7eb8e8",
                  boxShadow: "0 4px 14px rgba(14,53,127,0.12)",
                  minHeight: "140px",
                }}
              >
                <p
                  className="mb-3 text-[12px] font-bold uppercase tracking-wider"
                  style={{ color: "#0e357f" }}
                >
                  導入する設備・システム
                </p>
                <ul className="list-none space-y-2 p-0">
                  {(card.systems.length
                    ? card.systems
                    : [
                        `${data.subsidyName ?? "本制度"}の対象に沿った設備・ソフトウェア等（公募要領で確認）`,
                      ]
                  )
                    .slice(0, 3)
                    .map((t, i) => (
                      <li
                        key={i}
                        className="relative pl-3.5 text-[16px] font-bold leading-relaxed text-[#0e357f] before:absolute before:left-0 before:top-[0.55em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-[#0e357f] before:opacity-60 before:content-['']"
                      >
                        {t}
                      </li>
                    ))}
                </ul>
              </div>

              <ColumnArrow />

              {/* 右: 導入後の効果（見込み） */}
              <div
                className="flex min-h-0 flex-1 flex-col rounded-xl border border-[#86efac] bg-[#f0fdf4] p-4"
                style={{ minHeight: "140px" }}
              >
                <p
                  className="mb-3 text-[12px] font-bold uppercase tracking-wider"
                  style={{ color: "#166534", opacity: 0.9 }}
                >
                  導入後の効果（見込み）
                </p>
                <ul className="list-none space-y-2 p-0">
                  {(card.effects.length
                    ? card.effects
                    : [
                        "業務の見える化や連携改善により、運用品質の向上が期待できる",
                      ]
                  )
                    .slice(0, 3)
                    .map((t, i) => (
                      <li
                        key={i}
                        className="relative pl-3.5 text-[16px] leading-relaxed text-slate-700 before:absolute before:left-0 before:top-[0.55em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-emerald-500 before:opacity-70 before:content-['']"
                      >
                        {t}
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-slate-500">
        上記は公表情報をもとにした活用イメージです。対象経費・補助額・採択可否は制度、申請内容、審査により異なります。最新情報は公式情報をご確認ください。
      </p>
    </VisualSection>
  );
}

// ────────────────────────────────────────────────────────────
// 1. SummaryCards — アイキャッチ下・目次上に置く概要カード群
// ────────────────────────────────────────────────────────────
export function SummaryCards({ data }: { data: ArticleVisualData }) {
  const cards = [
    {
      label: "補助上限",
      value: data.maxAmount ? `最大 ${data.maxAmount}` : FB.amount,
      note: data.maxAmount ? null : "※公募要領をご確認ください",
      accent: true,
    },
    {
      label: "申請期限",
      value: data.deadline ?? FB.deadline,
      note: data.deadline ? null : "※最新情報は公式でご確認ください",
      accent: false,
    },
    {
      label: "対象地域",
      value: data.region ?? FB.region,
      note: null,
      accent: false,
    },
    {
      label: "対象テーマ",
      value:
        data.categories && data.categories.length > 0
          ? data.categories.slice(0, 2).join(" / ")
          : "公募要領で確認",
      note: null,
      accent: false,
    },
  ];

  return (
    <VisualSection>
      <SectionLabel text="この補助金のポイント" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="flex flex-col rounded-xl bg-white px-4 py-3.5"
            style={{
              border: c.accent ? "1.5px solid #0e357f" : "1px solid #dbe7f3",
              boxShadow: c.accent
                ? "0 2px 12px rgba(14,53,127,0.10)"
                : "0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            <span
              className="mb-1 text-[10px] font-bold uppercase tracking-wider"
              style={{ color: "#0e357f", opacity: 0.6 }}
            >
              {c.label}
            </span>
            <span
              className="text-[15px] font-bold leading-snug"
              style={{ color: c.accent ? "#0e357f" : "#1e293b" }}
            >
              {c.value}
            </span>
            {c.note && (
              <span className="mt-1 text-[10px] text-slate-400">{c.note}</span>
            )}
          </div>
        ))}
      </div>
      <Disclaimer />
    </VisualSection>
  );
}

// ────────────────────────────────────────────────────────────
// 3. SubsidySpecCard — H2「補助額・補助率・申請期限」直下
// ────────────────────────────────────────────────────────────
export function SubsidySpecCard({ data }: { data: ArticleVisualData }) {
  const rows: { label: string; value: string; note?: string }[] = [
    {
      label: "補助上限",
      value: data.maxAmount ? `最大 ${data.maxAmount}` : FB.amount,
      note: data.maxAmount ? undefined : "※公募要領をご確認ください",
    },
    {
      label: "補助率",
      value: FB.rate,
      note: "※公募要領をご確認ください",
    },
    {
      label: "申請期限",
      value: data.deadline ?? FB.deadline,
      note: data.deadline ? undefined : "※最新情報は公式でご確認ください",
    },
    {
      label: "対象地域",
      value: data.region ?? FB.region,
    },
    {
      label: "対象経費",
      value: FB.expense,
      note: "※対象経費は公募要領で確認",
    },
  ];

  return (
    <VisualSection className="!my-6">
      <SectionLabel text="制度仕様サマリー" />
      {data.subsidyName && (
        <p className="mb-4 text-[15px] font-bold text-[#0e357f]">
          {data.subsidyName}
        </p>
      )}
      <dl className="divide-y divide-[#dbe7f3] overflow-hidden rounded-xl border border-[#dbe7f3] bg-white">
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex flex-col gap-0.5 px-4 py-3 sm:flex-row sm:items-baseline sm:gap-4"
          >
            <dt
              className="w-24 shrink-0 text-[11px] font-bold uppercase tracking-wider"
              style={{ color: "#0e357f", opacity: 0.65 }}
            >
              {r.label}
            </dt>
            <dd className="flex flex-col">
              <span className="text-[16px] font-semibold text-slate-800">
                {r.value}
              </span>
              {r.note && (
                <span className="text-[11px] text-slate-400">{r.note}</span>
              )}
            </dd>
          </div>
        ))}
      </dl>
      <Disclaimer />
    </VisualSection>
  );
}

// ────────────────────────────────────────────────────────────
// 4. ApplicationSteps — H2「申請の流れ」直下
// ────────────────────────────────────────────────────────────
export function ApplicationSteps() {
  const steps = [
    {
      num: "1",
      title: "要件確認",
      body: "対象業種・規模・経費要件を公募要領で確認",
      color: "#eef6ff",
      border: "#b5d4f4",
    },
    {
      num: "2",
      title: "事業計画",
      body: "補助事業の目的・内容・効果を整理して計画を策定",
      color: "#f0fdf4",
      border: "#86efac",
    },
    {
      num: "3",
      title: "書類準備・申請",
      body: "必要書類を揃え、電子申請システムで提出",
      color: "#fefce8",
      border: "#fde047",
    },
    {
      num: "4",
      title: "採択後の実施・報告",
      body: "採択後に事業を実施し、実績報告・精算を行う",
      color: "#f8fafc",
      border: "#cbd5e1",
    },
  ];

  return (
    <VisualSection className="!my-6">
      <SectionLabel text="申請の流れ（一般的なステップ）" />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        {steps.map((s, i) => (
          <Fragment key={s.num}>
            <div
              className="flex flex-1 flex-col rounded-xl px-4 py-4"
              style={{ background: s.color, border: `1px solid ${s.border}` }}
            >
              <div className="mb-2 flex items-center gap-2">
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-black text-white"
                  style={{ background: "#0e357f" }}
                >
                  {s.num}
                </span>
                <span
                  className="text-[14px] font-bold"
                  style={{ color: "#0e357f" }}
                >
                  {s.title}
                </span>
              </div>
              <p className="text-[16px] leading-relaxed text-slate-600">
                {s.body}
              </p>
            </div>
            {i < steps.length - 1 ? <ColumnArrow /> : null}
          </Fragment>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-slate-400">
        ※ステップ・手続きは制度により異なります。必ず公式情報をご確認ください。
      </p>
    </VisualSection>
  );
}

// ────────────────────────────────────────────────────────────
// 免責表示（複数ブロックで共有）
// ────────────────────────────────────────────────────────────
export function Disclaimer() {
  return (
    <p className="mt-4 rounded-lg bg-white/70 px-3 py-2 text-[11px] leading-relaxed text-slate-400">
      掲載内容は公表情報をもとにした参考情報です。補助額・補助率・対象経費・採択可否は制度、申請内容、審査により異なります。最新情報は必ず公式情報をご確認ください。
    </p>
  );
}
