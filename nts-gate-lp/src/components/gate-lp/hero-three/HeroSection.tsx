"use client";

import Link from "next/link";
import { trackCTAClick } from "@/lib/analytics";
import HeroQuickCheckForm from "./HeroQuickCheckForm";
import styles from "./HeroSection.module.css";

export default function HeroSection() {
  return (
    <section
      className={`${styles.hero} relative flex flex-col`}
      style={{
        background: "linear-gradient(160deg, #E8EFF8 0%, #DDE8F5 100%)",
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
        <span className={`${styles.decorAccent} ${styles.decorAccentTeal}`} />
      </div>

      <div className={`section-inner relative z-[1] w-full shrink-0 ${styles.heroInnerWide}`}>
        <header className={styles.heroHeader}>
          <h1 className={styles.headlineTight}>
            会社の<em>URL</em>から、使える<em>補助金</em>が見つかる。
          </h1>
        </header>

        <div className={styles.heroLayout}>
          <div className={styles.formVideoUnit}>
            <HeroQuickCheckForm />
            <div className={styles.videoCard} aria-label="操作デモと3ステップ">
              <p className={styles.videoCardLead}>
                AIが御社の公式サイトを読み取り、事業内容にフィットする補助金だけを抽出します。名前や連絡先の登録は不要。まずは結果だけ確認できます。
              </p>
              <div className={styles.videoCardBody}>
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <video
                  className={styles.videoCardVideo}
                  src="/video/subsidy-check-demo.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-label="補助金照会サービスの操作デモ動画"
                />
              </div>
              <div className={styles.videoStepsRow} aria-label="3ステップで確認できます">
                <div className={styles.videoStepItem}>
                  <div className={styles.videoStepMedia}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/FV_content_001.png"
                      alt=""
                      aria-hidden="true"
                      className={styles.videoStepImg}
                      width={240}
                      height={240}
                      loading="eager"
                      decoding="async"
                    />
                    <span className={styles.videoStepNum}>1</span>
                  </div>
                  <span className={styles.videoStepLabel}>URL／社名を入力</span>
                </div>
                <span className={styles.videoStepArrow} aria-hidden="true">→</span>
                <div className={styles.videoStepItem}>
                  <div className={styles.videoStepMedia}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/FV_content_002.png"
                      alt=""
                      aria-hidden="true"
                      className={styles.videoStepImg}
                      width={240}
                      height={240}
                      loading="eager"
                      decoding="async"
                    />
                    <span className={styles.videoStepNum}>2</span>
                  </div>
                  <span className={styles.videoStepLabel}>AIが事業を照合</span>
                </div>
                <span className={styles.videoStepArrow} aria-hidden="true">→</span>
                <div className={styles.videoStepItem}>
                  <div className={styles.videoStepMedia}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/FV_content_003.png"
                      alt=""
                      aria-hidden="true"
                      className={styles.videoStepImg}
                      width={240}
                      height={240}
                      loading="eager"
                      decoding="async"
                    />
                    <span className={styles.videoStepNum}>3</span>
                  </div>
                  <span className={styles.videoStepLabel}>対象制度を表示</span>
                </div>
              </div>

              <div className={styles.videoCardFooter}>
                <div className={styles.videoTrustRow}>
                  <span className={styles.videoTrustItem}>個人情報入力なし</span>
                  <span className={styles.videoTrustItem}>公的データで照合</span>
                  <span className={styles.videoTrustItem}>専門家へそのまま相談可</span>
                </div>
                <Link
                  href="/consult"
                  className={styles.videoSecondaryLink}
                  onClick={() => trackCTAClick("hero_consult")}
                >
                  先に専門家へ無料で相談する →
                </Link>
              </div>
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
