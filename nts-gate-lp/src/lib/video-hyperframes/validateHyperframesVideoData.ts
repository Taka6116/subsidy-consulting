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

  if (data.totalDurationSec < 45 || data.totalDurationSec > 75) {
    errors.push(`動画の総尺は45〜75秒にしてください: ${data.totalDurationSec}秒`);
  }

  if (data.scenes.length !== 6) {
    errors.push(`動画シーンは6件にしてください: ${data.scenes.length}件`);
  }

  if (BANNED_TEXT_PATTERN.test(allText)) {
    errors.push("動画データに禁止表現（架空・想定事例・実際の採択事例ではありません）が含まれています");
  }

  const useCaseScene = data.scenes.find((scene) => scene.id === "useCases");
  if (!useCaseScene?.useCases || useCaseScene.useCases.length !== 3) {
    errors.push("活用イメージは必ず3件にしてください");
  }

  for (const scene of data.scenes) {
    if (!scene.voiceover.trim()) {
      errors.push(`${scene.id} シーンのナレーションが空です`);
    }
    if (scene.voiceover.length > scene.duration * 9) {
      warnings.push(`${scene.id} シーンのナレーションが長めです`);
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
