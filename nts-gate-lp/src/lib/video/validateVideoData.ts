/**
 * AI生成の動画台本データを検証するガードレール関数。
 *
 * チェック内容:
 *  - 「公募要領で確認」出現回数 > 1 → error
 *  - numbers スライドに具体的数値なし → error
 *  - hook headline に「補助金」含む → warning
 *  - story スライドに数値効果なし（%/万円/時間/倍） → warning
 *  - headline が40文字超 → warning
 */

import type { VideoScriptSection } from "@/lib/ai/bedrockVideoScriptGenerate";

export type ValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
};

/** テキスト中に具体的な数値（アラビア数字または「〜割」「〜分の〜」等）が含まれるか */
function containsNumericValue(text: string): boolean {
  return /[0-9０-９]/.test(text) || /割|分の|倍|円|%|％/.test(text);
}

/** テキスト中に定量的な効果（%・万円・時間・倍）が含まれるか */
function containsQuantitativeEffect(text: string): boolean {
  return /%|％|万円|時間|倍/.test(text);
}

export function validateVideoData(sections: VideoScriptSection[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // ── E1: 「公募要領」出現回数チェック ──────────────────────────
  const allText = sections
    .flatMap((s) => [s.heading, s.text, ...(s.slide_lines ?? []), s.highlight ?? ""])
    .join(" ");
  const kouboCount = (allText.match(/公募要領/g) ?? []).length;
  if (kouboCount > 1) {
    errors.push(
      `「公募要領」という語が動画全体で${kouboCount}回使われています（最大1回まで）。推定値＋注記で埋めてください。`,
    );
  }

  for (const section of sections) {
    const sectionText = [
      section.heading,
      section.text,
      ...(section.slide_lines ?? []),
      section.highlight ?? "",
    ].join(" ");

    // ── E2: numbers スライドに数値なし ────────────────────────────
    if (section.type === "numbers") {
      const numbersText = [
        ...(section.slide_lines ?? []),
        section.highlight ?? "",
        section.text,
      ].join(" ");
      if (!containsNumericValue(numbersText)) {
        errors.push(
          `「${section.heading}」（numbersスライド）に具体的な数値がありません。補助率・上限額・期限などの数値を必ず入れてください。`,
        );
      }
    }

    // ── W1: hook headline に「補助金」含む ─────────────────────────
    if (section.type === "hook" && section.heading.includes("補助金")) {
      warnings.push(
        `hookスライドの見出し「${section.heading}」に「補助金」が含まれています。ターゲットの課題・痛みから始める表現に変えてください。`,
      );
    }

    // ── W2: story スライドに数値効果なし ──────────────────────────
    if (section.type === "story" && !containsQuantitativeEffect(sectionText)) {
      warnings.push(
        `「${section.heading}」（storyスライド）に数値効果（%・万円・時間・倍）がありません。Before/After の効果を定量的に示してください。`,
      );
    }

    // ── W3: headline が40文字超 ────────────────────────────────────
    if (section.heading.length > 40) {
      warnings.push(
        `見出し「${section.heading}」が${section.heading.length}文字で40文字を超えています。短くしてください。`,
      );
    }

    // ── W4: highlight が空または未設定 ────────────────────────────
    if (!section.highlight || section.highlight.trim().length === 0) {
      warnings.push(
        `「${section.heading}」スライドの highlight が空です。10文字以内のキーワードを設定してください。`,
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
