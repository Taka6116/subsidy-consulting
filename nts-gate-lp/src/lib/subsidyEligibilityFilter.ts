/**
 * jGrants の一覧・詳細テキストから、都道府県名の言及を検出し
 * ユーザー入力の都道府県と照合する（保守的な事前フィルタ）。
 * 言及が取れない場合は除外しない（誤除外を避ける）。
 */

import type { JGrantsSubsidyDetail, JGrantsSubsidySummary } from "@/lib/jgrants/client";
import { JAPAN_PREFECTURES } from "@/data/japanPrefectures";

const BLOCKED_TITLE_WORDS = ["交付申請", "採択済", "保証協会", "債務履行"];

function titleHasBlockedWord(summary: JGrantsSubsidySummary): boolean {
  const t = summary.title?.trim() ?? "";
  if (!t) return false;
  return BLOCKED_TITLE_WORDS.some((w) => t.includes(w));
}

/** 長い表記を先にマッチ（将来の表記ゆれ対策） */
const PREFECTURE_LABELS = JAPAN_PREFECTURES.filter((p) => p.id)
  .map((p) => p.label)
  .sort((a, b) => b.length - a.length);

function stripHtmlLite(html: string, maxLen: number): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLen);
}

export function extractMentionedPrefectures(text: string): string[] {
  if (!text.trim()) return [];
  const seen = new Set<string>();
  const found: string[] = [];
  for (const label of PREFECTURE_LABELS) {
    if (text.includes(label) && !seen.has(label)) {
      seen.add(label);
      found.push(label);
    }
  }
  return found;
}

/** 地域判定用に、一覧の対象地域・詳細の地域欄・本文先頭を連結 */
export function buildRegionCorpus(
  summary: JGrantsSubsidySummary,
  detail: JGrantsSubsidyDetail | null,
): string {
  const chunks: string[] = [
    summary.target_area_search ?? "",
    detail?.target_area_detail ?? "",
  ];
  if (detail?.detail) {
    chunks.push(stripHtmlLite(detail.detail, 3500));
  }
  return chunks.join("\n");
}

/**
 * コーパス内に少なくとも1つの都道府県名が含まれ、
 * かつユーザーの県がそのいずれにも含まれない → 地域不適合とみなす。
 */
export function isRegionIncompatible(userPrefecture: string, corpus: string): boolean {
  const u = userPrefecture.trim();
  if (!u) return false;
  const mentions = extractMentionedPrefectures(corpus);
  if (mentions.length === 0) return false;
  return !mentions.includes(u);
}

export type IndustryMatchClass = "match" | "mismatch" | "unknown";

export type EligibilityFilterRow = {
  summary: JGrantsSubsidySummary;
  detail: JGrantsSubsidyDetail | null;
  cls: IndustryMatchClass;
};

export type EligibilityPrefilterMeta = {
  droppedBlockedTitle: number;
  droppedIndustryMismatch: number;
  droppedRegionMismatch: number;
  usedIndustryFallback: boolean;
  usedRegionFallback: boolean;
};

/**
 * 0) 補助金タイトルに除外ワードが含まれるものを除外（フォールバックなし）
 * 1) 詳細に業種欄があり jGrants 照合が mismatch のものを除外（0件ならフォールバック）
 * 2) ユーザー都道府県が入力されているとき、地域コーパスに他県のみ明示されるものを除外（0件ならフォールバック）
 */
export function applyEligibilityPrefilters(
  rows: EligibilityFilterRow[],
  userPrefecture: string,
): { rows: EligibilityFilterRow[]; meta: EligibilityPrefilterMeta } {
  const meta: EligibilityPrefilterMeta = {
    droppedBlockedTitle: 0,
    droppedIndustryMismatch: 0,
    droppedRegionMismatch: 0,
    usedIndustryFallback: false,
    usedRegionFallback: false,
  };

  const afterBlocked = rows.filter((r) => !titleHasBlockedWord(r.summary));
  meta.droppedBlockedTitle = rows.length - afterBlocked.length;

  let afterIndustry = afterBlocked.filter((r) => {
    const hasIndustry = Boolean(r.detail?.industry?.trim());
    if (!hasIndustry) return true;
    return r.cls !== "mismatch";
  });
  meta.droppedIndustryMismatch = afterBlocked.length - afterIndustry.length;

  if (afterIndustry.length === 0) {
    afterIndustry = afterBlocked;
    meta.usedIndustryFallback = true;
    meta.droppedIndustryMismatch = 0;
  }

  const pref = userPrefecture.trim();
  if (!pref) {
    return { rows: afterIndustry, meta };
  }

  const afterRegion = afterIndustry.filter((r) => {
    const corpus = buildRegionCorpus(r.summary, r.detail);
    return !isRegionIncompatible(pref, corpus);
  });
  meta.droppedRegionMismatch = afterIndustry.length - afterRegion.length;

  if (afterRegion.length === 0) {
    meta.usedRegionFallback = true;
    return { rows: afterIndustry, meta };
  }

  return { rows: afterRegion, meta };
}
