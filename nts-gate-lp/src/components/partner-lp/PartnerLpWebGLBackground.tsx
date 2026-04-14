"use client";

/**
 * パートナー LP 用「海中の太陽光」WebGL 背景。
 * ゴッドレイは THREE.Line のみ（Plane での光束は使わない）。
 * 色味: CSS `linear-gradient(180deg, #0a466b 0%, #011326 100%)` / `rgba(167,240,255,…)` に合わせる。
 */
import { useEffect, useRef } from "react";
import * as THREE from "three";

/** #0a466b に近い明るめのネイビー（クリアカラー） */
const CLEAR_COLOR = 0x0a3d5e;
/** フォグ深部 #011326 系 */
const FOG_COLOR = 0x062840;
const FOG_DENSITY = 0.016;
const BEAM_COUNT = 16;
const N1 = 2200;
const N2 = 600;
const N3 = 90;
/** 光源：右斜め上の外側 */
const SX = 22;
const SY = 16;
const SZ = -4;

function makeCircleTex(size: number, sharpness: number): THREE.CanvasTexture {
  const cv = document.createElement("canvas");
  cv.width = cv.height = size;
  const ctx = cv.getContext("2d");
  if (!ctx) throw new Error("2d context");
  const r = size / 2;
  const grad = ctx.createRadialGradient(r, r, 0, r, r, r);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(sharpness, "rgba(255,255,255,0.5)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(r, r, r, 0, Math.PI * 2);
  ctx.fill();
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

type BeamUserData = {
  baseOp: number;
  cloudPhase: number;
  cloudSpeed: number;
  cloudAmp: number;
  wavePhase: number;
  waveSpeed: number;
  waveAmp: number;
  anglePhase: number;
  angleSpeed: number;
  angleDrift: number;
};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

type PartnerLpWebGLBackgroundProps = {
  /** 1 = 既定。1.2 などで粒子・ビームの不透明度を上げ視認性を上げる（各値は 1 でクランプ） */
  particleIntensity?: number;
};

export default function PartnerLpWebGLBackground({
  particleIntensity = 1,
}: PartnerLpWebGLBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pi = Math.max(0.5, Math.min(1.5, particleIntensity));

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: false,
      antialias: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(CLEAR_COLOR, 1);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(FOG_COLOR, FOG_DENSITY);

    const cam = new THREE.PerspectiveCamera(
      65,
      window.innerWidth / window.innerHeight,
      0.1,
      200,
    );
    cam.position.set(0, 1, 14);

    let mx = 0;
    let my = 0;
    const onMove = (e: MouseEvent) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const onResize = () => {
      cam.aspect = window.innerWidth / window.innerHeight;
      cam.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("resize", onResize);

    const texSharp = makeCircleTex(64, 0.28);
    const texSoft = makeCircleTex(64, 0.55);
    const texGlow = makeCircleTex(128, 0.38);

    const p1 = new Float32Array(N1 * 3);
    const c1 = new Float32Array(N1 * 3);
    const v1 = new Float32Array(N1 * 3);
    for (let i = 0; i < N1; i++) {
      p1[i * 3] = (Math.random() - 0.5) * 50;
      p1[i * 3 + 1] = (Math.random() - 0.5) * 30;
      p1[i * 3 + 2] = (Math.random() - 0.5) * 25;
      const t = Math.random();
      const br = 0.5 + Math.random() * 0.5;
      if (t < 0.4) {
        c1[i * 3] = 0.655 * br;
        c1[i * 3 + 1] = 0.941 * br;
        c1[i * 3 + 2] = 1.0 * br;
      } else if (t < 0.72) {
        c1[i * 3] = 0.3 * br;
        c1[i * 3 + 1] = 0.78 * br;
        c1[i * 3 + 2] = 0.92 * br;
      } else {
        c1[i * 3] = 0.82 * br;
        c1[i * 3 + 1] = 0.96 * br;
        c1[i * 3 + 2] = 1.0 * br;
      }
      v1[i * 3] = (Math.random() - 0.5) * 0.0007;
      v1[i * 3 + 1] = 0.0005 + Math.random() * 0.0009;
      v1[i * 3 + 2] = (Math.random() - 0.5) * 0.0004;
    }
    const g1 = new THREE.BufferGeometry();
    g1.setAttribute("position", new THREE.BufferAttribute(p1, 3));
    g1.setAttribute("color", new THREE.BufferAttribute(c1, 3));
    const m1 = new THREE.PointsMaterial({
      size: 0.12,
      map: texSharp,
      vertexColors: true,
      transparent: true,
      opacity: clamp01(0.85 * pi),
      alphaTest: 0.01,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    scene.add(new THREE.Points(g1, m1));

    const p2 = new Float32Array(N2 * 3);
    const v2 = new Float32Array(N2 * 3);
    for (let i = 0; i < N2; i++) {
      p2[i * 3] = (Math.random() - 0.5) * 44;
      p2[i * 3 + 1] = (Math.random() - 0.5) * 28;
      p2[i * 3 + 2] = (Math.random() - 0.5) * 20;
      v2[i * 3] = (Math.random() - 0.5) * 0.0005;
      v2[i * 3 + 1] = 0.003 + Math.random() * 0.005;
      v2[i * 3 + 2] = (Math.random() - 0.5) * 0.0003;
    }
    const g2 = new THREE.BufferGeometry();
    g2.setAttribute("position", new THREE.BufferAttribute(p2, 3));
    const m2 = new THREE.PointsMaterial({
      size: 0.28,
      map: texSoft,
      color: 0xa7f0ff,
      transparent: true,
      opacity: clamp01(0.46 * pi),
      alphaTest: 0.01,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    scene.add(new THREE.Points(g2, m2));

    const p3 = new Float32Array(N3 * 3);
    const v3: number[] = [];
    for (let i = 0; i < N3; i++) {
      p3[i * 3] = (Math.random() - 0.5) * 36;
      p3[i * 3 + 1] = (Math.random() - 0.5) * 22;
      p3[i * 3 + 2] = (Math.random() - 0.5) * 14;
      v3.push(0.005 + Math.random() * 0.009);
    }
    const g3 = new THREE.BufferGeometry();
    g3.setAttribute("position", new THREE.BufferAttribute(p3, 3));
    const m3 = new THREE.PointsMaterial({
      size: 0.55,
      map: texGlow,
      color: 0xd8f6ff,
      transparent: true,
      opacity: clamp01(0.3 * pi),
      alphaTest: 0.01,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    scene.add(new THREE.Points(g3, m3));

    const rayGroup = new THREE.Group();
    const rayLines: THREE.Group[] = [];
    const lineDisposables: { geo: THREE.BufferGeometry; mat: THREE.LineBasicMaterial }[] = [];

    for (let bi = 0; bi < BEAM_COUNT; bi++) {
      const tgt = {
        x: -22 + Math.random() * 14,
        y: -8 + Math.random() * 10,
        z: (Math.random() - 0.5) * 8,
      };
      const lineCount = 7 + Math.floor(Math.random() * 4);
      const baseOp = 0.09 + Math.random() * 0.14;
      const beamGroup = new THREE.Group();

      for (let li = 0; li < lineCount; li++) {
        const spreadX = (Math.random() - 0.5) * 1.15;
        const spreadY = (Math.random() - 0.5) * 0.55;
        const srcX = SX + (Math.random() - 0.5) * 2.2;
        const srcY = SY + (Math.random() - 0.5) * 1.1;
        const srcZ = SZ + (Math.random() - 0.5) * 0.65;

        const points = [
          new THREE.Vector3(srcX, srcY, srcZ),
          new THREE.Vector3(tgt.x + spreadX, tgt.y + spreadY, tgt.z),
        ];
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        const colors = new Float32Array([
          0.48, 0.78, 0.92, 0.06, 0.22, 0.36,
        ]);
        geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

        const mat = new THREE.LineBasicMaterial({
          vertexColors: true,
          transparent: true,
          opacity: clamp01(baseOp * (0.28 + Math.random() * 0.35) * pi),
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          linewidth: 1,
        });
        const line = new THREE.Line(geo, mat);
        beamGroup.add(line);
        lineDisposables.push({ geo, mat });
      }

      beamGroup.userData = {
        baseOp,
        cloudPhase: Math.random() * Math.PI * 2,
        cloudSpeed: 0.009 + Math.random() * 0.012,
        cloudAmp: 0.2 + Math.random() * 0.32,
        wavePhase: Math.random() * Math.PI * 2,
        waveSpeed: 0.1 + Math.random() * 0.14,
        waveAmp: 0.04 + Math.random() * 0.08,
        anglePhase: Math.random() * Math.PI * 2,
        angleSpeed: 0.003 + Math.random() * 0.005,
        angleDrift: (Math.random() - 0.5) * 0.04,
      } satisfies BeamUserData;
      rayGroup.add(beamGroup);
      rayLines.push(beamGroup);
    }
    scene.add(rayGroup);

    const sunGlowG = new THREE.PlaneGeometry(7, 4);
    const sunGlowM = new THREE.MeshBasicMaterial({
      color: 0xa7f0ff,
      transparent: true,
      opacity: clamp01(0.11 * pi),
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const sunGlow = new THREE.Mesh(sunGlowG, sunGlowM);
    sunGlow.position.set(13, 10, -3);
    sunGlow.rotation.z = -0.3;
    scene.add(sunGlow);

    const causticG = new THREE.PlaneGeometry(22, 10);
    const causticM = new THREE.MeshBasicMaterial({
      color: 0x55d8f0,
      transparent: true,
      opacity: clamp01(0.05 * pi),
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const caustic = new THREE.Mesh(causticG, causticM);
    caustic.position.set(-3, -6, -5);
    caustic.rotation.x = -1.1;
    caustic.rotation.z = 0.15;
    scene.add(caustic);

    let cloudState = 1.0;
    let cloudTarget = 1.0;
    let cloudTimer = 0;
    let cloudInterval = 8 + Math.random() * 12;

    const updateCloud = (deltaTime: number) => {
      cloudTimer += deltaTime;
      if (cloudTimer > cloudInterval) {
        cloudTimer = 0;
        cloudInterval = 6 + Math.random() * 14;
        cloudTarget = 0.3 + Math.random() * 0.7;
      }
      cloudState += (cloudTarget - cloudState) * Math.min(1, deltaTime * 60 * 0.003);
    };

    const updateRays = (t: number) => {
      rayLines.forEach((beam) => {
        const u = beam.userData as BeamUserData;
        const cloud = cloudState * (0.7 + u.cloudAmp * Math.sin(t * u.cloudSpeed + u.cloudPhase));
        const wave = 1.0 + u.waveAmp * Math.sin(t * u.waveSpeed + u.wavePhase);
        const finalOp = u.baseOp * cloud * wave;

        beam.children.forEach((child) => {
          const line = child as THREE.Line;
          const mat = line.material as THREE.LineBasicMaterial;
          mat.opacity = clamp01(finalOp * pi);
        });

        beam.rotation.z = u.angleDrift * Math.sin(t * u.angleSpeed + u.anglePhase);
      });
    };

    const clock = new THREE.Clock();
    let raf = 0;

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.1);
      const t = clock.getElapsedTime();

      cam.position.x += (mx * 0.55 - cam.position.x) * 0.02;
      cam.position.y += (-my * 0.28 - cam.position.y + 1) * 0.02;
      cam.lookAt(0, 0, 0);

      updateCloud(dt);
      updateRays(t);

      sunGlowM.opacity = clamp01(
        (0.07 * cloudState + 0.02 * Math.sin(t * 0.3)) * pi,
      );
      causticM.opacity = clamp01(
        (0.03 * cloudState + 0.015 * Math.sin(t * 0.5 + 1.2)) * pi,
      );

      for (let i = 0; i < N1; i++) {
        p1[i * 3] += v1[i * 3];
        p1[i * 3 + 1] += v1[i * 3 + 1];
        p1[i * 3 + 2] += v1[i * 3 + 2];
        if (p1[i * 3 + 1] > 15) p1[i * 3 + 1] = -15;
        if (p1[i * 3] > 25) p1[i * 3] = -25;
        else if (p1[i * 3] < -25) p1[i * 3] = 25;
      }
      g1.attributes.position!.needsUpdate = true;

      for (let i = 0; i < N2; i++) {
        p2[i * 3] += v2[i * 3] + Math.sin(t * 0.4 + i * 0.3) * 0.0008;
        p2[i * 3 + 1] += v2[i * 3 + 1];
        if (p2[i * 3 + 1] > 14) p2[i * 3 + 1] = -14;
      }
      g2.attributes.position!.needsUpdate = true;

      for (let i = 0; i < N3; i++) {
        p3[i * 3 + 1] += v3[i]!;
        p3[i * 3] += Math.sin(t * 0.6 + i * 0.8) * 0.003;
        if (p3[i * 3 + 1] > 11) p3[i * 3 + 1] = -11;
      }
      g3.attributes.position!.needsUpdate = true;

      renderer.render(scene, cam);
    };

    if (prefersReduced) {
      renderer.render(scene, cam);
    } else {
      animate();
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
      g1.dispose();
      g2.dispose();
      g3.dispose();
      m1.dispose();
      m2.dispose();
      m3.dispose();
      texSharp.dispose();
      texSoft.dispose();
      texGlow.dispose();
      lineDisposables.forEach(({ geo, mat }) => {
        geo.dispose();
        mat.dispose();
      });
      sunGlowG.dispose();
      sunGlowM.dispose();
      causticG.dispose();
      causticM.dispose();
      renderer.dispose();
    };
  }, [particleIntensity]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
      style={{ width: "100%", height: "100%" }}
      aria-hidden="true"
    />
  );
}
