/**
 * 既存の公開済み動画から「実際に使われているスライド1枚目」のフレームを
 * ffmpeg で抽出し、一覧カード用サムネイルとして S3 に再アップロード、
 * DB の thumbnailPath を更新するスクリプト。
 *
 * ※ 動画本体（mp4）は一切変更しない。サムネイル画像のみを差し替える。
 *
 * 使い方:
 *   npx tsx --tsconfig tsconfig.json scripts/heygen/regenerate-thumbnails-from-video.ts           # 全件
 *   npx tsx --tsconfig tsconfig.json scripts/heygen/regenerate-thumbnails-from-video.ts --id=<generatedContentId>
 *   npx tsx --tsconfig tsconfig.json scripts/heygen/regenerate-thumbnails-from-video.ts --dry-run  # DB更新なし・ローカル確認のみ
 */
import * as dotenv from "dotenv";
import * as path from "path";
import fs from "node:fs/promises";
import { exec } from "node:child_process";
import { promisify } from "node:util";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import ffmpegPath from "ffmpeg-static";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "@/lib/db/prisma";

const execAsync = promisify(exec);

async function uploadToS3(buf: Buffer, key: string, contentType: string): Promise<string> {
  const bucket = process.env.VIDEO_S3_BUCKET;
  if (!bucket) throw new Error("VIDEO_S3_BUCKET が未設定です");
  const region = process.env.VIDEO_S3_REGION ?? process.env.AWS_REGION ?? "ap-northeast-1";
  const baseUrl = process.env.VIDEO_S3_BASE_URL;
  const s3 = new S3Client({ region });
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buf,
      ContentType: contentType,
      CacheControl: "public, max-age=86400",
    }),
  );
  return baseUrl ? `${baseUrl}/${key}` : `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

async function extractFirstFrame(mp4Path: string, pngPath: string): Promise<void> {
  // 0.15秒地点でキャプチャ（0秒ちょうどだと稀に黒フレームになることがあるため）
  const bin = ffmpegPath as unknown as string;
  await execAsync(
    `"${bin}" -y -ss 0.15 -i "${mp4Path}" -frames:v 1 -q:v 2 "${pngPath}"`,
  );
}

async function main() {
  const args = process.argv.slice(2);
  const idArg = args.find((a) => a.startsWith("--id="))?.replace("--id=", "");
  const dryRun = args.includes("--dry-run");

  const rows = await prisma.generatedContent.findMany({
    where: {
      contentType: "video",
      status: "published",
      videoPath: { not: null },
      ...(idArg ? { id: idArg } : {}),
    },
    select: { id: true, slug: true, title: true, videoPath: true, thumbnailPath: true, subsidyId: true },
    orderBy: { createdAt: "asc" },
  });

  console.log(`対象動画: ${rows.length}件${dryRun ? "（--dry-run: DB更新なし）" : ""}`);

  const tmpDir = path.join(process.cwd(), "scripts", "heygen", "output", "_thumb-extract-tmp");
  await fs.mkdir(tmpDir, { recursive: true });

  let ok = 0;
  let fail = 0;

  for (const row of rows) {
    const label = `${row.title ?? row.slug ?? row.id}`;
    try {
      if (!row.videoPath) throw new Error("videoPath が空です");
      console.log(`\n▶ ${label}`);
      console.log(`  動画DL: ${row.videoPath}`);
      const res = await fetch(row.videoPath);
      if (!res.ok) throw new Error(`動画ダウンロード失敗: HTTP ${res.status}`);
      const mp4Buf = Buffer.from(await res.arrayBuffer());

      const mp4Path = path.join(tmpDir, `${row.id}.mp4`);
      const pngPath = path.join(tmpDir, `${row.id}.png`);
      await fs.writeFile(mp4Path, mp4Buf);

      await extractFirstFrame(mp4Path, pngPath);
      const pngBuf = await fs.readFile(pngPath);
      console.log(`  フレーム抽出OK: ${(pngBuf.length / 1024).toFixed(0)} KB`);

      if (!dryRun) {
        const version = Date.now();
        const thumbUrl = await uploadToS3(
          pngBuf,
          `videos/${row.subsidyId}/thumbnail-slide1-${version}.png`,
          "image/png",
        );
        console.log(`  → S3: ${thumbUrl}`);
        await prisma.generatedContent.update({
          where: { id: row.id },
          data: { thumbnailPath: thumbUrl },
        });
        console.log(`  DB更新OK`);
      } else {
        console.log(`  [dry-run] ローカル保存のみ: ${pngPath}`);
      }

      // 後片付け（--dry-run 時は png を残して目視確認できるようにする）
      await fs.rm(mp4Path, { force: true });
      if (!dryRun) await fs.rm(pngPath, { force: true });

      ok++;
    } catch (e) {
      fail++;
      console.error(`  ✗ 失敗: ${(e as Error).message}`);
    }
  }

  console.log(`\n完了: 成功 ${ok}件 / 失敗 ${fail}件`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
