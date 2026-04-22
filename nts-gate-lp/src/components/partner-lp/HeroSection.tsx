"use client";

import Image from "next/image";
import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import HeroPartnerStrip from "@/components/gate-lp/HeroPartnerStrip";
import isometric08 from "../../../icon-assets/isometric_08.webp";
import isometric16 from "../../../icon-assets/isometric_16.webp";
import styles from "./HeroSection.module.css";

export default function HeroSection() {
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctRef = useRef<HTMLDivElement>(null);
  const imgColRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const allEls = [
      eyebrowRef.current,
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
    tl.to(eyebrowRef.current, { opacity: 1, y: 0, duration: 0.8 }, 0)
      .to(headlineRef.current, { opacity: 1, y: 0, duration: 0.9 }, 0.2)
      .to(subRef.current, { opacity: 1, y: 0, duration: 0.8 }, 0.4)
      .to(ctRef.current, { opacity: 1, y: 0, duration: 0.7 }, 0.75)
      .to(imgColRef.current, { opacity: 1, y: 0, duration: 0.9 }, 0.3);

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <section className={`section-hero ${styles.page}`}>
      {/* ── 上部: テキスト（左） + 画像プレースホルダー（右） ── */}
      <div className={styles.heroMain}>
        {/* 左カラム: テキスト + CTA */}
        <div className={styles.content}>
          <p ref={eyebrowRef} className={`${styles.eyebrow} font-body`}>
            PARTNER PROGRAM — NTS
          </p>
          <h1 ref={headlineRef} className={`${styles.headline} font-heading`}>
            <span className={styles.headlineLine}>「補助金が使えますよ」</span>
            <span className={styles.headlineLine}>その一言で、営業が変わる。</span>
          </h1>
          <p ref={subRef} className={`${styles.sub} font-body`}>
            御社の商材を提案するとき、「補助金の対象です」と添えるだけで顧客の反応が変わります。
            <br />
            補助金の知識も、申請の対応も不要。紹介フィーもお支払いします。
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

        {/* 右カラム: 画像プレースホルダー */}
        <div
          ref={imgColRef}
          className={styles.imgCol}
          style={{ opacity: 0, transform: "translateY(20px)" }}
        >
          <div className={styles.imgPlaceholder} data-placeholder="hero-main">
            <Image
              src={isometric08}
              alt="（後から差し替え）Heroイラスト"
              width={640}
              height={640}
              className={styles.heroImageLeft}
            />
            <Image
              src={isometric16}
              alt="（後から差し替え）Heroイラスト"
              width={640}
              height={640}
              className={styles.heroImageRight}
            />
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
