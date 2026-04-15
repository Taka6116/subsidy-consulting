import dotenv from "dotenv";
import pg from "pg";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const { Client } = pg;
const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}
// RDS 証明書チェーンで Node が失敗する場合があるため、この検証スクリプトのみ緩和
const client = new Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
});

await client.connect();

const tables = await client.query(
  `SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public'
   ORDER BY table_name`
);
console.log("--- public.tables ---");
for (const r of tables.rows) console.log(r.table_name);

const ex = await client.query(
  `SELECT 1 FROM information_schema.tables
   WHERE table_schema = 'public' AND table_name = 'subsidy_grants'`
);
const has = ex.rowCount > 0;
console.log("\n--- subsidy_grants ---");
console.log("exists:", has);

if (has) {
  const cols = await client.query(
    `SELECT column_name, data_type FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'subsidy_grants'
     ORDER BY ordinal_position`
  );
  console.log("\n--- subsidy_grants columns ---");
  for (const c of cols.rows) console.log(`${c.column_name}\t${c.data_type}`);
}

const alt = await client.query(
  `SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public' AND LOWER(table_name) IN ('subsidygrant','subsidy_grants')`
);
if (alt.rows.length) {
  for (const t of alt.rows) {
    const tn = t.table_name;
    const cols = await client.query(
      `SELECT column_name, data_type FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = $1
       ORDER BY ordinal_position`,
      [tn]
    );
    console.log(`\n--- columns: ${tn} ---`);
    for (const c of cols.rows) console.log(`${c.column_name}\t${c.data_type}`);
  }
}

await client.end();
