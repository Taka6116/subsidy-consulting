"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/** GA linker が読み取った後、アドレスバーから _gl だけを除去する */
function stripGlFromUrl(): void {
  if (typeof window === "undefined") return;

  const { pathname, search, hash } = window.location;
  const params = new URLSearchParams(search);

  if (!params.has("_gl")) return;

  params.delete("_gl");
  const query = params.toString();
  const nextUrl = pathname + (query ? `?${query}` : "") + hash;
  const currentUrl = pathname + search + hash;

  if (nextUrl !== currentUrl) {
    window.history.replaceState(window.history.state, "", nextUrl);
  }
}

export default function CleanGlParam() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 初回ロード後（GTM/GA が linker を読む時間を確保）
  useEffect(() => {
    const onLoad = () => stripGlFromUrl();
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  // 初回表示・クライアント遷移のたび（遷移後に付いた _gl も除去）
  useEffect(() => {
    const t = window.setTimeout(stripGlFromUrl, 500);
    return () => window.clearTimeout(t);
  }, [pathname, searchParams]);

  return null;
}
