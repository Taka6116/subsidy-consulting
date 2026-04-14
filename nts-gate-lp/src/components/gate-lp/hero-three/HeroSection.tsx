"use client";

import Link from "next/link";
import { trackCTAClick } from "@/lib/analytics";
import HeroThreeWebGLBackground from "./HeroThreeWebGLBackground";
import styles from "./HeroSection.module.css";

export default function HeroSection() {
  return (
    <section
      className={styles.hero}
      aria-label="補助金照会サービス ヒーローセクション"
    >
      <HeroThreeWebGLBackground interactive />

      <div className={styles.content}>
        <h1 className={styles.headline}>
          <span className={styles.headlineLine}>人手不足・設備老朽化・事業承継 ―</span>
          <span className={styles.headlineLine}>
            あなたの課題に使える補助金が、1分でわかります。
          </span>
        </h1>

        <p className={styles.sub}>
          <span className={styles.subLine}>あなたの会社の対象制度を即時照会。</span>
          <span className={styles.subLine}>照会・相談は完全無料です。</span>
        </p>

        <div className={styles.ctaRow}>
          <Link
            href="/check"
            className={styles.cta}
            onClick={() => trackCTAClick("hero")}
          >
            対象の補助金を確認する
            <span className={styles.ctaArrow} aria-hidden="true">
              →
            </span>
          </Link>
          <Link
            href="/consult"
            className={styles.ctaSecondary}
            onClick={() => trackCTAClick("hero_consult")}
          >
            無料相談申し込み
            <span className={styles.ctaArrow} aria-hidden="true">
              →
            </span>
          </Link>
        </div>
      </div>

      <div className={styles.scrollHint} aria-hidden="true">
        <div className={styles.scrollLine} />
        <span className={styles.scrollText}>scroll</span>
      </div>
    </section>
  );
}
