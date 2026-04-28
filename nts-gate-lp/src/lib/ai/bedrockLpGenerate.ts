/**
 * 補助金 1 件 → LP 用 AI コピー（JSON）を Bedrock (Claude) で生成する。
 *
 * 出力は GeneratedContent.body に JSON 文字列として保存し、
 * buildSubsidyLpData.ts の parseLpAiPayload() で読み出す。
 *
 * contentType = "lp" として article と分離管理する。
 */

import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { parseAssistantJson } from "@/lib/ai/bedrockJsonExtract";

const LOG_PREFIX = "[bedrockLpGenerate]";

export type SubsidyForLp = {
  id: string;
  name: string;
  description: string | null;
  maxAmountLabel: string | null;
  deadlineLabel: string | null;
  subsidyRate: string | null;
  targetIndustries: string[];
  targetIndustryNote: string | null;
  prefecture: string | null;
};

export type GeneratedLpCopy = {
  /** ヒーローキャッチコピー（30〜45文字） */
  heroCopy: string;
  /** サブコピー（50〜80文字） */
  subCopy: string;
  /** 経営課題リスト（3〜5件） */
  pains: string[];
  /** 活用ユースケース（必ず3件） */
  useCases: Array<{ persona?: string; label: string; body: string }>;
  /** FAQ（3〜5件） */
  faqs: Array<{ q: string; a: string }>;
};

const SYSTEM_PROMPT = `あなたは日本の中小企業向け補助金活用 LP の専門コピーライターです。

# 読者像
- 中小企業の経営者（40〜60代）
- 「補助金を使いたいが、自社に合うか分からない」と感じている
- 専門用語より「自分ごと」として読めるコピーを求めている

# NTS（日本提携支援）の役割
- 申請書類の代行・代理申請ではない
- 「どの補助金をどう活用するか」という戦略設計と採択後の伴走支援
- 着手金15万円 + 段階的成功報酬

# 文体ルール
- 丁寧語（です・ます調）で統一
- 1文60字以内
- カタカナ専門用語は使わない（「スキーム」→「仕組み」）
- 煽り・誇張・保証表現は一切使わない

# 禁止事項
- 数値の断定（「売上2倍」「年間500万円削減」等）
- 採択保証・申請代行の印象を与える表現
- 入力にない制度条件・成果数値・採択実績の創作
- コードフェンス・JSON以外の文字列の出力
- 制度名と無関係な業種の活用例（例: 建設機械制度に小売・飲食業）を出さない
- 「架空」「想定事例」「実際の採択事例ではありません」という表現を一切使わない

---

# 業種・用途推定ルール

description や targetIndustries が空でも、制度名から対象業種と用途を推定してよい。
ただし、金額・補助率・期限などの条件は入力値を超えて創作しない。

- 「建設機械」「重機」「ショベル」「解体」を含む場合:
  - persona は「土木工事業」「解体工事業」「建設会社」「建機レンタル会社」を優先
  - pains は燃料費、排ガス、騒音、環境対応、老朽機械の更新、初期投資負担を扱う
  - useCases は電動ショベル、電動重機、充電設備、建機レンタル体制などに寄せる
- 「商用車」「物流」「配送」を含む場合:
  - persona は「運送業」「物流会社」「配送事業者」「食品卸」を優先
  - pains は燃料費、人手不足、配送効率、環境対応を扱う
- 「電動化」「脱炭素」を含む場合:
  - persona は環境対応投資を迫られる事業者に寄せる
  - pains は燃料費、排ガス、騒音、発注者からの環境要件を扱う
- 「事業再構築」を含む場合:
  - persona は製造業、サービス業、小売業などの新規事業・業態転換に寄せる
  - pains は既存事業の限界、新規事業投資、販路拡大を扱う
- 「DX」「IT」「デジタル」を含む場合:
  - persona は紙管理や受発注管理に課題のある事業者に寄せる

targetIndustries が空でも、一般的な中小企業に逃げず、制度名から一番自然な業種を選ぶ。

# タスク

以下の JSON を 1 つだけ返す。コードフェンス・前置き・後書き禁止。

{
  "heroCopy": "ヒーローキャッチコピー（補助金名を含まずに経営課題解決を訴求・30〜45文字）",
  "subCopy": "サブコピー（補助額・補助率・相談無料に触れる・50〜80文字）",
  "pains": [
    "経営課題の箇条書き1（20〜35文字）",
    "経営課題の箇条書き2（20〜35文字）",
    "経営課題の箇条書き3（20〜35文字）",
    "経営課題の箇条書き4（20〜35文字・任意）"
  ],
  "useCases": [
    {
      "persona": "制度に合う業種・状況（例: 土木工事業、解体工事業、建機レンタル会社）",
      "label": "【活用例】＋業種や状況（15〜25文字）",
      "body": "どんな経営者が・何に使えるか・期待できる変化（80〜130文字。成果の数値断定禁止。「架空」表現禁止）"
    },
    {
      "persona": "制度に合う別の業種・状況",
      "label": "【活用例】＋別の業種や状況",
      "body": "同上"
    },
    {
      "persona": "制度に合う3つ目の業種・状況",
      "label": "【活用例】＋3つ目の業種や状況",
      "body": "同上"
    }
  ],
  "faqs": [
    { "q": "よくある質問1（20〜40文字）", "a": "回答（60〜120文字）" },
    { "q": "よくある質問2", "a": "回答" },
    { "q": "よくある質問3", "a": "回答" }
  ]
}

# 入力フィールドの使用ルール
- description が null/空 → 制度名から推測して書く
- maxAmountLabel / subsidyRate / deadlineLabel が null → subCopy で「公募要領で要確認」と一言触れる
- targetIndustries が空 → 制度名から自然な対象業種を推定して useCases を構成する
- 入力に「null」「undefined」「[object Object]」が含まれる場合は「公募要領で要確認」に置き換える
- useCases は必ず3件返す。2件以下は禁止
- useCases の body に「架空」「想定」「実際の採択事例ではありません」を含めない

JSON オブジェクトを 1 つだけ返す。`;

function assistantTextFromBedrockBody(raw: string): string {
  try {
    const outer = JSON.parse(raw) as { content?: unknown };
    const content = outer.content;
    if (!Array.isArray(content) || content.length === 0) return "";
    return content
      .filter((b): b is { type: string; text: string } => typeof (b as { text?: string }).text === "string")
      .map((b) => b.text)
      .join("\n");
  } catch {
    return "";
  }
}

function pickStr(v: unknown, max: number): string {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, max);
}

function pickStrArr(v: unknown, maxItems: number, maxLen: number): string[] {
  if (!Array.isArray(v)) return [];
  return (v as unknown[])
    .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
    .map((s) => s.trim().slice(0, maxLen))
    .slice(0, maxItems);
}

function sanitizeLpCopyText(value: string): string {
  return value
    .replace(/※?\s*架空(?:の)?(?:活用)?(?:事例|イメージ)?(?:です)?[。．、,\s]*/g, "")
    .replace(/※?\s*想定(?:の)?(?:事例|イメージ)?(?:です)?[。．、,\s]*/g, "")
    .replace(/※?\s*実際の採択事例ではありません[。．、,\s]*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseLpCopy(parsed: unknown): GeneratedLpCopy | null {
  if (!parsed || typeof parsed !== "object") return null;
  const o = parsed as Record<string, unknown>;

  const heroCopy = pickStr(o.heroCopy, 80);
  const subCopy = pickStr(o.subCopy, 160);
  const pains = pickStrArr(o.pains, 5, 60);

  if (!heroCopy || pains.length < 2) return null;

  const rawUseCases = Array.isArray(o.useCases) ? o.useCases : [];
  const useCases = rawUseCases
    .map((u) => {
      const uu = u as Record<string, unknown>;
      return {
        persona: sanitizeLpCopyText(pickStr(uu.persona, 40)),
        label: sanitizeLpCopyText(pickStr(uu.label, 60)),
        body: sanitizeLpCopyText(pickStr(uu.body, 260)),
      };
    })
    .filter((u) => u.label && u.body)
    .slice(0, 3);

  const rawFaqs = Array.isArray(o.faqs) ? o.faqs : [];
  const faqs = rawFaqs
    .map((f) => {
      const ff = f as Record<string, unknown>;
      return {
        q: pickStr(ff.q, 80),
        a: pickStr(ff.a, 240),
      };
    })
    .filter((f) => f.q && f.a)
    .slice(0, 5);

  return {
    heroCopy,
    subCopy,
    pains,
    useCases: useCases.length > 0 ? useCases : [{ persona: "設備投資を検討する企業", label: "【活用例】設備投資", body: "詳細は公募要領をご確認ください。" }],
    faqs: faqs.length > 0 ? faqs : [],
  };
}

export async function generateSubsidyLpCopy(
  subsidy: SubsidyForLp,
): Promise<GeneratedLpCopy | null> {
  const modelId = process.env.BEDROCK_MODEL_ID?.trim();
  const region = process.env.AWS_REGION?.trim();

  if (!modelId || !region) {
    console.log(`${LOG_PREFIX} skip: missing BEDROCK_MODEL_ID or AWS_REGION`);
    return null;
  }

  try {
    const client = new BedrockRuntimeClient({ region });

    const body = JSON.stringify({
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 4000,
      temperature: 0.4,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: JSON.stringify({ subsidy }) }],
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
    const copy = parseLpCopy(parsed);
    if (!copy) {
      console.log(`${LOG_PREFIX} invalid copy shape`);
      return null;
    }
    console.log(`${LOG_PREFIX} success subsidyId=${subsidy.id} heroCopy="${copy.heroCopy}"`);
    return copy;
  } catch (e) {
    console.error(LOG_PREFIX, e);
    return null;
  }
}
