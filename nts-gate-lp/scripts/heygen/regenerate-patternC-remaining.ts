/**
 * Pattern C 動画をすべて修正済みテンプレート（slide4番号バッジ青統一・slide5 ▼ボックス削除）で再生成する
 *
 * 実行:
 *   npx tsx scripts/heygen/regenerate-patternC-remaining.ts [flags]
 *
 * フラグ:
 *   --dry-run          対象一覧を表示するだけ（生成しない）
 *   --limit=N          処理件数の上限（テスト用: --limit=3 など）
 *   --resume           進捗ファイルを読み込んで続きから実行
 *   --delay=N          1本ごとの待機時間(ms)。デフォルト 10000
 *   --stop-on-error    失敗時に即中断
 */

import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "node:fs/promises";
import { spawn } from "node:child_process";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { prisma } from "@/lib/db/prisma";

const PROGRESS_FILE = path.join(
  process.cwd(),
  "scripts",
  "heygen",
  "regenerate-patternC-progress.json",
);

/** generate-heygen-agent.ts と同じハッシュ関数でパターンを決定 */
function pickPattern(subsidyId: string): "A" | "B" | "C" | "D" {
  const keys = ["A", "B", "C", "D"] as const;
  let h = 0;
  for (const ch of subsidyId) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return keys[h % keys.length];
}

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

async function loadProgress(): Promise<Record<string, "ok" | "fail">> {
  try {
    const raw = await fs.readFile(PROGRESS_FILE, "utf-8");
    return JSON.parse(raw) as Record<string, "ok" | "fail">;
  } catch {
    return {};
  }
}

async function saveProgress(progress: Record<string, "ok" | "fail">) {
  await fs.writeFile(PROGRESS_FILE, JSON.stringify(progress, null, 2), "utf-8");
}

function runOne(subsidyId: string): Promise<number> {
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
    "--publish",
    "--pattern=C",
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
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const resumeMode = args.includes("--resume");
  const stopOnError = args.includes("--stop-on-error");
  const limitArg = args.find((a) => a.startsWith("--limit="));
  const limit = limitArg ? parseInt(limitArg.replace("--limit=", ""), 10) : Infinity;
  const delayArg = args.find((a) => a.startsWith("--delay="));
  const delay = delayArg ? parseInt(delayArg.replace("--delay=", ""), 10) : 10000;

  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║   Pattern C 全動画 再生成スクリプト（slide4/5修正反映）   ║");
  console.log("╚══════════════════════════════════════════════════════════╝\n");

  const records = await prisma.generatedContent.findMany({
    where: { contentType: "video", status: "published" },
    select: { id: true, title: true, subsidyId: true },
    orderBy: { publishedAt: "desc" },
  });

  // 重複 subsidyId を除去
  const seen = new Set<string>();
  const unique = records.filter((r) => {
    if (!r.subsidyId) return false;
    if (seen.has(r.subsidyId)) return false;
    seen.add(r.subsidyId);
    return true;
  });

  // Pattern C のみを対象に
  const targets = unique.filter((r) => {
    if (!r.subsidyId) return false;
    return pickPattern(r.subsidyId) === "C";
  });

  console.log(`📊 DB 登録済み動画（重複除去）: ${unique.length} 件`);
  console.log(`🎯 Pattern C 全件: ${targets.length} 件\n`);

  if (dryRun) {
    console.log("📋 対象一覧（--dry-run）:");
    targets.forEach((r, i) => {
      console.log(
        `  [${i + 1}] ${r.subsidyId}  ${(r.title ?? "").slice(0, 50)}`,
      );
    });
    console.log("\n🔍 --dry-run のため生成はスキップしました。");
    return;
  }

  const progress = resumeMode ? await loadProgress() : {};
  if (resumeMode) {
    const doneCount = Object.values(progress).filter((v) => v === "ok").length;
    console.log(`🔄 --resume: 前回完了 ${doneCount} 件をスキップ\n`);
  }

  let processed = 0;
  let okCount = 0;
  let failCount = 0;
  const failList: string[] = [];

  for (const rec of targets) {
    if (processed >= limit) break;

    const sid = rec.subsidyId!;
    const label = `[${processed + 1}/${Math.min(targets.length, limit)}] ${(rec.title ?? "").slice(0, 40)}`;

    if (resumeMode && progress[sid] === "ok") {
      console.log(`⏭  スキップ（前回OK）: ${label}`);
      continue;
    }

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`▶ ${label}`);
    console.log(`  subsidyId: ${sid}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    const code = await runOne(sid);
    processed++;

    if (code === 0) {
      okCount++;
      progress[sid] = "ok";
      console.log(`\n✅ 完了: ${label}`);
    } else {
      failCount++;
      failList.push(sid);
      progress[sid] = "fail";
      console.error(`\n❌ 失敗 (exit ${code}): ${label}`);
      if (stopOnError) {
        console.log("--stop-on-error のため中断します。");
        break;
      }
    }

    await saveProgress(progress);

    if (processed < Math.min(targets.length, limit)) {
      console.log(`\n⏱  次の生成まで ${delay / 1000} 秒待機...`);
      await sleep(delay);
    }
  }

  console.log("\n╔══════════════════════════════════════════════════════════╗");
  console.log("║   再生成 結果サマリー                                      ║");
  console.log("╚══════════════════════════════════════════════════════════╝");
  console.log(`  処理: ${processed} 件 / 対象: ${targets.length} 件`);
  console.log(`  成功: ${okCount} 件`);
  console.log(`  失敗: ${failCount} 件`);
  if (failList.length > 0) {
    console.log("\n  ❌ 失敗一覧:");
    failList.forEach((id) => console.log(`    ${id}`));
    console.log(
      "\n  ヒント: npx tsx scripts/heygen/regenerate-patternC-remaining.ts --resume で再開できます。",
    );
  }

  if (failCount > 0) process.exit(1);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
