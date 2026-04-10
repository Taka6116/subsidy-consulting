import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import {
  parseAssistantJson,
  stripMarkdownCodeFences,
} from "@/lib/ai/bedrockJsonExtract";

const LOG_PREFIX = "[bedrockSubsidyMatch]";

/** Bedrock 投入用（正規化済み） */
export type NormalizedSubsidyForMatch = {
  id: string;
  title: string;
  description: string;
  targetIndustries: string[];
  eligibility: string;
  maxSubsidyAmount: number | null;
  deadline: string;
  region: string;
};

/** 御社目線の意思決定向け短文カード（API記載範囲内のみ） */
export type SubsidyInsightCard = {
  title: string;
  body: string;
};

export type BedrockMatchScoreRow = {
  subsidyId: string;
  title: string;
  matchScore: number;
  summary: string;
  matchReason: string[];
  riskFlags: string[];
  insightCards: SubsidyInsightCard[];
};

export type CompanyProfileForMatch = {
  industryLabel: string;
  /** jGrants 一覧検索に渡した業種パラメータ（空の場合はキーワードのみ検索） */
  jGrantsIndustryParam?: string;
  companyName: string;
  prefecture: string;
  employees: string;
  revenueBand: string;
  businessPurpose: string;
};

const SYSTEM_PROMPT = `あなたは日本の補助金制度に特化したマッチングアナリストです。

# 目的
ユーザー企業情報とJGrants APIから取得した補助金情報をもとに、
各補助金の適合度をスコアリングし、意思決定可能な形で要約すること。

---

# 入力情報
以下が入力される：

1. ユーザー企業情報
- companyName（会社名。特定は参考程度）
- industryLabel（画面で選択した業種の表示名）
- jGrantsIndustryParam（あれば：API検索に使った業種文字列。業種照合の参考）
- 都道府県、従業員数、売上規模の目安
- businessPurpose（事業内容の説明。ユーザー記述が含まれる場合がある）

2. JGrants API結果（最大5件）
- title
- description
- targetIndustries
- eligibility
- maxSubsidyAmount
- deadline
- region

---

# タスク
各補助金ごとに以下を出力：

## 1. matchScore（0〜100）
- 適合度を数値化

## 2. matchReason（最大3つ）
- 短い理由のみ

## 3. summary（1〜2行）
- ユーザー向け説明

## 4. riskFlags（該当時のみ）
例：
- "業種要確認"
- "地域条件不明"
- "詳細審査必要"

## 5. insightCards（必ず4件出力すること）

ユーザー企業の **businessPurpose・industryLabel** と制度の **対象経費・支援内容・補助率** を **掛け合わせ**、「この企業がこの補助金を使ったら具体的に何が実現し、事業がどう変わるか」をユーザーが想像できるカードにすること。
**制度原文の言い換えではなく、企業の事業に当てはめた具体的な活用シナリオ**を書くこと。

各要素: { "title": "短い見出し（日本語）", "body": "100〜250文字" }

### カードテーマ（この順番で4件出力すること）

1. **御社での活用イメージ** — 企業の業種・事業内容を踏まえ、この制度で「何に投資できるか」「何を導入・実行できるか」を具体的に描写する。業種から合理的に推論できる投資対象（例: 情報通信業なら業務システム・クラウド移行、製造業なら生産設備の自動化など）は記載してよい。ただし API に存在しない固有の製品名・サービス名の創作は禁止。
2. **導入で変わること** — その投資・導入の結果、事業にどんな改善・変化が期待できるかを描写する。「業務効率化」「コスト削減」「新規事業の立ち上げ」など、制度の趣旨と企業の業種から合理的に導ける効果を記載してよい。
3. **金額・補助率のポイント** — 補助上限額・補助率・想定される自己負担の目安を、企業目線で分かりやすくまとめる。情報が不足する場合は「公募要領で要確認」と明記。
4. **申請前に確認すべきこと** — 申請期限・対象要件・リスクフラグの要約。riskFlags の内容と整合させること。

### 禁止事項
- API にない固有の製品名・ブランド名の創作
- 具体的な補助額の創作（API に記載のない金額の捏造）
- CTA・利用を促す誘導文（「今すぐ」「お早めに」等）
- 制度の**申請主体が一般の事業者ではない**場合は、**必ずカード1の本文で明示**し、riskFlags と整合させる

### 許可される推論
- 企業の業種・事業内容から合理的に推論できる投資対象・導入内容の例示（一般名詞レベル）
- 制度の趣旨と企業の業態を掛け合わせた、期待される事業効果の記載
- 情報が乏しい場合でも4件出力し、不足箇所は「公募要領で要確認」等で補うこと

---

# 重要ルール
- 制度を創作しない
- 断定せず、曖昧な場合は「要確認」
- CTA・誘導文は一切出力禁止
- JSONのみ出力
- APIにない固有製品名・ブランド名・具体金額の捏造は禁止（ただし業種から合理的に導ける一般名詞での投資対象の例示は許可）

---

# 追加ルール（安定化）
- subsidies配列の順序や欠損は評価に影響させない
- idで制度を識別すること（出力の subsidyId は入力 subsidies[].id と完全一致させる）
- null / 空文字は存在しないものとして扱い、推測で補わない

---

# 業種・事業整合（厳守）
- company.industryLabel および company.jGrantsIndustryParam（あれば）を、各補助金の targetIndustries と照合すること。
- targetIndustries にユーザーの主たる業種が明示されていない、かつ制度の title/description から見て当該業種が主な対象でない場合は、matchScore を **35 以下**に抑え、riskFlags に **「業種が主対象外の可能性」** を必ず含めること。
- company.businessPurpose（ユーザーが記述した事業内容）がある場合、制度の目的・対象と明らかにずれるときは同様に低スコアとし、riskFlags に **「事業内容との整合要確認」** を含めてよい。
- 上記でも API 記載の範囲を超えて推測しないこと。

---

# 地域整合（厳守）
- company.prefecture が具体的な都道府県名（「（未指定）」以外）のとき、subsidies[].region・targetIndustries・description・eligibility に記載された対象地域と照合すること。
- 制度側に **特定の都道府県名が列挙・明示**されており、かつ **ユーザーの都道府県がそのいずれにも含まれない** と判断できる場合は、matchScore を **30 以下**に抑え、riskFlags に **「地域対象外の可能性」** を必ず含めること。
- 対象地域が全国・記載なし・解釈が割れる場合は、無理に低スコアにせず「要確認」でよい（APIにない推測はしない）。

---

# 出力形式（厳守）

{
  "results": [
    {
      "subsidyId": "（入力 subsidies[].id と完全一致）",
      "title": "制度名",
      "matchScore": 0,
      "summary": "1〜2行のユーザー向け要約",
      "matchReason": ["理由1", "理由2"],
      "riskFlags": ["該当時のみ"],
      "insightCards": [
        { "title": "御社での活用イメージ", "body": "100〜250文字" },
        { "title": "導入で変わること", "body": "100〜250文字" },
        { "title": "金額・補助率のポイント", "body": "100〜250文字" },
        { "title": "申請前に確認すべきこと", "body": "100〜250文字" }
      ]
    }
  ]
}`;

function assistantTextFromBedrockBody(raw: string): string {
  try {
    const outer = JSON.parse(raw) as { content?: unknown };
    const content = outer.content;
    if (!Array.isArray(content) || content.length === 0) return "";
    const texts: string[] = [];
    for (const block of content) {
      const b = block as { type?: string; text?: string };
      if (typeof b.text === "string" && b.text) {
        texts.push(b.text);
      }
    }
    return texts.join("\n");
  } catch {
    return "";
  }
}

function clampScore(n: unknown): number {
  if (typeof n !== "number" || Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function toStringArray(v: unknown, maxLen: number): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x): x is string => typeof x === "string")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, maxLen);
}

const MAX_INSIGHT_CARDS = 4;
const MAX_INSIGHT_TITLE_LEN = 48;
const MAX_INSIGHT_BODY_LEN = 320;

function parseInsightCards(v: unknown): SubsidyInsightCard[] {
  if (!Array.isArray(v)) return [];
  const out: SubsidyInsightCard[] = [];
  for (const el of v) {
    if (!el || typeof el !== "object") continue;
    const o = el as Record<string, unknown>;
    const title = typeof o.title === "string" ? o.title.trim() : "";
    const body =
      typeof o.body === "string" ? o.body.trim().replace(/\s+/g, " ") : "";
    if (!title || !body) continue;
    out.push({
      title: title.slice(0, MAX_INSIGHT_TITLE_LEN),
      body: body.slice(0, MAX_INSIGHT_BODY_LEN),
    });
    if (out.length >= MAX_INSIGHT_CARDS) break;
  }
  return out;
}

function parseBedrockResults(parsed: unknown): BedrockMatchScoreRow[] {
  if (!parsed || typeof parsed !== "object") return [];
  const results = (parsed as { results?: unknown }).results;
  if (!Array.isArray(results)) return [];

  const out: BedrockMatchScoreRow[] = [];
  for (const el of results) {
    if (!el || typeof el !== "object") continue;
    const r = el as Record<string, unknown>;
    const subsidyId = typeof r.subsidyId === "string" ? r.subsidyId.trim() : "";
    if (!subsidyId) continue;
    const title = typeof r.title === "string" ? r.title.trim() : "";
    out.push({
      subsidyId,
      title,
      matchScore: clampScore(r.matchScore),
      summary: typeof r.summary === "string" ? r.summary.trim() : "",
      matchReason: toStringArray(r.matchReason, 3),
      riskFlags: toStringArray(r.riskFlags, 10),
      insightCards: parseInsightCards(r.insightCards),
    });
  }
  return out;
}

/** `{` 開始位置からネスト対応で1オブジェクト分を切り出す（文字列内の括弧は無視） */
function extractBalancedObjectAt(
  text: string,
  start: number,
): { end: number; slice: string } | null {
  if (start >= text.length || text[start] !== "{") return null;
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
      if (depth === 0) return { end: i + 1, slice: text.slice(start, i + 1) };
    }
  }
  return null;
}

/**
 * 全体の JSON.parse が失敗・空でも、`results` 配列先頭から完全なオブジェクトだけ抽出してパースする。
 */
function parseBedrockResultsPartialFromText(assistantText: string): BedrockMatchScoreRow[] {
  const candidate = stripMarkdownCodeFences(assistantText.replace(/^\uFEFF/, "").trim());
  const keyMatch = candidate.match(/"results"\s*:\s*\[/);
  if (!keyMatch || keyMatch.index === undefined) return [];
  const bracketStart = candidate.indexOf("[", keyMatch.index);
  if (bracketStart < 0) return [];

  const rowObjects: unknown[] = [];
  let i = bracketStart + 1;
  while (i < candidate.length) {
    while (i < candidate.length && /\s/.test(candidate[i])) i++;
    if (i >= candidate.length || candidate[i] === "]") break;
    if (candidate[i] === ",") {
      i++;
      continue;
    }
    const ext = extractBalancedObjectAt(candidate, i);
    if (!ext) break;
    try {
      rowObjects.push(JSON.parse(ext.slice));
    } catch {
      break;
    }
    i = ext.end;
  }

  if (rowObjects.length === 0) return [];
  return parseBedrockResults({ results: rowObjects });
}

/**
 * 正規化済み subsidies と企業プロファイルを Bedrock に渡し、スコア行を返す。
 * 失敗時は null（呼び出し側でフォールバック）
 */
export async function runSubsidyMatchBedrock(
  company: CompanyProfileForMatch,
  subsidies: NormalizedSubsidyForMatch[],
): Promise<BedrockMatchScoreRow[] | null> {
  const modelId = process.env.BEDROCK_MODEL_ID?.trim();
  const region = process.env.AWS_REGION?.trim();

  if (!modelId || !region) {
    console.log(`${LOG_PREFIX} skip: missing BEDROCK_MODEL_ID or AWS_REGION`);
    return null;
  }

  if (subsidies.length === 0) {
    return [];
  }

  try {
    const client = new BedrockRuntimeClient({ region });
    const subsidiesForBedrock = subsidies.slice(0, 4);
    const userPayload = JSON.stringify({ company, subsidies: subsidiesForBedrock });

    const body = JSON.stringify({
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 3000,
      temperature: 0.5,
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
    let rows = parseBedrockResults(parsed);
    if (rows.length === 0) {
      const partial = parseBedrockResultsPartialFromText(assistantText);
      if (partial.length > 0) {
        console.log(
          `${LOG_PREFIX} partial parse: recovered ${partial.length} result row(s) from truncated JSON`,
        );
        rows = partial;
      }
    }
    return rows;
  } catch (e) {
    console.error(LOG_PREFIX, e);
    return null;
  }
}
