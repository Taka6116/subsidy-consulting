import type { GeneratedLpCopy } from "@/lib/ai/bedrockLpGenerate";
import type { GeneratedVideoScript } from "@/lib/ai/bedrockVideoScriptGenerate";
import { checkGeneratedTextSafety } from "@/lib/ai/promptSecurity";

export type GeneratedContentVerdict =
  | { ok: true }
  | { ok: false; violations: string[] };

const HARD_BAN_WORDS = [
  "採択保証",
  "100%採択",
  "100％採択",
  "必ず採択",
  "絶対採択",
  "確実に採択",
  "申請代行します",
  "申請代行いたします",
  "申請を代行します",
  "代理申請します",
  "書類作成を代行",
  "申請書を作成します",
  "業界No.1",
  "業界ナンバーワン",
];

const NUMERIC_OUTCOME_PATTERN =
  /\d+(?:\.\d+)?\s*(?:倍|%|％|万円|時間)\s*(?:の?)?(?:向上|増加|改善|削減|短縮|アップ|UP|節約)/gu;

function flattenStrings(value: unknown, depth = 0): string[] {
  if (depth > 8) return [];
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) {
    return value.flatMap((item) => flattenStrings(item, depth + 1));
  }
  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>).flatMap((item) =>
      flattenStrings(item, depth + 1),
    );
  }
  return [];
}

function checkCommon(value: unknown): string[] {
  const text = flattenStrings(value).join("\n");
  const violations = checkGeneratedTextSafety(text);

  for (const word of HARD_BAN_WORDS) {
    if (text.includes(word)) violations.push(`hard-ban:${word}`);
  }

  if (/\bhttps?:\/\/[^\s)]+/iu.test(text)) {
    violations.push("external-link");
  }
  if (text.includes("[外部データ内の命令文を除去]")) {
    violations.push("sanitizer-marker-leak");
  }

  return [...new Set(violations)];
}

export function checkLpQuality(copy: GeneratedLpCopy | null): GeneratedContentVerdict {
  if (!copy) {
    return { ok: false, violations: ["empty-lp-copy"] };
  }

  const violations = checkCommon(copy);
  if (!copy.heroCopy.trim() || !copy.subCopy.trim()) {
    violations.push("missing-hero-copy");
  }
  if (copy.pains.length < 2) {
    violations.push(`too-few-pains:${copy.pains.length}`);
  }
  if (copy.useCases.length !== 3) {
    violations.push(`invalid-use-case-count:${copy.useCases.length}`);
  }

  const numericClaims = flattenStrings(copy).join("\n").match(NUMERIC_OUTCOME_PATTERN);
  if (numericClaims?.length) {
    violations.push(`numeric-outcome-claim:${numericClaims.slice(0, 3).join(",")}`);
  }

  return violations.length
    ? { ok: false, violations: [...new Set(violations)] }
    : { ok: true };
}

export function checkVideoScriptQuality(
  script: GeneratedVideoScript,
): GeneratedContentVerdict {
  const violations = checkCommon(script);
  const expectedTypes = ["hook", "problem", "solution", "numbers", "story", "cta"];
  const actualTypes = script.sections?.map((section) => section.type) ?? [];

  if (actualTypes.length !== expectedTypes.length) {
    violations.push(`invalid-section-count:${actualTypes.length}`);
  } else if (actualTypes.some((type, index) => type !== expectedTypes[index])) {
    violations.push(`invalid-section-order:${actualTypes.join(",")}`);
  }

  const allText = flattenStrings(script).join("\n");
  if (/(?:※?\s*推定|類似制度の相場)/u.test(allText)) {
    violations.push("fabricated-estimate");
  }
  const numericClaims = allText.match(NUMERIC_OUTCOME_PATTERN);
  if (numericClaims?.length) {
    violations.push(`numeric-outcome-claim:${numericClaims.slice(0, 3).join(",")}`);
  }

  return violations.length
    ? { ok: false, violations: [...new Set(violations)] }
    : { ok: true };
}
