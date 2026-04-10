/**
 * Bedrock 応答から JSON を取り出す共通処理（フェンス除去・バランス括弧・フォールバック parse）
 */

const LOG_PREFIX = "[bedrockJsonExtract]";

export function safeParseJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        /* fall through */
      }
    }
    return null;
  }
}

/** マークダウンの ```json ... ``` を除去（複数フェンスがあれば繰り返し） */
export function stripMarkdownCodeFences(text: string): string {
  let t = text.trim();
  for (let i = 0; i < 3; i++) {
    const m = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (!m) break;
    t = m[1].trim();
  }
  return t;
}

/** 先頭の { から対応する } までを抜き出す（文字列内の括弧は簡易対応） */
export function extractBalancedJsonObject(text: string): string | null {
  const start = text.indexOf("{");
  if (start < 0) return null;
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (c === "\\" && inString) {
      escape = true;
      continue;
    }
    if (c === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

export function parseAssistantJson(assistantText: string, logLabel = LOG_PREFIX): unknown {
  const rawLogLimit = 4000;
  console.log(
    `${logLabel} assistantText(raw, truncated)`,
    assistantText.length > rawLogLimit
      ? `${assistantText.slice(0, rawLogLimit)}… (${assistantText.length} chars)`
      : assistantText,
  );

  let candidate = stripMarkdownCodeFences(assistantText);
  candidate = candidate.replace(/^\uFEFF/, "").trim();

  const tryParse = (s: string): unknown => {
    try {
      return JSON.parse(s);
    } catch {
      return null;
    }
  };

  let parsed: unknown = tryParse(candidate);
  if (parsed === null) {
    const balanced = extractBalancedJsonObject(candidate);
    if (balanced) {
      parsed = tryParse(balanced);
    }
  }
  if (parsed === null) {
    parsed = safeParseJson(candidate);
  }
  if (parsed === null && candidate !== assistantText) {
    parsed = safeParseJson(assistantText);
  }

  console.log(`${logLabel} parsedAfterExtract`, JSON.stringify(parsed));

  return parsed;
}
