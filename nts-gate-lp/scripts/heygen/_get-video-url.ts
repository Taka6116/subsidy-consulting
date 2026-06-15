/**
 * 生成済み動画の最新 video_url を取得する
 * 実行: npx tsx scripts/heygen/_get-video-url.ts
 */
import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const API_KEY = process.env.HEYGEN_API_KEY ?? "";

const VIDEO_IDS = [
  "1fa8dd349d174a7a869b2b4089ff2670", // テスト①（日本語男性ボイス・アバターあり）
  "7058ee1b9e514b4aace07651515ee67e", // テスト②（桜庭さんボイス・アバターあり）
  "b4ca7c33dcfe43699c9fab0e778370e3", // テスト③（桜庭さんボイス・スライドのみ）
];

async function main() {
  for (const videoId of VIDEO_IDS) {
    const res = await fetch(
      `https://api.heygen.com/v1/video_status.get?video_id=${videoId}`,
      { headers: { "X-Api-Key": API_KEY } },
    );
    const json = await res.json() as {
      data?: { status?: string; video_url?: string; thumbnail_url?: string; error?: string };
    };
    const d = json.data ?? {};
    console.log(`\n── video_id: ${videoId}`);
    console.log(`   status      : ${d.status ?? "-"}`);
    console.log(`   video_url   : ${d.video_url ?? "(なし)"}`);
    console.log(`   thumbnail   : ${d.thumbnail_url ?? "(なし)"}`);
    if (d.error) console.log(`   error       : ${d.error}`);
  }
}

main().catch(console.error);
