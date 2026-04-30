import type { HyperframesVideoData } from "@/lib/video-hyperframes/buildVideoData";

export type HyperframesVideoValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
};

const BANNED_TEXT_PATTERN = /架空|想定事例|想定の事例|実際の採択事例ではありません/;

function collectText(data: HyperframesVideoData): string {
  return [
    data.title,
    data.subsidyName,
    data.narrationText,
    ...data.scenes.flatMap((scene) => [
      scene.kicker,
      scene.title,
      scene.voiceover,
      ...scene.lines,
      ...(scene.captions ?? []).map((caption) => caption.text),
      ...(scene.useCases ?? []).flatMap((useCase) => [
        useCase.persona,
        useCase.label,
        useCase.body,
      ]),
    ]),
  ].join("\n");
}

export function validateHyperframesVideoData(
  data: HyperframesVideoData,
): HyperframesVideoValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const allText = collectText(data);

  // 音声先生成パイプラインでは実際の音声長が確定するため、幅広く許容する
  if (data.totalDurationSec < 30 || data.totalDurationSec > 90) {
    errors.push(`動画の総尺は30〜90秒の範囲にしてください: ${data.totalDurationSec}秒`);
  }

  if (data.scenes.length !== 4) {
    errors.push(`動画シーンは4件（hook/overview/useCases/cta）にしてください: ${data.scenes.length}件`);
  }

  if (BANNED_TEXT_PATTERN.test(allText)) {
    errors.push("動画データに禁止表現（架空・想定事例・実際の採択事例ではありません）が含まれています");
  }

  const useCaseScene = data.scenes.find((scene) => scene.id === "useCases");
  if (!useCaseScene?.useCases || useCaseScene.useCases.length !== 3) {
    errors.push("活用イメージは必ず3件にしてください");
  }

  // 各シーンのvoiceover文字数上限（音声先生成なので duration との比較は不要）
  const voiceoverCharLimits: Record<string, number> = {
    hook: 70,
    overview: 100,
    useCases: 120,
    cta: 75,
  };

  for (const scene of data.scenes) {
    if (!scene.voiceover.trim()) {
      errors.push(`${scene.id} シーンのナレーションが空です`);
    }
    const charLimit = voiceoverCharLimits[scene.id];
    if (charLimit && scene.voiceover.length > charLimit) {
      warnings.push(`${scene.id} シーンのナレーションが文字数上限(${charLimit}字)を超えています: ${scene.voiceover.length}字`);
    }
    if (scene.lines.some((line) => line.length > 64)) {
      warnings.push(`${scene.id} シーンの表示テキストが長めです`);
    }
  }

  const hasCta = data.scenes.some(
    (scene) => scene.id === "cta" && /無料|相談|確認/.test(`${scene.title} ${scene.voiceover}`),
  );
  if (!hasCta) {
    errors.push("CTAシーンには無料相談または確認導線を含めてください");
  }

  const overview = data.scenes.find((scene) => scene.id === "overview");
  if (!overview?.metrics || overview.metrics.length < 2) {
    errors.push("制度概要シーンには補助上限・補助率・期限などの数字カードを含めてください");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
