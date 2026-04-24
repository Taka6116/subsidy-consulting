import type { Metadata } from "next";
import Header from "@/components/shared/Header";
import LpFooter from "@/components/gate-lp/LpFooter";
import { prisma } from "@/lib/db/prisma";
import SubsidiesVideosIndex, { type VideoCard } from "./SubsidiesVideosIndex";

export const metadata: Metadata = {
  title: "補助金解説動画 | 日本提携支援",
  description: "補助金の概要・活用例・申請ポイントをわかりやすく解説した音声付き動画です。",
};

export const revalidate = 300;

function formatPublishedAt(date: Date | null): string {
  if (!date) return "";
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
}

const DEADLINE_MAX = new Date("2050-01-01");

function formatDeadlineLabelForCard(
  deadlineLabel: string | null | undefined,
  deadline: Date | null | undefined,
  rawPayload: unknown,
): string | null {
  const raw = rawPayload as Record<string, unknown> | null;
  const dateFromRaw = raw?.application_end_date
    ? new Date(String(raw.application_end_date))
    : null;

  const candidates = [
    deadline instanceof Date ? deadline : null,
    dateFromRaw,
    deadlineLabel ? new Date(deadlineLabel) : null,
  ];

  for (const d of candidates) {
    if (d && !Number.isNaN(d.getTime()) && d < DEADLINE_MAX) {
      return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
    }
  }
  return null;
}

function formatMaxAmount(
  label: string | null | undefined,
  amountYen: bigint | null | undefined,
): string | null {
  const pick = (s: string | null | undefined) => (s ? s.trim() : "");
  const raw = pick(label);
  if (raw) {
    return raw.startsWith("最大") ? raw : `最大 ${raw}`;
  }
  if (amountYen == null) return null;
  const yen = Number(amountYen);
  if (!Number.isFinite(yen) || yen <= 0) return null;
  const man = yen / 10000;
  if (man >= 10000) {
    const oku = man / 10000;
    return `最大 ${oku.toFixed(oku >= 10 ? 0 : 1)}億円`;
  }
  return `最大 ${Math.round(man).toLocaleString("ja-JP")}万円`;
}

export default async function SubsidiesVideosPage() {
  const rows = await prisma.generatedContent.findMany({
    where: {
      contentType: "video",
      status: "published",
      slug: { not: undefined },
    },
    orderBy: { publishedAt: "desc" },
    take: 60,
    include: {
      grant: {
        select: {
          name: true,
          maxAmountLabel: true,
          subsidyAmount: true,
          deadlineLabel: true,
          deadline: true,
          rawPayload: true,
          prefecture: true,
        },
      },
    },
  });

  const videos: VideoCard[] = rows
    .filter((r) => r.slug && r.title)
    .map((r) => ({
      id: r.id,
      slug: r.slug as string,
      title: r.title as string,
      excerpt: r.excerpt ?? "",
      publishedAt: formatPublishedAt(r.publishedAt),
      subsidyName: r.grant?.name ?? "",
      maxAmountLabel: formatMaxAmount(
        r.grant?.maxAmountLabel,
        r.grant?.subsidyAmount,
      ),
      deadlineLabel: formatDeadlineLabelForCard(
        r.grant?.deadlineLabel,
        r.grant?.deadline,
        r.grant?.rawPayload,
      ),
      prefecture: r.grant?.prefecture ?? null,
      tags: r.tags ?? [],
      duration: r.duration ?? null,
      audioPath: r.audioPath ?? null,
      videoPath: r.videoPath ?? null,
      thumbnailPath: r.thumbnailPath ?? null,
    }));

  return (
    <>
      <Header />
      <main className="relative z-[2] min-h-[100svh] bg-[#f9f7f2] pt-16 font-body sm:pt-20">
        <SubsidiesVideosIndex videos={videos} />
      </main>
      <LpFooter />
    </>
  );
}
