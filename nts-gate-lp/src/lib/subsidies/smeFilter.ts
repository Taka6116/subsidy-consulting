import type { Prisma } from "@prisma/client";

const EXCLUDED_TEXTS = [
  "給付金",
  "奨学金",
  "就学",
  "入学",
  "高校",
  "中学校",
  "小学校",
  "保育",
  "児童",
  "生徒",
  "学生",
  "妊婦",
  "子育て",
  "世帯",
  "個人向け",
  "生活支援",
  "医療費",
  "介護費",
];

const INCLUDED_TEXTS = [
  "補助金",
  "中小企業",
  "小規模事業者",
  "事業者",
  "法人",
  "設備投資",
  "生産性",
  "販路開拓",
  "業務改善",
  "創業",
  "DX",
  "デジタル",
];

export function buildSmeSubsidyWhere(base: Prisma.SubsidyGrantWhereInput = {}): Prisma.SubsidyGrantWhereInput {
  const includeOr: Prisma.SubsidyGrantWhereInput[] = INCLUDED_TEXTS.map((text) => ({
    OR: [
      { name: { contains: text, mode: "insensitive" } },
      { description: { contains: text, mode: "insensitive" } },
    ],
  }));

  const excludeAnd: Prisma.SubsidyGrantWhereInput[] = EXCLUDED_TEXTS.map((text) => ({
    NOT: [
      { name: { contains: text, mode: "insensitive" } },
      { description: { contains: text, mode: "insensitive" } },
    ],
  }));

  return {
    ...base,
    AND: [...(Array.isArray(base.AND) ? base.AND : base.AND ? [base.AND] : []), ...excludeAnd, { OR: includeOr }],
  };
}
