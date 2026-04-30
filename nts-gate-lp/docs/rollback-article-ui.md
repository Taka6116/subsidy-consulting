# 記事ページ UI改善 ロールバック手順
（2026-04-30 実施分）

## 追加したファイル（削除するだけで元に戻る）

- `src/components/articles/LivePublishedBadge.tsx`
- `src/components/articles/ArticleToc.tsx`
- `src/components/articles/ConsultantComment.tsx`
- `src/components/articles/ArticleCTA.tsx`
- `src/components/articles/RelatedArticles.tsx`

## 変更したファイル（コメント切り替えで元に戻る）

- `src/app/subsidies/articles/[slug]/page.tsx`
  - `[LEGACY 2026-04-30]` ブロックを解除し、`[NEW 2026-04-30]` ブロックをコメントアウト
  - `id="article-body"` を本文 div から削除

## 完全ロールバック（最速）

```bash
git checkout main -- src/components/articles/
git checkout main -- src/app/subsidies/articles/[slug]/page.tsx
```

## 部分ロールバック（コンポーネント単位）

### Phase 1（速報バッジ・目次）の解除

`src/app/subsidies/articles/[slug]/page.tsx` で：
- `<LivePublishedBadge ... />` をコメントアウト
- `<ArticleToc ... />` をコメントアウト
- 本文 div の `id="article-body"` を削除

### Phase 2（コンサルタントコメント）の解除

- `<ConsultantComment />` をコメントアウト

### Phase 3（温度別マルチCTA）の解除

- `[LEGACY]` ブロックのコメントを解除
- `<ArticleCTA ... />` をコメントアウト

### Phase 4（関連記事カード）の解除

- `<RelatedArticles articles={relatedArticles} />` をコメントアウト
- `getRelatedArticles` 関数と `relatedArticles` 変数を削除 or コメントアウト

## 影響範囲外（変更していないもの）

- トップページ
- 補助金一覧ページ
- 補助金別LPページ（`/subsidies/lp/[id]`）
- DBスキーマ・Prismaクエリ（getRelatedArticles の findMany 追加のみ、既存ロジック変更なし）
- その他のコンポーネント

## 残っているTODO

- `minutesAfterAnnouncement`：行政発表からの経過分数。DB フィールド追加後に `LivePublishedBadge` に渡す
- `article.consultantComment`：コンサルタントコメントの DB フィールド追加後に `ConsultantComment` の `comment` prop に渡す
- `/api/subscribe`：Route Handler の実装（SES経由送信・Subscribers テーブルへのinsert）
- ArticleCTA の `subsidyId` prop：DB から取得した値を hidden input に渡す
