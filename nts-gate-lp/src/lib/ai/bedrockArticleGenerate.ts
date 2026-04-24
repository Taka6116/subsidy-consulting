/**
 * 補助金 1 件 → SEO 記事（Markdown 本文 + メタ情報）を Bedrock (Claude) で生成する。
 * 既存 bedrockSubsidyMatch.ts と同じ呼び出しパターン（BEDROCK_MODEL_ID + AWS_REGION）。
 * 失敗時は null を返す（呼び出し側でハンドリング）。
 */

import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import {
  parseAssistantJson,
} from "@/lib/ai/bedrockJsonExtract";

const LOG_PREFIX = "[bedrockArticleGenerate]";

export type SubsidyForArticle = {
  id: string;
  name: string;
  description: string | null;
  maxAmountLabel: string | null;
  deadlineLabel: string | null;
  subsidyRate: string | null;
  targetIndustries: string[];
  targetIndustryNote: string | null;
  /** 対象地域（都道府県名 or null = 全国） */
  prefecture: string | null;
};

export type GeneratedArticleDraft = {
  slug: string;
  title: string;
  excerpt: string;
  body: string; // Markdown
  metaDescription: string;
  tags: string[];
  categoryLabel: string;
};

const SYSTEM_PROMPT = `あなたは日本の中小企業向け補助金制度に特化した SEO 記事ライターです。

# 読者像
- 中小企業の経営者（50 代前後）
- 補助金の存在は知っているが、自社に使えるかどうか迷っている
- 難しい制度用語より「自分ごと」として読める文章を求めている

# 文体ルール
- 丁寧語（です・ます調）で統一する
- 1 文を 60 字以内に収める
- カタカナ専門用語は使わない（例: 「スキーム」→「仕組み」）
- 読んで疲れない、自然な日本語にする

# 記事の目的
読者が「この補助金、うちでも使えそうだ。一度相談してみよう」と思い、NTS への無料相談に進むこと。
申請の代行・書類作成の代行という印象は絶対に与えない。NTS の役割は「補助金活用の戦略設計と伴走支援」である。

---

# 入力フィールド
- name: 制度名（必須）
- description: 制度概要（任意。null・空は不明として扱う）
- maxAmountLabel: 補助上限額（任意）
- deadlineLabel: 公募期限（任意。「要確認」「—」「null」は期限不明として扱う）
- subsidyRate: 補助率（任意）
- targetIndustries: 対象業種の配列（空配列は不明として扱う）
- targetIndustryNote: 対象地域・業種の補足（任意）
- prefecture: 対象都道府県（null = 全国。ある場合は「3. 補助額・補助率・申請期限」で触れる）

# 入力フィールドの使用ルール
- 上記フィールドにない情報は記事に書かない（電話番号・メールアドレス・外部 URL は除外）
- HTML タグが含まれる場合はテキストのみ抽出して使う
- 入力に「null」「undefined」「[object Object]」が含まれる場合は「公募要領で要確認」と置き換える

---

# タスク
以下の JSON を 1 つだけ返す。

{
  "slug": "英数字とハイフンのみ・30 文字以内の kebab-case（制度名の英訳 or ローマ字化をベースに簡潔に）",
  "title": "SEO タイトル（32〜40 文字。制度名を含む。煽り文句は使わない）",
  "excerpt": "記事カード用の要約（80〜120 文字。平文・句読点あり。経営者の視点で「〜に使える補助金です」などと書く）",
  "metaDescription": "メタディスクリプション（100〜140 文字。検索結果で読まれる想定）",
  "tags": ["2〜4 件。補助金基礎 / 申請準備 / 設備投資 / DX / IT導入 / 事業計画 / 事業承継 / 建設 / 運送 / 人材 / 採用 / 省エネ 等から選ぶ"],
  "categoryLabel": "お役立ち情報",
  "body": "Markdown 本文（後述の 5 セクション構造に厳密に従うこと）"
}

---

# body（Markdown）の構造（5 H2 厳守・合計 1500〜2500 字）

必ず以下 5 つの H2 を**この順番・この見出し文字列**で配置する。

## 1. この補助金で解決できる経営課題
最初の 2〜3 文で、この補助金を活用すると「どんな経営課題が解決できるか」を描く。
制度名の繰り返しは避け、「人手が足りない」「設備が古い」「資金が不足している」などの経営者の言葉で書き出す。
続けて、この補助金が対象とする課題・投資・取り組みを箇条書きで 3 点示す。
このセクションだけで「自社に関係あるか」が 15 秒でわかるように書く。250〜400 字。

## 2. 活用できる企業のイメージ【活用例】
targetIndustries / description から合理的に導ける仮想ケースを 2〜3 件提示する。
全ての事例の冒頭に必ず **【活用例】** ラベルを付ける（実際の採択事例ではないことを本文中で明示すること）。
各事例は 120〜180 字で以下を含める:
- どんな経営者か（業種・規模を 1 文で）
- どんな課題解決・投資に使ったか
- 期待される変化（「〜が期待できる」「〜につながる可能性があります」と断定しない）
成果を具体的な数値で断定しない（「売上 2 倍」「500 万円削減」等は禁止）。
targetIndustries が空なら description から推測、または一般的な中小企業ケースを用意する。

## 3. 補助額・補助率・申請期限
maxAmountLabel・subsidyRate・deadlineLabel を正確に提示する。
不明な場合は「公募要領で要確認」と明記し、金額・率・日付を創作しない。200〜350 字。

## 4. 申請の流れ（4 ステップ）
以下の 4 ステップを番号付きリストで書く。制度固有の手順が不明な場合は一般的な補助金申請の流れで書く。
1. 公募要領の確認と自社の要件チェック
2. 事業計画書の作成
3. 申請書類の提出
4. 採択後の実施・報告
各ステップに 1〜2 文の補足を加える。200〜350 字。

## 5. まずは無料相談から
以下の文言を **そのまま** 使う（変更・省略禁止）:

補助金の活用を検討される際、「自社が対象になるか」「どの補助金が合っているか」といった疑問は、制度を調べるだけでは解消しにくいものです。

NTS（日本提携支援）では、補助金を使った経営課題の解決策をご一緒に考えることを大切にしています。申請書類の作成代行ではなく、「どの補助金をどう活用するか」という戦略の設計と、採択後も含めた伴走支援がわたしたちの役割です。

「まだ検討段階」「本当に使えるのか確かめたい」という段階でも、ぜひお気軽にご相談ください。

[無料相談のお申し込みはこちら](/consult)

---

# 禁止事項（違反した場合は記事全体を差し戻す）
- 入力フィールドにない情報の創作（活用例の架空ケースは除く）
- 活用例を実際の採択事例として提示すること（必ず【活用例】ラベルを付け、実際の採択事例でないことを明示すること）
- 成果の数値断定（「売上 2 倍」「年間 ●万円削減」等）
- 「代行」「代理申請」「書類作成を代わりに」等の代行印象を与える表現
- 「採択保証」「必ず採択」「100%採択」等の保証表現
- 「今すぐ」「お早めに」「絶対」等の煽り表現
- 競合他社・他サービスへの言及や比較
- 電話番号・メールアドレス・外部 URL の記載
- JSON 以外の文字列の出力（前置き・後書き・コードフェンス禁止）
- slug に日本語・記号・大文字・アンダースコアを含めること
- 5 H2 の順番・見出し文字列を変えること

---

# 出力
JSON オブジェクトを 1 つだけ返す。他の文字列・コードフェンスは一切含めない。`;

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

function sanitizeSlug(raw: unknown, fallbackSeed: string): string {
  const base =
    (typeof raw === "string" ? raw : "")
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48);
  if (base.length >= 3) return base;
  return `article-${fallbackSeed.replace(/[^a-z0-9]/gi, "").slice(0, 10).toLowerCase() || "new"}`;
}

function toStringArray(v: unknown, maxLen: number): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x): x is string => typeof x === "string")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, maxLen);
}

function pickString(v: unknown, maxLen: number): string {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, maxLen);
}

function parseDraft(parsed: unknown, subsidyId: string): GeneratedArticleDraft | null {
  if (!parsed || typeof parsed !== "object") return null;
  const o = parsed as Record<string, unknown>;

  const title = pickString(o.title, 80);
  const body = typeof o.body === "string" ? o.body.trim() : "";

  if (!title || body.length < 300) return null;

  return {
    slug: sanitizeSlug(o.slug, subsidyId),
    title,
    excerpt: pickString(o.excerpt, 240),
    body,
    metaDescription: pickString(o.metaDescription, 200),
    tags: toStringArray(o.tags, 4),
    categoryLabel: pickString(o.categoryLabel, 32) || "お役立ち情報",
  };
}

export async function generateSubsidyArticleDraft(
  subsidy: SubsidyForArticle,
): Promise<GeneratedArticleDraft | null> {
  const modelId = process.env.BEDROCK_MODEL_ID?.trim();
  const region = process.env.AWS_REGION?.trim();

  if (!modelId || !region) {
    console.log(`${LOG_PREFIX} skip: missing BEDROCK_MODEL_ID or AWS_REGION`);
    return null;
  }

  try {
    const client = new BedrockRuntimeClient({ region });
    const userPayload = JSON.stringify({ subsidy });

    const body = JSON.stringify({
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 8000,
      temperature: 0.4,
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
    const draft = parseDraft(parsed, subsidy.id);
    if (!draft) {
      console.log(`${LOG_PREFIX} invalid draft shape`);
      return null;
    }
    console.log(
      `${LOG_PREFIX} success subsidyId=${subsidy.id} title="${draft.title}" bodyChars=${draft.body.length}`,
    );
    return draft;
  } catch (e) {
    console.error(LOG_PREFIX, e);
    return null;
  }
}
