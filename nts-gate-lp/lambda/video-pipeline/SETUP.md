# Lambda 動画生成パイプライン セットアップ手順

## 概要

Polly音声（MP3）＋ sharpスライド（PNG）→ FFmpeg → MP4 の合成をLambda上で実行する。

---

## 1. FFmpeg Lambda Layer の追加

### 方法A: AWS Serverless Application Repository（推奨・最短）

1. AWSコンソール → Lambda → Layers → 「レイヤーの作成」
2. または下記リンクから既成Layerをデプロイ:
   - https://serverlessrepo.aws.amazon.com/applications/us-east-1/145266761615/ffmpeg-lambda-layer
3. Lambdaの設定 → レイヤー → 「レイヤーを追加」でARNを指定

### 方法B: 手動でバイナリをアップロード

```bash
# 公式ビルド済みバイナリ取得 (Amazon Linux 2 x86_64)
curl -L https://github.com/nicholasstephan/ffmpeg-lambda-layer/releases/latest/download/ffmpeg-lambda-layer.zip -o ffmpeg-layer.zip

# Layerとしてアップロード
aws lambda publish-layer-version \
  --layer-name ffmpeg-binary \
  --zip-file fileb://ffmpeg-layer.zip \
  --compatible-runtimes nodejs20.x \
  --region ap-northeast-1
```

Layer追加後、Lambdaの環境変数に追加:
```
FFMPEG_PATH = /opt/bin/ffmpeg
```

---

## 2. Lambda メモリ・タイムアウト設定

動画合成は CPU / メモリを使用するため、以下に変更してください:

| 設定項目 | 現在値 | 推奨値 |
|---------|--------|--------|
| メモリ | 256 MB | **1024 MB** |
| タイムアウト | 30秒 | **300秒 (5分)** |
| ストレージ (/tmp) | 512 MB | **2048 MB** |

---

## 3. IAM ロールへの S3 権限追加

`lambda-subsidy-role` に以下を追加（GetObject が新たに必要）:

```json
{
  "Effect": "Allow",
  "Action": [
    "s3:PutObject",
    "s3:GetObject",
    "s3:DeleteObject"
  ],
  "Resource": "arn:aws:s3:::YOUR-VIDEO-BUCKET/*"
}
```

---

## 4. 環境変数の確認

Lambdaの環境変数に以下が設定されていることを確認:

```
VIDEO_S3_BUCKET     = （動画保存先バケット名）
VIDEO_S3_REGION     = ap-northeast-1
VIDEO_S3_BASE_URL   = https://（CloudFrontドメインまたはS3 URL）
FFMPEG_PATH         = /opt/bin/ffmpeg
```

---

## 5. ローカルテスト

```bash
# ffmpeg がインストールされていること（brew install ffmpeg など）
cd nts-gate-lp
npx tsx scripts/generate-videos.ts --limit 1 --force
```

ローカルでは `FFMPEG_PATH` を設定しなければシステムPATHのffmpegが使われる。

---

## 6. Lambda Layer ARN（ap-northeast-1 用）

以下のパブリックLayerが利用可能（2024年時点）:

```
arn:aws:lambda:ap-northeast-1:145266761615:layer:ffmpeg:1
```

※ リージョン・バージョンは変わる場合があります。AWSコンソールで確認してください。
