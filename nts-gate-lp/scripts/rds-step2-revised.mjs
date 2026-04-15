/**
 * Step 2 修正版: 2-A / 2-B / 2-C を順に実行（DATABASE_URL は .env から）
 */
import dotenv from "dotenv";
import pg from "pg";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const client = new pg.Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
});

const __dirname = dirname(fileURLToPath(import.meta.url));
const sqlPath = join(__dirname, "rds-step2-revised.sql");
const fullSql = readFileSync(sqlPath, "utf8");

/** 先頭の `--` コメント行だけ除去（ステートメント全体を捨てない） */
function stripLeadingLineComments(s) {
  const lines = s.split(/\r?\n/);
  while (lines.length && /^\s*(--|$)/.test(lines[0])) lines.shift();
  return lines.join("\n").trim();
}

/** 単純なセミコロン分割（この SQL ファイル内の文字列に `;` を含めない前提） */
function splitStatements(sql) {
  return sql
    .split(";")
    .map((s) => stripLeadingLineComments(s))
    .filter((s) => s.length > 0);
}

await client.connect();
console.log("Connected. Running Step 2-A/B/C...\n");

for (const stmt of splitStatements(fullSql)) {
  console.log("---\n" + stmt.slice(0, 120) + (stmt.length > 120 ? "..." : ""));
  await client.query(stmt);
  console.log("OK\n");
}

await client.end();
console.log("All statements completed.");
