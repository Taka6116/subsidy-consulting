/**
 * テンプレートの変数一覧を確認する
 * 実行: npx tsx scripts/heygen/_debug-template.ts
 *
 * HEYGEN_SLIDE_TEMPLATE_ID（未設定時は HEYGEN_TEMPLATE_ID）のテンプレート構造を表示する。
 * 新しいスライドテンプレートを作成したら、変数名が正しく設定されているかここで確認する。
 */
import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const API_KEY = process.env.HEYGEN_API_KEY ?? "";
const TEMPLATE_ID =
  process.env.HEYGEN_SLIDE_TEMPLATE_ID ??
  process.env.HEYGEN_TEMPLATE_ID ??
  "";

if (!TEMPLATE_ID) {
  console.error(
    "❌ HEYGEN_SLIDE_TEMPLATE_ID（または HEYGEN_TEMPLATE_ID）が .env に設定されていません。",
  );
  process.exit(1);
}

async function main() {
  console.log(`テンプレートID: ${TEMPLATE_ID}`);
  const res = await fetch(`https://api.heygen.com/v2/template/${TEMPLATE_ID}`, {
    headers: { "X-Api-Key": API_KEY },
  });
  const json = (await res.json()) as Record<string, unknown>;
  console.log("status:", res.status);

  // 変数一覧を整理して表示
  const variables = (json.data as Record<string, unknown> | undefined)?.variables as
    | Record<string, unknown>
    | undefined;
  if (variables) {
    console.log("\n【変数一覧】");
    for (const [name, val] of Object.entries(variables)) {
      const v = val as Record<string, unknown>;
      console.log(`  ${name.padEnd(20)}: type=${v.type}`);
    }
    console.log(`\n合計 ${Object.keys(variables).length} 変数`);

    // 期待される変数名との差分チェック
    const expected = [
      "s1_title", "s1_subtitle", "s1_voice",
      "s2_name", "s2_description", "s2_voice",
      "s3_amount", "s3_deadline", "s3_industries", "s3_voice",
      "s4_case1", "s4_case2", "s4_voice",
      "s5_cta", "s5_url", "s5_voice",
    ];
    const actual = Object.keys(variables);
    const missing = expected.filter((e) => !actual.includes(e));
    const extra = actual.filter((a) => !expected.includes(a));
    if (missing.length > 0) {
      console.log(`\n⚠️  未設定の変数（テンプレートに追加が必要）:`);
      missing.forEach((m) => console.log(`    - ${m}`));
    }
    if (extra.length > 0) {
      console.log(`\nℹ️  テンプレートにある追加変数:`);
      extra.forEach((e) => console.log(`    + ${e}`));
    }
    if (missing.length === 0) {
      console.log("\n✅ 全16変数が揃っています。自動生成の準備ができています！");
    }
  } else {
    console.log("\nフルレスポンス:");
    console.log(JSON.stringify(json, null, 2));
  }
}

main().catch(console.error);
