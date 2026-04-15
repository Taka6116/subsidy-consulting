import dotenv from "dotenv";
import pg from "pg";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });
const c = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await c.connect();
const r = await c.query(
  `SELECT id, name, "maxAmountLabel", deadline, status, source
   FROM "SubsidyGrant"
   ORDER BY "updatedAt" DESC`
);
console.log("rows:", r.rowCount);
for (const row of r.rows) console.log(JSON.stringify(row));
await c.end();
