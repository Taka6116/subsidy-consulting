import fs from "node:fs/promises";
import path from "node:path";
import type { GeneratedVideoScript } from "@/lib/ai/bedrockVideoScriptGenerate";

const LOG_PREFIX = "[stockFootage]";

export type StockClip = {
  sectionIndex: number;
  query: string;
  source: "pexels" | "pixabay";
  filePath: string;
  credit?: string;
};

export type StockFootageResult = {
  clips: StockClip[];
  attemptedQueries: number;
  matchedQueries: number;
  pexelsConfigured: boolean;
  pixabayConfigured: boolean;
};

type PexelsVideoFile = {
  link?: string;
  quality?: string;
  width?: number;
  height?: number;
};

type PexelsVideo = {
  user?: { name?: string };
  video_files?: PexelsVideoFile[];
};

type PexelsResponse = {
  videos?: PexelsVideo[];
};

type PixabayVideo = {
  videos?: {
    large?: { url?: string; width?: number; height?: number };
    medium?: { url?: string; width?: number; height?: number };
    small?: { url?: string; width?: number; height?: number };
  };
  user?: string;
};

type PixabayResponse = {
  hits?: PixabayVideo[];
};

function cleanQuery(query: string): string {
  return query.replace(/[^a-z0-9\s-]/gi, " ").replace(/\s+/g, " ").trim().slice(0, 80);
}

function uniqueQueries(script: GeneratedVideoScript, sectionIndex: number): string[] {
  const section = script.sections[sectionIndex];
  const raw = [...(section?.visual_keywords ?? []), ...(script.stock_keywords ?? []), ...script.tags];
  return Array.from(new Set(raw.map(cleanQuery).filter(Boolean))).slice(0, 4);
}

async function downloadFile(url: string, filePath: string): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download failed: HTTP ${res.status} ${url}`);
  const arrayBuffer = await res.arrayBuffer();
  await fs.writeFile(filePath, Buffer.from(arrayBuffer));
}

function pickPexelsFile(video: PexelsVideo): string | null {
  const files = video.video_files ?? [];
  const candidates = files
    .filter((file) => file.link && (file.width ?? 0) >= 960 && (file.height ?? 0) >= 540)
    .sort((a, b) => {
      const aq = a.quality === "hd" ? 0 : 1;
      const bq = b.quality === "hd" ? 0 : 1;
      return aq - bq || Math.abs((a.width ?? 1280) - 1280) - Math.abs((b.width ?? 1280) - 1280);
    });
  return candidates[0]?.link ?? files.find((file) => file.link)?.link ?? null;
}

async function searchPexels(query: string): Promise<{ url: string; credit?: string } | null> {
  const key = process.env.PEXELS_API_KEY?.trim();
  if (!key) return null;
  const url = new URL("https://api.pexels.com/videos/search");
  url.searchParams.set("query", query);
  url.searchParams.set("orientation", "landscape");
  url.searchParams.set("size", "medium");
  url.searchParams.set("per_page", "5");

  const res = await fetch(url, { headers: { Authorization: key } });
  if (!res.ok) throw new Error(`Pexels search failed: HTTP ${res.status}`);
  const data = (await res.json()) as PexelsResponse;
  for (const video of data.videos ?? []) {
    const fileUrl = pickPexelsFile(video);
    if (fileUrl) return { url: fileUrl, credit: video.user?.name ? `Pexels: ${video.user.name}` : "Pexels" };
  }
  return null;
}

function pickPixabayUrl(video: PixabayVideo): string | null {
  return video.videos?.large?.url ?? video.videos?.medium?.url ?? video.videos?.small?.url ?? null;
}

async function searchPixabay(query: string): Promise<{ url: string; credit?: string } | null> {
  const key = process.env.PIXABAY_API_KEY?.trim();
  if (!key) return null;
  const url = new URL("https://pixabay.com/api/videos/");
  url.searchParams.set("key", key);
  url.searchParams.set("q", query);
  url.searchParams.set("orientation", "horizontal");
  url.searchParams.set("safesearch", "true");
  url.searchParams.set("per_page", "5");

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Pixabay search failed: HTTP ${res.status}`);
  const data = (await res.json()) as PixabayResponse;
  for (const video of data.hits ?? []) {
    const fileUrl = pickPixabayUrl(video);
    if (fileUrl) return { url: fileUrl, credit: video.user ? `Pixabay: ${video.user}` : "Pixabay" };
  }
  return null;
}

async function findStockVideo(query: string): Promise<{ url: string; source: "pexels" | "pixabay"; credit?: string } | null> {
  const pexels = await searchPexels(query).catch((e) => {
    console.warn(`${LOG_PREFIX} Pexels failed query="${query}"`, e);
    return null;
  });
  if (pexels) return { ...pexels, source: "pexels" };

  const pixabay = await searchPixabay(query).catch((e) => {
    console.warn(`${LOG_PREFIX} Pixabay failed query="${query}"`, e);
    return null;
  });
  if (pixabay) return { ...pixabay, source: "pixabay" };

  return null;
}

export async function downloadStockFootageForScript(
  script: GeneratedVideoScript,
  outputDir: string,
  maxClips = 4,
): Promise<StockFootageResult> {
  const pexelsConfigured = !!process.env.PEXELS_API_KEY?.trim();
  const pixabayConfigured = !!process.env.PIXABAY_API_KEY?.trim();
  const result: StockFootageResult = {
    clips: [],
    attemptedQueries: 0,
    matchedQueries: 0,
    pexelsConfigured,
    pixabayConfigured,
  };

  if (!pexelsConfigured && !pixabayConfigured) {
    console.warn(`${LOG_PREFIX} no stock API key configured`);
    return result;
  }

  await fs.mkdir(outputDir, { recursive: true });
  const usedQueries = new Set<string>();

  for (let i = 0; i < script.sections.length && result.clips.length < maxClips; i++) {
    const queries = uniqueQueries(script, i).filter((query) => !usedQueries.has(query));
    for (const query of queries) {
      usedQueries.add(query);
      result.attemptedQueries += 1;
      const found = await findStockVideo(query);
      if (!found) continue;

      const filePath = path.join(outputDir, `stock-${String(i).padStart(2, "0")}-${result.clips.length}.mp4`);
      await downloadFile(found.url, filePath);
      result.clips.push({ sectionIndex: i, query, source: found.source, filePath, credit: found.credit });
      result.matchedQueries += 1;
      console.log(`${LOG_PREFIX} downloaded ${found.source} clip section=${i} query="${query}"`);
      break;
    }
  }

  console.log(
    `${LOG_PREFIX} result clips=${result.clips.length} attempted=${result.attemptedQueries} pexels=${pexelsConfigured} pixabay=${pixabayConfigured}`,
  );
  return result;
}
