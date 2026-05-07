# 全自治体補助金クローリングシステム 設計指示書

> **目的**: 日本全市区町村（約1,700）の公式補助金情報を自動収集し、補助金詳細ページに集約表示する。「補助金情報はここに来ればいい」という日本最速のプラットフォームを実現する。
>
> **対象**: Cursor（Claude）への実装指示として使用する。コードの新規作成・既存コードとの統合を含む。

---

## 0. 現状アーキテクチャの理解（前提）

### 既存データフロー
```
[jGrants API] → sync-jgrants.mjs → SubsidyGrant (RDS)
[省庁RSS/HTML] → article-pipeline/index.mjs (Stage 0) → SubsidyGrant (RDS)
                                ↓
                    ContentJob queue → 記事/LP/動画 自動生成
                                ↓
                    /subsidies/list/[id] 詳細ページ表示
```

### 既存テーブル（変更してはならない）
- `SubsidyGrant` — 補助金マスター（source: "jgrants" | "manual" | "ministry"）
- `GeneratedContent` — AI生成コンテンツ
- `ContentJob` — 生成ジョブキュー
- `SubsidySyncRun`, `SyncLog` — 同期ログ

### 技術スタック
- Next.js 15 (App Router) / React 19 / TypeScript
- Prisma + PostgreSQL (RDS)
- AWS Lambda + EventBridge (15分間隔)
- Vercel (ISR revalidate: 300秒)

---

## 1. アーキテクチャ概要

### 新規追加するもの
```
[全自治体公式サイト] → municipality-crawler → SubsidyGrant (source="municipality")
                                                  ↓
                              既存パイプラインに合流（記事/LP/動画 自動生成）
```

### 設計原則
1. **既存コードを壊さない** — SubsidyGrantテーブルに `source="municipality"` として追加するだけ
2. **段階的スケール** — Phase 1で47都道府県 → Phase 2で政令市 → Phase 3で全市区町村
3. **異種ソース対応** — HTML/RSS/PDF/APIなど自治体ごとに異なるフォーマットに対応
4. **速度優先** — 公募開始からDB反映まで最短を目指す（目標: 1時間以内）

---

## 2. データベース拡張

### 2-1. 新規テーブル: `Municipality`（自治体マスター）

```prisma
model Municipality {
  id              String   @id @default(cuid())
  code            String   @unique  // 総務省 全国地方公共団体コード（6桁）
  name            String            // 例: "東京都渋谷区"
  prefectureName  String            // 例: "東京都"
  type            String            // "prefecture" | "designated_city" | "city" | "ward" | "town" | "village"
  officialUrl     String?           // 公式サイトトップURL
  subsidyPageUrl  String?           // 補助金一覧ページURL（手動 or 自動検出）
  feedUrl         String?           // RSS/Atom フィードURL（あれば）
  crawlStrategy   String   @default("html_list")  // "rss" | "html_list" | "html_table" | "pdf_list" | "api" | "manual"
  crawlConfig     Json?             // 自治体固有のセレクタ/パーサー設定
  lastCrawledAt   DateTime?
  crawlStatus     String   @default("pending")  // "pending" | "active" | "error" | "disabled"
  errorMessage    String?
  priority        Int      @default(0)  // クロール優先度（高い=先にクロール）
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  crawlResults    MunicipalityCrawlResult[]

  @@map("municipalities")
  @@index([prefectureName])
  @@index([crawlStatus])
  @@index([lastCrawledAt])
}
```

### 2-2. 新規テーブル: `MunicipalityCrawlResult`（クロール結果ログ）

```prisma
model MunicipalityCrawlResult {
  id              String   @id @default(cuid())
  municipalityId  String
  municipality    Municipality @relation(fields: [municipalityId], references: [id])
  crawledAt       DateTime @default(now())
  linksFound      Int      @default(0)
  newGrants       Int      @default(0)
  updatedGrants   Int      @default(0)
  errors          Json?    // エラー詳細の配列
  duration        Int?     // クロール所要時間(ms)

  @@map("municipality_crawl_results")
  @@index([municipalityId])
  @@index([crawledAt])
}
```

### 2-3. SubsidyGrant テーブルへのカラム追加

```prisma
// 既存の SubsidyGrant に以下を追加
model SubsidyGrant {
  // ... 既存フィールド ...

  municipalityCode  String?          // 総務省コード（自治体紐付け）
  officialPageUrl   String?          // 公募の公式ページURL（原典リンク）
  institutionName   String?          // 実施機関名（例: "渋谷区産業振興課"）
  fetchedAt         DateTime?        // 情報取得日時
  contentHash       String?          // ページコンテンツのハッシュ（重複・更新検知用）

  @@index([municipalityCode])
  @@index([officialPageUrl])
}
```

> **注意**: `source` フィールドの値として `"municipality"` を新たに使う。既存の `"jgrants"` / `"manual"` / `"ministry"` はそのまま。

---

## 3. 自治体マスターデータの初期構築

### 3-1. データソース

総務省「全国地方公共団体コード」を使用する。

```
ファイル: scripts/data/municipality-codes.json
ソース: https://www.soumu.go.jp/denshijiti/code.html
```

### 3-2. 初期データ投入スクリプト

```
ファイル: scripts/seed-municipalities.ts
```

**処理内容**:
1. 総務省コード一覧（CSV/JSON）を読み込む
2. 各自治体の公式サイトURLを付与（手動整備 + 自動検出のハイブリッド）
3. `municipalities` テーブルに一括INSERT
4. 都道府県 → 政令市 → その他の順で `priority` を設定

### 3-3. 補助金ページURL自動検出

```
ファイル: scripts/detect-subsidy-pages.ts
```

**処理内容**:
1. 各自治体の公式サイトトップページをfetch
2. 以下のキーワードでリンクを探索:
   - "補助金", "助成金", "支援制度", "融資", "給付金"
   - "事業者向け", "中小企業", "産業振興"
   - "/hojyo", "/josei", "/shien", "/kigyou"
3. 見つかったURLを `subsidyPageUrl` に保存
4. 見つからない場合は `crawlStatus = "manual"` として手動設定待ちにする

---

## 4. クローラーエンジン設計

### 4-1. ファイル構成

```
nts-gate-lp/
├── src/lib/crawler/
│   ├── index.ts                    # メインエントリ（オーケストレーター）
│   ├── strategies/
│   │   ├── base.ts                 # 共通インターフェース
│   │   ├── rss-strategy.ts         # RSS/Atom フィード解析
│   │   ├── html-list-strategy.ts   # HTMLリンクリスト型
│   │   ├── html-table-strategy.ts  # HTMLテーブル型
│   │   ├── pdf-list-strategy.ts    # PDFリスト型（リンクのみ抽出）
│   │   └── api-strategy.ts         # REST API型（東京都等）
│   ├── parsers/
│   │   ├── subsidy-extractor.ts    # ページ本文から補助金情報を構造化抽出
│   │   ├── deadline-parser.ts      # 締切日パーサー（和暦/西暦/相対日付対応）
│   │   └── amount-parser.ts        # 金額パーサー（万円/億円/分数表記対応）
│   ├── utils/
│   │   ├── fetch-with-retry.ts     # リトライ付きfetch（exponential backoff）
│   │   ├── rate-limiter.ts         # ドメイン別レートリミッター
│   │   ├── content-hash.ts         # ページ変更検知用ハッシュ
│   │   ├── url-resolver.ts         # 相対URL→絶対URL変換
│   │   └── charset-detector.ts     # Shift_JIS/EUC-JP→UTF-8変換
│   ├── llm/
│   │   └── classify-subsidy.ts     # Bedrock Claude で補助金情報を構造化
│   └── config/
│       ├── municipality-overrides.json  # 自治体別カスタム設定
│       └── keyword-filters.ts          # 補助金判定キーワード
```

### 4-2. クロール戦略インターフェース

```typescript
// src/lib/crawler/strategies/base.ts

export interface CrawlResult {
  links: DiscoveredLink[];
  errors: CrawlError[];
  metadata: {
    strategy: string;
    duration: number;
    pagesFetched: number;
  };
}

export interface DiscoveredLink {
  url: string;           // 補助金情報ページのURL
  title: string;         // リンクテキスト or ページタイトル
  publishedAt?: Date;    // 公開日（わかれば）
  rawHtml?: string;      // 詳細ページのHTML（取得済みの場合）
}

export interface CrawlStrategy {
  name: string;
  canHandle(municipality: Municipality): boolean;
  crawl(municipality: Municipality): Promise<CrawlResult>;
}
```

### 4-3. 各戦略の実装方針

#### RSS戦略（`rss-strategy.ts`）
- 自治体がRSS/Atomフィードを提供している場合に使用
- `<item>` / `<entry>` を解析し、タイトルにキーワードフィルタ適用
- 最も軽量・高速な戦略

#### HTMLリスト戦略（`html-list-strategy.ts`）
- 最も多い形式。補助金一覧ページの `<a>` タグを走査
- `crawlConfig` に自治体別のCSSセレクタを格納可能:
  ```json
  {
    "listSelector": "div.subsidy-list a",
    "titleSelector": "a",
    "dateSelector": ".date",
    "paginationSelector": "a.next"
  }
  ```
- デフォルトはセレクタなしで全 `<a>` をキーワードフィルタリング

#### HTMLテーブル戦略（`html-table-strategy.ts`）
- 補助金一覧がテーブル形式の自治体向け
- `<table>` → `<tr>` を解析し、列ごとに名称・金額・締切を抽出

#### PDFリスト戦略（`pdf-list-strategy.ts`）
- **Phase 1ではPDF本文の解析は行わない**
- PDFへのリンクURLとリンクテキストのみ抽出
- Phase 2以降でPDF本文解析（pdf-parse等）を追加

#### API戦略（`api-strategy.ts`）
- 東京都など独自APIを持つ自治体向け
- `crawlConfig` にエンドポイント・認証情報・レスポンスマッピングを定義

### 4-4. LLMによる補助金情報の構造化抽出

```
ファイル: src/lib/crawler/llm/classify-subsidy.ts
```

**処理フロー**:
1. 発見されたリンクの詳細ページHTMLを取得
2. HTMLからテキスト抽出（タグ除去）
3. Bedrock Claude (Haiku — コスト最適化) に以下を依頼:
   - これは補助金/助成金の公募情報か？ (boolean)
   - 補助金名称
   - 対象事業者
   - 補助金額上限
   - 補助率
   - 申請期限
   - 対象地域
   - 実施機関名
4. JSON形式で返却 → SubsidyGrant にマッピング

**プロンプト設計**:
```
あなたは日本の補助金情報を構造化するエキスパートです。
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
  "deadline": string | null,     // ISO 8601形式
  "targetBusiness": string | null,
  "targetArea": string | null,
  "institutionName": string | null,
  "confidence": number           // 0.0-1.0
}

## ページテキスト
{pageText}
```

**コスト管理**:
- Haiku使用（Sonnetの約1/10コスト）
- 1ページあたり入力 ~2,000トークン → 全自治体で月額見積もり要算出
- `confidence < 0.6` の場合はスキップ（ゴミデータ防止）
- 同一URL（contentHash一致）は再処理しない

**Bedrock呼び出しパターン**（既存コードに合わせる）:
```typescript
// 既存の src/lib/ai/bedrockArticleGenerate.ts と同じパターンを使用
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const body = JSON.stringify({
  anthropic_version: "bedrock-2023-05-31",
  max_tokens: 2000,  // 構造化抽出なので短くてOK
  temperature: 0.1,  // 構造化データなので低温度
  system: SYSTEM_PROMPT,
  messages: [{ role: "user", content: pageText }],
});
// レスポンス解析は既存の bedrockJsonExtract.ts の parseAssistantJson() を再利用
```

### 4-5. レートリミッター

```typescript
// src/lib/crawler/utils/rate-limiter.ts

// ドメイン別に最低1秒間隔を保証
// 同一自治体ドメインへの同時リクエストは1に制限
// 全体の同時リクエスト数上限: 10
// robots.txt を尊重する（Crawl-delay対応）
```

### 4-6. 文字コード対応

```typescript
// src/lib/crawler/utils/charset-detector.ts

// 多くの自治体サイトがShift_JIS/EUC-JPを使用
// Content-Type ヘッダー or <meta charset> から検出
// iconv-lite でUTF-8に変換
// 依存: npm install iconv-lite
```

---

## 5. パイプライン統合

### 5-1. Lambda article-pipeline への統合

既存の `lambda/article-pipeline/index.mjs` の Stage 0（省庁クロール）の**後**に、新しい Stage 0.5 として自治体クロールを追加する。

```javascript
// Stage 0.5: Municipality Crawl（新規追加）
// ただし全1,700自治体を1回のLambda実行（15分制限）で処理するのは不可能
// → 別Lambda関数として分離する
```

### 5-2. 新規Lambda: `municipality-crawler-lambda`

```
lambda/municipality-crawler/
├── index.mjs          # ハンドラー
├── package.json
└── package-lock.json
```

**実行モデル**:
- EventBridge: 1時間ごとに実行
- 1回の実行で処理する自治体数: 最大50件（15分制限内で安全に完了）
- `lastCrawledAt` が古い順 + `priority` 順でピックアップ
- 全自治体を約34時間で1周（1,700 ÷ 50 = 34回 × 1時間間隔）

**処理フロー**:
```
1. municipalities テーブルから対象50件を SELECT（WHERE crawlStatus != 'disabled'）
2. 各自治体に対して:
   a. crawlStrategy に基づくストラテジー選択
   b. クロール実行 → DiscoveredLink[] 取得
   c. 各リンクについて:
      - contentHash チェック（既知なら skip）
      - LLM構造化抽出
      - SubsidyGrant UPSERT（source="municipality", externalId="muni-{code}-{urlHash}"）
      - 新規レコードなら ContentJob 3件キュー
   d. MunicipalityCrawlResult 記録
   e. Municipality.lastCrawledAt 更新
3. サマリーレポート返却
```

### 5-3. externalId の命名規則

既存ソースとの衝突を防ぐため:
- jGrants: `{jgrants_id}` （既存のまま）
- 省庁: `ministry-{source}-{url}` （既存のまま。sourceは "meti" / "chusho" / "maff" / "mlit"）
- 自治体: `muni-{municipalityCode}-{urlHash}` （新規）

`urlHash` = 公式ページURLのSHA-256先頭16文字

> **注意**: 省庁ソースの `source` フィールドは `"ministry"` ではなく、省庁名そのもの（`"meti"`, `"chusho"`, `"maff"`, `"mlit"`）が使われている。自治体ソースは統一的に `"municipality"` とする。

### 5-4. 重複検知

同一補助金が複数ソースに掲載される可能性がある（例: 国の補助金が自治体ページにも掲載）。

**対策**:
1. **URL一致**: `officialPageUrl` が既存レコードと一致 → 既存レコードを更新
2. **名称類似**: 補助金名の類似度（Levenshtein距離 or LLM判定）が閾値超え → マージ候補として `merge_candidates` テーブルに記録、手動レビュー
3. **jGrants ID参照**: ページ内にjGrants IDの記載があれば既存レコードに紐付け

---

## 6. 詳細ページ（フロントエンド）への統合

### 6-1. 既存 `/subsidies/list/[id]/page.tsx` への変更

**変更点1: source表示の拡張**
```typescript
// 既存: "jGrants" | "NTS独自"
// 追加: 自治体名を表示
// 例: "渋谷区公式" のバッジ
```

**変更点2: 原典リンクの追加**
```typescript
// officialPageUrl がある場合、「公式ページで確認する」リンクを表示
// 信頼性の担保 + SEOメリット
```

**変更点3: データ鮮度表示**
```typescript
// fetchedAt を使って「X時間前に取得」と表示
// 自治体ソースの場合、情報の新鮮さを可視化
```

### 6-2. 既存 `/api/subsidies` への変更

**変更点1: source フィルタに "municipality" を追加**
```typescript
// クエリパラメータ: source = "jgrants" | "manual" | "ministry" | "municipality"
```

**変更点2: 自治体名フィルタの追加**
```typescript
// クエリパラメータ: municipalityCode = "131130"（渋谷区のコード等）
// prefecture フィルタとの組み合わせ対応
```

### 6-3. 新規ページ: 自治体別補助金一覧

```
ファイル: src/app/subsidies/municipality/[code]/page.tsx
```

**URL**: `/subsidies/municipality/131130` （渋谷区の補助金一覧）

**内容**:
- 自治体情報ヘッダー（名称、公式サイトリンク）
- その自治体の補助金一覧（SubsidyGrant WHERE municipalityCode = {code}）
- 最終クロール日時の表示

**SEO効果**: 「渋谷区 補助金」等のロングテールキーワードで上位表示を狙える

---

## 7. フェーズ分割と実装順序

### Phase 1: 基盤構築 + 都道府県（2-3週間）

1. **DBマイグレーション**: Municipality テーブル + SubsidyGrant カラム追加
2. **自治体マスターデータ投入**: 47都道府県の公式サイトURL手動整備
3. **クローラーエンジン基盤**: Strategy パターン + fetch-with-retry + rate-limiter
4. **HTML List Strategy**: 最も汎用的な戦略を最初に実装
5. **RSS Strategy**: フィード提供自治体向け
6. **LLM構造化抽出**: Bedrock Haiku による情報抽出
7. **Lambda統合**: municipality-crawler-lambda の作成・デプロイ
8. **詳細ページ対応**: source="municipality" の表示対応
9. **動作確認**: 東京都・大阪府・福岡県等で手動テスト

### Phase 2: 政令市 + 安定化（2週間）

1. **20政令市の公式サイトURL整備**
2. **HTML Table Strategy**: テーブル形式対応の追加
3. **文字コード対応**: Shift_JIS/EUC-JP サイトへの対応強化
4. **エラーハンドリング強化**: 個別自治体の失敗が全体に波及しない設計
5. **モニタリングダッシュボード**: クロール成功率・エラー率の可視化
6. **重複検知の実装**: 同一補助金の複数ソースマージ

### Phase 3: 全市区町村展開（4-6週間）

1. **残り約1,630自治体のURL自動検出** (`detect-subsidy-pages.ts`)
2. **自治体別カスタム設定の整備**: `municipality-overrides.json` に個別設定追加
3. **PDF List Strategy**: PDFリンク抽出の追加
4. **API Strategy**: 東京都等の独自API対応
5. **自治体別補助金一覧ページ**: SEO用の自治体別ページ生成
6. **スケーリング**: Lambda並列実行数の調整、DBコネクション管理

### Phase 4: 速度最適化 + 運用（継続的）

1. **差分クロール**: contentHash による変更検知で不要な再処理を排除
2. **Webhook/Push通知**: 新規補助金発見時のSlack通知
3. **品質管理UI**: 管理画面から自治体別のクロール状況確認・手動トリガー
4. **LLMコスト最適化**: キャッシュ活用、不要なLLM呼び出しの削減

---

## 8. 主要な技術的課題と対策

### 課題1: 自治体サイトの構造が統一されていない
**対策**: Strategy パターンで戦略を切り替え + `crawlConfig` で自治体別設定を許容。最初はデフォルト設定（全 `<a>` タグのキーワードフィルタ）で広く拾い、精度は LLM で担保する。

### 課題2: 文字コードがバラバラ（UTF-8 / Shift_JIS / EUC-JP）
**対策**: `iconv-lite` で自動変換。Content-Type ヘッダーと `<meta>` タグの両方を確認。

### 課題3: Lambda 15分制限で全自治体を処理しきれない
**対策**: 1回50件ずつバッチ処理。1時間間隔で34サイクルで全自治体1周。都道府県→政令市→市区町村の priority 順で重要な自治体を先に処理。

### 課題4: robots.txt / サーバー負荷への配慮
**対策**: ドメイン別 1秒以上の間隔。robots.txt パース。`User-Agent: NTS-SubsidyCrawler/1.0 (+https://nts-gate.com/about)` で身元を明示。`Crawl-delay` ディレクティブ尊重。

### 課題5: 同一補助金の重複（国→県→市で転載されるケース）
**対策**: Phase 1では URL 完全一致のみで重複排除。Phase 2で名称類似度による候補検出を追加。完全自動マージは行わず、管理UIで手動確認。

### 課題6: LLM API コスト
**対策**: Haiku 使用で1ページ約$0.001。仮に月10,000ページ処理でも月$10程度。contentHash で同一コンテンツの再処理を防止。

### 課題7: ページが消えた場合（404/リンク切れ）
**対策**: 3回連続で取得失敗した補助金は `status = "closed"` に自動変更。ただし物理削除はしない。

---

## 9. 必要な npm パッケージ（新規追加分）

```bash
npm install iconv-lite     # 文字コード変換
npm install robots-parser   # robots.txt パーサー
npm install cheerio         # HTML パーサー（正規表現より堅牢）
# pdf-parse は Phase 3 で追加
```

> **注意**: 既存コードは正規表現でHTML解析しており、Lambda内は依存を `pg` のみに限定する方針。自治体クローラーは Vercel 側（`src/lib/crawler/`）で実行するため `cheerio` を導入可能。Lambda から Vercel API エンドポイント経由で呼び出す構成とする（既存の記事生成と同じパターン）。

---

## 10. 環境変数（新規追加分）

```env
# Municipality Crawler
MUNICIPALITY_CRAWLER_ENABLED=true
MUNICIPALITY_BATCH_SIZE=50          # 1回のLambda実行で処理する自治体数
MUNICIPALITY_CRAWL_INTERVAL=3600    # クロール間隔（秒）
MUNICIPALITY_REQUEST_DELAY=1000     # 同一ドメインへのリクエスト間隔（ms）
MUNICIPALITY_MAX_CONCURRENT=10      # 最大同時リクエスト数
MUNICIPALITY_LLM_MODEL=anthropic.claude-haiku  # 構造化抽出用モデル
MUNICIPALITY_LLM_CONFIDENCE_THRESHOLD=0.6      # LLM信頼度閾値
```

---

## 11. Cursorへの実装指示の出し方（推奨手順）

### Step 1: DB拡張
```
「prisma/schema.prisma に Municipality テーブルと MunicipalityCrawlResult テーブルを追加し、
SubsidyGrant に municipalityCode, officialPageUrl, institutionName, fetchedAt, contentHash カラムを追加してください。
この設計指示書の Section 2 に従ってください。マイグレーションも実行してください。」
```

### Step 2: 自治体マスター投入
```
「scripts/seed-municipalities.ts を作成してください。
総務省の全国地方公共団体コードを使い、まず47都道府県のデータを municipalities テーブルに投入します。
各都道府県の公式サイトURLも含めてください。
設計指示書の Section 3 に従ってください。」
```

### Step 3: クローラーエンジン
```
「src/lib/crawler/ 以下にクローラーエンジンを実装してください。
設計指示書の Section 4 に従い、まず base.ts（インターフェース）、
html-list-strategy.ts、rss-strategy.ts、fetch-with-retry.ts、
rate-limiter.ts、charset-detector.ts を作成してください。
cheerio と iconv-lite を使用します。」
```

### Step 4: LLM構造化抽出
```
「src/lib/crawler/llm/classify-subsidy.ts を作成してください。
Bedrock Claude Haiku を使って、HTMLテキストから補助金情報を構造化抽出します。
設計指示書 Section 4-4 のプロンプト設計に従ってください。
既存の Bedrock 呼び出しコード（src/lib/content/ 内）を参考にしてください。」
```

### Step 5: Lambda関数
```
「lambda/municipality-crawler/index.mjs を作成してください。
設計指示書 Section 5-2 の処理フローに従い、
municipalities テーブルから対象自治体をピックアップし、
クローラーエンジンを呼び出し、結果を SubsidyGrant にUPSERTする Lambda ハンドラーです。
既存の lambda/article-pipeline/index.mjs のパターンを踏襲してください。」
```

### Step 6: フロントエンド統合
```
「/subsidies/list/[id]/page.tsx を修正し、source="municipality" の補助金に対応してください。
自治体名バッジの表示、公式ページリンクの追加、データ鮮度表示を追加します。
設計指示書 Section 6 に従ってください。既存の表示を壊さないでください。」
```

### Step 7: テスト実行
```
「東京都の公式サイト（https://www.metro.tokyo.lg.jp）を対象に、
クローラーをローカルで手動実行してテストしてください。
結果を確認し、問題があれば修正してください。」
```

---

## 12. 成功指標

| 指標 | Phase 1 目標 | 最終目標 |
|------|-------------|---------|
| カバー自治体数 | 47（都道府県） | 1,700+（全市区町村） |
| 新規補助金検出速度 | 公開から24時間以内 | 公開から1時間以内 |
| 情報正確性 | LLM confidence > 0.8 が90%以上 | 同左 |
| クロール成功率 | 80%以上 | 95%以上 |
| 重複率 | 10%以下 | 3%以下 |
| 月間LLMコスト | $50以下 | $200以下 |

---

## 付録A: 都道府県の補助金ページURL（初期データ例）

Phase 1 で手動整備する。以下は代表例:

| 都道府県 | 補助金ページURL候補 |
|---------|-------------------|
| 北海道 | https://www.pref.hokkaido.lg.jp/kz/csk/ |
| 東京都 | https://www.metro.tokyo.lg.jp/tosei/hodohappyo/ |
| 大阪府 | https://www.pref.osaka.lg.jp/shoukou/ |
| 愛知県 | https://www.pref.aichi.jp/soshiki/chiikisangyo/ |
| 福岡県 | https://www.pref.fukuoka.lg.jp/life/2/14/ |

> 全47都道府県分は `scripts/data/prefecture-subsidy-urls.json` に別途整備する。

---

## 付録B: キーワードフィルターリスト

補助金関連リンクを判定するキーワード:

**含む（OR条件）**: 補助金, 助成金, 支援金, 給付金, 交付金, 公募, 募集, 支援制度, 補助事業, 助成事業

**除外（AND条件で除外）**: 終了, 締切済, 募集は終了, 受付終了, 令和X年度実績, 報告書, 実績報告, 交付決定一覧

---

*この設計指示書は CRAWLER_DESIGN_SPEC.md として補助金サービスV6リポジトリのルートに配置し、Cursor での実装時に参照すること。*
