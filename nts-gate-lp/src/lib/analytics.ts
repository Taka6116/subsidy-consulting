type GtagCommand = "config" | "event" | "set";

interface GtagEventParams {
  [key: string]: string | number | boolean | undefined;
}

declare global {
  interface Window {
    gtag?: (command: GtagCommand, target: string, params?: GtagEventParams) => void;
  }
}

function sendEvent(eventName: string, params: GtagEventParams) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, params);
  }
}

// ---- CTA click ----

export type CTALocation =
  | "hero"
  /** トップヒーロー — 無料相談申し込み */
  | "hero_consult"
  | "impact"
  | "steps"
  | "final"
  /** トップ LP — 照会導線セクション（Section C 等） */
  | "home_check_lead"
  /** トップ LP — 対象補助金確認（/check） */
  | "home_subsidy_check"
  /** サイトヘッダー — 無料相談 */
  | "header_consult"
  /** サイトヘッダー — 補助金照会 */
  | "header_subsidy_lookup"
  /** サイトヘッダー — 補助金プラットフォーム（詳細） */
  | "header_subsidy_detail";

export function trackCTAClick(location: CTALocation) {
  sendEvent("cta_click", { location });
}

// ---- Partner link click ----

type PartnerLinkLocation =
  | "header"
  | "footer"
  | "professional_section"
  | "header_subsidies";

export function trackPartnerLinkClick(location: PartnerLinkLocation) {
  sendEvent("partner_link_click", { location });
}

// ---- Scroll depth ----

type ScrollPercent = 25 | 50 | 75 | 100;

export function trackScrollDepth(percent: ScrollPercent) {
  sendEvent("scroll_depth", { percent });
}

// ---- Diagnosis step ----

type DiagnosisAction = "complete" | "abandon";

export function trackDiagnosisStep(step: number, action: DiagnosisAction) {
  sendEvent("diagnosis_step", { step, action });
}

// ---- Diagnosis result ----

/** q1 の内部値などをそのまま送る（設問設計書参照） */
export function trackDiagnosisResult(segment: string) {
  sendEvent("diagnosis_result", { segment });
}

// ---- Home intro (splash) ----

export function trackIntroStart() {
  sendEvent("intro_start", {});
}

export function trackIntroComplete(duration_ms: number) {
  sendEvent("intro_complete", { duration_ms });
}

export function trackIntroSkip() {
  sendEvent("intro_skip", {});
}

// ---- Scroll depth hook ----

import { useEffect, useRef } from "react";

export function useScrollDepth() {
  const fired = useRef<Set<ScrollPercent>>(new Set());

  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;

      const percent = (scrollTop / docHeight) * 100;
      const thresholds: ScrollPercent[] = [25, 50, 75, 100];

      for (const t of thresholds) {
        if (percent >= t && !fired.current.has(t)) {
          fired.current.add(t);
          trackScrollDepth(t);
        }
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
}
