/**
 * HeyGen 生成動画を public/videos/ にダウンロードしてサイトから配信できるようにする
 * 実行: npx tsx scripts/heygen/_download-to-public.ts <video_id> <output-filename.mp4>
 */
import * as dotenv from "dotenv";
import * as path from "path";
import fs from "node:fs/promises";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const API_KEY = process.env.HEYGEN_API_KEY ?? "";
const [videoId, outName] = process.argv.slice(2);

if (!videoId || !outName) {
  console.error("使い方: npx tsx scripts/heygen/_download-to-public.ts <video_id> <output-filename.mp4>");
  process.exit(1);
}

async function main() {
  console.log("動画ステータス取得中...");
  const statusRes = await fetch(
    `https://api.heygen.com/v1/video_status.get?video_id=${videoId}`,
    { headers: { "X-Api-Key": API_KEY } },
  );
  const statusJson = (await statusRes.json()) as {
    data?: { status?: string; video_url?: string };
  };
  const videoUrl = statusJson.data?.video_url;
  console.log("status:", statusJson.data?.status);

  if (!videoUrl) {
    console.error("URLが取得できませんでした");
    process.exit(1);
  }

  console.log("ダウンロード中...");
  const dlRes = await fetch(videoUrl);
  if (!dlRes.ok) {
    console.error("HTTPエラー:", dlRes.status, dlRes.statusText);
    process.exit(1);
  }

  const buf = Buffer.from(await dlRes.arrayBuffer());
  const outDir = path.join(process.cwd(), "public", "videos");
  await fs.mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, outName);
  await fs.writeFile(outPath, buf);
  console.log(`✅ 保存完了: ${outPath}`);
  console.log(`   ファイルサイズ: ${(buf.length / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   配信URL: /videos/${outName}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
