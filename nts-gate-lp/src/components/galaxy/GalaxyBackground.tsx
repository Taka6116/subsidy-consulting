"use client";

import { useRef } from "react";
import { useGalaxy, type UseGalaxyOptions } from "./useGalaxy";

type GalaxyBackgroundProps = {
  className?: string;
} & UseGalaxyOptions;

export function GalaxyBackground({
  className = "absolute inset-0 block h-full w-full",
  particleIntensity,
}: GalaxyBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useGalaxy(canvasRef, { particleIntensity });

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}
