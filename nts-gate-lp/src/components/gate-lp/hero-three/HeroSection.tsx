"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import * as THREE from "three";
import { trackCTAClick } from "@/lib/analytics";
import styles from "./HeroSection.module.css";

const KEYWORDS = [
  "ものづくり補助金",
  "IT導入補助金",
  "事業再構築補助金",
  "雇用調整助成金",
  "小規模事業者持続化補助金",
  "省力化投資補助金",
  "産業雇用安定助成金",
  "キャリアアップ助成金",
  "業務改善助成金",
  "人材開発支援助成金",
  "働き方改革推進支援助成金",
  "両立支援等助成金",
  "地域雇用開発助成金",
  "設備投資補助金",
  "DX推進補助金",
  "事業承継・引継ぎ補助金",
  "創業補助金",
  "販路開拓補助金",
  "省エネ補助金",
  "再エネ導入補助金",
  "中小企業省力化投資補助事業",
  "社会保険適用促進助成金",
  "先端設備等導入計画",
  "経営革新計画",
  "地方創生推進交付金",
  "農業次世代投資資金",
  "医療DX推進事業",
  "トライアル雇用助成金",
  "なでしこ補助金",
  "各種税制優遇制度",
];

function makeTextSprite(
  text: string,
  opts: { fontSize: number; color: string; weight: 400 | 500 },
): THREE.Sprite {
  const fs = opts.fontSize;

  const tmp = document.createElement("canvas");
  const tc = tmp.getContext("2d")!;
  tc.font = `${opts.weight} ${fs}px 'Noto Sans JP', sans-serif`;
  const tw = tc.measureText(text).width;

  const cw = Math.ceil(tw + 28);
  const ch = Math.ceil(fs * 1.8);
  const c = document.createElement("canvas");
  c.width = cw;
  c.height = ch;

  const ctx = c.getContext("2d")!;
  ctx.font = `${opts.weight} ${fs}px 'Noto Sans JP', sans-serif`;
  ctx.fillStyle = opts.color;
  ctx.textBaseline = "middle";
  ctx.fillText(text, 14, ch / 2);

  const tex = new THREE.CanvasTexture(c);
  const mat = new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    depthWrite: false,
  });
  const sp = new THREE.Sprite(mat);
  sp.scale.set((cw / ch) * 3.4, 3.4, 1);
  return sp;
}

function easeInOutSine(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

interface Particle {
  sp: THREE.Sprite;
  cx: number;
  cy: number;
  targetA: number;
  fadeStart: number;
  fadeDuration: number;
  xA1: number;
  xF1: number;
  xP1: number;
  xA2: number;
  xF2: number;
  xP2: number;
  yA1: number;
  yF1: number;
  yP1: number;
  yA2: number;
  yF2: number;
  yP2: number;
  breathF: number;
  breathP: number;
  /** 毎フレームのフェード後アルファ（ホバー前） */
  lastAlpha: number;
  baseScale: THREE.Vector3;
  baseColor: THREE.Color;
}

export default function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) {
      canvas.style.display = "none";
      return;
    }

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: false,
      antialias: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x0d2660, 1);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      62,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.z = 52;

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    const startTime = performance.now();
    const particles: Particle[] = [];

    KEYWORDS.forEach((kw, i) => {
      // 左右にまんべんなくばらけるよう、インデックスで横位置の基準をずらしつつジッター
      const t = (i + Math.random() * 0.9) / KEYWORDS.length;
      const x = (t - 0.5) * 132 + (Math.random() - 0.5) * 28;
      const y = (Math.random() - 0.5) * 68;
      const z = (Math.random() - 0.5) * 42 - 4;

      const bright = 200 + Math.floor(Math.random() * 55);
      const targetA = 0.28 + Math.random() * 0.38;
      const isAccent = Math.random() > 0.55;
      const colorStr = isAccent
        ? `rgba(100,${bright},255,1)`
        : `rgba(${bright - 30},${bright + 10},255,1)`;

      const sp = makeTextSprite(kw, {
        fontSize: 12 + Math.floor(Math.random() * 6),
        color: colorStr,
        weight: Math.random() > 0.55 ? 500 : 400,
      });
      sp.position.set(x, y, z);
      (sp.material as THREE.SpriteMaterial).opacity = 0;
      scene.add(sp);

      const freqScale = 0.00018 + Math.random() * 0.00014;

      const mat0 = sp.material as THREE.SpriteMaterial;
      particles.push({
        sp,
        cx: x,
        cy: y,
        targetA,
        fadeStart: startTime + i * 120 + Math.random() * 300,
        fadeDuration: 1800 + Math.random() * 1200,
        xA1: 1.2 + Math.random() * 2.0,
        xF1: freqScale * (0.7 + Math.random() * 0.6),
        xP1: Math.random() * Math.PI * 2,
        xA2: 0.5 + Math.random() * 1.2,
        xF2: freqScale * (0.3 + Math.random() * 0.3),
        xP2: Math.random() * Math.PI * 2,
        yA1: 0.8 + Math.random() * 1.8,
        yF1: freqScale * (0.8 + Math.random() * 0.5),
        yP1: Math.random() * Math.PI * 2,
        yA2: 0.3 + Math.random() * 0.9,
        yF2: freqScale * (0.25 + Math.random() * 0.25),
        yP2: Math.random() * Math.PI * 2,
        breathF: 0.00022 + Math.random() * 0.00018,
        breathP: Math.random() * Math.PI * 2,
        lastAlpha: 0,
        baseScale: sp.scale.clone(),
        baseColor: mat0.color.clone(),
      });
    });

    const spriteMeshes = particles.map((p) => p.sp);
    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2(0, 0);
    let pointerInHero = false;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointerNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      pointerInHero = true;
    };
    const handlePointerLeave = () => {
      pointerInHero = false;
    };

    wrap.addEventListener("pointermove", handlePointerMove);
    wrap.addEventListener("pointerleave", handlePointerLeave);

    const DOT_N = 2400;
    const dPos = new Float32Array(DOT_N * 3);
    const dCol = new Float32Array(DOT_N * 3);
    const colA = new THREE.Color("#1a4dcc");
    const colB = new THREE.Color("#00bfff");

    for (let i = 0; i < DOT_N; i++) {
      dPos[i * 3] = (Math.random() - 0.5) * 180;
      dPos[i * 3 + 1] = (Math.random() - 0.5) * 110;
      dPos[i * 3 + 2] = (Math.random() - 0.5) * 80;
      const col = colA.clone().lerp(colB, Math.random());
      dCol[i * 3] = col.r;
      dCol[i * 3 + 1] = col.g;
      dCol[i * 3 + 2] = col.b;
    }

    const dcv = document.createElement("canvas");
    dcv.width = 32;
    dcv.height = 32;
    const dctx = dcv.getContext("2d")!;
    const dg = dctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    dg.addColorStop(0, "rgba(255,255,255,1)");
    dg.addColorStop(0.45, "rgba(255,255,255,.55)");
    dg.addColorStop(1, "rgba(255,255,255,0)");
    dctx.fillStyle = dg;
    dctx.fillRect(0, 0, 32, 32);

    const dGeo = new THREE.BufferGeometry();
    dGeo.setAttribute("position", new THREE.BufferAttribute(dPos, 3));
    dGeo.setAttribute("color", new THREE.BufferAttribute(dCol, 3));
    const dotTex = new THREE.CanvasTexture(dcv);
    const dMat = new THREE.PointsMaterial({
      size: 1.4,
      map: dotTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });
    const dots = new THREE.Points(dGeo, dMat);
    scene.add(dots);

    let mx = 0;
    let my = 0;
    const handleMouse = (e: MouseEvent) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    document.addEventListener("mousemove", handleMouse);

    let rafId = 0;
    const animate = () => {
      rafId = window.requestAnimationFrame(animate);
      const now = performance.now();

      particles.forEach((p) => {
        const elapsed = now - p.fadeStart;
        let alpha: number;
        if (elapsed <= 0) {
          alpha = 0;
        } else if (elapsed < p.fadeDuration) {
          alpha = easeInOutSine(elapsed / p.fadeDuration) * p.targetA;
        } else {
          const breath =
            0.88 + 0.12 * Math.sin(now * p.breathF + p.breathP);
          alpha = p.targetA * breath;
        }
        p.lastAlpha = alpha;
        p.sp.position.x =
          p.cx +
          p.xA1 * Math.sin(now * p.xF1 + p.xP1) +
          p.xA2 * Math.sin(now * p.xF2 + p.xP2);
        p.sp.position.y =
          p.cy +
          p.yA1 * Math.sin(now * p.yF1 + p.yP1) +
          p.yA2 * Math.sin(now * p.yF2 + p.yP2);
      });

      let hitSprite: THREE.Sprite | null = null;
      if (pointerInHero) {
        raycaster.setFromCamera(pointerNdc, camera);
        const hits = raycaster.intersectObjects(spriteMeshes, false);
        for (const h of hits) {
          const spr = h.object as THREE.Sprite;
          const part = particles.find((p) => p.sp === spr);
          if (part && part.lastAlpha > 0.06) {
            hitSprite = spr;
            break;
          }
        }
      }

      particles.forEach((p) => {
        const mat = p.sp.material as THREE.SpriteMaterial;
        const isHit = hitSprite === p.sp;
        let a = p.lastAlpha;
        if (isHit && a > 0.02) {
          a = Math.min(1, a * 1.28);
          mat.color.setRGB(1.45, 1.48, 1.55);
          p.sp.scale.copy(p.baseScale).multiplyScalar(1.09);
        } else {
          mat.color.copy(p.baseColor);
          p.sp.scale.copy(p.baseScale);
        }
        mat.opacity = a;
      });

      wrap.style.cursor = hitSprite ? "pointer" : "";

      camera.position.x += (mx * 2.5 - camera.position.x) * 0.04;
      camera.position.y += (my * 1.8 - camera.position.y) * 0.04;
      dots.rotation.y = now * 0.000055;
      dots.rotation.x = now * 0.000025;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousemove", handleMouse);
      wrap.removeEventListener("pointermove", handlePointerMove);
      wrap.removeEventListener("pointerleave", handlePointerLeave);
      wrap.style.cursor = "";
      renderer.dispose();
      particles.forEach((p) => {
        const m = p.sp.material as THREE.SpriteMaterial;
        m.map?.dispose();
        m.dispose();
      });
      dGeo.dispose();
      dMat.map?.dispose();
      dMat.dispose();
    };
  }, []);

  return (
    <section
      className={styles.hero}
      ref={wrapRef}
      aria-label="補助金照会サービス ヒーローセクション"
    >
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      <div className={styles.overlay} aria-hidden="true" />

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
