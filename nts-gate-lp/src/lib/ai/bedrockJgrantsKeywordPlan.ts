/**
 * Phase A: ユーザー入力の範囲内だけを前提に、jGrants 一覧検索用キーワードを JSON で返す。
 * 捏造（未入力の従業員数・売上・所在地の創作など）は禁止。
 */

import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { parseAssistantJson } from "@/lib/ai/bedrockJsonExtract";

const LOG_PREFIX = "[bedrockJgrantsKeywordPlan]";

export type KeywordPlanInput = {
  companyName: string;
  industryLabel: string;
  prefecture: string;
  employees: string;
  revenueBand: string;
  businessNotes: string;
  /** ユーザーが指定した公式URLからサーバーが取得したプレーンテキスト抜粋（無ければ空） */
  websiteExcerpt: string;
};

const SYSTEM_PROMPT = `あなたは jGrants 補助金一覧APIの「keyword」パラメータ用の検索語を設計するアシスタントです。

# 入力
ユーザーがフォームに入力した以下のフィールドのみが与えられる（空の項目もある）:
- companyName, industryLabel, prefecture, employees, revenueBand, businessNotes
- websiteExcerpt: ユーザーが任意で入力した「会社の公式サイトURL」から、サーバーが**実際に取得できた**ページ本文の抜粋のみ（取得失敗時は空）。捏造や推測で埋めてはならない。

# タスク
jGrants で制度を探すための検索キーワードを **2個以上3個以内** の文字列配列で提案する。

# 厳守ルール（捏造禁止）
- 入力に無い事実（資本金、従業員の正確な人数、本社住所の詳細、事業内容の推測など）を**追加してはならない**。
- businessNotes と websiteExcerpt がともに空なら、事業内容を**想像で補わない**（社名・地域など入力にある語と【使うべきワード例】の組み合わせで組み立てる）。
- websiteExcerpt にはノイズや定型文が混じることがある。**明らかに事業・サービスに関する語句だけ**をキーワード材料にし、サイト共通のフッタ文言だけから語を作らないこと。
- industryLabel は参考情報とし、キーワード文字列に**業種名・業態名をそのまま含めない**（下記【禁止ワード】参照）。
- 各キーワードは API 向けに **80文字以内**。「補助金」「助成」「支援」のうち1語以上を**自然な形で**含めること。
- JSON 以外は出力禁止。

【禁止ワード】
- 業種名・業態名を含むキーワードは生成しない（例：「娯楽業」「製造業」「飲食業」などを単独または組み合わせで使わない）
- 「交付申請」「採択」を含むキーワードは生成しない

【使うべきワード例】
- 設備投資、IT導入、販路開拓、省力化、人手不足対策、事業再構築、生産性向上、デジタル化、脱炭素、賃上げ

# 出力形式（厳守）
{"jgrantsKeywords":["",""]}`;

function assistantTextFromBedrockBody(raw: string): string {
  try {
    const outer = JSON.parse(raw) as { content?: unknown };
    const content = outer.content;
    if (!Array.isArray(content) || content.length === 0) return "";
    const texts: string[] = [];
    for (const block of content) {
      const b = block as { type?: string; text?: string };
      if (typeof b.text === "string" && b.text) texts.push(b.text);
    }
    return texts.join("\n");
  } catch {
    return "";
  }
}

function parseKeywords(parsed: unknown): string[] {
  if (!parsed || typeof parsed !== "object") return [];
  const raw = (parsed as { jgrantsKeywords?: unknown }).jgrantsKeywords;
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((x): x is string => typeof x === "string")
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .map((s) => s.slice(0, 80))
    .slice(0, 3);
}

/**
 * Bedrock でキーワード案を生成。失敗時は null。
 */
export async function runJgrantsKeywordPlanBedrock(
  input: KeywordPlanInput,
): Promise<string[] | null> {
  const modelId = process.env.BEDROCK_MODEL_ID?.trim();
  const region = process.env.AWS_REGION?.trim();

  if (!modelId || !region) {
    console.log(`${LOG_PREFIX} skip: missing BEDROCK_MODEL_ID or AWS_REGION`);
    return null;
  }

  try {
    const client = new BedrockRuntimeClient({ region });
    const userPayload = JSON.stringify({ userInput: input });

    const body = JSON.stringify({
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 600,
      temperature: 0.25,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPayload }],
    });

    const res = await client.send(
      new InvokeModelCommand({
        modelId,
        contentType: "application/json",
        accept: "application/json",
        body: new TextEncoder().encode(body),
      }),
    );

    const raw = res.body ? new TextDecoder().decode(res.body) : "";
    const assistantText = assistantTextFromBedrockBody(raw);
    if (!assistantText.trim()) {
      console.log(`${LOG_PREFIX} empty assistant text`);
      return null;
    }

    const parsed = parseAssistantJson(assistantText, LOG_PREFIX);
    const kw = parseKeywords(parsed);
    if (kw.length === 0) return null;
    console.log(`${LOG_PREFIX} keywords:`, kw);
    return kw;
  } catch (e) {
    console.error(LOG_PREFIX, e);
    return null;
  }
}

/**
 * 業種ラベルから汎用的な検索キーワードへのマッピング（業種名そのままは使わない）。
 * jGrantsのキーワード検索で有効な語を使う。
 */
const INDUSTRY_TO_FALLBACK_KEYWORDS: Record<string, string[]> = {
  "農業":         ["農業 補助金", "農業 支援"],
  "林業":         ["林業 補助金", "森林 支援"],
  "漁業":         ["漁業 補助金", "水産 支援"],
  "鉱業":         ["鉱業 補助金", "採掘 支援"],
  "建設":         ["建設業 補助金", "建築 省力化 支援"],
  "製造":         ["製造業 設備投資 補助金", "生産性向上 補助金"],
  "食品製造":     ["食品製造 補助金", "HACCP 支援"],
  "卸売":         ["販路開拓 補助金", "卸売 小売 支援"],
  "小売":         ["販路開拓 補助金", "小売 デジタル化 支援"],
  "運輸":         ["物流 補助金", "運輸業 支援"],
  "情報通信":     ["デジタル化 補助金", "システム開発 支援"],
  "IT":           ["デジタル化 補助金", "IT導入 生産性向上 支援"],
  "ソフトウェア": ["デジタル化 補助金", "クラウド 補助金"],
  "金融":         ["金融 補助金", "FinTech 支援"],
  "不動産":       ["不動産 補助金", "省エネ 改修 支援"],
  "専門":         ["専門サービス 補助金", "生産性向上 補助金"],
  "広告":         ["販路開拓 補助金", "広告 デジタル化 支援"],
  "コンサル":     ["事業再構築 補助金", "生産性向上 補助金"],
  "宿泊":         ["宿泊業 補助金", "観光 設備投資 支援"],
  "飲食":         ["飲食業 補助金", "省力化 設備投資 補助金"],
  "教育":         ["教育 補助金", "人材育成 支援"],
  "医療":         ["医療 補助金", "福祉 設備投資 支援"],
  "福祉":         ["介護 補助金", "福祉 ICT 支援"],
  "芸術":         ["文化 補助金", "芸術 支援"],
  "娯楽":         ["観光 補助金", "エンタメ 支援"],
  "生活":         ["生活サービス 補助金", "省力化 支援"],
  "エネルギー":   ["省エネ 補助金", "再生可能エネルギー 支援"],
  "廃棄物":       ["廃棄物処理 補助金", "環境 支援"],
};

/**
 * Bedrock 未使用・失敗時の決定的なキーワード（入力のみから生成）。
 * 業種名をそのままキーワードにせず、jGrantsで有効な汎用語を使う。
 */
export function defaultJgrantsKeywordPlan(
  industryLabel: string,
  businessNotes: string,
): string[] {
  const out: string[] = [];

  // 業種ラベルからマッピングされたキーワードを使う
  const matched = Object.entries(INDUSTRY_TO_FALLBACK_KEYWORDS).find(([key]) =>
    industryLabel.includes(key),
  );
  if (matched) {
    out.push(...matched[1]);
  } else {
    // マッピングなし：汎用キーワードのみ
    out.push("生産性向上 補助金", "事業再構築 補助金");
  }

  // businessNotes があれば追加
  const notes = businessNotes.trim();
  if (notes) {
    const snippet = notes.slice(0, 48).replace(/\s+/g, " ");
    out.push(`${snippet} 補助金`.slice(0, 100));
  }

  if (out.length === 0) {
    out.push("補助金");
  }
  return [...new Set(out)].slice(0, 5);
}
