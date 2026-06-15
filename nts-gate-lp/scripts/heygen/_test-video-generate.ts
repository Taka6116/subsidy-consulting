/**
 * HeyGen video.generate API エンドポイントのテスト
 * 前回アップロード済みのアセット URL を使って各エンドポイントを試す
 * 実行: npx tsx scripts/heygen/_test-video-generate.ts
 */
import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const API_KEY = process.env.HEYGEN_API_KEY ?? "";
const SAKURABA_VOICE_ID = "6c2b2c234a604057a90578e18e10c211";

// 前回アップロード済みのスライド URL（最新実行分）
const TEST_ASSET_URL = "https://resource2.heygen.ai/image/b69fe0c7b8524e118d3a8f1308ca103e/original.png";

const TEST_NARRATION = "本動画では、中小・小規模企業向けのデジタル技術導入補助金についてご説明します。";

const ENDPOINTS = [
  "https://api.heygen.com/v1/video.generate",
  "https://api.heygen.com/v2/video.generate",
  "https://api.heygen.com/v2/video/generate",
  "https://api.heygen.com/v3/videos",
  "https://api.heygen.com/v1/videos",
];

async function tryEndpoint(endpoint: string) {
  console.log(`\n── Testing: ${endpoint}`);

  const body = {
    video_inputs: [
      {
        // character フィールドなし（アバターなし）
        voice: {
          type: "text",
          input_text: TEST_NARRATION,
          voice_id: SAKURABA_VOICE_ID,
          speed: 1.0,
        },
        background: {
          type: "image",
          url: TEST_ASSET_URL,
        },
      },
    ],
    dimension: { width: 1280, height: 720 },
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "X-Api-Key": API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  console.log(`   status: ${res.status}`);
  console.log(`   body  : ${text.slice(0, 400)}`);
}

async function main() {
  for (const ep of ENDPOINTS) {
    await tryEndpoint(ep);
  }
}

main().catch(console.error);
