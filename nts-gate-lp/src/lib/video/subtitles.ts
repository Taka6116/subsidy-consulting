import fs from "node:fs/promises";
import type { VideoScriptSection } from "@/lib/ai/bedrockVideoScriptGenerate";
import { VIDEO_FONT_FAMILY } from "@/lib/video/fonts";

function assTime(totalSec: number): string {
  const centis = Math.max(0, Math.round(totalSec * 100));
  const cs = centis % 100;
  const totalSeconds = Math.floor(centis / 100);
  const s = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const m = totalMinutes % 60;
  const h = Math.floor(totalMinutes / 60);
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
}

function escapeAss(text: string): string {
  return text
    .replace(/[{}]/g, "")
    .replace(/\r?\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function splitSubtitleText(text: string): string[] {
  const normalized = escapeAss(text);
  const chunks: string[] = [];
  let current = "";
  for (const ch of normalized) {
    current += ch;
    if (current.length >= 24 || /[。！？]/.test(ch)) {
      chunks.push(current);
      current = "";
    }
  }
  if (current) chunks.push(current);
  return chunks.filter(Boolean).slice(0, 6);
}

export async function writeAssSubtitles(
  sections: VideoScriptSection[],
  outputPath: string,
  opts?: { initialOffsetSec?: number },
): Promise<string> {
  const initialOffsetSec = opts?.initialOffsetSec ?? 0;
  const lines: string[] = [
    "[Script Info]",
    "ScriptType: v4.00+",
    "PlayResX: 1280",
    "PlayResY: 720",
    "",
    "[V4+ Styles]",
    "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
    `Style: Default,${VIDEO_FONT_FAMILY},38,&H00FFFFFF,&H00FFFFFF,&H80000000,&HAA000000,-1,0,0,0,100,100,0,0,1,4,1,2,80,80,46,1`,
    "",
    "[Events]",
    "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text",
  ];

  let cursor = initialOffsetSec;
  for (const section of sections) {
    const duration = Math.max(4, section.duration_sec ?? 12);
    const chunks = splitSubtitleText(section.text);
    const perChunk = duration / Math.max(chunks.length, 1);
    chunks.forEach((chunk, i) => {
      const start = cursor + i * perChunk;
      const end = i === chunks.length - 1 ? cursor + duration : cursor + (i + 1) * perChunk;
      lines.push(`Dialogue: 0,${assTime(start)},${assTime(end)},Default,,0,0,0,,${chunk}`);
    });
    cursor += duration;
  }

  await fs.writeFile(outputPath, lines.join("\n"), "utf-8");
  return outputPath;
}
