import * as dotenv from "dotenv";
import * as path from "path";
import fs from "node:fs/promises";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const API_KEY = process.env.HEYGEN_API_KEY ?? "";
const VIDEO_ID = "be940b1bd9714b8881dac7ccd1eb8207";

async function main() {
  console.log("動画ステータス取得中...");
  const statusRes = await fetch(
    `https://api.heygen.com/v1/video_status.get?video_id=${VIDEO_ID}`,
    { headers: { "X-Api-Key": API_KEY } }
  );
  const statusJson = (await statusRes.json()) as any;
  const videoUrl: string = statusJson.data?.video_url;
  console.log("status:", statusJson.data?.status);
  console.log("video_url:", videoUrl);

  if (!videoUrl) {
    console.error("URLが取得できませんでした");
    return;
  }

  console.log("\nダウンロード中...");
  const dlRes = await fetch(videoUrl);
  console.log("HTTP status:", dlRes.status, dlRes.statusText);

  if (!dlRes.ok) {
    const body = await dlRes.text();
    console.error("エラーレスポンス:", body.slice(0, 500));
    return;
  }

  const buf = Buffer.from(await dlRes.arrayBuffer());
  const outDir = path.join(process.cwd(), "scripts/heygen/output");
  await fs.mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, "slide-video-6scenes-v5.mp4");
  await fs.writeFile(outPath, buf);
  console.log(`\n✅ 保存完了: ${outPath}`);
  console.log(`   ファイルサイズ: ${(buf.length / 1024 / 1024).toFixed(2)} MB`);
}

main().catch(console.error);
