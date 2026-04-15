import dotenv from "dotenv";
import pg from "pg";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

await client.connect();

const grants = await client.query(`
  SELECT "externalId", name, "maxAmountLabel", "deadlineLabel", status, source
  FROM "SubsidyGrant"
  WHERE source = 'jgrants'
  ORDER BY "updatedAt" DESC
  LIMIT 20
`);
console.log("--- latest jgrants grants (top 20) ---");
console.log("count:", grants.rowCount);
for (const row of grants.rows) {
  console.log(JSON.stringify(row));
}

const jobs = await client.query(`
  SELECT cj.job_type, cj.status, sg.name
  FROM content_jobs cj
  JOIN "SubsidyGrant" sg ON sg.id = cj.subsidy_id
  WHERE sg.source = 'jgrants'
  ORDER BY cj.triggered_at DESC
  LIMIT 20
`);
console.log("\n--- latest content_jobs for jgrants (top 20) ---");
console.log("count:", jobs.rowCount);
for (const row of jobs.rows) {
  console.log(JSON.stringify(row));
}

const totals = await client.query(`
  SELECT
    (SELECT COUNT(*) FROM "SubsidyGrant" WHERE source = 'jgrants')::int AS jgrants_grants,
    (SELECT COUNT(*) FROM content_jobs cj JOIN "SubsidyGrant" sg ON sg.id = cj.subsidy_id WHERE sg.source = 'jgrants')::int AS jgrants_jobs,
    (SELECT COUNT(*) FROM sync_logs)::int AS sync_logs_total
`);
console.log("\n--- totals ---");
console.log(JSON.stringify(totals.rows[0]));

const latestLog = await client.query(`
  SELECT synced_at, records_fetched, records_upserted, error_message
  FROM sync_logs
  ORDER BY synced_at DESC
  LIMIT 3
`);
console.log("\n--- latest sync_logs (top 3) ---");
for (const row of latestLog.rows) {
  console.log(JSON.stringify(row));
}

await client.end();
