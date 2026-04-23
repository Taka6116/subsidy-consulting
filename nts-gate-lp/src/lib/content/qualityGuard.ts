/**
 * 自動生成記事の品質ガードレール。
 *
 * 目的:
 *  - 薬機法/景品表示法的に危うい断定・保証表現を自動公開させない
 *  - 代行業者と誤認される表現を混入させない
 *  - 本文が実質空 / H2 構造が崩れているものを自動公開させない
 *
 * 使い方:
 *  const verdict = checkArticleQuality(draft);
 *  if (!verdict.ok) { status = "rejected"; metaDescription.violations = verdict.violations; }
 */

import type { GeneratedArticleDraft } from "@/lib/ai/bedrockArticleGenerate";

/**
 * 絶対に自動公開させない強度の禁止語（1 件でもヒットしたら reject）
 *
 * 注: 「申請代行ではなく戦略設計」のような否定文脈での登場を誤爆しないよう、
 *     動詞形・断定形のみをここに置く。
 */
const HARD_BAN_WORDS: string[] = [
  // 採択保証系
  "採択保証",
  "100%採択",
  "100% 採択",
  "100％採択",
  "100％ 採択",
  "必ず採択",
  "絶対採択",
  "確実に採択",
  // 代行系（動詞形・断定形のみ）
  "申請代行します",
  "申請代行いたします",
  "申請代行致します",
  "申請を代行します",
  "申請を代行いたします",
  "申請を代行致します",
  "代理申請します",
  "代理申請いたします",
  "代理申請致します",
  "書類を代わりに作成",
  "書類作成を代行",
  "代書します",
  // 代行印象を強く与える表現
  "申請書を作成いたします",
  "申請書を作成します",
  // 誇大広告
  "業界No.1",
  "業界ナンバーワン",
  "日本一の採択率",
  "最高の採択率",
  // 競合社名
  "補助金ポータル",
  "ミラサポ",
];

/**
 * soft ban: 単独では reject しないが、3 件以上で reject。
 * 「申請代行」は否定文脈（「申請代行ではなく」）でも登場しうるため閾値管理。
 */
const SOFT_BAN_WORDS: string[] = [
  "絶対",
  "完全無料",
  "今すぐ",
  "お早めに",
  "期間限定",
  "特別価格",
  "誰でも",
  "簡単に申請",
  // 代行印象（閾値管理）
  "申請代行",
  "代理申請",
  "代書",
  "申請を手伝",
];

export type QualityVerdict =
  | { ok: true }
  | { ok: false; violations: string[] };

export function checkArticleQuality(draft: GeneratedArticleDraft): QualityVerdict {
  const violations: string[] = [];

  // 1. hard-ban: 1 件でもヒットしたら reject
  const haystack = `${draft.title}\n${draft.body}\n${draft.excerpt}\n${draft.metaDescription}`;
  for (const word of HARD_BAN_WORDS) {
    if (haystack.includes(word)) {
      violations.push(`hard-ban:${word}`);
    }
  }

  // 2. soft-ban: 3 件以上で reject
  const softHits: string[] = [];
  for (const word of SOFT_BAN_WORDS) {
    if (haystack.includes(word)) softHits.push(word);
  }
  if (softHits.length >= 3) {
    violations.push(`soft-ban-threshold:${softHits.join(",")}`);
  }

  // 3. 本文長の最低基準（5 セクション構造で 1500〜2500 字）
  const bodyChars = draft.body.trim().length;
  if (bodyChars < 1200) {
    violations.push(`too-short:${bodyChars}`);
  }

  // 4. H2 の数（新構造は 5 H2。LLM の欠落を考慮し 4 以上で合格）
  const h2Count = (draft.body.match(/^##\s+/gm) ?? []).length;
  if (h2Count < 4) {
    violations.push(`too-few-h2:${h2Count}`);
  }

  // 5. 外部 URL の混入チェック（CTA の相対パス /#contact のみ許可）
  const externalLinks = draft.body.match(/\bhttps?:\/\/[^\s)]+/g) ?? [];
  for (const url of externalLinks) {
    violations.push(`external-link:${url}`);
  }

  // 6. 壊れたトークンの混入チェック
  const brokenPattern = /(undefined|NaN|\[object Object\]|<null>)/g;
  const brokenMatches = draft.body.match(brokenPattern);
  if (brokenMatches && brokenMatches.length > 0) {
    violations.push(`broken-token:${brokenMatches.join(",")}`);
  }

  // 7. 新 5 セクション構造の必須キーワードチェック
  const requiredSectionKeywords = [
    "経営課題",    // ## 1
    "活用",        // ## 2
    "補助額",      // ## 3
    "申請",        // ## 4
    "無料相談",    // ## 5 CTA
    "NTS",
  ];
  const missingSections = requiredSectionKeywords.filter(
    (kw) => !draft.body.includes(kw),
  );
  if (missingSections.length > 2) {
    violations.push(`missing-sections:${missingSections.join(",")}`);
  }

  // 8. 活用例セクションの【架空の事例】ラベル必須（景表法対応）
  if (draft.body.includes("活用") && !draft.body.includes("架空")) {
    violations.push("missing-fictitious-label");
  }

  // 9. 数値断定の検出（「2 倍」「500 万円削減」等の成果断定は禁止）
  const numericClaimPattern =
    /\d+\s*(?:倍|%|％)\s*(?:の?)?(?:向上|増加|改善|削減|アップ|UP)/g;
  const numericClaims = draft.body.match(numericClaimPattern);
  if (numericClaims && numericClaims.length > 0) {
    violations.push(`numeric-claim:${numericClaims.slice(0, 3).join(",")}`);
  }

  // 10. CTA リンクの存在チェック（## 5 に /#contact が含まれているか）
  if (!draft.body.includes("/#contact")) {
    violations.push("missing-cta-link");
  }

  if (violations.length === 0) return { ok: true };
  return { ok: false, violations };
}
