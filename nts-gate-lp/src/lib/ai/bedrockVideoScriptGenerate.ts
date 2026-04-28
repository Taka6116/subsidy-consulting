/**
 * 補助金 1 件 → 動画台本（ナレーションテキスト + セクション構成）を Bedrock (Claude) で生成する。
 * 台本は AWS Polly で音声合成するため、読み上げやすい自然な日本語で出力する。
 *
 * v2: ストーリー型6スライド構成に刷新。type/layout フィールドを追加。
 */

import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { parseAssistantJson } from "@/lib/ai/bedrockJsonExtract";

const LOG_PREFIX = "[bedrockVideoScriptGenerate]";

export type VideoSlideType = "hook" | "problem" | "solution" | "numbers" | "story" | "cta";
export type VideoSlideLayout = "full-text" | "split" | "number-focus" | "before-after" | "cta-center";

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
  type: VideoSlideType;
  layout: VideoSlideLayout;
  /** スライドに表示する短い箇条書きテキスト（最大4行、各18文字以内） */
  slide_lines: string[];
  /** スライドで大きく強調する数値・キーワード（必須・10文字以内） */
  highlight: string;
  /** Pexels/Pixabay でB-roll素材を探すための英語キーワード */
  visual_keywords?: string[];
};

export type GeneratedVideoScript = {
  slug: string;
  title: string;
  excerpt: string;
  narration_text: string;
  sections: VideoScriptSection[];
  total_duration_sec: number;
  stock_keywords?: string[];
  tags: string[];
};

const SYSTEM_PROMPT = `あなたは補助金の専門家であり、中小企業の経営者に補助金を「自分ごと」として理解させるプロの解説者です。

# 視聴者像
- 中小企業の経営者（40〜60代）
- 補助金の存在は知っているが、自社に使えるかどうか迷っている
- 短い動画で「具体的な数字・条件・使い方」をつかみたい

# 文体ルール（ナレーション用）
- 話し言葉（です・ます調）で統一する
- 1文を40字以内に収める（読み上げやすさ優先）
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

# 絶対ルール（必ず守ること）

1. 「公募要領で確認」というフレーズは動画全体で最大1回まで。情報がなければ推定値＋注記（例: 「約2/3程度（※要確認）」）で埋める
2. numbersスライドには必ず数値を入れる。不明なら類似制度の相場から推定値を生成し「（※推定・要確認）」と添える
3. hookスライドのheadlineに「補助金」という語を入れない。ターゲットの課題・痛みから始める
4. storyスライドには必ず「%」「万円」「時間」「倍」のいずれかを含む数値効果を入れる
5. highlight は毎セクション必須。null や空文字は禁止。10文字以内の数値・単語で設定する
6. 各slide_linesは18文字以内、1スライド2〜4行まで

---

# スライド構成（ストーリー型・全6スライド）

必ず以下の順序と type/layout を使うこと：

SLIDE 1: type="hook", layout="full-text"
- ターゲットの「痛み・課題」を突く一言でフック
- headlineに「補助金」を含めない
- 例: 「配送コスト、年間いくら払っていますか？」

SLIDE 2: type="problem", layout="split"
- ターゲットが直面している具体的課題を3点
- 各課題は業種・状況に合わせた具体的な内容
- 例: ・燃料費高騰で利益が圧迫されている

SLIDE 3: type="solution", layout="full-text"
- 補助金の位置づけを伝える
- 「その課題を、国が費用を出して解決できる制度があります」
- 補助金名と一言で何ができるかを明確に

SLIDE 4: type="numbers", layout="number-focus"
- 補助率・補助上限・対象経費・申請期限の4点
- 必ず具体的な数値を入れる（推定可）
- highlightは「最大〇〇万円」または「補助率2/3」等の最重要数値

SLIDE 5: type="story", layout="before-after"
- 架空の1社の Before/After 活用ストーリー
- 左: Before（課題・状況）、右: After（導入後・効果）
- 必ず数値効果（%削減・万円節約・時間短縮等）を含める
- slide_lines構成: 「架空の事例です」「Before: 〇〇」「After: 〇〇（効果）」

SLIDE 6: type="cta", layout="cta-center"
- 申請期限を目立たせる
- NTSへの無料相談誘導
- highlightは「無料相談受付中」または残り日数

---

# slide_lines のルール
- 各行は18文字以内
- 1スライドあたり2〜4行
- 箇条書き行は「・」で始める
- 数字・金額・期限・業種など具体的情報を必ず含める
- 「確認が必要」だけの行は禁止（「〇〇円（要確認）」のように情報を添える）

# highlight のルール
- 毎セクション必ず設定（null・空文字禁止）
- 金額情報がある → 「最大〇〇万円」「補助率2/3」など
- 金額不明 → 対象業種・期限・採択件数など最重要情報1つ
- 10文字以内

# visual_keywords のルール
- Pexels/Pixabay 検索用の英語キーワード
- 1セクション2〜4件
- 日本語は使わない

---

# 出力形式
以下のJSONを1つだけ返す（\`\`\`jsonコードブロックで囲んでよい）:

{
  "slug": "kebab-case・英数字とハイフンのみ・30文字以内・末尾に-videoを付ける",
  "title": "動画タイトル（20〜35文字。制度名を含む）",
  "excerpt": "動画説明文（60〜100文字。平文・句読点あり）",
  "narration_text": "全セクションのtextを改行2つでつないだもの",
  "sections": [
    {
      "heading": "フック",
      "text": "ターゲットの痛みを突く書き出し。60〜100字のナレーション。",
      "duration_sec": 10,
      "type": "hook",
      "layout": "full-text",
      "slide_lines": [
        "（ターゲットの課題を問いかける1行・18字以内）",
        "（補足文・18字以内）"
      ],
      "highlight": "（課題キーワード・8字以内）",
      "visual_keywords": ["business owner", "small factory", "logistics truck"]
    },
    {
      "heading": "こんな課題に",
      "text": "対象となる経営者の課題を3点、語りかける形で。100〜130字。",
      "duration_sec": 20,
      "type": "problem",
      "layout": "split",
      "slide_lines": [
        "・（具体的な経営課題1・18字以内）",
        "・（具体的な経営課題2・18字以内）",
        "・（具体的な経営課題3・18字以内）"
      ],
      "highlight": "（最も刺さる課題キーワード・8字以内）",
      "visual_keywords": ["business meeting", "worried owner", "office work"]
    },
    {
      "heading": "解決策があります",
      "text": "補助金の位置づけと概要を平易な言葉で。80〜120字。",
      "duration_sec": 15,
      "type": "solution",
      "layout": "full-text",
      "slide_lines": [
        "（補助金名を1行で・18字以内）",
        "（何ができるかを1行で・18字以内）",
        "（対象を1行で・18字以内）"
      ],
      "highlight": "（補助金の短縮名・8字以内）",
      "visual_keywords": ["government support", "business solution", "office meeting"]
    },
    {
      "heading": "補助の条件",
      "text": "補助額・補助率・対象経費・期限を平易な言葉で。120〜160字。",
      "duration_sec": 25,
      "type": "numbers",
      "layout": "number-focus",
      "slide_lines": [
        "補助率：（比率または推定値）",
        "上限：（金額または推定値）",
        "対象：（主な経費・18字以内）",
        "期限：（日付または年度）"
      ],
      "highlight": "（最重要数値「最大〇〇万円」または「補助率〇/〇」・10字以内）",
      "visual_keywords": ["money calculation", "business budget", "financial planning"]
    },
    {
      "heading": "活用イメージ",
      "text": "架空の1社のBefore/After。「例えば、」で始める。100〜140字。",
      "duration_sec": 25,
      "type": "story",
      "layout": "before-after",
      "slide_lines": [
        "架空の事例です",
        "Before：（課題・状況を1行で）",
        "After：（導入後の変化・数値効果）"
      ],
      "highlight": "（得られる最大の便益・数値含む・10字以内）",
      "visual_keywords": ["manufacturing improvement", "business growth", "factory automation"]
    },
    {
      "heading": "まずは無料相談",
      "text": "NTSへの相談を促す。戦略設計・伴走支援を案内。60〜90字。",
      "duration_sec": 15,
      "type": "cta",
      "layout": "cta-center",
      "slide_lines": [
        "申請期限：（日付・18字以内）",
        "採択後1年間の伴走支援",
        "まずは無料相談から"
      ],
      "highlight": "無料相談受付中",
      "visual_keywords": ["consulting", "handshake", "business advisor"]
    }
  ],
  "total_duration_sec": 110,
  "stock_keywords": ["small business", "office meeting", "factory", "business consulting"],
  "tags": ["2〜4件。設備投資 / DX / IT導入 / 事業計画 / 省エネ / 運送 / 建設 / 人材 等から選ぶ"]
}`;

export async function generateVideoScript(
  subsidy: SubsidyForVideoScript,
  feedbackHints?: string[],
): Promise<GeneratedVideoScript | null> {
  const region = process.env.AWS_REGION ?? "ap-northeast-1";
  const modelId =
    process.env.BEDROCK_MODEL_ID ?? "anthropic.claude-3-haiku-20240307-v1:0";

  const client = new BedrockRuntimeClient({ region });

  const feedbackBlock =
    feedbackHints && feedbackHints.length > 0
      ? `\n\n# 前回生成の修正指示\n${feedbackHints.map((h) => `- ${h}`).join("\n")}\n上記の問題を必ず修正して再生成してください。`
      : "";

  const userContent = `以下の補助金情報から動画台本を生成してください。${feedbackBlock}

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
      parsed.sections?.reduce((sum, s) => sum + (s.duration_sec ?? 0), 0) ?? 110;

    const stockKeywords = sanitizeKeywords(parsed.stock_keywords, [
      "small business",
      "office meeting",
      "business consulting",
    ]);
    parsed.stock_keywords = stockKeywords;

    // highlight フォールバック: null/空文字は空白1文字で置き換えてバリデーションで検出させる
    parsed.sections = (parsed.sections ?? []).map((section, i) => ({
      ...section,
      type: section.type ?? fallbackType(i),
      layout: section.layout ?? fallbackLayout(i),
      highlight: section.highlight?.trim() || `ポイント${i + 1}`,
      visual_keywords: sanitizeKeywords(section.visual_keywords, stockKeywords),
    }));

    return parsed;
  } catch (err) {
    console.error(LOG_PREFIX, "Bedrock invocation failed", err);
    return null;
  }
}

function fallbackType(index: number): VideoSlideType {
  const types: VideoSlideType[] = ["hook", "problem", "solution", "numbers", "story", "cta"];
  return types[index] ?? "solution";
}

function fallbackLayout(index: number): VideoSlideLayout {
  const layouts: VideoSlideLayout[] = [
    "full-text", "split", "full-text", "number-focus", "before-after", "cta-center",
  ];
  return layouts[index] ?? "full-text";
}

function sanitizeKeywords(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback;
  const cleaned = value
    .filter((x): x is string => typeof x === "string")
    .map((x) => x.trim().toLowerCase())
    .filter((x) => x.length >= 3 && /^[a-z0-9\s-]+$/.test(x));
  return cleaned.length ? Array.from(new Set(cleaned)).slice(0, 5) : fallback;
}
