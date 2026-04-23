/**
 * AWS Polly で日本語テキストを MP3 に変換し、S3 に保存する。
 * 音声エンジン: neural（高品質）
 * 音声モデル: Takumi（男性）または Kazuha（女性）
 *
 * 必要な環境変数:
 *   AWS_REGION         - ap-northeast-1 等
 *   VIDEO_S3_BUCKET    - 動画・音声ファイルの保存先 S3 バケット名
 *   VIDEO_S3_BASE_URL  - CloudFront または S3 の公開 URL（末尾スラッシュなし）
 *                        例: https://d1234abcd.cloudfront.net
 */

import {
  PollyClient,
  SynthesizeSpeechCommand,
  type Engine,
  type LanguageCode,
  type OutputFormat,
  type VoiceId,
} from "@aws-sdk/client-polly";
import {
  S3Client,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

const LOG_PREFIX = "[pollyTts]";

export type PollyTtsResult = {
  s3Key: string;
  publicUrl: string;
  durationSec: number | null;
};

/**
 * テキストを Polly で音声合成し、S3 に保存して公開 URL を返す。
 * @param text       ナレーションテキスト
 * @param subsidyId  補助金 ID（S3 キーのパスに使用）
 * @param voiceId    "Takumi"（男性・デフォルト）または "Kazuha"（女性）
 */
export async function synthesizeAndUpload(
  text: string,
  subsidyId: string,
  voiceId: VoiceId = "Takumi",
): Promise<PollyTtsResult | null> {
  // Polly の日本語 neural 音声は ap-northeast-1 でのみ利用可能
  const pollyRegion = process.env.VIDEO_S3_REGION ?? "ap-northeast-1";
  const s3Region = process.env.VIDEO_S3_REGION ?? process.env.AWS_REGION ?? "ap-northeast-1";
  const bucket = process.env.VIDEO_S3_BUCKET;
  const baseUrl = process.env.VIDEO_S3_BASE_URL;

  if (!bucket) {
    console.error(LOG_PREFIX, "VIDEO_S3_BUCKET is not set");
    return null;
  }

  const polly = new PollyClient({ region: pollyRegion });
  const s3 = new S3Client({ region: s3Region });

  const s3Key = `videos/${subsidyId}/audio.mp3`;

  try {
    const pollyCommand = new SynthesizeSpeechCommand({
      Text: text,
      VoiceId: voiceId,
      Engine: "neural" as Engine,
      LanguageCode: "ja-JP" as LanguageCode,
      OutputFormat: "mp3" as OutputFormat,
    });

    const pollyResponse = await polly.send(pollyCommand);

    if (!pollyResponse.AudioStream) {
      console.error(LOG_PREFIX, "Polly returned no AudioStream");
      return null;
    }

    const audioBuffer = await streamToBuffer(pollyResponse.AudioStream as AsyncIterable<Uint8Array>);

    const putCommand = new PutObjectCommand({
      Bucket: bucket,
      Key: s3Key,
      Body: audioBuffer,
      ContentType: "audio/mpeg",
      CacheControl: "public, max-age=86400",
    });

    await s3.send(putCommand);

    const publicUrl = baseUrl
      ? `${baseUrl}/${s3Key}`
      : `https://${bucket}.s3.${s3Region}.amazonaws.com/${s3Key}`;

    const durationSec = estimateDurationFromText(text);

    console.log(LOG_PREFIX, `uploaded audio: ${s3Key} (~${durationSec}s)`);

    return { s3Key, publicUrl, durationSec };
  } catch (err) {
    console.error(LOG_PREFIX, "Polly/S3 error", err);
    return null;
  }
}

async function streamToBuffer(stream: AsyncIterable<Uint8Array>): Promise<Buffer> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

/**
 * テキスト文字数から概算の読み上げ時間（秒）を算出する。
 * 日本語の平均読み上げ速度: 約 400〜450 文字/分 → 7 文字/秒 で概算。
 */
function estimateDurationFromText(text: string): number {
  const charCount = text.replace(/\s/g, "").length;
  return Math.round(charCount / 7);
}
