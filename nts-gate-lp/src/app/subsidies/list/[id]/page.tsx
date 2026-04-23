import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/shared/Header";
import LpFooter from "@/components/gate-lp/LpFooter";
import SubsidiesGalaxyBackdrop from "../../SubsidiesGalaxyBackdrop";
import { prisma } from "@/lib/db/prisma";

type DetailPageProps = {
  params: Promise<{ id: string }>;
};

type RawPayloadLike = Record<string, unknown> | null;

function toObj(rawPayload: unknown): RawPayloadLike {
  if (!rawPayload || typeof rawPayload !== "object" || Array.isArray(rawPayload)) return null;
  return rawPayload as Record<string, unknown>;
}

function getString(rawPayload: RawPayloadLike, key: string): string | null {
  const v = rawPayload?.[key];
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function formatDateJP(raw: string | null): string {
  if (!raw) return "-";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return "-";
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

function formatAmountLabel(maxAmountLabel: string | null, rawPayload: RawPayloadLike): string {
  const current = maxAmountLabel?.trim() ?? "";
  if (/^最大\s*[\d,]+\s*円$/.test(current)) return current.replace(/\s+/g, "");

  const n = Number(rawPayload?.subsidy_max_limit ?? 0);
  if (Number.isFinite(n) && n > 0) return `最大 ${n.toLocaleString("ja-JP")} 円`;
  return "-";
}

function parseAmount(maxAmountLabel: string | null, rawPayload: RawPayloadLike): number | null {
  const raw = Number(rawPayload?.subsidy_max_limit ?? 0);
  if (Number.isFinite(raw) && raw > 0) return raw;
  const m = (maxAmountLabel ?? "").replace(/[^\d]/g, "");
  const n = Number(m);
  if (Number.isFinite(n) && n > 0) return n;
  return null;
}

function formatJPY(amount: number): string {
  if (amount >= 100000000) {
    const oku = amount / 100000000;
    return oku % 1 === 0 ? `${oku}億円` : `${oku.toFixed(1)}億円`;
  }
  if (amount >= 10000) {
    const man = amount / 10000;
    return man % 1 === 0 ? `${man.toLocaleString()}万円` : `${man.toFixed(0)}万円`;
  }
  return `${amount.toLocaleString()}円`;
}

function formatRate(rawPayload: RawPayloadLike): string {
  const rateRaw = rawPayload?.subsidy_rate;
  if (typeof rateRaw === "number" && rateRaw > 0) return `${Math.round(rateRaw * 100)}%`;
  if (typeof rateRaw === "string" && rateRaw.trim()) {
    const n = Number(rateRaw);
    if (Number.isFinite(n)) {
      if (n <= 1) return `${Math.round(n * 100)}%`;
      return `${Math.round(n)}%`;
    }
    return rateRaw;
  }
  return "要確認";
}

function classifyGrantContext(text: string): {
  tags: string[];
  pains: string[];
} {
  if (text.includes("省力化") || text.includes("人手不足")) {
    return {
      tags: ["#人手不足", "#設備投資", "#生産性向上"],
      pains: [
        "人手不足で業務が回らない",
        "作業の自動化・効率化を検討している",
        "設備の老朽化が生産性に影響している",
        "人件費の高騰を設備投資でカバーしたい",
      ],
    };
  }
  if (text.includes("IT") || text.includes("デジタル") || text.includes("DX")) {
    return {
      tags: ["#業務効率化", "#DX推進", "#コスト削減"],
      pains: [
        "業務のデジタル化が進んでいない",
        "紙・Excel管理からシステム化したい",
        "在庫・受発注管理を自動化したい",
        "テレワーク環境を整備したい",
      ],
    };
  }
  if (text.includes("事業承継") || text.includes("承継") || text.includes("M&A")) {
    return {
      tags: ["#後継者不在", "#M&A", "#事業継続"],
      pains: [
        "後継者への経営移行を検討している",
        "M&Aによる事業売却・買収を検討している",
        "承継後の新事業展開に投資したい",
      ],
    };
  }
  return {
    tags: ["#経営課題", "#補助金活用"],
    pains: [
      "投資判断のタイミングに悩んでいる",
      "自己負担を抑えて事業を前進させたい",
      "活用できる補助金制度を比較したい",
    ],
  };
}

/** 2050年より先は jGrants のデータ不備とみなし null 扱い */
const DEADLINE_MAX_DETAIL = new Date("2050-01-01");

function remainingDays(deadlineLabel: string | null, deadline: Date | null): number | null {
  const raw = deadlineLabel ?? deadline?.toISOString() ?? null;
  if (!raw) return null;
  const target = new Date(raw);
  if (Number.isNaN(target.getTime())) return null;
  if (target > DEADLINE_MAX_DETAIL) return null; // 異常値（2124年など）は非表示
  const diff = target.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

const APPLICATION_STEPS: { step: string; text: string; active: boolean }[] = [
  { step: "Step 1", text: "NTSに無料相談（今日できる）", active: true },
  { step: "Step 2", text: "対象確認・要件チェック（1週間）", active: false },
  { step: "Step 3", text: "申請書類の準備（2〜4週間）", active: false },
  { step: "Step 4", text: "申請・審査（1〜3ヶ月）", active: false },
  { step: "Step 5", text: "採択・補助金受給", active: false },
];

export async function generateMetadata({ params }: DetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const grant = await prisma.subsidyGrant.findUnique({
    where: { id },
    select: { name: true },
  });
  const title = grant?.name ? `${grant.name} | 補助金詳細` : "補助金詳細 | 日本提携支援";
  return {
    title,
    description: "補助金の詳細情報ページです。",
  };
}

export default async function SubsidyDetailPage({ params }: DetailPageProps) {
  const { id } = await params;
  const [grant, relatedArticles] = await Promise.all([
    prisma.subsidyGrant.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        maxAmountLabel: true,
        deadlineLabel: true,
        deadline: true,
        targetIndustries: true,
        targetIndustryNote: true,
        source: true,
        updatedAt: true,
        rawPayload: true,
      },
    }),
    prisma.generatedContent.findMany({
      where: { subsidyId: id, contentType: "article", status: "published" },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { id: true, title: true, status: true, publishedAt: true, slug: true },
    }),
  ]);

  const raw = toObj(grant?.rawPayload);
  const titleFromRaw = getString(raw, "title");
  const institutionName = getString(raw, "institution_name") ?? "所管未設定";
  const targetArea = getString(raw, "target_area_search") ?? grant?.targetIndustryNote ?? "全国";
  const acceptanceStart = formatDateJP(getString(raw, "acceptance_start_datetime"));
  const acceptanceEnd = formatDateJP(getString(raw, "acceptance_end_datetime") ?? grant?.deadlineLabel ?? null);
  const displayName = grant?.name ?? titleFromRaw ?? "名称未設定";
  const context = classifyGrantContext(displayName);
  const amountLabel = grant ? formatAmountLabel(grant.maxAmountLabel, raw) : "-";
  const amountValue = grant ? parseAmount(grant.maxAmountLabel, raw) : null;
  const subsidyRate = formatRate(raw);
  const remaining = grant ? remainingDays(grant.deadlineLabel, grant.deadline) : null;
  const remainingText = remaining === null ? "公募中" : remaining < 0 ? "締切済み" : `残り${remaining}日`;
  const remainingTone =
    remaining !== null && remaining <= 30
      ? "text-red-600"
      : remaining !== null && remaining <= 60
        ? "text-orange-500"
        : "text-[#0d2640]";

  return (
    <>
      <Header />
      <main className="relative z-[2] min-h-[100svh] pb-44 font-body md:pb-40">
        <SubsidiesGalaxyBackdrop />
        <div className="relative z-10 mx-auto max-w-6xl px-6 py-24 lg:grid lg:grid-cols-[1fr_320px] lg:gap-8">
          <div className="rounded-2xl border border-white/20 bg-white/90 p-8 shadow-sm backdrop-blur-sm md:p-10">
            <Link
              href="/subsidies/list?page=1"
              className="text-sm text-[#706c64] transition hover:text-[#2f2e2b]"
            >
              ← 一覧に戻る
            </Link>

            {!grant ? (
              <div className="mt-6">
                <h1 className="font-heading text-3xl font-normal text-[#2a2926]">
                  補助金が見つかりません
                </h1>
                <p className="mt-3 text-sm text-[#6a6760]">指定されたIDの補助金は存在しないか、公開対象外です。</p>
              </div>
            ) : (
              <div className="mt-6 space-y-10">
                <section>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#f4f2ee] px-2.5 py-1 text-xs text-[#5f5c55]">
                      {institutionName}
                    </span>
                    <span className="rounded-full bg-[#f4f2ee] px-2.5 py-1 text-xs text-[#5f5c55]">
                      更新: {new Date(grant.updatedAt).toLocaleDateString("ja-JP")}
                    </span>
                    <span className="rounded-full bg-[#f4f2ee] px-2.5 py-1 text-xs text-[#5f5c55]">
                      {grant.source === "manual" ? "NTS取扱" : "jGrants"}
                    </span>
                  </div>

                  <h1 className="font-heading mt-4 text-3xl font-normal leading-tight text-[#2a2926] sm:text-5xl">
                    {displayName}
                  </h1>

                  <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-semibold text-[#2f2e2b]">この補助金を見ている経営者の課題：</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {context.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-[#eaf4f2] px-3 py-1 text-xs font-medium text-[#1a7b6f]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
                    <p className="text-xs text-[#6d6961]">補助される可能性</p>
                    <p className="mt-1 text-xs text-[#6d6961]">最大</p>
                    <p className="mt-2 whitespace-nowrap text-3xl font-bold text-[#0d2640]">
                      {amountValue ? formatJPY(amountValue) : amountLabel.replace(" ", "")}
                    </p>
                  </div>
                  <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
                    <p className="text-xs text-[#6d6961]">補助率（自己負担の軽減）</p>
                    <p
                      className={`mt-2 text-4xl font-bold ${
                        subsidyRate === "要確認" ? "italic text-gray-400" : "text-[#0d2640]"
                      }`}
                    >
                      {subsidyRate}
                    </p>
                    {subsidyRate === "要確認" ? (
                      <p className="mt-1 text-xs text-gray-400">申請時に確認が必要です</p>
                    ) : null}
                  </div>
                  <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
                    <p className="text-xs text-[#6d6961]">締切まで</p>
                    <p className="mt-1 text-xs text-[#6d6961]">残り</p>
                    <p className={`mt-2 whitespace-nowrap text-4xl font-bold ${remainingTone}`}>
                      {remaining !== null && remaining >= 0 ? (
                        <>
                          {remaining}
                          <span className="ml-1 text-xl">日</span>
                        </>
                      ) : (
                        remainingText
                      )}
                    </p>
                  </div>
                </section>

                <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-semibold text-[#2f2e2b]">こんな経営課題を抱えていませんか？</h2>
                  <ul className="mt-4 space-y-2 text-sm leading-relaxed text-[#545149]">
                    {context.pains.map((pain) => (
                      <li key={pain}>✓ {pain}</li>
                    ))}
                  </ul>
                </section>

                <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-semibold text-[#2f2e2b]">基本情報</h2>
                  <div className="mt-4 overflow-hidden rounded-lg border border-neutral-200">
                    <table className="w-full text-sm">
                      <tbody className="divide-y divide-neutral-200">
                        {[
                          ["上限補助額", amountLabel],
                          ["補助率", subsidyRate],
                          ["対象事業者", "中小企業・小規模事業者"],
                          ["対象エリア", targetArea],
                          ["公募期間", `${acceptanceStart} 〜 ${acceptanceEnd}`],
                          ["所管省庁", institutionName],
                        ].map(([k, v]) => (
                          <tr key={k}>
                            <th className="w-40 bg-[#f9f7f3] px-4 py-3 text-left font-medium text-[#625f58]">
                              {k}
                            </th>
                            <td className="px-4 py-3 text-[#2f2e2b]">{v}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-semibold text-[#2f2e2b]">申請の流れ</h2>
                  <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-5">
                    {APPLICATION_STEPS.map(({ step, text, active }, idx) => (
                      <div
                        key={step}
                        className={`rounded-lg border p-3 text-sm ${
                          active
                            ? "border-[#1a7b6f] bg-[#eaf4f2] text-[#1a7b6f]"
                            : "border-neutral-200 bg-white text-[#555149]"
                        }`}
                      >
                        <p className="font-semibold">{step}</p>
                        <p className="mt-1 leading-relaxed">{text}</p>
                        {idx < 4 ? <div className="mt-3 h-1 rounded bg-[#1a7b6f]/30 md:hidden" /> : null}
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-semibold text-[#2f2e2b]">制度概要</h2>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[#57544d]">
                    {titleFromRaw ?? grant.description ?? "制度概要は準備中です。"}
                  </p>
                </section>

                <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-semibold text-[#2f2e2b]">この補助金に関連する記事</h2>
                  {relatedArticles.length === 0 ? (
                    <p className="mt-3 text-sm text-[#6a6760]">関連記事は準備中です。</p>
                  ) : (
                    <ul className="mt-4 space-y-2">
                      {relatedArticles.map((article) => (
                        <li key={article.id}>
                          <Link
                            href={
                              article.slug
                                ? `/subsidies/articles/${article.slug}`
                                : `/subsidies/articles`
                            }
                            className="block rounded-lg border border-neutral-200 bg-[#faf9f6] px-4 py-3 text-sm transition hover:border-[#cfd6d3]"
                          >
                            <p className="font-medium text-[#2f2e2b]">{article.title ?? "無題の記事"}</p>
                            <p className="mt-1 text-xs text-[#6b685f]">
                              {article.publishedAt
                                ? `${new Date(article.publishedAt).toLocaleDateString("ja-JP")}`
                                : ""}
                            </p>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </div>
            )}
          </div>
          <aside className="hidden lg:block">
            <div className="subsidy-detail-side-panel sticky top-24 rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
              <p className="text-base font-bold text-[#0d2640]">🔔 無料で相談できます</p>
              <p className="mt-3 text-sm leading-relaxed text-[#4f4b44]">
                この補助金に申請できるか、対象経費は何か。専門家が無料でお答えします。
              </p>
              <Link
                href="/consult"
                className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[#1a7b6f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#16665c]"
              >
                無料相談を予約する →
              </Link>
              <Link
                href="/check"
                className="mt-3 inline-block text-sm text-[#1a7b6f] underline underline-offset-2"
              >
                まず補助金診断を受ける
              </Link>
              <div className="mt-5 border-t border-[#eceff1] pt-4 text-sm text-[#4f4b44]">
                <p>✓ 相談申し込み無料</p>
                <p className="mt-1">✓ 申請後も伴走サポート</p>
              </div>
            </div>
          </aside>
        </div>

        <aside className="sticky bottom-0 z-50 border-t border-white/15 bg-[#0d2640] px-4 py-4 text-white shadow-[0_-6px_24px_rgba(0,0,0,0.22)] lg:hidden">
          <div className="mx-auto flex max-w-5xl flex-col items-start gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold">この補助金について、無料で相談できます。</p>
              <p className="mt-1 text-xs text-white/75">
                対象かどうか、申請できる経費は何か。専門家が無料でお答えします。
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 md:w-auto md:items-end">
              <Link
                href="/consult"
                className="inline-flex w-full items-center justify-center rounded bg-[#1a7b6f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#16675d] md:w-auto"
              >
                無料相談を予約する →
              </Link>
              <Link
                href="/check"
                className="text-xs text-white/80 underline underline-offset-2 transition hover:text-white"
              >
                まず補助金診断を受ける
              </Link>
            </div>
          </div>
        </aside>
      </main>
      <LpFooter />
    </>
  );
}
