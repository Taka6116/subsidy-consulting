/**
 * 動画一覧ページ1の先頭10件を AWS Polly 音声 + スライドパターン付きで再生成
 *
 * 実行:
 *   npx tsx scripts/heygen/regenerate-page1-polly.ts [--dry-run]
 *
 * ページ1の選定ロジックは /subsidies/videos の SubsidiesVideosIndex と同一:
 *   - publishedAt desc（サーバー側 take:60）
 *   - デフォルトフィルタ（タブ=all・タグなし・検索なし）
 *   - 受付終了を末尾へ
 *   - 先頭10件
 */

import * as dotenv from "dotenv";
import * as path from "path";
import { spawn } from "node:child_process";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const PATTERNS = ["A", "B", "C", "D"] as const;
const COUNT = 10;

/** ページ1先頭10件の固定リスト（再生成開始時点の順序。publishedAt更新で順序が変わらないよう固定） */
const PAGE1_FIXED_TARGETS: { subsidyId: string; pattern: (typeof PATTERNS)[number]; title: string }[] = [
  { subsidyId: "0be58438-f9b7-4f2c-b268-bdac62206ea3", pattern: "A", title: "中小・小規模事業者賃上げ環境整備支援補助金" },
  { subsidyId: "6b4b4163-5537-4698-985c-71d411490fce", pattern: "B", title: "プラスチック代替製品利用促進事業費補助金" },
  { subsidyId: "2b301546-2b9e-4d19-997e-7e1a1d9166c9", pattern: "C", title: "観光経営人材育成事業 連携大学・学校募集" },
  { subsidyId: "c9f7dbcd-8db2-4077-ae1f-91635ad9ac2e", pattern: "D", title: "プロジェクションマッピング等促進支援事業" },
  { subsidyId: "97889c66-45f2-4f4d-b6e4-bf2408937908", pattern: "A", title: "令和8年度中小企業生産性向上促進事業費補助金" },
  { subsidyId: "aacb80d2-0736-46a7-9db1-f5ac519ec0ea", pattern: "B", title: "岩手県 物価高騰対策賃上げ支援金" },
  { subsidyId: "e303e4ad-5d5d-4a74-8982-143dc9ea68fe", pattern: "C", title: "水力発電導入促進支援事業費補助金（事業性評価）" },
  { subsidyId: "9f7a0c94-fc81-490f-a9be-f6ff5637b982", pattern: "D", title: "秋田県・海外特許出願で最大300万円補助" },
  { subsidyId: "84e05a63-139d-4c79-9997-a54a9373c9cf", pattern: "A", title: "青森県・海外出願支援補助金｜最大300万円" },
  { subsidyId: "13d9fdc4-689e-4736-b5b9-fd50acab799b", pattern: "B", title: "海外進出、知財は守れていますか？｜鹿児島県海外出願支援" },
];

function runOne(subsidyId: string, pattern: string): Promise<number> {
  const script = path.join(
    process.cwd(),
    "scripts",
    "heygen",
    "generate-heygen-agent.ts",
  );
  const args = [
    "tsx",
    "--tsconfig",
    "tsconfig.json",
    script,
    subsidyId,
    `--pattern=${pattern}`,
    "--publish",
  ];

  return new Promise((resolve, reject) => {
    const child = spawn("npx", args, {
      cwd: process.cwd(),
      stdio: "inherit",
      shell: true,
    });
    child.on("error", reject);
    child.on("close", (code) => resolve(code ?? 1));
  });
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const startArg = process.argv.find((a) => a.startsWith("--start="));
  const startIndex = startArg ? Math.max(1, parseInt(startArg.replace("--start=", ""), 10)) : 1;
  const countArg = process.argv.find((a) => a.startsWith("--count="));
  const count = countArg ? parseInt(countArg.replace("--count=", ""), 10) : COUNT;

  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║   ページ1 先頭10件 Polly 再生成                           ║");
  console.log("╚══════════════════════════════════════════════════════════╝\n");

  const allTargets = PAGE1_FIXED_TARGETS.map((t) => ({
    ...t,
    publishedAt: "—",
  }));
  const targets = allTargets.slice(startIndex - 1, startIndex - 1 + count);
  if (targets.length === 0) {
    throw new Error("再生成対象が見つかりませんでした。");
  }

  console.log(`📋 対象 ${targets.length} 件:\n`);
  targets.forEach((t, i) => {
    console.log(
      `  [${i + 1}] Pattern ${t.pattern} | ${t.publishedAt} | ${t.title.slice(0, 45)}`,
    );
    console.log(`       subsidyId: ${t.subsidyId}\n`);
  });

  if (dryRun) {
    console.log("🔍 --dry-run のため生成はスキップしました。");
    return;
  }

  let ok = 0;
  let fail = 0;

  for (let i = 0; i < targets.length; i++) {
    const t = targets[i]!;
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`▶ [${i + 1}/${targets.length}] Pattern ${t.pattern}: ${t.title.slice(0, 40)}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    const code = await runOne(t.subsidyId, t.pattern);
    if (code === 0) {
      ok++;
      console.log(`\n✅ 完了 [${i + 1}/${targets.length}]`);
    } else {
      fail++;
      console.error(`\n❌ 失敗 (exit ${code}) [${i + 1}/${targets.length}]`);
    }
  }

  console.log("\n╔══════════════════════════════════════════════════════════╗");
  console.log("║   結果サマリー                                            ║");
  console.log("╚══════════════════════════════════════════════════════════╝");
  console.log(`  成功: ${ok} / ${targets.length}`);
  console.log(`  失敗: ${fail}`);

  if (fail > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
