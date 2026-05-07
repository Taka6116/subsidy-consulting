-- AlterTable
ALTER TABLE "SubsidyGrant"
ADD COLUMN IF NOT EXISTS "municipality_code" TEXT,
ADD COLUMN IF NOT EXISTS "official_page_url" TEXT,
ADD COLUMN IF NOT EXISTS "institution_name" TEXT,
ADD COLUMN IF NOT EXISTS "fetched_at" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "content_hash" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "municipalities" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "prefecture_name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "official_url" TEXT,
    "subsidy_page_url" TEXT,
    "feed_url" TEXT,
    "crawl_strategy" TEXT NOT NULL DEFAULT 'html_list',
    "crawl_config" JSONB,
    "last_crawled_at" TIMESTAMP(3),
    "crawl_status" TEXT NOT NULL DEFAULT 'pending',
    "error_message" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "municipalities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "municipality_crawl_results" (
    "id" TEXT NOT NULL,
    "municipality_id" TEXT NOT NULL,
    "crawled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "links_found" INTEGER NOT NULL DEFAULT 0,
    "new_grants" INTEGER NOT NULL DEFAULT 0,
    "updated_grants" INTEGER NOT NULL DEFAULT 0,
    "errors" JSONB,
    "duration" INTEGER,

    CONSTRAINT "municipality_crawl_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "municipalities_code_key" ON "municipalities"("code");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "municipalities_prefecture_name_idx" ON "municipalities"("prefecture_name");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "municipalities_crawl_status_idx" ON "municipalities"("crawl_status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "municipalities_last_crawled_at_idx" ON "municipalities"("last_crawled_at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "municipality_crawl_results_municipality_id_idx" ON "municipality_crawl_results"("municipality_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "municipality_crawl_results_crawled_at_idx" ON "municipality_crawl_results"("crawled_at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SubsidyGrant_municipality_code_idx" ON "SubsidyGrant"("municipality_code");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SubsidyGrant_official_page_url_idx" ON "SubsidyGrant"("official_page_url");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'municipality_crawl_results_municipality_id_fkey'
  ) THEN
    ALTER TABLE "municipality_crawl_results"
      ADD CONSTRAINT "municipality_crawl_results_municipality_id_fkey"
      FOREIGN KEY ("municipality_id")
      REFERENCES "municipalities"("id")
      ON DELETE CASCADE
      ON UPDATE CASCADE;
  END IF;
END $$;
