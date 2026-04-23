-- AlterTable: add video-related fields to generated_contents
ALTER TABLE "generated_contents" ADD COLUMN IF NOT EXISTS "audio_path" TEXT;
ALTER TABLE "generated_contents" ADD COLUMN IF NOT EXISTS "video_path" TEXT;
ALTER TABLE "generated_contents" ADD COLUMN IF NOT EXISTS "duration" INTEGER;
