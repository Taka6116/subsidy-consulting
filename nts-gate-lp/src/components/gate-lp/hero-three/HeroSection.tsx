"use client";

import Link from "next/link";
import HeroCheckCtaLink from "@/components/shared/HeroCheckCtaLink";
import { trackCTAClick } from "@/lib/analytics";
import styles from "./HeroSection.module.css";

export default function HeroSection() {
  return (
    <section
      className={`${styles.hero} section-block relative flex min-h-[min(100svh,680px)] flex-col justify-center`}
      style={{
        background: "linear-gradient(160deg, #E8EFF8 0%, #DDE8F5 100%)",
        minHeight: "580px",
      }}
      aria-label="補助金照会サービス ヒーローセクション"
    >
      <div className={styles.decorWrap} aria-hidden="true">
        <span className={`${styles.decorBlob} ${styles.decorBlobNavy}`} />
        <span className={`${styles.decorBlob} ${styles.decorBlobTeal}`} />
        <span className={`${styles.decorBlob} ${styles.decorBlobGold}`} />
        <span className={`${styles.decorDots} ${styles.decorDotsTopRight}`} />
        <span className={`${styles.decorDots} ${styles.decorDotsBottomLeft}`} />
        <span className={`${styles.decorRing} ${styles.decorRing1}`} />
        <span className={`${styles.decorRing} ${styles.decorRing2}`} />
        <span className={`${styles.decorRing} ${styles.decorRing3}`} />
        <span className={`${styles.decorAccent} ${styles.decorAccentTeal}`} />
        <span className={`${styles.decorAccent} ${styles.decorAccentGold}`} />
      </div>
      <div className={`section-inner relative z-[1] w-full shrink-0 py-8 ${styles.heroInnerWide}`}>
        <div className={`two-col img-right ${styles.heroSplit}`}>
          <div className={`${styles.textCol} col-text space-y-6`}>
            <h1 className={styles.headline}>
              <span className={styles.headlineLine}>重要な決断を、</span>
              <span className={styles.headlineLine}>ひとりで抱えていませんか。</span>
            </h1>

            <p className={`${styles.sub} font-body`}>
              <span className={styles.subLine}>人手不足、設備の更新、この先の経営——</span>
              <span className={styles.subLine}>答えのない問いを、誰かと一緒に考える。</span>
              <span className={styles.subLine}>補助金の活用は、その第一歩です。</span>
            </p>

            <div className={`${styles.ctaRow} font-body`}>
              <Link
                href="/consult"
                className={styles.ctaConsult}
                onClick={() => trackCTAClick("hero_consult")}
              >
                まず話を聞いてみる（無料）
                <span className={styles.ctaArrow} aria-hidden="true">
                  →
                </span>
              </Link>
              <HeroCheckCtaLink location="home_subsidy_check" className={styles.cta}>
                自社に使える補助金を調べる
                <span className={styles.ctaArrow} aria-hidden="true">
                  →
                </span>
              </HeroCheckCtaLink>
            </div>
          </div>

          <div className={`col-img w-full ${styles.heroImgCol}`}>
            <div className={styles.heroVisual}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icon-assets/undraw_thinking-mode_7czd.svg"
                alt=""
                aria-hidden="true"
                className={styles.heroCharMain}
                width={928}
                height={871}
                loading="eager"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </div>

      <div className={`${styles.scrollHint} relative z-[1] font-body`} aria-hidden="true">
        <div className={styles.scrollLine} />
        <span className={styles.scrollText}>scroll</span>
      </div>
    </section>
  );
}
