-- メールマガジン: 配信停止トークン・記事配信済みフラグ
ALTER TABLE "subscribers" ADD COLUMN IF NOT EXISTS "unsubscribe_token" UUID;

UPDATE "subscribers"
SET "unsubscribe_token" = gen_random_uuid()
WHERE "unsubscribe_token" IS NULL;

ALTER TABLE "subscribers"
  ALTER COLUMN "unsubscribe_token" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "subscribers_unsubscribe_token_key"
  ON "subscribers"("unsubscribe_token");

ALTER TABLE "generated_contents" ADD COLUMN IF NOT EXISTS "newsletter_sent_at" TIMESTAMPTZ;
