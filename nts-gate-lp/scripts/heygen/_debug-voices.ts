import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const API_KEY = process.env.HEYGEN_API_KEY ?? "";

type VoiceRaw = {
  voice_id: string;
  language: string | null;
  gender: string | null;
  name?: string | null;
  display_name?: string | null;
  creator_username?: string | null;
  user_voice_clone_id?: string | null;
  status?: string | null;
  is_shared?: boolean;
  labels?: Record<string, string> | null;
};

async function main() {
  const res = await fetch("https://api.heygen.com/v1/voice.list", {
    headers: { "X-Api-Key": API_KEY },
  });
  const json = await res.json() as { data?: { list?: VoiceRaw[] } };
  const voices = json.data?.list ?? [];
  console.log(`全ボイス: ${voices.length}件`);

  const ja = voices.filter((v) =>
    v.language === "Japanese" ||
    v.language?.toLowerCase().startsWith("ja"),
  );
  console.log(`\n── 日本語ボイス一覧 (${ja.length}件) ──`);
  for (const v of ja) {
    const label = JSON.stringify(v.labels ?? {}).slice(0, 60);
    console.log(
      [
        v.voice_id,
        `gender:${v.gender ?? "-"}`,
        `creator:${v.creator_username ?? "-"}`,
        `clone_id:${v.user_voice_clone_id ?? "-"}`,
        `labels:${label}`,
      ].join(" | "),
    );
  }

  // カスタムクローンボイスを探す（桜庭さんの可能性）
  const clones = voices.filter((v) => v.user_voice_clone_id && v.user_voice_clone_id !== "");
  console.log(`\n── カスタムクローンボイス (${clones.length}件) ──`);
  for (const v of clones) {
    console.log(JSON.stringify(v, null, 2));
  }
}

main().catch(console.error);
