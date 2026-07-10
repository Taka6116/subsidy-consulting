/**
 * AI生成の動画台本データを検証するガードレール関数。
 *
 * チェック内容:
 *  - 「公募要領で確認」出現回数 > 1 → error
 *  - numbers スライドに入力値または「要確認」の表示なし → error
 *  - hook headline に「補助金」含む → warning
 *  - headline が40文字超 → warning
 */

import type { VideoScriptSection } from "@/lib/ai/bedrockVideoScriptGenerate";

export type ValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
};

/** 入力由来の数値、または値を創作しないための「要確認」が明示されているか */
function containsNumericValueOrUnknown(text: string): boolean {
  return (
    /[0-9０-９]/.test(text) ||
    /割|分の|円|%|％/.test(text) ||
    /要確認|不明/.test(text)
  );
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
      `「公募要領」という語が動画全体で${kouboCount}回使われています（最大1回まで）。不明な値は「要確認」に統一してください。`,
    );
  }

  for (const section of sections) {
    // ── E2: numbers スライドに数値なし ────────────────────────────
    if (section.type === "numbers") {
      const numbersText = [
        ...(section.slide_lines ?? []),
        section.highlight ?? "",
        section.text,
      ].join(" ");
      if (!containsNumericValueOrUnknown(numbersText)) {
        errors.push(
          `「${section.heading}」（numbersスライド）に入力値または「要確認」の表示がありません。入力にない数値は創作しないでください。`,
        );
      }
    }

    // ── W1: hook headline に「補助金」含む ─────────────────────────
    if (section.type === "hook" && section.heading.includes("補助金")) {
      warnings.push(
        `hookスライドの見出し「${section.heading}」に「補助金」が含まれています。ターゲットの課題・痛みから始める表現に変えてください。`,
      );
    }

    // ── W2: headline が40文字超 ────────────────────────────────────
    if (section.heading.length > 40) {
      warnings.push(
        `見出し「${section.heading}」が${section.heading.length}文字で40文字を超えています。短くしてください。`,
      );
    }

    // ── W3: highlight が空または未設定 ────────────────────────────
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
