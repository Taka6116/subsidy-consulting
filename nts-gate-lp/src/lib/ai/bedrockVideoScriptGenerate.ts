/**
 * 補助金 1 件 → 動画台本（ナレーションテキスト + セクション構成）を Bedrock (Claude) で生成する。
 * 台本は AWS Polly で音声合成するため、読み上げやすい自然な日本語で出力する。
 */

import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { parseAssistantJson } from "@/lib/ai/bedrockJsonExtract";

const LOG_PREFIX = "[bedrockVideoScriptGenerate]";

export type SubsidyForVideoScript = {
  id: string;
  name: string;
  description: string | null;
  maxAmountLabel: string | null;
  deadlineLabel: string | null;
  subsidyRate: string | null;
  targetIndustries: string[];
  targetIndustryNote: string | null;
  prefecture: string | null;
  articleExcerpt?: string | null;
};

export type VideoScriptSection = {
  heading: string;
  text: string;
  duration_sec: number;
  /** スライドに表示する短い箇条書きテキスト（最大4行、各20文字以内） */
  slide_lines: string[];
  /** スライドで大きく強調する数値・キーワード（任意）例: "最大500万円" */
  highlight?: string;
};

export type GeneratedVideoScript = {
  slug: string;
  title: string;
  excerpt: string;
  narration_text: string;
  sections: VideoScriptSection[];
  total_duration_sec: number;
  tags: string[];
};

const SYSTEM_PROMPT = `あなたは日本の中小企業向け補助金制度を専門とする動画ナレーター・脚本家です。

# 視聴者像
- 中小企業の経営者（40〜60 代）
- 補助金の存在は知っているが、自社に使えるかどうか迷っている
- 短い動画で「具体的な数字・条件・使い方」をつかみたい

# 文体ルール（ナレーション用）
- 話し言葉（です・ます調）で統一する
- 1 文を 40 字以内に収める（読み上げやすさ優先）
- カタカナ専門用語は使わない
- 句読点を適切に入れる（Polly が正しく読み上げられるように）
- 数字は算用数字（例: 二千万円 → 2000万円）
- 「〜と思います」「〜でしょう」は使わない。断定的に話す

# 動画の目的
「この補助金、うちでも使えそうだ。一度相談してみよう」と思わせ、NTS の無料相談に誘導する。
NTS の役割は「申請代行・書類作成代行」ではなく「補助金活用の戦略設計と採択後1年間の伴走支援」。

# 禁止事項
- 具体的な採択事例の断言（「〜社が採択されました」等）
- 成果の数値断定（「売上2倍」「500万円削減」等）
- 申請書類作成・申請代行・手続き代行の印象を与える表現
- 外部URL・電話番号・メールアドレスの記載

---

# スライドデザイン仕様（slide_lines / highlight）

slide_lines はスライド上に大きく表示されるテキスト行です。以下を厳守する。

## slide_lines のルール
- 各行は **25 文字以内**
- 1 スライドあたり **3〜5 行**
- 箇条書き行は「・」で始める
- **数字・金額・期限・業種など具体的情報を必ず含める**
- 「確認が必要」「要確認」だけの行は作らない（「〇〇円（要公募要領確認）」のように情報を添える）

## highlight のルール
- **毎セクション必ず設定する**（null は禁止）
- 金額情報がある → 「最大〇〇万円」「補助率2/3」など金額・比率
- 金額不明 → 対象業種・対象地域・採択件数・期限など最も重要な情報1つ
- 文字数は **12 文字以内**

---

# タスク
以下の JSON を 1 つだけ返す（\`\`\`json コードブロックで囲んでよい）。

{
  "slug": "英数字とハイフンのみ・30 文字以内の kebab-case に -video を付加",
  "title": "動画タイトル（20〜35 文字。制度名を含む）",
  "excerpt": "動画説明文（60〜100 文字。平文・句読点あり）",
  "narration_text": "全セクションの text を改行 2 つでつないだもの",
  "sections": [
    {
      "heading": "イントロ",
      "text": "補助金名と概要を 2 文で。視聴者に『自分ごと』として届ける書き出し。80〜120 字。",
      "duration_sec": 15,
      "slide_lines": [
        "（補助金の正式名称または短縮名を1行で）",
        "対象：（業種・規模を具体的に）",
        "（この補助金が解決する課題を1行で）",
        "（補助規模のざっくり感を1行で。不明なら省略）"
      ],
      "highlight": "（補助金名の短縮形・最大8文字）"
    },
    {
      "heading": "こんな課題を持つ経営者に",
      "text": "対象となる経営者の課題を 3 点、語りかける形で。100〜140 字。",
      "duration_sec": 20,
      "slide_lines": [
        "・（具体的な経営課題1・20字以内）",
        "・（具体的な経営課題2・20字以内）",
        "・（具体的な経営課題3・20字以内）"
      ],
      "highlight": "（最も刺さる課題キーワード・8字以内）"
    },
    {
      "heading": "この補助金でできること",
      "text": "補助金の内容・補助額・補助率を平易な言葉で説明。120〜160 字。",
      "duration_sec": 30,
      "slide_lines": [
        "補助上限：（金額または「公募要領で確認」）",
        "補助率：（比率または「公募要領で確認」）",
        "対象経費：（主な経費を具体的に）",
        "申請期限：（日付または「〇〇年度公募」）"
      ],
      "highlight": "（補助上限金額「最大〇〇万円」。不明なら対象業種）"
    },
    {
      "heading": "活用例",
      "text": "仮想の活用シーンを 1 件。冒頭に『例えば、』を付ける。100〜140 字。",
      "duration_sec": 25,
      "slide_lines": [
        "例えば…",
        "（活用する事業者の属性・業種を1行で）",
        "・（行動・投資内容を1行で）",
        "・（得られる効果・メリットを1行で）"
      ],
      "highlight": "（活用で得られる最大の便益・8字以内）"
    },
    {
      "heading": "申請のポイント",
      "text": "申請前に確認すべき注意点を 3 点。100〜130 字。",
      "duration_sec": 20,
      "slide_lines": [
        "・（要件・条件チェックポイント1・20字以内）",
        "・（要件・条件チェックポイント2・20字以内）",
        "・（スケジュールや期限に関する注意・20字以内）",
        "→ 詳細は公募要領で最終確認を"
      ],
      "highlight": "（最重要チェック事項キーワード・8字以内）"
    },
    {
      "heading": "NTS へのご相談",
      "text": "補助金活用の戦略設計について NTS に相談できることを案内。60〜90 字。",
      "duration_sec": 10,
      "slide_lines": [
        "採択後1年間の伴走支援",
        "戦略設計から実績報告まで",
        "まずは無料相談から"
      ],
      "highlight": "無料相談受付中"
    }
  ],
  "total_duration_sec": 120,
  "tags": ["2〜4 件。補助金基礎 / 申請準備 / 設備投資 / DX / IT導入 / 事業計画 / 事業承継 / 建設 / 運送 / 人材 / 省エネ 等から選ぶ"]
}

各セクションの text は読み上げ用ナレーションとして仕上げること。
highlight は必ず毎セクション設定すること（null 禁止）。`;

export async function generateVideoScript(
  subsidy: SubsidyForVideoScript,
): Promise<GeneratedVideoScript | null> {
  const region = process.env.AWS_REGION ?? "ap-northeast-1";
  const modelId =
    process.env.BEDROCK_MODEL_ID ?? "anthropic.claude-3-haiku-20240307-v1:0";

  const client = new BedrockRuntimeClient({ region });

  const userContent = `以下の補助金情報から動画台本を生成してください。

name: ${subsidy.name}
description: ${subsidy.description ?? "（情報なし）"}
maxAmountLabel: ${subsidy.maxAmountLabel ?? "要確認"}
subsidyRate: ${subsidy.subsidyRate ?? "要確認"}
deadlineLabel: ${subsidy.deadlineLabel ?? "要確認"}
targetIndustries: ${subsidy.targetIndustries.length > 0 ? subsidy.targetIndustries.join("、") : "（情報なし）"}
targetIndustryNote: ${subsidy.targetIndustryNote ?? "（情報なし）"}
prefecture: ${subsidy.prefecture ?? "全国"}
articleExcerpt: ${subsidy.articleExcerpt ?? "（情報なし）"}`;

  const body = JSON.stringify({
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 4000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userContent }],
  });

  try {
    const command = new InvokeModelCommand({
      modelId,
      contentType: "application/json",
      accept: "application/json",
      body,
    });

    const response = await client.send(command);
    const text = new TextDecoder().decode(response.body);
    const outer = JSON.parse(text) as {
      content?: Array<{ text?: string }>;
    };
    const raw = outer.content?.[0]?.text ?? "";

    const parsed = parseAssistantJson(raw) as GeneratedVideoScript | null;
    if (!parsed || !parsed.slug || !parsed.narration_text) {
      console.error(LOG_PREFIX, "invalid response structure", raw.slice(0, 200));
      return null;
    }

    parsed.slug = parsed.slug.replace(/[^a-z0-9-]/g, "-").slice(0, 60);
    parsed.total_duration_sec =
      parsed.sections?.reduce((sum, s) => sum + (s.duration_sec ?? 0), 0) ?? 120;

    return parsed;
  } catch (err) {
    console.error(LOG_PREFIX, "Bedrock invocation failed", err);
    return null;
  }
}
