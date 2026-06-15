/**
 * 既存アセット URL から直接スライド動画を生成（DB不要）
 * 実行: npx tsx scripts/heygen/_generate-from-assets.ts
 */
import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const API_KEY = process.env.HEYGEN_API_KEY ?? "";
const SAKURABA_VOICE_ID = "6c2b2c234a604057a90578e18e10c211";
const HEYGEN_BASE = "https://api.heygen.com";

// ── 前回アップロード済みアセット（最新実行: 中小・小規模企業デジタル技術導入等緊急支援事業費補助金）
const ASSET_URLS = [
  "https://resource2.heygen.ai/image/b69fe0c7b8524e118d3a8f1308ca103e/original.png", // slide-1
  "https://resource2.heygen.ai/image/5a004de90f454a7e95e2cda81bf3672d/original.png", // slide-2
  "https://resource2.heygen.ai/image/bc0ec3bc96e141daa3be2b8605ecea88/original.png", // slide-3
  "https://resource2.heygen.ai/image/d913f8ecb47e411f98df0d118b3395b0/original.png", // slide-4
  "https://resource2.heygen.ai/image/bb9caecb8e9c4c56a96b47624b714faf/original.png", // slide-5
  "https://resource2.heygen.ai/image/a1fce36d71c74acdae15b8814285c9fe/original.png", // slide-6
];

const NARRATIONS = [
  "本動画では、中小・小規模企業デジタル技術導入等緊急支援事業費について、わかりやすくご説明します。",
  "こちらは、エネルギー価格高止まり等の影響を受けている中小・小規模企業の生産性向上等を図るため、デジタル技術の導入を支援する補助金。多くの事業者が、内容を知らないまま申請期限を迎えてしまっています。",
  "補助の上限は最大3,000,000円。申請期限: 2025年5月19日。対象: 道内の中小・小規模企業等（みなし大企業を除く）が対象です。詳しくは公式の公募要領をご確認ください。",
  "この補助金は、たとえば、業務システム・クラウドツールの導入費用に活用。また、RPA・省力化ツールによる業務自動化に活用など、幅広い使い道があります。",
  "より具体的には、会計・在庫・顧客管理などの業務システムを導入。受発注や予約をオンライン化し、手作業を削減。RPAやクラウドツールで定型業務を自動化、といった形で活用できます。御社の状況に合わせて、最適な使い方をご提案します。",
  "補助金のご相談は、にほんていけいしえんまで、お気軽にどうぞ。画面のキューアールコードから、無料診断ページにアクセスいただけます。",
];

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

async function generateSlideVideo(): Promise<string> {
  console.log("\n━━━ /v2/video/generate でスライド動画生成 ━━━");

  const video_inputs = NARRATIONS.map((text, i) => ({
    voice: {
      type: "text",
      input_text: text,
      voice_id: SAKURABA_VOICE_ID,
      speed: 1.0,
    },
    background: {
      type: "image",
      url: ASSET_URLS[i],
    },
  }));

  const body = {
    video_inputs,
    dimension: { width: 1280, height: 720 },
  };

  console.log(`  scenes   : ${video_inputs.length}`);
  console.log(`  voice_id : ${SAKURABA_VOICE_ID}`);

  const res = await fetch(`${HEYGEN_BASE}/v2/video/generate`, {
    method: "POST",
    headers: {
      "X-Api-Key": API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  console.log(`  HTTP: ${res.status}  body: ${text.slice(0, 300)}`);

  const json = JSON.parse(text) as { data?: { video_id?: string }; error?: unknown };
  if (!res.ok || !json.data?.video_id) {
    throw new Error(`エラー: ${res.status} ${JSON.stringify(json)}`);
  }

  return json.data.video_id;
}

async function pollVideo(videoId: string): Promise<void> {
  console.log(`\n━━━ ポーリング (video_id: ${videoId}) ━━━`);
  const TIMEOUT = 15 * 60 * 1000;
  const start = Date.now();

  while (Date.now() - start < TIMEOUT) {
    await sleep(10000);
    const res = await fetch(
      `${HEYGEN_BASE}/v1/video_status.get?video_id=${videoId}`,
      { headers: { "X-Api-Key": API_KEY } },
    );
    const json = (await res.json()) as {
      data?: { status?: string; video_url?: string; thumbnail_url?: string; error?: string };
    };
    const status = json.data?.status ?? "unknown";
    const elapsed = Math.round((Date.now() - start) / 1000);
    console.log(`  [${elapsed}s] status: ${status}`);

    if (status === "completed") {
      console.log("\n🎉 完了！");
      console.log(`  video_url : ${json.data?.video_url}`);
      console.log(`  video_id  : ${videoId}`);
      return;
    }
    if (status === "failed") {
      throw new Error(`失敗: ${json.data?.error ?? "(詳細なし)"}`);
    }
  }
  throw new Error("タイムアウト");
}

async function main() {
  const videoId = await generateSlideVideo();
  await pollVideo(videoId);
}

main().catch(console.error);
