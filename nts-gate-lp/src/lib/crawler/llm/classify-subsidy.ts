import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { parseAssistantJson } from "@/lib/ai/bedrockJsonExtract";
import {
  buildUntrustedDataMessage,
  checkGeneratedTextSafety,
  sanitizeUntrustedText,
  UNTRUSTED_DATA_SYSTEM_RULES,
} from "@/lib/ai/promptSecurity";

const LOG_PREFIX = "[crawler/classify-subsidy]";

const SYSTEM_PROMPT = `あなたは日本の補助金情報を構造化するエキスパートです。

${UNTRUSTED_DATA_SYSTEM_RULES}

以下のWebページテキストから補助金情報を抽出してください。

## ルール
- 補助金・助成金・支援金の公募情報のみ対象とする
- 融資（返済が必要なもの）は除外する
- 情報が不明な場合はnullとする
- 金額は数値（円単位）で返す

## 出力JSON形式
{
  "isSubsidy": boolean,
  "name": string | null,
  "description": string | null,
  "maxAmount": number | null,
  "subsidyRate": string | null,
  "deadline": string | null,
  "targetBusiness": string | null,
  "targetArea": string | null,
  "institutionName": string | null,
  "confidence": number
}

JSONオブジェクトを1つだけ返す。コードフェンスは使わない。`;

export type ClassifiedSubsidy = {
  isSubsidy: boolean;
  name: string | null;
  description: string | null;
  maxAmount: number | null;
  subsidyRate: string | null;
  deadline: string | null;
  targetBusiness: string | null;
  targetArea: string | null;
  institutionName: string | null;
  confidence: number;
};

function assistantTextFromBedrockBody(raw: string): string {
  try {
    const outer = JSON.parse(raw) as { content?: unknown };
    const content = outer.content;
    if (!Array.isArray(content) || content.length === 0) return "";

    const texts: string[] = [];
    for (const block of content) {
      const b = block as { text?: string };
      if (typeof b.text === "string" && b.text.trim()) {
        texts.push(b.text);
      }
    }
    return texts.join("\n");
  } catch {
    return "";
  }
}

function toText(value: unknown, max = 2000): string | null {
  if (typeof value !== "string") return null;
  const s = value.trim();
  if (!s) return null;
  if (s === "null" || s === "undefined") return null;
  return s.slice(0, max);
}

function toNumberOrNull(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const num = Number(value.replace(/[,\s]/g, ""));
    if (Number.isFinite(num)) return num;
  }
  return null;
}

function toIsoOrNull(value: unknown): string | null {
  const text = toText(value, 64);
  if (!text) return null;
  const parsed = Date.parse(text);
  if (Number.isNaN(parsed)) return null;
  return new Date(parsed).toISOString();
}

function toConfidence(value: unknown): number {
  const num = toNumberOrNull(value);
  if (num == null) return 0;
  if (num < 0) return 0;
  if (num > 1) return 1;
  return num;
}

function normalizeParsed(parsed: unknown): ClassifiedSubsidy | null {
  if (!parsed || typeof parsed !== "object") return null;
  const p = parsed as Record<string, unknown>;

  const isSubsidy =
    typeof p.isSubsidy === "boolean"
      ? p.isSubsidy
      : toText(p.isSubsidy)?.toLowerCase() === "true";

  const normalized: ClassifiedSubsidy = {
    isSubsidy,
    name: toText(p.name, 300),
    description: toText(p.description, 4000),
    maxAmount: toNumberOrNull(p.maxAmount),
    subsidyRate: toText(p.subsidyRate, 120),
    deadline: toIsoOrNull(p.deadline),
    targetBusiness: toText(p.targetBusiness, 1000),
    targetArea: toText(p.targetArea, 500),
    institutionName: toText(p.institutionName, 300),
    confidence: toConfidence(p.confidence),
  };

  return normalized;
}

function normalizeForGrounding(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, "");
}

function isNameGrounded(source: string, name: string): boolean {
  const normalizedSource = normalizeForGrounding(source);
  const normalizedName = normalizeForGrounding(name);
  return normalizedName.length >= 4 && normalizedSource.includes(normalizedName);
}

function isAmountGrounded(source: string, amount: number): boolean {
  const compact = source.normalize("NFKC").replace(/[\s,，]/g, "");
  const candidates = [String(Math.trunc(amount))];
  if (amount >= 10_000 && amount % 10_000 === 0) {
    candidates.push(`${amount / 10_000}万`);
  }
  if (amount >= 1_000 && amount % 1_000 === 0) {
    candidates.push(`${amount / 1_000}千`);
  }
  return candidates.some((candidate) => compact.includes(candidate));
}

export type ClassifySubsidyInput = {
  pageText: string;
  pageUrl?: string;
};

export async function classifySubsidy(input: ClassifySubsidyInput): Promise<ClassifiedSubsidy | null> {
  const modelId =
    process.env.MUNICIPALITY_LLM_MODEL?.trim() ||
    process.env.BEDROCK_MODEL_ID?.trim();
  const region = process.env.AWS_REGION?.trim();
  const threshold = Number(process.env.MUNICIPALITY_LLM_CONFIDENCE_THRESHOLD ?? "0.6");

  if (!modelId || !region) {
    console.log(`${LOG_PREFIX} skip: missing MUNICIPALITY_LLM_MODEL/BEDROCK_MODEL_ID or AWS_REGION`);
    return null;
  }

  const pageText = sanitizeUntrustedText(input.pageText, 12_000);
  if (!pageText) return null;

  try {
    const client = new BedrockRuntimeClient({ region });
    const userPrompt = buildUntrustedDataMessage("crawled_web_page", {
      pageUrl: input.pageUrl ?? null,
      pageText,
    });

    const body = JSON.stringify({
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 2000,
      temperature: 0.1,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const response = await client.send(
      new InvokeModelCommand({
        modelId,
        contentType: "application/json",
        accept: "application/json",
        body: new TextEncoder().encode(body),
      }),
    );

    const raw = response.body ? new TextDecoder().decode(response.body) : "";
    const assistantText = assistantTextFromBedrockBody(raw);
    if (!assistantText.trim()) {
      console.log(`${LOG_PREFIX} empty assistant text`);
      return null;
    }

    const parsed = parseAssistantJson(assistantText, LOG_PREFIX);
    const classified = normalizeParsed(parsed);
    if (!classified) return null;

    if (!classified.isSubsidy) return null;
    const safetyViolations = checkGeneratedTextSafety(JSON.stringify(classified));
    if (safetyViolations.length > 0) {
      console.warn(
        `${LOG_PREFIX} rejected unsafe output: ${safetyViolations.join("|")}`,
      );
      return null;
    }
    if (!classified.name || !isNameGrounded(pageText, classified.name)) {
      console.warn(`${LOG_PREFIX} rejected ungrounded subsidy name`);
      return null;
    }
    if (
      classified.maxAmount != null &&
      !isAmountGrounded(pageText, classified.maxAmount)
    ) {
      console.warn(`${LOG_PREFIX} rejected ungrounded max amount`);
      return null;
    }
    if (classified.confidence < threshold) {
      console.log(`${LOG_PREFIX} below confidence threshold: ${classified.confidence}`);
      return null;
    }

    return classified;
  } catch (error) {
    console.error(LOG_PREFIX, error);
    return null;
  }
}
