/**
 * 記事 Markdown を H2（## 1. 〜）単位で分割し、図解挿入位置の判定に使う。
 */

export type ArticleBodySection = {
  /** 見出し番号（0 = 先頭に ## が無い前書き） */
  order: number;
  /** 見出し行のみ（例: "## 2. 活用できる企業のイメージ【活用例】"） */
  headingLine: string;
  /** 見出し直後〜次の ## 直前までの本文 */
  body: string;
};

/** 見出しマッチ用に正規化（空白除去・括弧類のゆらぎ吸収） */
export function normalizeHeadingForMatch(headingLine: string): string {
  const withoutPrefix = headingLine.replace(/^##\s*\d+\.\s*/i, "");
  return withoutPrefix
    .replace(/[\s\u3000]/g, "")
    .replace(/[［\[]/g, "【")
    .replace(/[］\]]/g, "】")
    .replace(/[（]/g, "(")
    .replace(/[）]/g, ")")
    .toLowerCase();
}

export type SectionVisualKind = "useCase" | "subsidySpec" | "application" | "none";

export function detectSectionVisualKind(
  headingLine: string,
  sectionOrder: number,
): SectionVisualKind {
  const n = normalizeHeadingForMatch(headingLine);

  if (
    n.includes("活用できる企業") ||
    sectionOrder === 2
  ) {
    return "useCase";
  }
  if (
    n.includes("補助額") &&
    n.includes("補助率") &&
    n.includes("申請期限")
  ) {
    return "subsidySpec";
  }
  if (n.includes("申請") && n.includes("流れ")) {
    return "application";
  }
  return "none";
}

/**
 * `## 1. ...` 形式の H2 で分割（先頭に前書きのみある場合は order 0）
 */
export function splitArticleBodyByH2(markdown: string): ArticleBodySection[] {
  const text = markdown.replace(/\r\n/g, "\n").trim();
  if (!text) return [];

  const parts = text.split(/(?=^##\s*\d+\.\s+)/m);
  const out: ArticleBodySection[] = [];

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    const m = trimmed.match(/^##\s*(\d+)\.\s*([^\n]*)(?:\n([\s\S]*))?$/);
    if (!m) {
      out.push({ order: 0, headingLine: "", body: trimmed });
      continue;
    }

    const order = Number.parseInt(m[1]!, 10);
    const titleRest = (m[2] ?? "").trim();
    const body = (m[3] ?? "").trim();

    out.push({
      order: Number.isFinite(order) ? order : 0,
      headingLine: `## ${m[1]}. ${titleRest}`,
      body,
    });
  }

  return out;
}
