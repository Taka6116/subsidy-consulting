"use client";

import { Fragment, useMemo, useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
  type UseScrollOptions,
} from "framer-motion";
import {
  flattenRevealLines,
  parseRevealLines,
  type RevealToken,
} from "@/lib/motion/parseRevealLines";

const DEFAULT_OFFSET = ["start 0.9", "start 0.45"] as UseScrollOptions["offset"];

const MOTION_TAGS = {
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  p: motion.p,
} as const;

type ScrollTextRevealProps = {
  as?: keyof typeof MOTION_TAGS;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  children: React.ReactNode;
  /** スクロール連動の開始・終了位置（Framer offset） */
  scrollOffset?: UseScrollOptions["offset"];
};

function RevealUnit({
  token,
  index,
  total,
  progress,
}: {
  token: RevealToken;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const spread = total <= 1 ? 0.45 : 0.72;
  const start = total <= 1 ? 0.05 : (index / total) * spread;
  const end = Math.min(start + (total <= 1 ? 0.4 : spread / total + 0.12), 1);

  const opacity = useTransform(progress, [start, end], [0, 1]);
  const y = useTransform(progress, [start, end], [10, 0]);

  const inner = (
    <motion.span
      className="inline-block will-change-[transform,opacity]"
      style={{ opacity, y }}
    >
      {token.char}
    </motion.span>
  );

  if (token.wrapper?.className || token.wrapper?.style) {
    return (
      <span className={token.wrapper.className} style={token.wrapper.style}>
        {inner}
      </span>
    );
  }

  return inner;
}

export default function ScrollTextReveal({
  as = "h2",
  className,
  style,
  id,
  children,
  scrollOffset = DEFAULT_OFFSET,
}: ScrollTextRevealProps) {
  const reduceMotion = useReducedMotion();
  const MotionTag = MOTION_TAGS[as];
  const ref = useRef<HTMLHeadingElement | null>(null);

  const lines = useMemo(() => parseRevealLines(children), [children]);
  const units = useMemo(() => flattenRevealLines(lines), [lines]);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: scrollOffset,
  });

  if (reduceMotion || units.length === 0) {
    const StaticTag = as;
    return (
      <StaticTag id={id} className={className} style={style}>
        {children}
      </StaticTag>
    );
  }

  let unitIndex = 0;

  return (
    <MotionTag ref={ref} id={id} className={className} style={style}>
      {lines.map((lineUnits, lineIdx) => (
        <Fragment key={`line-${lineIdx}`}>
          {lineIdx > 0 ? <br /> : null}
          {lineUnits.map((token) => {
            const index = unitIndex++;
            return (
              <RevealUnit
                key={`${lineIdx}-${index}-${token.char}`}
                token={token}
                index={index}
                total={units.length}
                progress={scrollYProgress}
              />
            );
          })}
        </Fragment>
      ))}
    </MotionTag>
  );
}

/** プレーンテキスト1行用のショートカット */
export function ScrollTextRevealPlain({
  text,
  ...props
}: Omit<ScrollTextRevealProps, "children"> & { text: string }) {
  return <ScrollTextReveal {...props}>{text}</ScrollTextReveal>;
}
