"use client";

import { memo } from "react";

type AuroraTextProps = {
  children: React.ReactNode;
  className?: string;
  /** オーロラグラデーションの色（NTSブランド寄り） */
  colors?: string[];
  /** 1 = 標準速度、2 = 2倍速（animated が true のときのみ） */
  speed?: number;
  /** false のときはグラデーションのみ（位置・回転アニメーションなし） */
  animated?: boolean;
};

const DEFAULT_COLORS = ["#22d3ee", "#38bdf8", "#1368d8", "#1a56db"];

export const AuroraText = memo(function AuroraText({
  children,
  className = "",
  colors = DEFAULT_COLORS,
  speed = 1,
  animated = true,
}: AuroraTextProps) {
  const gradientStyle: React.CSSProperties = {
    backgroundImage: `linear-gradient(90deg, ${colors.join(", ")})`,
    backgroundSize: animated ? "200% auto" : "100% auto",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
    color: "transparent",
    ...(animated ? { animationDuration: `${10 / speed}s` } : {}),
  };

  return (
    <span className={`relative inline-block ${className}`.trim()}>
      <span
        className={`relative inline-block bg-clip-text text-transparent${animated ? " animate-aurora" : ""}`}
        style={gradientStyle}
      >
        {children}
      </span>
    </span>
  );
});

export default AuroraText;
