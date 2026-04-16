"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import HeroPartnerStrip from "@/components/gate-lp/HeroPartnerStrip";
import styles from "./HeroSection.module.css";

export default function HeroSection() {
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const s1Ref = useRef<HTMLDivElement>(null);
  const a1Ref = useRef<HTMLDivElement>(null);
  const s2Ref = useRef<HTMLDivElement>(null);
  const a2Ref = useRef<HTMLDivElement>(null);
  const s3Ref = useRef<HTMLDivElement>(null);
  const a3Ref = useRef<HTMLDivElement>(null);
  const s4Ref = useRef<HTMLDivElement>(null);
  const ctRef = useRef<HTMLDivElement>(null);
  const stepIconRefs = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const allEls = [
      eyebrowRef.current,
      headlineRef.current,
      subRef.current,
      s1Ref.current,
      a1Ref.current,
      s2Ref.current,
      a2Ref.current,
      s3Ref.current,
      a3Ref.current,
      s4Ref.current,
      ctRef.current,
    ].filter(Boolean) as HTMLElement[];

    if (prefersReduced) {
      gsap.set(allEls, { opacity: 1, y: 0, clearProps: "transform" });
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.to(eyebrowRef.current, { opacity: 1, y: 0, duration: 0.8 }, 0)
      .to(headlineRef.current, { opacity: 1, y: 0, duration: 0.9 }, 0.2)
      .to(subRef.current, { opacity: 1, y: 0, duration: 0.8 }, 0.4)
      .to(s1Ref.current, { opacity: 1, y: 0, duration: 0.7 }, 0.7)
      .to(a1Ref.current, { opacity: 1, duration: 0.5 }, 0.95)
      .to(s2Ref.current, { opacity: 1, y: 0, duration: 0.7 }, 1.05)
      .to(a2Ref.current, { opacity: 1, duration: 0.5 }, 1.3)
      .to(s3Ref.current, { opacity: 1, y: 0, duration: 0.7 }, 1.4)
      .to(a3Ref.current, { opacity: 1, duration: 0.5 }, 1.65)
      .to(s4Ref.current, { opacity: 1, y: 0, duration: 0.7 }, 1.75)
      .to(ctRef.current, { opacity: 1, y: 0, duration: 0.7 }, 1.95);

    const icons = stepIconRefs.current.filter(Boolean) as HTMLDivElement[];
    const bindings = icons.map((el) => {
      const onEnter = () => {
        gsap.to(el, { scale: 1.12, duration: 0.25, ease: "back.out(2)" });
      };
      const onLeave = () => {
        gsap.to(el, { scale: 1, duration: 0.2 });
      };
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
      return { el, onEnter, onLeave };
    });

    return () => {
      tl.kill();
      bindings.forEach(({ el, onEnter, onLeave }) => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      });
    };
  }, []);

  const setStepIconRef = (i: number) => (el: HTMLDivElement | null) => {
    stepIconRefs.current[i] = el;
  };

  return (
    <section className={`section-hero ${styles.page}`}>
      <div className={styles.heroMain}>
      <div className={styles.content}>
      <p ref={eyebrowRef} className={`${styles.eyebrow} font-body`}>
        PARTNER PROGRAM — NTS
      </p>
      <h1 ref={headlineRef} className={`${styles.headline} font-heading`}>
        顧客の『できない』を、
        <br />
        『できる』に変える一言がある。
      </h1>
      <p ref={subRef} className={`${styles.sub} font-body`}>
        御社の顧客に、補助金という選択肢を渡してください。
        <br />
        採択後も1年間、NTSがお客様に寄り添います。
        <br />
        紹介フィーは成功報酬制です。
      </p>

      <div className={`${styles.flow} font-body`}>
        <div ref={s1Ref} className={styles.step}>
          <div ref={setStepIconRef(0)} className={styles.stepIcon}>
            <div className={styles.pulseRing} aria-hidden />
            <span className={styles.stepNum}>1</span>
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className={styles.stepLabel}>顧客を紹介</div>
          <div className={styles.stepSub}>
            御社→NTS
            <br />
            1分で完了
          </div>
        </div>
        <div ref={a1Ref} className={styles.arrow}>
          <div className={styles.arrowDot} />
        </div>
        <div ref={s2Ref} className={styles.step}>
          <div ref={setStepIconRef(1)} className={styles.stepIcon}>
            <span className={styles.stepNum}>2</span>
            <svg viewBox="0 0 24 24" aria-hidden>
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
              <path d="M11 8v6M8 11h6" />
            </svg>
          </div>
          <div className={styles.stepLabel}>補助金マッチング</div>
          <div className={styles.stepSub}>
            NTSが診断
            <br />
            最適制度を選定
          </div>
        </div>
        <div ref={a2Ref} className={styles.arrow}>
          <div className={`${styles.arrowDot} ${styles.arrowDotDelay1}`} />
        </div>
        <div ref={s3Ref} className={styles.step}>
          <div ref={setStepIconRef(2)} className={styles.stepIcon}>
            <span className={styles.stepNum}>3</span>
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <div className={styles.stepLabel}>申請〜採択</div>
          <div className={styles.stepSub}>
            全てNTSが
            <br />
            一括対応
          </div>
        </div>
        <div ref={a3Ref} className={styles.arrow}>
          <div className={`${styles.arrowDot} ${styles.arrowDotDelay2}`} />
        </div>
        <div ref={s4Ref} className={styles.step}>
          <div ref={setStepIconRef(3)} className={styles.stepIcon}>
            <span className={styles.stepNum}>4</span>
            <svg viewBox="0 0 24 24" aria-hidden>
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className={styles.stepLabel}>紹介フィー受取</div>
          <div className={styles.stepSub}>
            採択額の
            <br />
            一定割合をお支払
          </div>
        </div>
      </div>

      <div ref={ctRef} className={`${styles.ctas} font-body`}>
        <a href="#merit" className={styles.btnP}>
          提携の詳細を見る
        </a>
        <a href="#contact" className={styles.btnS}>
          まず話を聞く →
        </a>
      </div>
      </div>
      </div>

      <div className={styles.heroStrip}>
        <HeroPartnerStrip variant="dark" />
      </div>
    </section>
  );
}
