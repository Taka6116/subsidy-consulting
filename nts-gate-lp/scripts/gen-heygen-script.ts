/**
 * HeyGen 動画用スクリプト生成
 * 実行: npx tsx scripts/gen-heygen-script.ts
 *
 * 対象: 公募中または近日公募予定の補助金で、建設業・運輸業が含まれるものを優先して1件取得し、
 * 5幕構成（Hook / What / Numbers / Use Cases / CTA）のナレーション台本を出力する。
 */

import { prisma } from "@/lib/db/prisma";

type RawPayload = Record<string, unknown> | null;

// ─── 取得 ─────────────────────────────────────────────────────
async function fetchGrant() {
  // 優先: 建設業・運輸業対象 かつ 公募中
  const priority = await prisma.subsidyGrant.findFirst({
    where: {
      status: { in: ["open", "upcoming"] },
      OR: [
        { targetIndustries: { hasSome: ["建設業", "運輸業", "建設", "運輸", "物流"] } },
        { targetIndustryNote: { contains: "建設" } },
        { targetIndustryNote: { contains: "運輸" } },
      ],
    },
    orderBy: [{ deadline: "asc" }, { syncedAt: "desc" }],
    select: {
      id: true,
      name: true,
      description: true,
      maxAmountLabel: true,
      subsidyAmount: true,
      targetIndustryNote: true,
      targetIndustries: true,
      deadlineLabel: true,
      deadline: true,
      rawPayload: true,
      status: true,
    },
  });
  if (priority) return priority;

  // フォールバック: 条件緩和して公募中の最新1件
  return prisma.subsidyGrant.findFirst({
    where: { status: { in: ["open", "upcoming"] } },
    orderBy: [{ deadline: "asc" }, { syncedAt: "desc" }],
    select: {
      id: true,
      name: true,
      description: true,
      maxAmountLabel: true,
      subsidyAmount: true,
      targetIndustryNote: true,
      targetIndustries: true,
      deadlineLabel: true,
      deadline: true,
      rawPayload: true,
      status: true,
    },
  });
}

// ─── 整形ヘルパー ─────────────────────────────────────────────
function resolveAmount(label: string | null, amountYen: bigint | null, raw: RawPayload): string {
  if (label) return label.startsWith("最大") ? label : `最大 ${label}`;
  if (amountYen) {
    const n = Number(amountYen);
    const man = n / 10_000;
    if (man >= 10_000) return `最大 ${(man / 10_000).toFixed(1)}億円`;
    return `最大 ${Math.round(man).toLocaleString("ja-JP")}万円`;
  }
  const rawLimit = Number(raw?.subsidy_max_limit ?? 0);
  if (rawLimit > 0) {
    const man = rawLimit / 10_000;
    return `最大 ${Math.round(man).toLocaleString("ja-JP")}万円`;
  }
  return "最大数百万円規模";
}

function resolveDeadline(label: string | null, deadline: Date | null, raw: RawPayload): string {
  if (label) return label;
  if (deadline) {
    return `${deadline.getFullYear()}年${deadline.getMonth() + 1}月${deadline.getDate()}日`;
  }
  const fromRaw = raw?.application_end_date ? new Date(String(raw.application_end_date)) : null;
  if (fromRaw && !Number.isNaN(fromRaw.getTime())) {
    return `${fromRaw.getFullYear()}年${fromRaw.getMonth() + 1}月${fromRaw.getDate()}日`;
  }
  return "公募中";
}

function resolveDescription(desc: string | null, raw: RawPayload): string {
  const base = desc ?? String(raw?.purpose ?? raw?.summary ?? "");
  return base.length > 100 ? base.slice(0, 100) + "…" : base || "（概要は公式ページをご確認ください）";
}

function resolveIndustries(note: string | null, list: string[]): string {
  if (note && note.length < 120) return note;
  if (list.length > 0) return list.slice(0, 4).join("・") + "など";
  return "中小企業全般";
}

// ─── スクリプト生成 ───────────────────────────────────────────
function buildScript(params: {
  name: string;
  description: string;
  amount: string;
  industries: string;
  deadline: string;
}): string {
  const { name, description, amount, industries, deadline } = params;

  return [
    "【Hook  0〜15秒】",
    "人手不足や設備の老朽化で、日々の業務がギリギリになっていませんか？",
    "実は今、その課題解決に使える補助金が公募されています。",
    "",
    "【What 15〜40秒】",
    `「${name}」をご存知ですか？`,
    description,
    "多くの事業者がまだ知らないまま申請期限を迎えてしまっています。",
    "",
    "【Numbers 40〜60秒】",
    `補助上限は${amount}。`,
    `申請期限は${deadline}です。`,
    `対象となるのは${industries}です。`,
    "",
    "【Use Cases 60〜80秒】",
    "建設業であれば、重機や現場設備の更新費用に充てることができます。",
    "運輸業・物流業であれば、配送管理システムの導入や省力化投資にも活用できます。",
    "一度確認するだけで、経営の選択肢が大きく広がります。",
    "",
    "【CTA 80〜90秒】",
    "御社で活用できる補助金があるかどうか、まず無料でご確認ください。",
    "画面下のリンクから、今すぐ診断ツールをお試しいただけます。",
  ].join("\n");
}

// ─── メイン ───────────────────────────────────────────────────
async function main() {
  const grant = await fetchGrant();

  if (!grant) {
    console.log("⚠️  該当する補助金が見つかりませんでした（DB に open/upcoming レコードがない可能性があります）");
    return;
  }

  const raw = grant.rawPayload as RawPayload;

  const params = {
    name:        grant.name ?? String(raw?.title ?? "補助金制度"),
    description: resolveDescription(grant.description, raw),
    amount:      resolveAmount(grant.maxAmountLabel, grant.subsidyAmount ?? null, raw),
    industries:  resolveIndustries(grant.targetIndustryNote, grant.targetIndustries),
    deadline:    resolveDeadline(grant.deadlineLabel, grant.deadline ?? null, raw),
  };

  console.log("═".repeat(60));
  console.log("  HeyGen ナレーション台本（5幕構成）");
  console.log("═".repeat(60));
  console.log();
  console.log(buildScript(params));
  console.log();
  console.log("─".repeat(60));
  console.log(`補助金ID   : ${grant.id}`);
  console.log(`補助金名   : ${params.name}`);
  console.log(`補助上限   : ${params.amount}`);
  console.log(`申請期限   : ${params.deadline}`);
  console.log(`対象業種   : ${params.industries.slice(0, 80)}`);
  console.log(`ステータス : ${grant.status}`);
  const charCount = buildScript(params).replace(/\n|【[^】]*】/g, "").replace(/\s/g, "").length;
  console.log(`文字数(概算): 約${charCount}文字`);
  console.log("─".repeat(60));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
