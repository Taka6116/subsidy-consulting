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

/** 小さな区切り矢印 */
function StepArrow() {
  return (
    <div
      className="flex shrink-0 items-center justify-center text-slate-300"
      aria-hidden
    >
      {/* PC: → / SP: ↓ */}
      <svg
        className="hidden sm:block"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
      >
        <path
          d="M4 10h12M12 6l4 4-4 4"
          stroke="#94a3b8"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <svg
        className="block sm:hidden"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
      >
        <path
          d="M10 4v12M6 12l4 4 4-4"
          stroke="#94a3b8"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
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
// 2. UsageFlow — 課題→活用→期待できる変化 3ステップ
// ────────────────────────────────────────────────────────────
export function UsageFlow({ data }: { data: ArticleVisualData }) {
  // タグ・業種から課題・活用のヒントを自動生成
  const industry =
    data.targetIndustries && data.targetIndustries.length > 0
      ? data.targetIndustries[0]
      : null;
  const theme =
    data.categories && data.categories.length > 0 ? data.categories[0] : null;

  const challengeText = [industry, theme]
    .filter(Boolean)
    .join("・")
    .concat("に関する経営課題");

  const usageText = data.subsidyName
    ? `${data.subsidyName}を活用した投資・改善`
    : "補助制度を活用した設備・業務の改善";

  const resultText = "コスト削減・業務効率化・競争力強化の可能性を確認できます";

  const steps = [
    {
      num: "01",
      heading: "現状の課題",
      body: challengeText,
      bg: "#ffffff",
      border: "#dbe7f3",
    },
    {
      num: "02",
      heading: "制度の活用",
      body: usageText,
      bg: "#eef6ff",
      border: "#b5d4f4",
    },
    {
      num: "03",
      heading: "期待できる変化",
      body: resultText,
      bg: "#f0fdf4",
      border: "#86efac",
    },
  ];

  return (
    <VisualSection>
      <SectionLabel text="この補助金で解決できる経営課題" />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        {steps.map((s, i) => (
          <>
            <div
              key={s.num}
              className="flex flex-1 flex-col rounded-xl px-4 py-4"
              style={{ background: s.bg, border: `1px solid ${s.border}` }}
            >
              <span
                className="mb-2 text-[11px] font-black tracking-widest"
                style={{ color: "#0e357f", opacity: 0.5 }}
              >
                {s.num}
              </span>
              <p
                className="mb-1 text-[13px] font-bold"
                style={{ color: "#0e357f" }}
              >
                {s.heading}
              </p>
              <p className="text-[14px] leading-relaxed text-slate-600">
                {s.body}
              </p>
            </div>
            {i < steps.length - 1 && <StepArrow key={`arrow-${i}`} />}
          </>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-slate-400">
        ※上記は一般的な活用イメージです。対象・成果は条件により異なります。
      </p>
    </VisualSection>
  );
}

// ────────────────────────────────────────────────────────────
// 3. SubsidySpecCard — 補助仕様まとめカード
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
    <VisualSection>
      <SectionLabel text="補助金・制度の仕様概要" />
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
              <span className="text-[15px] font-semibold text-slate-800">
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
// 4. ApplicationSteps — 申請の流れ 4ステップ
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
    <VisualSection>
      <SectionLabel text="申請の流れ（一般的なステップ）" />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        {steps.map((s, i) => (
          <>
            <div
              key={s.num}
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
                  className="text-[13px] font-bold"
                  style={{ color: "#0e357f" }}
                >
                  {s.title}
                </span>
              </div>
              <p className="text-[13px] leading-relaxed text-slate-600">
                {s.body}
              </p>
            </div>
            {i < steps.length - 1 && <StepArrow key={`arrow-${i}`} />}
          </>
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
