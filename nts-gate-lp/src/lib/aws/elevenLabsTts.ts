/**
 * ElevenLabs で日本語ナレーションを生成し、MP3 を S3 に保存する。
 *
 * 必要な環境変数:
 *   ELEVENLABS_API_KEY   - ElevenLabs API key
 *   ELEVENLABS_VOICE_ID  - 利用する Voice ID
 * 任意:
 *   ELEVENLABS_MODEL_ID  - 既定: eleven_multilingual_v2
 *   VIDEO_S3_BUCKET      - 保存先 S3 バケット
 *   VIDEO_S3_BASE_URL    - CloudFront または S3 の公開URL
 */

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import type { PollyTtsResult } from "@/lib/aws/pollyTts";

const LOG_PREFIX = "[elevenLabsTts]";
const ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1";

export async function synthesizeElevenLabsAndUpload(
  text: string,
  subsidyId: string,
): Promise<PollyTtsResult | null> {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  const voiceId = process.env.ELEVENLABS_VOICE_ID?.trim();
  const modelId = process.env.ELEVENLABS_MODEL_ID?.trim() || "eleven_multilingual_v2";
  const s3Region = process.env.VIDEO_S3_REGION ?? process.env.AWS_REGION ?? "ap-northeast-1";
  const bucket = process.env.VIDEO_S3_BUCKET;
  const baseUrl = process.env.VIDEO_S3_BASE_URL;

  if (!bucket) {
    console.error(LOG_PREFIX, "VIDEO_S3_BUCKET is not set");
    return null;
  }
  if (!apiKey || !voiceId) {
    console.warn(LOG_PREFIX, "ELEVENLABS_API_KEY or ELEVENLABS_VOICE_ID is not set");
    return null;
  }

  try {
    const url = `${ELEVENLABS_BASE_URL}/text-to-speech/${encodeURIComponent(
      voiceId,
    )}?output_format=mp3_44100_128`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: modelId,
        voice_settings: {
          stability: Number(process.env.ELEVENLABS_STABILITY ?? 0.48),
          similarity_boost: Number(process.env.ELEVENLABS_SIMILARITY_BOOST ?? 0.8),
          style: Number(process.env.ELEVENLABS_STYLE ?? 0.25),
          use_speaker_boost: process.env.ELEVENLABS_SPEAKER_BOOST !== "false",
        },
      }),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      console.error(LOG_PREFIX, "request failed", res.status, errorText.slice(0, 300));
      return null;
    }

    const audioBuffer = Buffer.from(await res.arrayBuffer());
    const s3 = new S3Client({ region: s3Region });
    const s3Key = `videos/${subsidyId}/audio-elevenlabs-${Date.now()}.mp3`;

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: s3Key,
        Body: audioBuffer,
        ContentType: "audio/mpeg",
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );

    const publicUrl = baseUrl
      ? `${baseUrl}/${s3Key}`
      : `https://${bucket}.s3.${s3Region}.amazonaws.com/${s3Key}`;
    const durationSec = estimateDurationFromText(text);

    console.log(LOG_PREFIX, `uploaded audio: ${s3Key} (~${durationSec}s)`);
    return { s3Key, publicUrl, durationSec };
  } catch (err) {
    console.error(LOG_PREFIX, err);
    return null;
  }
}

function estimateDurationFromText(text: string): number {
  const charCount = text.replace(/\s/g, "").length;
  return Math.round(charCount / 7);
}

