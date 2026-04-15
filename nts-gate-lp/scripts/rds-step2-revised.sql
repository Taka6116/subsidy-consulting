-- Step 2-A
ALTER TABLE "SubsidyGrant"
  ADD COLUMN IF NOT EXISTS status       TEXT DEFAULT 'open',
  ADD COLUMN IF NOT EXISTS source       TEXT DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS subsidy_amount BIGINT,
  ADD COLUMN IF NOT EXISTS subsidy_rate   NUMERIC(4,2),
  ADD COLUMN IF NOT EXISTS deadline       DATE;

-- Step 2-B
CREATE TABLE IF NOT EXISTS generated_contents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subsidy_id      TEXT REFERENCES "SubsidyGrant"(id) ON DELETE CASCADE,
  content_type    TEXT NOT NULL,
  title           TEXT,
  body            TEXT,
  meta_description TEXT,
  status          TEXT DEFAULT 'draft',
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content_jobs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subsidy_id      TEXT REFERENCES "SubsidyGrant"(id) ON DELETE CASCADE,
  job_type        TEXT NOT NULL,
  status          TEXT DEFAULT 'pending',
  triggered_at    TIMESTAMPTZ DEFAULT NOW(),
  completed_at    TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS sync_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  synced_at       TIMESTAMPTZ DEFAULT NOW(),
  records_fetched  INT,
  records_upserted INT,
  error_message   TEXT
);

-- Step 2-C（再実行時の重複を避ける）
DELETE FROM "SubsidyGrant"
WHERE source = 'manual'
  AND name IN (
    '省力化投資補助金',
    '事業承継・引継ぎ補助金',
    'IT導入補助金'
  );

INSERT INTO "SubsidyGrant"
  (id, name, description, "targetIndustries", status, source,
   subsidy_amount, subsidy_rate, deadline,
   "maxAmountLabel", "deadlineLabel", "updatedAt", "syncedAt")
VALUES
(
  gen_random_uuid()::text,
  '省力化投資補助金',
  '中小企業・小規模事業者等が、人手不足の解消に向けてIoT・ロボット等の省力化設備を導入する際の費用を補助する制度。',
  ARRAY['製造業','小売業','飲食業','サービス業'],
  'open', 'manual',
  15000000, 0.50, '2025-12-31',
  '最大1,500万円', '2025年12月31日',
  NOW(), NOW()
),
(
  gen_random_uuid()::text,
  '事業承継・引継ぎ補助金',
  '事業承継・M&Aを契機とした経営革新や設備投資・販路開拓等に取り組む中小企業者等を支援する補助金。',
  ARRAY['全業種'],
  'open', 'manual',
  8000000, 0.67, '2025-10-31',
  '最大800万円', '2025年10月31日',
  NOW(), NOW()
),
(
  gen_random_uuid()::text,
  'IT導入補助金',
  '業務効率化やDX推進のためにITツール（ソフトウェア・クラウド等）を導入する中小企業・小規模事業者を支援する補助金。',
  ARRAY['全業種'],
  'open', 'manual',
  4500000, 0.50, '2025-11-30',
  '最大450万円', '2025年11月30日',
  NOW(), NOW()
);
