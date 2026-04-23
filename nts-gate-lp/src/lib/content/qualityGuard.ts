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
 * 注: 記事内で「申請代行ではなく戦略設計」のような否定文脈で語が登場する可能性があるため、
 *     裸の「申請代行」は SOFT_BAN_WORDS に回し、ここには動詞形で断定している表現のみを置く。
 */
const HARD_BAN_WORDS: string[] = [
  // 採択保証系（代行業者と誤認される最大リスク）
  "採択保証",
  "100%採択",
  "100% 採択",
  "100％採択",
  "100％ 採択",
  "必ず採択",
  "絶対採択",
  "確実に採択",
  // 代行系（動詞形のみ。否定文脈「申請代行ではなく」を誤爆しないよう語尾必須）
  "申請代行します",
  "申請代行いたします",
  "申請代行致します",
  "申請を代行します",
  "申請を代行いたします",
  "申請を代行致します",
  "代理申請します",
  "代理申請いたします",
  "代理申請致します",
  "代書します",
  // 誇大広告
  "業界No.1",
  "業界ナンバーワン",
  "日本一の採択率",
  "最高の採択率",
  // 具体的な競合社名（例示。必要に応じて追加）
  "補助金ポータル",
  "ミラサポ",
];

/**
 * soft ban: 1 件で reject はしないが、合計 3 件以上で reject（薬機法/景表法グレー）
 *
 * 「申請代行」「代理申請」は否定文脈で正当に使われうるが、何度も連呼すると代行業者の印象になるため
 * ここで閾値管理する。
 */
const SOFT_BAN_WORDS: string[] = [
  "絶対",
  "完全無料",
  "今すぐ",
  "お早めに",
  "期間限定",
  "特別価格",
  "誰でも",
  "簡単",
  // 代行系（否定文脈を許容するため、閾値ベース）
  "申請代行",
  "代理申請",
  "代書",
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

  // 3. 本文長の最低基準（プロンプトで 2000-3000 字を要求、活用例分を含めて長くなっている）
  const bodyChars = draft.body.trim().length;
  if (bodyChars < 1500) {
    violations.push(`too-short:${bodyChars}`);
  }

  // 4. H2 の数（新構造は 8 H2。LLM が 1-2 欠落する余地を残して 6 以上を合格）
  const h2Count = (draft.body.match(/^##\s+/gm) ?? []).length;
  if (h2Count < 6) {
    violations.push(`too-few-h2:${h2Count}`);
  }

  // 5. Markdown 直リンクに jGrants 以外の問合せ URL が紛れ込んでいないか
  //    （プロンプトで /#contact のみ許可しているが念のため）
  const externalLinks = draft.body.match(/\bhttps?:\/\/[^\s)]+/g) ?? [];
  for (const url of externalLinks) {
    // 許可ドメイン: なし（社内 CTA は相対パス /#contact）
    violations.push(`external-link:${url}`);
  }

  // 6. undefined / NaN / null / [object Object] の混入
  const brokenPattern = /(undefined|NaN|\[object Object\]|<null>)/g;
  const brokenMatches = draft.body.match(brokenPattern);
  if (brokenMatches && brokenMatches.length > 0) {
    violations.push(`broken-token:${brokenMatches.join(",")}`);
  }

  // 7. 必須セクションのキーワード（新 8 H2 構造の要所が含まれているか）
  //    「できること」「活用例」が新構造の核なので必須キーワードに含める
  const requiredSectionKeywords = [
    "できること",
    "活用例",
    "概要",
    "対象",
    "補助",
    "申請",
    "ポイント",
    "NTS",
  ];
  const missingSections = requiredSectionKeywords.filter(
    (kw) => !draft.body.includes(kw),
  );
  if (missingSections.length > 2) {
    violations.push(`missing-sections:${missingSections.join(",")}`);
  }

  // 8. 活用例セクションの「【架空の事例】」ラベル必須化
  //    （活用例を実例と誤認させないための景表法ガード）
  if (draft.body.includes("活用例") && !draft.body.includes("架空")) {
    violations.push("missing-fictitious-label");
  }

  // 9. 数値断定の検出（「2 倍」「3 倍」「500 万円削減」等の具体数値での成果断定）
  //    活用例セクションで成果を断定していないかチェック
  const numericClaimPattern =
    /\d+\s*(?:倍|%|％)\s*(?:の?)?(?:向上|増加|改善|削減|アップ|UP)/g;
  const numericClaims = draft.body.match(numericClaimPattern);
  if (numericClaims && numericClaims.length > 0) {
    violations.push(`numeric-claim:${numericClaims.slice(0, 3).join(",")}`);
  }

  if (violations.length === 0) return { ok: true };
  return { ok: false, violations };
}
