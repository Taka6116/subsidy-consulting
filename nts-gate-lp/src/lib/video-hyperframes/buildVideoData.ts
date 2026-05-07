import type { GeneratedContent, SubsidyGrant } from "@prisma/client";
import { buildSubsidyLpData } from "@/lib/subsidy-lp/buildSubsidyLpData";
import { cleanSubsidyName } from "@/lib/subsidyCheckResultHelpers";

export type HyperframesSceneType =
  | "hook"
  | "overview"
  | "useCases"
  | "cta";

export type HyperframesCaption = {
  start: number;
  end: number;
  text: string;
};

export type HyperframesUseCase = {
  persona: string;
  label: string;
  body: string;
  image: string;
};

export type HyperframesMetric = {
  label: string;
  value: string;
  note?: string;
};

export type HyperframesScene = {
  id: HyperframesSceneType;
  start: number;
  duration: number;
  kicker: string;
  title: string;
  lines: string[];
  voiceover: string;
  captions: HyperframesCaption[];
  metrics?: HyperframesMetric[];
  useCases?: HyperframesUseCase[];
  steps?: string[];
};

export type HyperframesVideoData = {
  id: string;
  title: string;
  subsidyName: string;
  lpUrl: string;
  width: number;
  height: number;
  fps: number;
  totalDurationSec: number;
  narrationText: string;
  scenes: HyperframesScene[];
  assets: {
    useCaseImages: string[];
  };
};

// 各シーンの duration は音声計測後に runVideoJob 側で確定させる。
// buildHyperframesVideoData では文字数から概算した仮値を設定する。

// 各シーンのvoiceover文字数上限（日本語 約5.5文字/秒 で計算）
// hook: 10秒 → 55文字, overview: 15秒 → 82文字,
// useCases: 18秒 → 99文字, cta: 11秒 → 60文字
const VOICEOVER_CHAR_LIMITS = {
  hook: 55,
  overview: 82,
  useCases: 99,
  cta: 60,
} as const;

const USE_CASE_IMAGES = [
  "assets/isometric_10.webp",
  "assets/isometric_20.webp",
  "assets/isometric_15.webp",
];

const BANNED_PATTERNS = [
  /※?\s*架空(?:の)?(?:活用)?(?:事例|イメージ)?(?:です)?[。．、,\s]*/g,
  /※?\s*想定(?:の)?(?:事例|イメージ)?(?:です)?[。．、,\s]*/g,
  /※?\s*実際の採択事例ではありません[。．、,\s]*/g,
];

function sanitizeText(value: string | null | undefined): string {
  let text = value?.trim() ?? "";
  for (const pattern of BANNED_PATTERNS) {
    text = text.replace(pattern, "");
  }
  return text.replace(/\s+/g, " ").trim();
}

function truncate(value: string, maxLength: number): string {
  const text = sanitizeText(value);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1)}…`;
}

function shortSubsidyName(name: string): string {
  return cleanSubsidyName(name).replace(/令和[0-9０-９]+年度(?:（補正）)?\s*/g, "").slice(0, 34);
}

function caption(start: number, end: number, text: string): HyperframesCaption {
  return { start, end, text: truncate(text, 28) };
}

function scene(
  input: Omit<HyperframesScene, "captions"> & { captions?: HyperframesCaption[] },
): HyperframesScene {
  return {
    ...input,
    captions:
      input.captions ??
      input.lines.slice(0, 2).map((line, index) =>
        caption(input.start + index * Math.max(2, input.duration / 2), input.start + (index + 1) * Math.max(2, input.duration / 2), line),
      ),
  };
}

type GrantForLpVideo = SubsidyGrant & { contents?: GeneratedContent[] };

/**
 * voiceover テキストを文字数上限でカットし、音声と映像のズレを防ぐ。
 * 日本語は約5.5文字/秒で読み上げられるため、上限を超えないように制御する。
 */
function limitVoiceover(text: string, sceneId: keyof typeof VOICEOVER_CHAR_LIMITS): string {
  const limit = VOICEOVER_CHAR_LIMITS[sceneId];
  const cleaned = sanitizeText(text);
  if (cleaned.length <= limit) return cleaned;
  // 句点・読点で区切って上限内に収める
  const sentences = cleaned.split(/(?<=[。、])/);
  let result = "";
  for (const s of sentences) {
    if ((result + s).length > limit) break;
    result += s;
  }
  return result.trim() || cleaned.slice(0, limit);
}

export function buildHyperframesVideoData(
  grant: GrantForLpVideo,
  lpContent: GeneratedContent | null,
): HyperframesVideoData {
  const lpData = buildSubsidyLpData(grant, lpContent);
  const subsidyName = cleanSubsidyName(lpData.name);
  const shortName = shortSubsidyName(subsidyName);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://subsidy-consulting-nts.vercel.app";
  const lpUrl = `${siteUrl}/subsidies/lp/${lpData.id}`;

  const useCases = lpData.useCases.slice(0, 3).map((useCase, index) => ({
    persona: truncate(useCase.persona ?? `活用イメージ${index + 1}`, 16),
    label: truncate(useCase.label, 24),
    body: truncate(useCase.body, 58),
    image: USE_CASE_IMAGES[index % USE_CASE_IMAGES.length],
  }));

  const metrics: HyperframesMetric[] = [
    {
      label: "補助上限",
      value: lpData.amountLabel,
      note: "枠・条件により異なる場合があります",
    },
    {
      label: "補助率",
      value: lpData.rateLabel,
      note: "類型・要件により異なる場合があります",
    },
    {
      label: "公募期限",
      value: lpData.deadlineLabel,
      note: lpData.remainingDays !== null ? `残り ${lpData.remainingDays} 日` : "公募要領で確認が必要です",
    },
  ];

  // ── voiceover: 映像に映っている内容と1対1で対応させる ──────────
  // hook: 補助金名・金額・補助率を紹介
  const hookVoiceover = limitVoiceover(
    `${shortName}を解説します。補助上限は${lpData.amountLabel}、補助率は${lpData.rateLabel}です。`,
    "hook",
  );

  // overview: 映像に表示される3つの数字（補助上限・補助率・公募期限）を読む
  const overviewVoiceover = limitVoiceover(
    `数字で見ると、補助上限は${lpData.amountLabel}、補助率は${lpData.rateLabel}、公募期限は${lpData.deadlineLabel}です。詳しい条件は公募要領でご確認ください。`,
    "overview",
  );

  // useCases: 映像に表示される3つの活用イメージをそのまま読む
  const useCasesVoiceover = limitVoiceover(
    `活用イメージを3つご紹介します。${useCases
      .map((uc) => `${uc.persona}の場合、${uc.label.replace(/^【活用例】/, "")}`)
      .join("。")}。`,
    "useCases",
  );

  // cta: 映像に表示されるCTAと同じメッセージ
  const ctaVoiceover = limitVoiceover(
    `自社で使えるかどうか、まずは無料相談でご確認ください。日本提携支援が、制度選びから活用設計まで伴走します。`,
    "cta",
  );

  // ── duration は仮値（実際の音声長計測後に runVideoJob 側で上書き） ──
  // 文字数 ÷ 5.5文字/秒 の概算値 + 0.5秒の余裕
  const estimateDuration = (voiceover: string) =>
    Math.ceil(voiceover.length / 5.5) + 0.5;

  const hookDuration = estimateDuration(hookVoiceover);
  const overviewDuration = estimateDuration(overviewVoiceover);
  const useCasesDuration = estimateDuration(useCasesVoiceover);
  const ctaDuration = estimateDuration(ctaVoiceover);

  // start はそれぞれの duration に基づいて計算
  const overviewStart = hookDuration;
  const useCasesStart = overviewStart + overviewDuration;
  const ctaStart = useCasesStart + useCasesDuration;
  const totalDuration = ctaStart + ctaDuration;

  const scenes: HyperframesScene[] = [
    scene({
      id: "hook",
      start: 0,
      duration: hookDuration,
      kicker: "SUBSIDY ACTION GUIDE",
      title: truncate(lpData.heroCopy, 34),
      lines: [shortName, `補助上限 ${lpData.amountLabel} ／ 補助率 ${lpData.rateLabel}`],
      voiceover: hookVoiceover,
      captions: [
        caption(0, hookDuration / 2, shortName),
        caption(hookDuration / 2, hookDuration, `補助上限 ${lpData.amountLabel}`),
      ],
    }),
    scene({
      id: "overview",
      start: overviewStart,
      duration: overviewDuration,
      kicker: "KEY NUMBERS",
      title: "数字で見る制度概要",
      lines: metrics.map((m) => `${m.label}: ${m.value}`),
      metrics,
      voiceover: overviewVoiceover,
      captions: [
        caption(overviewStart, overviewStart + overviewDuration / 3, `補助上限 ${lpData.amountLabel}`),
        caption(overviewStart + overviewDuration / 3, overviewStart + overviewDuration * 2 / 3, `補助率 ${lpData.rateLabel}`),
        caption(overviewStart + overviewDuration * 2 / 3, overviewStart + overviewDuration, `期限 ${lpData.deadlineLabel}`),
      ],
    }),
    scene({
      id: "useCases",
      start: useCasesStart,
      duration: useCasesDuration,
      kicker: "USE CASES",
      title: "活用イメージ",
      lines: useCases.map((uc) => `${uc.persona}: ${uc.label}`),
      useCases,
      voiceover: useCasesVoiceover,
      captions: useCases.map((uc, i) =>
        caption(
          useCasesStart + i * (useCasesDuration / 3),
          useCasesStart + (i + 1) * (useCasesDuration / 3),
          `${uc.persona}: ${uc.label}`,
        ),
      ),
    }),
    scene({
      id: "cta",
      start: ctaStart,
      duration: ctaDuration,
      kicker: "無料相談",
      title: "自社で使えるか、まずは無料で確認できます",
      lines: [truncate(subsidyName, 42), "日本提携支援が活用設計から伴走します"],
      voiceover: ctaVoiceover,
      captions: [
        caption(ctaStart, ctaStart + ctaDuration / 2, "自社で使えるか無料で確認"),
        caption(ctaStart + ctaDuration / 2, ctaStart + ctaDuration, "制度選びから活用設計まで伴走"),
      ],
    }),
  ];

  return {
    id: lpData.id,
    title: `${shortName} 解説動画`,
    subsidyName,
    lpUrl,
    width: 1280,
    height: 720,
    fps: 30,
    totalDurationSec: Math.ceil(totalDuration),
    narrationText: scenes.map((s) => s.voiceover).join("\n"),
    scenes,
    assets: {
      useCaseImages: USE_CASE_IMAGES,
    },
  };
}
