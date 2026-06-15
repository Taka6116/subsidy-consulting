/**
 * HeyGen API 動画自動生成スクリプト
 * 実行: npx tsx scripts/heygen/generate-video.ts
 *
 * Step 1: アバター・ボイス一覧を取得し、Kenji / 桜庭さんを特定
 * Step 2: テスト動画を生成
 * Step 3: ステータスをポーリングして video_url を取得
 */

import * as dotenv from "dotenv";
import * as path from "path";

// cwd（= プロジェクトルート）の .env を明示的に読み込む
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const API_KEY = process.env.HEYGEN_API_KEY;
if (!API_KEY) {
  console.error("❌ HEYGEN_API_KEY が .env に設定されていません。");
  process.exit(1);
}

const HEADERS = {
  "X-Api-Key": API_KEY,
  "Content-Type": "application/json",
} as const;

// ─── 固定パラメータ ────────────────────────────────────────────
/** Kenji アバター（HeyGen 公式） */
const KENJI_AVATAR_ID = "d23aaf20be1c43b490381f567ce779d4";
/** 桜庭さんのボイスクローン */
const SAKURABA_VOICE_ID = "6c2b2c234a604057a90578e18e10c211";
/**
 * NTS コーポレート背景画像（public/heygen/bg-nts-corporate.png）
 * Vercel デプロイ後の公開 URL を指定。ローカル実行時はデプロイ済み URL を使用。
 */
const BG_IMAGE_URL = "https://subsidy-consulting-nts.vercel.app/heygen/bg-nts-corporate.png";

// ─── Step 1: アバター・ボイス一覧取得 ─────────────────────────

type Avatar = {
  avatar_id: string;
  avatar_name: string;
  gender?: string;
  preview_image_url?: string;
  preview_video_url?: string;
};

type Voice = {
  voice_id: string;
  language: string | null;
  gender?: string | null;
  name?: string | null;
  display_name?: string | null;
  labels?: Record<string, string> | null;
};

async function fetchAvatars(): Promise<Avatar[]> {
  console.log("\n━━━ Step 1-A: アバター一覧取得 ━━━");
  const res = await fetch("https://api.heygen.com/v2/avatars", {
    headers: HEADERS,
  });
  if (!res.ok) throw new Error(`avatars API エラー: ${res.status} ${await res.text()}`);
  const json = (await res.json()) as { data?: { avatars?: Avatar[] } };
  const avatars = json.data?.avatars ?? [];
  console.log(`✅ ${avatars.length} 件取得`);
  console.log("\n【全アバター一覧】");
  for (const a of avatars) {
    console.log(`  ${a.avatar_id} | ${a.avatar_name} | gender:${a.gender ?? "-"}`);
  }
  return avatars;
}

async function fetchVoices(): Promise<Voice[]> {
  console.log("\n━━━ Step 1-B: ボイス一覧取得 ━━━");
  const res = await fetch("https://api.heygen.com/v1/voice.list", {
    headers: HEADERS,
  });
  if (!res.ok) throw new Error(`voices API エラー: ${res.status} ${await res.text()}`);
  // HeyGen v1 voice.list は data.list を使用（data.voices ではない）
  const json = (await res.json()) as { data?: { list?: Voice[]; voices?: Voice[] } };
  const voices = json.data?.list ?? json.data?.voices ?? [];
  console.log(`✅ ${voices.length} 件取得`);
  // 日本語ボイスのみ一覧表示
  const jaVoices = voices.filter(
    (v) => v.language === "Japanese" || v.language?.toLowerCase().startsWith("ja"),
  );
  console.log(`\n【日本語ボイス一覧 (${jaVoices.length}件)】`);
  for (const v of jaVoices) {
    const labelStr = v.labels ? JSON.stringify(v.labels) : "-";
    console.log(`  ${v.voice_id} | gender:${v.gender ?? "-"} | labels:${labelStr}`);
  }
  return voices;
}

function findKenji(avatars: Avatar[]): string {
  // 固定値が一覧に存在するか確認し、あればそれを使用
  const confirmed = avatars.find((a) => a.avatar_id === KENJI_AVATAR_ID);
  if (confirmed) {
    console.log(`\n🎯 Kenji avatar_id: ${KENJI_AVATAR_ID} (${confirmed.avatar_name})`);
  } else {
    console.warn(`\n⚠️  KENJI_AVATAR_ID がアバター一覧に見つかりませんでした。固定値をそのまま使用します。`);
  }
  return KENJI_AVATAR_ID;
}

function findSakuraba(voices: Voice[]): string {
  // 固定値が一覧に存在するか確認
  const confirmed = voices.find((v) => v.voice_id === SAKURABA_VOICE_ID);
  if (confirmed) {
    console.log(`\n🎯 桜庭さん voice_id: ${SAKURABA_VOICE_ID} ✅`);
  } else {
    console.warn(`\n⚠️  SAKURABA_VOICE_ID がボイス一覧に見つかりませんでした。固定値をそのまま使用します。`);
  }
  return SAKURABA_VOICE_ID;
}

// ─── Step 2: 動画生成 ──────────────────────────────────────────

const SCRIPT_TEXT =
  "人手不足や設備の老朽化で、日々の業務がギリギリになっていませんか？" +
  "実は今、その課題解決に使える補助金が公募されています。" +
  "御社で活用できる補助金があるかどうか、まず無料でご確認ください。";

async function generateVideo(avatarId: string, voiceId: string): Promise<string> {
  console.log("\n━━━ Step 2: 動画生成リクエスト ━━━");
  console.log(`  avatar_id : ${avatarId}`);
  console.log(`  voice_id  : ${voiceId}`);
  console.log(`  script    : ${SCRIPT_TEXT}`);

  const body = {
    video_inputs: [
      {
        character: {
          type: "avatar",
          avatar_id: avatarId,
          avatar_style: "normal",
        },
        voice: {
          type: "text",
          voice_id: voiceId,
          input_text: SCRIPT_TEXT,
        },
        background: {
          type: "image",
          url: BG_IMAGE_URL,
        },
      },
    ],
    dimension: { width: 1280, height: 720 },
    title: "NTS_TEST_20260601_資格取得サポート助成金_桜庭様",
  };

  const res = await fetch("https://api.heygen.com/v2/video/generate", {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as { data?: { video_id?: string }; error?: unknown };
  if (!res.ok || !json.data?.video_id) {
    throw new Error(`動画生成 API エラー: ${res.status} ${JSON.stringify(json)}`);
  }
  const videoId = json.data.video_id;
  console.log(`✅ video_id: ${videoId}`);
  return videoId;
}

// ─── Step 3: ステータスポーリング ─────────────────────────────

type StatusResponse = {
  data?: {
    status?: string;
    video_url?: string;
    error?: string;
  };
};

async function pollStatus(videoId: string): Promise<void> {
  console.log(`\n━━━ Step 3: ステータス確認ポーリング (video_id: ${videoId}) ━━━`);

  const TIMEOUT_MS = 5 * 60 * 1000; // 5分
  const INTERVAL_MS = 5_000;
  const start = Date.now();
  let attempt = 0;

  while (Date.now() - start < TIMEOUT_MS) {
    attempt++;
    await sleep(INTERVAL_MS);

    const res = await fetch(
      `https://api.heygen.com/v1/video_status.get?video_id=${videoId}`,
      { headers: HEADERS },
    );
    const json = (await res.json()) as StatusResponse;
    const status = json.data?.status ?? "unknown";
    const elapsed = Math.round((Date.now() - start) / 1000);

    console.log(`  [${elapsed}s / 試行${attempt}回目] status: ${status}`);

    if (status === "completed") {
      const videoUrl = json.data?.video_url ?? "";
      console.log("\n🎉 動画生成完了！");
      console.log(`  video_url : ${videoUrl}`);
      console.log(`  video_id  : ${videoId}`);
      return;
    }

    if (status === "failed") {
      const errMsg = json.data?.error ?? "(詳細なし)";
      console.error(`\n❌ 動画生成失敗: ${errMsg}`);
      process.exit(1);
    }
  }

  console.error(`\n⏱️  タイムアウト（5分経過）。video_id: ${videoId} のステータスを HeyGen ダッシュボードで確認してください。`);
  process.exit(1);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── エントリーポイント ────────────────────────────────────────
async function main() {
  console.log("╔══════════════════════════════════════════════════════╗");
  console.log("║   HeyGen 動画自動生成スクリプト  NTS                ║");
  console.log("╚══════════════════════════════════════════════════════╝");

  // Step 1
  const [avatars, voices] = await Promise.all([fetchAvatars(), fetchVoices()]);
  const avatarId = findKenji(avatars);
  const voiceId = findSakuraba(voices);

  // findKenji / findSakuraba は固定値を返すため null にならない

  console.log("\n━━━ 確定パラメータ ━━━");
  console.log(`  avatar_id : ${avatarId}`);
  console.log(`  voice_id  : ${voiceId}`);

  // Step 2
  const videoId = await generateVideo(avatarId, voiceId);

  // Step 3
  await pollStatus(videoId);
}

main().catch((err) => {
  console.error("予期しないエラー:", err);
  process.exit(1);
});
