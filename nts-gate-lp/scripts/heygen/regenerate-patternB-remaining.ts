/**
 * page1 の 10 本以外の Pattern B 動画を修正済みテンプレートで再生成する
 *
 * 実行:
 *   npx tsx scripts/heygen/regenerate-patternB-remaining.ts [flags]
 *
 * フラグ:
 *   --dry-run          対象一覧を表示するだけ（生成しない）
 *   --limit=N          処理件数の上限（テスト用: --limit=3 など）
 *   --resume           進捗ファイルを読み込んで続きから実行
 *   --delay=N          1本ごとの待機時間(ms)。デフォルト 8000
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
  "regenerate-patternB-progress.json",
);

// page1 で再生成済みの subsidyId（スキップ対象）
const PAGE1_DONE = new Set([
  "0be58438-f9b7-4f2c-b268-bdac62206ea3",
  "6b4b4163-5537-4698-985c-71d411490fce",
  "2b301546-2b9e-4d19-997e-7e1a1d9166c9",
  "c9f7dbcd-8db2-4077-ae1f-91635ad9ac2e",
  "97889c66-45f2-4f4d-b6e4-bf2408937908",
  "aacb80d2-0736-46a7-9db1-f5ac519ec0ea",
  "e303e4ad-5d5d-4a74-8982-143dc9ea68fe",
  "9f7a0c94-fc81-490f-a9be-f6ff5637b982",
  "84e05a63-139d-4c79-9997-a54a9373c9cf",
  "13d9fdc4-689e-4736-b5b9-fd50acab799b",
]);

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
    "--pattern=B",
    // --voice=heygen なし → デフォルトで Polly が使われる
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
  const delay = delayArg ? parseInt(delayArg.replace("--delay=", ""), 10) : 8000;

  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║   Pattern B 残り動画 再生成スクリプト（二重下線修正済み）  ║");
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

  // Pattern B かつ page1 未処理のみを対象に
  const targets = unique.filter((r) => {
    if (!r.subsidyId) return false;
    if (PAGE1_DONE.has(r.subsidyId)) return false;
    return pickPattern(r.subsidyId) === "B";
  });

  console.log(`📊 DB 登録済み動画（重複除去）: ${unique.length} 件`);
  console.log(`🎯 Pattern B（page1 除く）: ${targets.length} 件\n`);

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
      "\n  ヒント: npx tsx scripts/heygen/regenerate-patternB-remaining.ts --resume で再開できます。",
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
