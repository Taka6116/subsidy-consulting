/**
 * 既存の GeneratedContent(VIDEO) を全件 AWS Polly 音声で再生成・S3 上書きする
 *
 * 実行:
 *   npx tsx scripts/heygen/regenerate-all-polly.ts [flags]
 *
 * フラグ:
 *   --dry-run          DB を確認して対象一覧を表示するだけ（生成しない）
 *   --limit=N          処理件数の上限（テスト用: --limit=3 など）
 *   --resume           前回の進捗ファイル（regenerate-progress.json）を読み込んで続きから実行
 *   --delay=N          1 本ごとの待機時間(ms)。デフォルト 8000（8秒）
 *   --stop-on-error    失敗時に即中断
 *
 * 仕組み:
 *   generate-heygen-agent.ts に subsidyId と --publish を渡して実行。
 *   デフォルト音声が Polly になったため --voice=polly フラグは不要。
 *   進捗は ./scripts/heygen/regenerate-progress.json に随時保存（--resume で再開可能）。
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
  "regenerate-progress.json",
);

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

/** 進捗ファイルを読み込む */
async function loadProgress(): Promise<Record<string, "ok" | "fail">> {
  try {
    const raw = await fs.readFile(PROGRESS_FILE, "utf-8");
    return JSON.parse(raw) as Record<string, "ok" | "fail">;
  } catch {
    return {};
  }
}

/** 進捗ファイルを保存 */
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
  console.log("║   既存動画 全件 AWS Polly 音声 再生成スクリプト           ║");
  console.log("╚══════════════════════════════════════════════════════════╝\n");

  // 対象取得（GeneratedContent から VIDEO 全件）
  const records = await prisma.generatedContent.findMany({
    where: { contentType: "video", status: "published" },
    select: { id: true, title: true, subsidyId: true },
    orderBy: { createdAt: "asc" },
  });

  console.log(`📊 DB 登録済み動画: ${records.length} 件`);

  // subsidyId が null のものは除外
  const targets = records.filter((r) => r.subsidyId != null);
  const skipped = records.length - targets.length;
  if (skipped > 0) {
    console.log(`⚠  subsidyId なし（除外）: ${skipped} 件`);
  }

  // 重複 subsidyId を除去（同一補助金で複数動画がある場合は最新1件のみ再生成）
  const seen = new Set<string>();
  const unique = targets.filter((r) => {
    if (seen.has(r.subsidyId!)) return false;
    seen.add(r.subsidyId!);
    return true;
  });
  console.log(`✅ 再生成対象（重複除去後）: ${unique.length} 件\n`);

  if (dryRun) {
    console.log("📋 対象一覧（--dry-run）:");
    unique.slice(0, 30).forEach((r, i) => {
      console.log(`  [${i + 1}] ${r.subsidyId}  ${(r.title ?? "").slice(0, 50)}`);
    });
    if (unique.length > 30) console.log(`  ... 他 ${unique.length - 30} 件`);
    console.log("\n🔍 --dry-run のため生成はスキップしました。");
    return;
  }

  // 進捗読み込み
  const progress = resumeMode ? await loadProgress() : {};
  if (resumeMode) {
    const doneCount = Object.values(progress).filter((v) => v === "ok").length;
    console.log(`🔄 --resume: 前回完了 ${doneCount} 件をスキップ\n`);
  }

  let processed = 0;
  let okCount = 0;
  let failCount = 0;
  const failList: string[] = [];

  for (const rec of unique) {
    if (processed >= limit) break;

    const sid = rec.subsidyId!;
    const label = `[${processed + 1}/${Math.min(unique.length, limit)}] ${(rec.title ?? "").slice(0, 40)}`;

    // 前回成功済みはスキップ
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

    // 進捗保存
    await saveProgress(progress);

    // レート制限のための待機（最後の1件はスキップ）
    if (processed < Math.min(unique.length, limit)) {
      console.log(`\n⏱  次の生成まで ${delay / 1000} 秒待機...`);
      await sleep(delay);
    }
  }

  console.log("\n╔══════════════════════════════════════════════════════════╗");
  console.log("║   再生成 結果サマリー                                      ║");
  console.log("╚══════════════════════════════════════════════════════════╝");
  console.log(`  処理: ${processed} 件 / 対象: ${unique.length} 件`);
  console.log(`  成功: ${okCount} 件`);
  console.log(`  失敗: ${failCount} 件`);
  if (failList.length > 0) {
    console.log("\n  ❌ 失敗一覧:");
    failList.forEach((id) => console.log(`    ${id}`));
    console.log(
      "\n  ヒント: npx tsx scripts/heygen/regenerate-all-polly.ts --resume で再開できます。",
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
