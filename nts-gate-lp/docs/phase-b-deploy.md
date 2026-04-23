# Phase B デプロイ手順：jGrants 検知 → 記事自動生成 → ISR パージ

## 全体アーキテクチャ

```
EventBridge Scheduler (15 min)
  ↓ invoke
AWS Lambda: article-pipeline
  ├─ (1) jGrants API fetch + RDS UPSERT + content_jobs enqueue
  ├─ (2) pending の article ジョブを 5 件まで選択
  │      POST https://<vercel>/api/articles/generate （Bedrock は Vercel 側）
  └─ (3) POST https://<vercel>/api/revalidate で ISR キャッシュ即時パージ
```

**遅延予算**: 新公募 → 記事公開まで **最大 16 分** (15 分 sync 周期 + 1 分の処理時間)。

---

## ローカル E2E テスト（AWS 展開前の必須確認）

### 前提

- `.env.local` に以下が入っていること（`.env.example` 参照）:
  ```
  DATABASE_URL=postgresql://...
  AWS_REGION=us-east-1
  BEDROCK_MODEL_ID=us.anthropic.claude-sonnet-4-5-20250929-v1:0
  ARTICLE_GENERATE_TOKEN=<ランダム 32 文字>
  REVALIDATE_SECRET=<ランダム 32 文字>
  VERCEL_APP_URL=http://localhost:3001   # E2E はローカル dev サーバを指す
  ```
- `npm run dev` でローカル dev サーバが起動していること

### 手順

```bash
# (1) sync のみ：jGrants → RDS → content_jobs.pending 積む
npm run jgrants:sync

# (2) pending 消化：Bedrock 呼び出し + DB 保存（Vercel API 経由でない直接呼び出し版）
npm run article:drain -- --limit 2

# (3) Lambda handler を直接 node で叩く E2E（sync + drain + revalidate 全部通す）
node lambda/article-pipeline/index.mjs
```

最終的に stdout の report JSON で以下が確認できれば成功:

```json
{
  "ok": true,
  "sync": { "fetched": 400, "newGrants": 0, "updatedGrants": 400 },
  "generate": { "picked": 0, "published": 0, "rejected": 0, "failed": 0 },
  "revalidate": null,
  "elapsedMs": 9876
}
```

新規補助金がない日は `picked: 0` が正常。新規補助金が出たら Lambda 呼び出しで `published: 1` になる。

---

## AWS 展開（1 回だけやれば以後自動）

### 1. Secrets Manager に機密情報を格納

```bash
aws secretsmanager create-secret \
  --name nts-gate-lp/phase-b \
  --secret-string '{
    "DATABASE_URL": "postgresql://...",
    "VERCEL_APP_URL": "https://nts-gate-lp.vercel.app",
    "ARTICLE_GENERATE_TOKEN": "xxx",
    "REVALIDATE_SECRET": "yyy",
    "SYNC_USER_AGENT": "nts-gate-lp-sync/1.0 (contact: ops@your-domain.jp)"
  }'
```

### 2. Vercel 側の環境変数を設定

Vercel プロジェクト Settings → Environment Variables に:


| Key                      | Value                                          | Environment         |
| ------------------------ | ---------------------------------------------- | ------------------- |
| `ARTICLE_GENERATE_TOKEN` | （Secrets Manager と同じ値）                         | Production, Preview |
| `REVALIDATE_SECRET`      | （Secrets Manager と同じ値）                         | Production, Preview |
| `AWS_REGION`             | `us-east-1`                                    | Production          |
| `BEDROCK_MODEL_ID`       | `us.anthropic.claude-sonnet-4-5-20250929-v1:0` | Production          |


さらに Vercel サービスが Bedrock を呼ぶため、IAM ユーザの `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` を Vercel Env に入れる（bedrock:InvokeModel 権限のみ）。

### 3. Lambda 関数作成

```bash
cd lambda/article-pipeline

# ZIP 作成（Linux/WSL/Mac）
bash -c "rm -rf build && mkdir build && cp index.mjs package.json build/ && \
  cd build && npm install --omit=dev --no-audit --no-fund && \
  zip -r ../function.zip . && cd .. && rm -rf build"

aws lambda create-function \
  --function-name nts-article-pipeline \
  --runtime nodejs20.x \
  --role arn:aws:iam::<ACCOUNT>:role/nts-article-pipeline-role \
  --handler index.handler \
  --timeout 300 \
  --memory-size 1024 \
  --zip-file fileb://function.zip \
  --vpc-config SubnetIds=subnet-xxx,subnet-yyy,SecurityGroupIds=sg-zzz
```

**重要**: RDS が VPC 内にある場合、Lambda も同じ VPC + Security Group を持つ必要あり。RDS の SG に Lambda SG からのインバウンド 5432 を許可する。

### 4. IAM ロール（最小権限）

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    },
    {
      "Effect": "Allow",
      "Action": ["ec2:CreateNetworkInterface", "ec2:DescribeNetworkInterfaces", "ec2:DeleteNetworkInterface"],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": "secretsmanager:GetSecretValue",
      "Resource": "arn:aws:secretsmanager:*:*:secret:nts-gate-lp/phase-b-*"
    }
  ]
}
```

### 5. Lambda の環境変数を Secrets Manager と同期

Lambda Console → Configuration → Environment variables で、Secrets Manager の値を流し込む。SAM/Terraform を使う場合は `fromSecret()` 相当で自動化。

### 6. EventBridge Scheduler を作成

```bash
aws scheduler create-schedule \
  --name nts-article-pipeline-15min \
  --schedule-expression "rate(15 minutes)" \
  --target '{
    "RoleArn": "arn:aws:iam::<ACCOUNT>:role/nts-eventbridge-invoke-lambda",
    "Arn": "arn:aws:lambda:ap-northeast-1:<ACCOUNT>:function:nts-article-pipeline",
    "Input": "{\"source\":\"eventbridge-scheduler\"}"
  }' \
  --flexible-time-window 'Mode=OFF'
```

---

## 監視

### CloudWatch Alarm（最低限）

1. **Lambda Errors > 0 が 2 回連続** → SNS で通知
2. **Lambda Duration > 240s** → タイムアウト危険
3. **Lambda ConcurrentExecutions > 1** → 15 分 Schedule なら常に 1 以下のはず（複数走ったら何かおかしい）

### DB 側の手動確認クエリ

```sql
-- 最近の sync ログ
SELECT synced_at, records_fetched, records_upserted, error_message
FROM sync_logs
ORDER BY synced_at DESC
LIMIT 10;

-- pending が溜まっていないか
SELECT status, COUNT(*)
FROM content_jobs
WHERE job_type = 'article'
GROUP BY status;

-- ガードレールで rejected された記事
SELECT id, title, subsidy_id, created_at
FROM generated_contents
WHERE content_type = 'article' AND status = 'rejected'
ORDER BY created_at DESC;
```

---

## 停止・ロールバック

```bash
# Scheduler を無効化（一時停止）
aws scheduler update-schedule --name nts-article-pipeline-15min --state DISABLED

# 完全停止
aws scheduler delete-schedule --name nts-article-pipeline-15min
aws lambda delete-function --function-name nts-article-pipeline
```

Vercel 側の `/api/articles/generate` と `/api/revalidate` は手動 CLI からも使える（`scripts/generate-article.ts` / curl）ため、Lambda を止めても運用は継続可能。

---

## 将来の最適化


| フェーズ | 内容                                                 | 期待効果                           |
| ---- | -------------------------------------------------- | ------------------------------ |
| B+   | Bedrock 呼び出しを Vercel 経由ではなく Lambda 内で直接行う          | Vercel Serverless の 60s 制限から解放 |
| B++  | SQS を挟んで failed ジョブのリトライを DLQ に切り出す                | 自動リトライ + エラー可視化                |
| C    | video_script 用の Lambda + Amazon Polly / HeyGen を追加 | 動画コンテンツの自動生成                   |
| D    | jGrants に Webhook API が追加されたらポーリング廃止               | ほぼリアルタイム（<1 分）                 |


