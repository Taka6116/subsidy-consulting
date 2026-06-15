# HeyGen スライド動画テンプレート作成手順書

## 目的

補助金解説動画を**スライド展開＋桜庭さんの声**で自動生成できるようにする。
HeyGenのTemplate APIを使い、DBの補助金データからシーンごとのテキストを差し替えて動画を自動生成する。

## 完成イメージ（5シーン構成）

```
シーン1（Hook）     : ブランド背景画像 + タイトルテキスト + 桜庭さんの声
シーン2（What）     : 補助金名 + 概要テキスト + 桜庭さんの声
シーン3（Numbers）  : 「最大〇〇万円」などの金額を大きく表示 + 桜庭さんの声
シーン4（Use Case） : 活用事例テキスト + 桜庭さんの声
シーン5（CTA）      : 「無料相談はこちら」+ URL + 桜庭さんの声
```

各シーンのテキストと音声はAPIで差し替えるため、テンプレートでは**プレースホルダー（変数）**を設定する。

---

## 手順

### Step 1. HeyGenにログイン

https://app.heygen.com にログインする。

### Step 2. 新しいテンプレートを作成

1. 左メニューから `Templates` → `Create Template` を選択
2. `Blank Template`（白紙）から作成開始

### Step 3. 5シーンを作成する

各シーンに共通の設定：
- **アバター**: なし（スライド動画のためアバターは配置しない）
- **ボイス（音声）**: 桜庭さんのクローン voice_id `625b342f002045da9f24df8f1b5cf3d3` を各シーンのVoiceScriptに設定
- **解像度**: 1280×720（16:9横向き）
- **背景**: NTSブランドカラー（ネイビー系）または白

#### シーン1 — Hook（導入）

| 要素 | 設定 |
|------|------|
| 背景 | NTS ロゴ入りブランド背景（`public/heygen/bg-nts-corporate.png` を使用可） |
| テキスト1（大見出し）| 変数名: `s1_title` 例: 「補助金で経営課題を解決する」 |
| テキスト2（小見出し）| 変数名: `s1_subtitle` 例: 「〇〇助成金 解説」 |
| 音声スクリプト | 変数名: `s1_voice` 例: 「人手不足や設備の老朽化で...」 |
| 表示時間 | 約15秒 |

#### シーン2 — What（制度の説明）

| 要素 | 設定 |
|------|------|
| 背景 | 白 or ライトグレー |
| テキスト1（補助金名）| 変数名: `s2_name` |
| テキスト2（概要）| 変数名: `s2_description` |
| 音声スクリプト | 変数名: `s2_voice` |
| 表示時間 | 約20秒 |

#### シーン3 — Numbers（金額・期限・対象）

| 要素 | 設定 |
|------|------|
| 背景 | ネイビー or ブランドカラー（数字を際立たせる） |
| テキスト1（金額 大きめ）| 変数名: `s3_amount` 例: `最大 100万円` |
| テキスト2（期限）| 変数名: `s3_deadline` |
| テキスト3（対象業種）| 変数名: `s3_industries` |
| 音声スクリプト | 変数名: `s3_voice` |
| 表示時間 | 約15秒 |

#### シーン4 — Use Case（活用事例）

| 要素 | 設定 |
|------|------|
| 背景 | 白 or ライトブルー |
| テキスト1（活用例1）| 変数名: `s4_case1` |
| テキスト2（活用例2）| 変数名: `s4_case2` |
| 音声スクリプト | 変数名: `s4_voice` |
| 表示時間 | 約20秒 |

#### シーン5 — CTA（行動喚起）

| 要素 | 設定 |
|------|------|
| 背景 | NTSブランド背景 |
| テキスト1（CTA文言）| 変数名: `s5_cta` 例: `まず無料でご確認ください` |
| テキスト2（URL）| 変数名: `s5_url` 例: `subsidy-consulting-nts.vercel.app` |
| 音声スクリプト | 変数名: `s5_voice` |
| 表示時間 | 約10秒 |

### Step 4. 変数名を設定する（重要）

各テキスト要素で「変数」として設定する際、**変数名を上記の表の通りに正確に入力する**。
APIは変数名でプレースホルダーを特定するため、名前が一致していないと差し替えが機能しない。

HeyGenでの変数設定方法:
1. テキスト要素をクリック → 上部ツールバーの `{ }` ボタン（Variable）をクリック
2. 変数名（例: `s1_title`）を入力 → Enter

音声スクリプトの変数設定方法:
1. シーン右側の「Script」エリア → テキストを入力後、右クリックまたはVariable アイコンで変数化
2. 変数名（例: `s1_voice`）を設定

### Step 5. テンプレートを保存・公開する

1. 右上の `Save` をクリック
2. テンプレート名を設定（例: `NTS_補助金解説_スライド_v1`）
3. 保存後、URLまたはテンプレート一覧から **Template ID** を確認する
   - URL例: `https://app.heygen.com/templates/XXXXXXXX` → `XXXXXXXX` がTemplate ID

### Step 6. Template IDを開発者に共有する

取得したTemplate IDを開発者（Cursor）に連携する。
以下の環境変数を `.env` に追加する：

```bash
HEYGEN_SLIDE_TEMPLATE_ID=<新しいTemplate IDをここに>
```

---

## テスト方法（開発者向け）

テンプレート作成後、以下のスクリプトで変数構造を確認できる：

```bash
npx tsx scripts/heygen/_debug-template.ts
```

→ 変数一覧が表示されればテンプレートの接続OK。

---

## 変数名まとめ（コピー用）

| シーン | 変数名 | 種類 | 用途 |
|--------|--------|------|------|
| 1 | `s1_title` | text | Hook 大見出し |
| 1 | `s1_subtitle` | text | Hook 小見出し（補助金名） |
| 1 | `s1_voice` | text（voice script） | Hook ナレーション |
| 2 | `s2_name` | text | 補助金制度名 |
| 2 | `s2_description` | text | 制度の概要 |
| 2 | `s2_voice` | text（voice script） | What ナレーション |
| 3 | `s3_amount` | text | 補助上限額（大表示） |
| 3 | `s3_deadline` | text | 申請期限 |
| 3 | `s3_industries` | text | 対象業種 |
| 3 | `s3_voice` | text（voice script） | Numbers ナレーション |
| 4 | `s4_case1` | text | 活用事例1 |
| 4 | `s4_case2` | text | 活用事例2 |
| 4 | `s4_voice` | text（voice script） | Use Case ナレーション |
| 5 | `s5_cta` | text | CTA 文言 |
| 5 | `s5_url` | text | サイトURL |
| 5 | `s5_voice` | text（voice script） | CTA ナレーション |

---

## 関連ファイル

- `scripts/heygen/generate-from-template.ts` — 自動生成スクリプト（テンプレートID設定後に稼働）
- `scripts/heygen/_debug-template.ts` — テンプレート変数確認用
- `scripts/gen-heygen-script.ts` — DBからナレーション台本を生成
- `.env` — `HEYGEN_API_KEY` / `HEYGEN_SLIDE_TEMPLATE_ID`
