"use client";

import { createContext, useContext } from "react";

/** ホームのスプラッシュ終了後は Hero の段階フェードを抑止し、ラッパー演出と二重にならないようにする */
export const HomeIntroContext = createContext<{ suppressHeroMotion: boolean }>({
  suppressHeroMotion: false,
});

export function useHomeIntro() {
  return useContext(HomeIntroContext);
}
