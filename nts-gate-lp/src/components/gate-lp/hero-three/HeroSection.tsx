"use client";

import Link from "next/link";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";
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
      <div className={`section-inner w-full shrink-0 py-8 ${styles.heroInnerWide}`}>
        <div className={`two-col img-right ${styles.heroSplit}`}>
          <div className={`${styles.textCol} col-text space-y-6`}>
            <h1 className={styles.headline}>
              <span className={styles.headlineLine}>補助金だけでなく、</span>
              <span className={styles.headlineLine}>経営課題を超えて前に進みたい方へ</span>
            </h1>

            <p className={`${styles.sub} font-body`}>
              <span className={styles.subLine}>補助金活用の戦略から採択後の伴走まで、</span>
              <span className={styles.subLine}>経営者のパートナーとして伴います。</span>
            </p>

            <div className={`${styles.ctaRow} font-body`}>
              <Link
                href="/consult"
                className={styles.ctaConsult}
                onClick={() => trackCTAClick("hero")}
              >
                無料相談申し込み
                <span className={styles.ctaArrow} aria-hidden="true">
                  →
                </span>
              </Link>
            </div>
          </div>

          <div className={`col-img w-full ${styles.heroImgCol}`}>
            <ImagePlaceholder
              label="メインビジュアル（等角イラストまたはダッシュボード画像）"
              aspectRatio="3/2"
            />
          </div>
        </div>
      </div>

      <div className={`${styles.scrollHint} font-body`} aria-hidden="true">
        <div className={styles.scrollLine} />
        <span className={styles.scrollText}>scroll</span>
      </div>
    </section>
  );
}
