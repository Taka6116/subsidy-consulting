# NTS Gate LP — プロジェクト全体概要（ChatGPT情報源用）

> 作成日：2026年5月8日  
> 対象リポジトリ：`C:/Users/goto_/補助金サービスV6`  
> デプロイ先：Vercel（`vercel-target/main` へ push で自動デプロイ）

---

## 1. プロジェクトの目的・ポジション

### 1-1. サービスの概要

**NTS Gate LP**は、中小企業・小規模事業者向けの**補助金マッチング＆LP自動生成サービス**のWebフロントエンドである。

- 運営主体：NTS（補助金コンサルティング事務所）
- ターゲット：補助金を活用したい中小企業の経営者・総務担当者
- ビジネスモデル：無料診断 → 有料コンサルティング契約への転換（リード獲得型）

### 1-2. 戦略的な立ち位置


| ポイント     | 内容                                     |
| -------- | -------------------------------------- |
| 差別化軸     | AI生成コンテンツ × 専門家レビューによる補助金情報の鮮度と品質      |
| 収益化      | 無料相談フォーム → コンサル契約                      |
| SEO戦略    | 補助金カテゴリ別LP + 解説記事の大量生成で有機流入を獲得         |
| コンテンツ自動化 | AWS Bedrock（Claude）で記事・LP・動画スクリプトを自動生成 |


---

## 2. 技術スタック（全体）

### 2-1. フロントエンド


| 技術                          | 用途         |
| --------------------------- | ---------- |
| Next.js 14（App Router）      | メインフレームワーク |
| TypeScript                  | 全コード       |
| Tailwind CSS                | スタイリング     |
| React Markdown + remark-gfm | 記事本文レンダリング |


### 2-2. バックエンド・データ


| 技術                    | 用途                |
| --------------------- | ----------------- |
| Prisma ORM            | DB操作              |
| PostgreSQL（Supabase）  | メインDB             |
| AWS Bedrock（Claude 3） | AI記事・LP・動画スクリプト生成 |
| AWS Lambda            | バッチ処理パイプライン       |
| Amazon S3             | 動画・画像アセット保存       |


### 2-3. インフラ・CI


| 技術            | 用途                                                            |
| ------------- | ------------------------------------------------------------- |
| Vercel        | ホスティング・自動デプロイ                                                 |
| GitHub（2リモート） | `subsidy-consulting/main`（バックアップ）、`vercel-target/main`（デプロイ用） |


---

## 3. サイト構成（ページ一覧）

### 3-1. メインルート


| URL          | 内容                    |
| ------------ | --------------------- |
| `/`          | ゲートLP（補助金診断誘導のトップページ） |
| `/check`     | 補助金簡易チェッカー（入力フォーム）    |
| `/result`    | チェック結果・マッチング表示        |
| `/diagnosis` | 詳細診断（ウィザード）           |


### 3-2. 補助金関連


| URL                              | 内容                            |
| -------------------------------- | ----------------------------- |
| `/subsidies`                     | 補助金一覧（全体）                     |
| `/subsidies/list`                | 補助金データ一覧（DB連携）                |
| `/subsidies/list/[id]`           | 個別補助金詳細                       |
| `/subsidies/lp`                  | 専用LP一覧（Featuredカード + DB生成カード） |
| `/subsidies/lp/[id]`             | DB生成の動的LP（個別補助金ごと）            |
| `/subsidies/articles`            | 解説記事インデックス（タグ絞り込み + キーワード検索）  |
| `/subsidies/articles/[slug]`     | 解説記事詳細（本チケットで再デザイン済み）         |
| `/subsidies/videos`              | 動画解説インデックス                    |
| `/subsidies/videos/[slug]`       | 動画解説詳細                        |
| `/subsidies/municipality/[code]` | 市区町村別LP                       |


### 3-3. カテゴリ別専用LP（ハードコード）


| URL                                       | カテゴリ       |
| ----------------------------------------- | ---------- |
| `/subsidies/construction-electrification` | 建設・電化      |
| `/subsidies/dx-support`                   | DX支援       |
| `/subsidies/equipment-productivity`       | 設備生産性向上    |
| `/subsidies/wage-support`                 | 賃上げ支援      |
| `/subsidies/equipment-investment`         | 設備投資       |
| `/subsidies/monodukuri-business`          | ものづくり・事業計画 |
| `/subsidies/logistics-support`            | 物流・運送効率化   |
| `/subsidies/human-resources`              | 人材確保・賃上げ支援 |


---

## 4. コンポーネント構成

### 4-1. 補助金LP共通セクション（`src/components/subsidy-lp/`）

各カテゴリ別LPで共通使用するセクション群。全LP共通の構成は下記の順序。

```
HeroSection          → ヒーロー画像 + 補助金名 + 申請状況バー
StatsSection         → 数字インパクト（採択件数など）
BeforeAfterSection   → 課題 Before / 解決 After 比較
CaseStudiesSection   → 導入事例カード
FlowSection          → 申請フロー
TargetIndustriesSection → 対象業種
SubsidyLpFaq        → よくある質問
ContactSection       → 無料相談フォーム（左：コピー、右：入力フォーム）
FinalCtaSection      → 最終CTA
```

### 4-2. 記事関連コンポーネント（`src/components/articles/`）


| コンポーネント                    | 役割                  |
| -------------------------- | ------------------- |
| `ArticleToc`               | 目次（h2/h3を自動収集）      |
| `ArticleCTA`               | 温度別マルチCTA（診断・相談・資料） |
| `ArticleDeadlineCountdown` | 締切カウントダウンタイマー       |
| `ConsultantComment`        | 専門家コメント枠            |
| `LivePublishedBadge`       | 公開直後に「速報」バッジ表示      |
| `RelatedArticles`          | 関連記事カード（3件）         |


### 4-3. 共通UI（`src/components/shared/`）

`Header`、`Footer`、`CTAButton`、`SectionWrapper` など。

---

## 5. データベース（Prismaスキーマ）

### 5-1. 主要モデル


| モデル名               | 役割                      |
| ------------------ | ----------------------- |
| `SubsidyGrant`     | 補助金マスターデータ（名称・上限額・締切など） |
| `GeneratedContent` | AI生成コンテンツ（記事・LP本文・スラッグ） |
| `GeneratedVideo`   | AI生成動画スクリプト・メタデータ       |
| `Municipality`     | 市区町村マスター                |
| `ContactInquiry`   | 無料相談フォームの送信データ          |
| `Subscriber`       | メール登録者                  |


### 5-2. GeneratedContentの主要フィールド

```
slug            スラッグ（URL）
title           記事タイトル
body            Markdown本文（AI生成）
excerpt         抜粋
metaDescription SEO用meta description
tags            タグ配列
status          "published" | "draft"
publishedAt     公開日時
subsidyId       関連補助金ID（SubsidyGrant）
prefecture      都道府県
subsidyName     補助金名
```

---

## 6. AI生成パイプライン

### 6-1. 記事生成フロー

```
jgrants API / クローラー
    → SubsidyGrant テーブルに補助金データ蓄積
    → AWS Lambda（article-pipeline）
        → AWS Bedrock（Claude 3）でMarkdown記事生成
        → qualityGuard でチェック
        → GeneratedContent テーブルに保存（status: "published"）
    → Next.js ISR（revalidate: 300秒）でページ配信
```

### 6-2. LP生成フロー

```
SubsidyGrant テーブル
    → /api/lp/generate（POST）
        → bedrockLpGenerate でLP本文生成
        → GeneratedContent（type: "lp"）に保存
    → /subsidies/lp/[id] で配信
```

### 6-3. 動画生成フロー

```
記事コンテンツ
    → bedrockVideoScriptGenerate でスクリプト生成
    → Amazon Polly / ElevenLabs でTTS
    → 動画合成 → S3保存
    → /subsidies/videos/[slug] で配信
```

---

## 7. UI/UXデザイン方針

### 7-1. ブランドカラー・フォント


| 項目       | 値                        |
| -------- | ------------------------ |
| メインカラー   | `#0e357f`（ネイビー）          |
| アクセントカラー | `#28a4a3`（ティール）          |
| 背景（記事）   | `#ffffff`（白）             |
| 背景（LP）   | `#f9f7f2`（オフホワイト）        |
| 見出しフォント  | Noto Sans JP（font-black） |
| 本文フォント   | Noto Sans JP（regular）    |


### 7-2. 記事詳細ページ（`/subsidies/articles/[slug]`）のデザイン

参照サイト：[https://nihon-teikei.co.jp/ma-advisor-contract-practical-pitfalls/](https://nihon-teikei.co.jp/ma-advisor-contract-practical-pitfalls/)


| 要素     | 実装                                  |
| ------ | ----------------------------------- |
| ページ背景  | 白（`bg-white`）                       |
| ヘッダー帯  | グレー背景（`#f5f7fa`）に日付・タグ・タイトル・SNSシェア  |
| h2スタイル | `border-bottom: 3px solid #0e357f`  |
| コンテンツ幅 | `max-w-[960px]`                     |
| SNSシェア | X・Facebook・Hatena・LINE（ヘッダー・フッター両方） |
| 関連記事   | 3件カード表示                             |


### 7-3. LP Heroセクションの画像マッピング

`HeroSection.tsx` の `pickHeroVisual()` でカテゴリキーワードから画像を自動選択。


| カテゴリキーワード    | 使用画像                        |
| ------------ | --------------------------- |
| DX・デジタル・IT化  | `dx-lp-hero.webp`           |
| 人材・採用・賃上げ・雇用 | `human-resources-hero.webp` |
| 事業計画・ものづくり   | `business-plan-hero.webp`   |
| 物流・運送・配送     | `logistics-hero.webp`       |
| 建設・電化・省エネ    | `isometric_31.webp`         |
| デフォルト        | `isometric_30.webp`         |


---

## 8. フォーム・リード獲得

### 8-1. 無料相談フォーム（ContactSection）

- **URL**：全カテゴリ別LP末尾 + 動的LP（`/subsidies/lp/[id]`）
- **構成**：左カラム（ベネフィットコピー）+ 右カラム（入力フォーム）
- **フィールド**：氏名・メールアドレス・会社名・相談内容
- **API**：`POST /api/contact`
- **DB保存先**：`ContactInquiry` テーブル（`source`フィールドでLP種別を識別）
- **状態管理**：送信中・送信完了・エラーの3ステート

### 8-2. メール登録（SubscribeSection）

- **API**：`POST /api/subscribe`
- **DB保存先**：`Subscriber` テーブル

---

## 9. 補助金LPインデックスページ（`/subsidies/lp`）

### 9-1. Featured LP（専用LP・固定表示）

以下8件をページ上部に固定表示：


| 名称         | URL                                       |
| ---------- | ----------------------------------------- |
| 建設・電化支援    | `/subsidies/construction-electrification` |
| DX・デジタル化支援 | `/subsidies/dx-support`                   |
| 設備生産性向上    | `/subsidies/equipment-productivity`       |
| 賃上げ・人材確保支援 | `/subsidies/wage-support`                 |
| 設備投資促進     | `/subsidies/equipment-investment`         |
| ものづくり・事業計画 | `/subsidies/monodukuri-business`          |
| 物流・運送効率化   | `/subsidies/logistics-support`            |
| 人材確保・採用支援  | `/subsidies/human-resources`              |


### 9-2. 動的LP（DB生成）

- `GeneratedContent`（type: "lp"）から取得
- Featured LPに対応する補助金IDを `DEDICATED_LP_GRANT_IDS` で管理し、重複表示を防止
- 金額表示：`最大14.3億円` 形式に自動フォーマット（万円・億円変換）

---

## 10. 解説記事インデックス（`/subsidies/articles`）

### 10-1. 機能一覧


| 機能       | 実装                         |
| -------- | -------------------------- |
| タグフィルター  | クリックで絞り込み（単一タグ）            |
| キーワード検索  | タイトル・補助金名・抜粋・都道府県・タグをAND検索 |
| ページネーション | 12件/ページ                    |
| 結果件数表示   | 「XX件中YY件表示」                |


---

## 11. 主要APIエンドポイント


| エンドポイント                              | メソッド | 役割               |
| ------------------------------------ | ---- | ---------------- |
| `/api/contact`                       | POST | 相談フォーム受信・DB保存    |
| `/api/subscribe`                     | POST | メール登録            |
| `/api/subsidies`                     | GET  | 補助金一覧取得          |
| `/api/subsidies/hero-live`           | GET  | Hero用リアルタイム補助金情報 |
| `/api/subsidy/match`                 | POST | 補助金マッチング（AI）     |
| `/api/articles/generate`             | POST | 記事生成トリガー         |
| `/api/lp/generate`                   | POST | LP生成トリガー         |
| `/api/videos/generate`               | POST | 動画生成トリガー         |
| `/api/revalidate`                    | POST | ISRキャッシュ再検証      |
| `/api/corporate/search`              | GET  | 法人番号API検索        |
| `/api/internal/crawler/municipality` | POST | 市区町村クローラー        |


---

## 12. デプロイ・リリースフロー

```
1. 開発・変更（ローカル）
2. git add / commit
3. git push subsidy-consulting main  ← GitHubバックアップ
4. git push vercel-target main       ← Vercel自動デプロイトリガー
5. Vercel上でビルド・本番反映（ISR: 300秒）
```

---

## 13. 過去の主な開発履歴（直近スプリント）


| 対象                           | 変更内容                      |
| ---------------------------- | ------------------------- |
| `ContactSection.tsx`         | 無料相談フォームの新規作成・全LP統合       |
| `HeroSection.tsx`            | カテゴリ別ヒーロー画像の自動選択・日付テキスト拡大 |
| `BeforeAfterSection.tsx`     | ボックス内テキスト・バッジの左右中央揃え      |
| カテゴリ別LP 4ページ新規作成             | 設備投資・ものづくり・物流・人材          |
| `SubsidiesLpClient.tsx`      | 補助金金額の万円・億円フォーマット修正       |
| `SubsidiesArticlesIndex.tsx` | キーワード検索ボックスの追加            |
| `articles/[slug]/page.tsx`   | 参照サイトに合わせた記事詳細ページの全面再デザイン |
| `prisma/schema.prisma`       | `ContactInquiry` モデル追加    |
| `icon-assets/`               | 新規ヒーロー画像のASCIIファイル名コピー    |


---

## 14. 今後の課題・未着手事項（把握している範囲）


| 項目                                    | 優先度目安 |
| ------------------------------------- | ----- |
| 個別記事ページへのOGP画像（サムネイル）表示               | 中     |
| 動的LP（`/subsidies/lp/[id]`）の記事一覧との統合UI | 低     |
| 補助金チェッカーのAI精度改善                       | 高     |
| 市区町村別LPの自動生成スケール                      | 中     |
| 解説記事の監修者情報DB化（現在はハードコード）              | 中     |
| CTAのA/Bテスト設計                          | 低     |


---

*このドキュメントはプロジェクト全体の俯瞰情報です。個別ファイルの実装詳細はソースコードを参照してください。*