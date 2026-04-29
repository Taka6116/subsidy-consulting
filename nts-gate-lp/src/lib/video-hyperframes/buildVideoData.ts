import type { GeneratedContent, SubsidyGrant } from "@prisma/client";
import { buildSubsidyLpData } from "@/lib/subsidy-lp/buildSubsidyLpData";
import { cleanSubsidyName } from "@/lib/subsidyCheckResultHelpers";

export type HyperframesSceneType =
  | "hook"
  | "overview"
  | "problem"
  | "useCases"
  | "process"
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

const TOTAL_DURATION_SEC = 60;
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

export function buildHyperframesVideoData(
  grant: GrantForLpVideo,
  lpContent: GeneratedContent | null,
): HyperframesVideoData {
  const lpData = buildSubsidyLpData(grant, lpContent);
  const subsidyName = cleanSubsidyName(lpData.name);
  const shortName = shortSubsidyName(subsidyName);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://subsidy-consulting-nts.vercel.app";
  const lpUrl = `${siteUrl}/subsidies/lp/${lpData.id}`;
  const pains = lpData.pains.slice(0, 3).map((pain) => truncate(pain, 30));
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

  const scenes: HyperframesScene[] = [
    scene({
      id: "hook",
      start: 0,
      duration: 6,
      kicker: "SUBSIDY ACTION GUIDE",
      title: truncate(lpData.heroCopy, 34),
      lines: [truncate(lpData.subCopy, 42), shortName],
      voiceover: `設備投資やコスト負担が増えるなか、${shortName}を活用できる可能性があります。`,
      captions: [
        caption(0, 3, "使える補助金を見落としていませんか"),
        caption(3, 6, shortName),
      ],
    }),
    scene({
      id: "overview",
      start: 6,
      duration: 9,
      kicker: "KEY NUMBERS",
      title: "数字で見る制度概要",
      lines: metrics.map((metric) => `${metric.label}: ${metric.value}`),
      metrics,
      voiceover: `この制度では、${lpData.amountLabel}、補助率は${lpData.rateLabel}、公募期限は${lpData.deadlineLabel}です。条件は公募要領で確認が必要です。`,
      captions: [
        caption(6, 9, `補助上限 ${lpData.amountLabel}`),
        caption(9, 12, `補助率 ${lpData.rateLabel}`),
        caption(12, 15, `公募期限 ${lpData.deadlineLabel}`),
      ],
    }),
    scene({
      id: "problem",
      start: 15,
      duration: 10,
      kicker: "PROBLEM",
      title: "こんなお悩みはありませんか",
      lines: pains,
      voiceover: `${pains.join("、")}。こうした課題を、補助金を使った投資計画として整理することが重要です。`,
      captions: [
        caption(15, 18.3, pains[0] ?? "投資負担を整理"),
        caption(18.3, 21.6, pains[1] ?? "要件確認が必要"),
        caption(21.6, 25, pains[2] ?? "申請準備を早めに整理"),
      ],
    }),
    scene({
      id: "useCases",
      start: 25,
      duration: 18,
      kicker: "USE CASES",
      title: "活用イメージ",
      lines: useCases.map((useCase) => `${useCase.persona}: ${useCase.label}`),
      useCases,
      voiceover: `活用イメージは3つあります。${useCases
        .map((useCase) => `${useCase.persona}では、${useCase.label.replace(/^【活用例】/, "")}`)
        .join("。")}。制度に合う投資内容を整理できます。`,
      captions: useCases.map((useCase, index) =>
        caption(25 + index * 6, 31 + index * 6, `${useCase.persona}: ${useCase.label}`),
      ),
    }),
    scene({
      id: "process",
      start: 43,
      duration: 9,
      kicker: "PROCESS",
      title: "申請検討から入金までの流れ",
      lines: ["事前確認", "申請準備", "採択後の実施", "実績報告", "入金"],
      steps: ["事前確認", "申請準備", "採択後の実施", "実績報告", "入金"],
      voiceover: "申請前には、対象要件、補助対象経費、締切を確認します。採択後も、交付申請、事業実施、実績報告まで整理が必要です。",
      captions: [
        caption(43, 46, "対象要件と補助対象経費を確認"),
        caption(46, 49, "申請準備から採択後対応まで整理"),
        caption(49, 52, "実績報告と入金まで伴走"),
      ],
    }),
    scene({
      id: "cta",
      start: 52,
      duration: 8,
      kicker: "FREE CONSULTATION",
      title: "自社で使えるか、まずは無料で確認できます",
      lines: [truncate(subsidyName, 42), "日本提携支援が活用設計から伴走します"],
      voiceover: "自社で使えるか分からない場合は、まず無料相談で確認できます。日本提携支援が、制度選びから活用設計まで伴走します。",
      captions: [
        caption(52, 56, "自社で使えるか無料で確認"),
        caption(56, 60, "制度選びから活用設計まで伴走"),
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
    totalDurationSec: TOTAL_DURATION_SEC,
    narrationText: scenes.map((item) => item.voiceover).join("\n"),
    scenes,
    assets: {
      useCaseImages: USE_CASE_IMAGES,
    },
  };
}
