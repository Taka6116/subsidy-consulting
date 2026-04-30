// ========== [NEW 2026-04-30] 目次コンポーネント ==========
"use client";

import { useEffect, useState } from "react";

type Heading = {
  id: string;
  text: string;
  level: 2 | 3;
};

type Props = {
  /** 記事本文が描画されているコンテナの ID */
  contentContainerId: string;
};

export function ArticleToc({ contentContainerId }: Props) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  // h2・h3を収集し、id属性を付与
  useEffect(() => {
    const container = document.getElementById(contentContainerId);
    if (!container) return;

    const elements = container.querySelectorAll("h2, h3");
    const items: Heading[] = [];

    elements.forEach((el, i) => {
      const id = el.id || `toc-heading-${i}`;
      el.id = id;
      items.push({
        id,
        text: el.textContent ?? "",
        level: el.tagName === "H2" ? 2 : 3,
      });
    });

    setHeadings(items);
  }, [contentContainerId]);

  // IntersectionObserver でアクティブ見出しを追跡
  useEffect(() => {
    if (headings.length === 0) return;

    const observers: IntersectionObserver[] = [];
    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveId(id);
        },
        { rootMargin: "-20% 0px -75% 0px" },
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((obs) => obs.disconnect());
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <nav aria-label="目次" className="mb-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
        目次
      </p>
      <ol className="space-y-1.5">
        {headings.map((h) => (
          <li key={h.id} className={h.level === 3 ? "ml-4" : ""}>
            <a
              href={`#${h.id}`}
              className={`block text-sm leading-relaxed transition-colors ${
                activeId === h.id
                  ? "font-semibold text-slate-900"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById(h.id)
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
