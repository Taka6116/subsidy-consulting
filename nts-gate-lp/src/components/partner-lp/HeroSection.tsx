"use client";

import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import HeroPartnerStrip from "@/components/gate-lp/HeroPartnerStrip";
import HeroQuickCheckForm from "@/components/gate-lp/hero-three/HeroQuickCheckForm";
import heroStyles from "@/components/gate-lp/hero-three/HeroSection.module.css";
import styles from "./HeroSection.module.css";

export default function HeroSection() {
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctRef = useRef<HTMLDivElement>(null);
  const imgColRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const allEls = [
      headlineRef.current,
      subRef.current,
      ctRef.current,
      imgColRef.current,
    ].filter(Boolean) as HTMLElement[];

    if (prefersReduced) {
      gsap.set(allEls, { opacity: 1, y: 0, clearProps: "transform" });
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.to(headlineRef.current, { opacity: 1, y: 0, duration: 0.9 }, 0)
      .to(subRef.current, { opacity: 1, y: 0, duration: 0.8 }, 0.2)
      .to(ctRef.current, { opacity: 1, y: 0, duration: 0.7 }, 0.55)
      .to(imgColRef.current, { opacity: 1, y: 0, duration: 0.9 }, 0.1);

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <section className={`section-hero ${styles.page}`}>
      {/* 装飾: dot grid overlay（低コントラスト・装飾のみ・非インタラクティブ） */}
      <div className={styles.dotGrid} aria-hidden="true" />

      {/* ── 上部: テキスト（左） + 画像プレースホルダー（右） ── */}
      <div className={styles.heroMain}>
        {/* 左カラム: テキスト + CTA */}
        <div className={styles.content}>
          <h1 ref={headlineRef} className={`${styles.headline} font-heading`}>
            <span className={styles.headlineLine}>「補助金が使えますよ」</span>
            <span className={styles.headlineLine}>その一言で、</span>
            <span className={`${styles.headlineLine} ${styles.headlineAccent}`}>営業が変わる。</span>
          </h1>
          <p ref={subRef} className={`${styles.sub} font-body`}>
            御社の商材を提案するとき、「補助金の対象です」
            <br />
            と添えるだけで顧客の反応が変わります。
            <br />
            補助金の知識も、申請の対応も不要。
            <br />
            紹介フィーもお支払いします。
          </p>

          <div ref={ctRef} className={`${styles.ctas} font-body`}>
            <Link href="/consult" className={styles.btnP}>
              提携について相談する（無料）
            </Link>
            <Link href="/check" className={styles.btnS}>
              御社の商材が補助金対象か確認する
            </Link>
          </div>
        </div>

        {/* 右カラム: エンドユーザーFVの診断体験を提携先向けにコンパクト表示 */}
        <div
          ref={imgColRef}
          className={styles.imgCol}
          style={{ opacity: 0, transform: "translateY(20px)" }}
        >
          <div className={styles.endUserPreview} data-placeholder="hero-main">
            <div className={`${heroStyles.formVideoUnit} ${styles.partnerFormVideoUnit}`}>
              <HeroQuickCheckForm formCardClassName={styles.partnerFormCard} />
              <div className={`${heroStyles.videoCard} ${styles.partnerVideoCard}`} aria-label="補助金診断の操作デモ">
                <p className={heroStyles.videoCardLead}>
                  AIが御社の公式サイトを読み取り、事業内容にフィットする補助金だけを抽出します。名前や連絡先の登録は不要。まずは結果だけ確認できます。
                </p>
                <div className={`${heroStyles.videoCardBody} ${styles.partnerVideoCardBody}`}>
                  <video
                    className={heroStyles.videoCardVideo}
                    src="/video/subsidy-check-demo.mp4"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    aria-label="補助金照会サービスの操作デモ動画"
                  />
                </div>
                <div className={heroStyles.videoStepsRow} aria-label="3ステップで確認できます">
                  <div className={heroStyles.videoStepItem}>
                    <div className={heroStyles.videoStepMedia}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/images/FV_content_001.png"
                        alt=""
                        aria-hidden="true"
                        className={heroStyles.videoStepImg}
                        width={240}
                        height={240}
                        loading="eager"
                        decoding="async"
                      />
                    </div>
                    <span className={heroStyles.videoStepLabel}>URL／社名を入力</span>
                  </div>
                  <span className={heroStyles.videoStepArrow} aria-hidden="true">→</span>
                  <div className={heroStyles.videoStepItem}>
                    <div className={heroStyles.videoStepMedia}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/images/FV_content_002.png"
                        alt=""
                        aria-hidden="true"
                        className={heroStyles.videoStepImg}
                        width={240}
                        height={240}
                        loading="eager"
                        decoding="async"
                      />
                    </div>
                    <span className={heroStyles.videoStepLabel}>AIが事業を照合</span>
                  </div>
                  <span className={heroStyles.videoStepArrow} aria-hidden="true">→</span>
                  <div className={heroStyles.videoStepItem}>
                    <div className={heroStyles.videoStepMedia}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/images/FV_content_003.png"
                        alt=""
                        aria-hidden="true"
                        className={heroStyles.videoStepImg}
                        width={240}
                        height={240}
                        loading="eager"
                        decoding="async"
                      />
                    </div>
                    <span className={heroStyles.videoStepLabel}>対象制度を表示</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── ロゴスクロール帯: heroMain の外に置き重なりをゼロに ── */}
      <div className={styles.heroStrip}>
        <HeroPartnerStrip variant="dark" />
      </div>
    </section>
  );
}
