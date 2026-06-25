# Vercel CPU 節約 — コンテンツパイプライン一時停止手順

Fluid Active CPU 上限超過時の緊急対応と、通常運用への復帰手順。

## 実施済みの対策（コード側）

| 対策 | 内容 |
|------|------|
| EventBridge | `nts-article-pipeline-15min` を **DISABLED** に設定可能 |
| Lambda | `DRAIN_LIMIT_VIDEO=0`（デフォルト）、`ENABLE_VERCEL_VIDEO=false` で Vercel 動画 API を呼ばない |
| Lambda | `DRAIN_LIMIT_ARTICLE` / `DRAIN_LIMIT_LP` を個別設定（デフォルト 1） |
| Vercel API | `VIDEO_GENERATION_DISABLED=1` で `/api/videos/generate` を 503 |
| Vercel API | `ARTICLE_GENERATION_DISABLED=1` で `/api/articles/generate` を 503 |
| ローカル CLI | `scripts/drain-pending-videos.ts`（1〜2 本ずつ FFmpeg 生成） |
| DB | `scripts/pause-content-pipeline.ts` で pending → `on_hold` |

## 1. パイプラインを止める

```bash
# EventBridge 停止
aws scheduler update-schedule \
  --name nts-article-pipeline-15min \
  --state DISABLED \
  --schedule-expression "rate(15 minutes)" \
  --schedule-expression-timezone "Asia/Tokyo" \
  --flexible-time-window Mode=OFF \
  --target file://lambda/article-pipeline/_tmp-scheduler-target.json \
  --region ap-northeast-1

# DB の pending / running を on_hold に
cd nts-gate-lp
npx tsx scripts/pause-content-pipeline.ts pause --types video,article

# Lambda 環境変数（AWS コンソール or CLI）
DRAIN_LIMIT_ARTICLE=0
DRAIN_LIMIT_LP=0
DRAIN_LIMIT_VIDEO=0
ENABLE_VERCEL_VIDEO=false

# Vercel 環境変数
VIDEO_GENERATION_DISABLED=1
ARTICLE_GENERATION_DISABLED=1
```

## 2. 動画だけローカルで少しずつ再生成

```bash
cd nts-gate-lp
# 1 本ずつ（Hobby CPU 節約のため）
npx tsx scripts/drain-pending-videos.ts --limit 1

# 最大 2 本
npx tsx scripts/drain-pending-videos.ts --limit 2 --force
```

## 3. CPU 枠回復後に再開

```bash
# Vercel: 環境変数を削除 or 0 に
# VIDEO_GENERATION_DISABLED=0
# ARTICLE_GENERATION_DISABLED=0

# DB: on_hold → pending
npx tsx scripts/pause-content-pipeline.ts resume --types video,article

# Lambda
DRAIN_LIMIT_ARTICLE=1
DRAIN_LIMIT_LP=1
DRAIN_LIMIT_VIDEO=0          # 動画は引き続きローカル推奨
ENABLE_VERCEL_VIDEO=false

# EventBridge 再開
aws scheduler update-schedule \
  --name nts-article-pipeline-15min \
  --state ENABLED \
  ...（同上）
```

## 状態確認

```bash
npx tsx scripts/pause-content-pipeline.ts status
aws scheduler get-schedule --name nts-article-pipeline-15min --region ap-northeast-1
```

## なぜ動画は Vercel 外か

`/api/videos/generate` は Bedrock + Polly + sharp + **FFmpeg** を 1 リクエストで実行し、
maxDuration 300 秒・1 本あたり数分の Fluid Active CPU を消費する。
Hobby プラン（4h/月）では一括再生成（69 本等）と両立できない。
