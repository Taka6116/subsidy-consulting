"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const FOG_COLOR = 0x041e42;
const CLEAR_COLOR = 0x041e42;
const BEAM_COUNT = 24;
const N1 = 2200;
const N2 = 600;
const N3 = 90;
const SX = 16;
const SY = 12;
const SZ = -5;

function makeCircleTex(size: number, sharpness: number): THREE.CanvasTexture {
  const cv = document.createElement("canvas");
  cv.width = cv.height = size;
  const ctx = cv.getContext("2d");
  if (!ctx) throw new Error("2d context");
  const r = size / 2;
  const g = ctx.createRadialGradient(r, r, 0, r, r, r);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(sharpness, "rgba(255,255,255,.5)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
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

export default function PartnerLpWebGLBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

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
    scene.fog = new THREE.FogExp2(FOG_COLOR, 0.016);

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
        c1[i * 3] = 0.5 * br;
        c1[i * 3 + 1] = 0.95 * br;
        c1[i * 3 + 2] = 0.85 * br;
      } else if (t < 0.72) {
        c1[i * 3] = 0.25 * br;
        c1[i * 3 + 1] = 0.72 * br;
        c1[i * 3 + 2] = 0.98 * br;
      } else {
        c1[i * 3] = 0.88 * br;
        c1[i * 3 + 1] = 0.98 * br;
        c1[i * 3 + 2] = br;
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
      opacity: 0.8,
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
      color: 0x88eedd,
      transparent: true,
      opacity: 0.42,
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
      color: 0xccf8f4,
      transparent: true,
      opacity: 0.26,
      alphaTest: 0.01,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    scene.add(new THREE.Points(g3, m3));

    const beamTargets: { x: number; y: number; z: number }[] = [];
    for (let i = 0; i < BEAM_COUNT; i++) {
      beamTargets.push({
        x: -18 + Math.random() * 16,
        y: -10 + Math.random() * 12,
        z: (Math.random() - 0.5) * 12,
      });
    }

    const rayGroup = new THREE.Group();
    const rayLines: THREE.Group[] = [];
    const lineDisposables: { geo: THREE.BufferGeometry; mat: THREE.LineBasicMaterial }[] = [];

    beamTargets.forEach((tgt) => {
      const lineCount = 3 + Math.floor(Math.random() * 3);
      const baseOp = 0.18 + Math.random() * 0.28;
      const beamGroup = new THREE.Group();

      for (let li = 0; li < lineCount; li++) {
        const spreadX = (Math.random() - 0.5) * 0.6;
        const spreadY = (Math.random() - 0.5) * 0.3;
        const srcX = SX + (Math.random() - 0.5) * 1.5;
        const srcY = SY + (Math.random() - 0.5) * 0.8;
        const srcZ = SZ + (Math.random() - 0.5) * 0.5;

        const points = [
          new THREE.Vector3(srcX, srcY, srcZ),
          new THREE.Vector3(tgt.x + spreadX, tgt.y + spreadY, tgt.z),
        ];
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        const colors = new Float32Array([
          0.55, 0.92, 0.82, 0.15, 0.55, 0.7,
        ]);
        geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

        const opacityScale = 0.5 + Math.random() * 0.5;
        const mat = new THREE.LineBasicMaterial({
          vertexColors: true,
          transparent: true,
          opacity: baseOp * opacityScale,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });
        const line = new THREE.Line(geo, mat);
        line.userData.opacityScale = opacityScale;
        beamGroup.add(line);
        lineDisposables.push({ geo, mat });
      }

      const ud: BeamUserData = {
        baseOp,
        cloudPhase: Math.random() * Math.PI * 2,
        cloudSpeed: 0.009 + Math.random() * 0.012,
        cloudAmp: 0.28 + Math.random() * 0.45,
        wavePhase: Math.random() * Math.PI * 2,
        waveSpeed: 0.14 + Math.random() * 0.2,
        waveAmp: 0.06 + Math.random() * 0.12,
        anglePhase: Math.random() * Math.PI * 2,
        angleSpeed: 0.003 + Math.random() * 0.005,
        angleDrift: (Math.random() - 0.5) * 0.04,
      };
      beamGroup.userData = ud;
      rayGroup.add(beamGroup);
      rayLines.push(beamGroup);
    });
    scene.add(rayGroup);

    const sunGlowG = new THREE.PlaneGeometry(7, 4);
    const sunGlowM = new THREE.MeshBasicMaterial({
      color: 0xaaffee,
      transparent: true,
      opacity: 0.09,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const sunGlow = new THREE.Mesh(sunGlowG, sunGlowM);
    sunGlow.position.set(SX * 0.55, SY * 0.65, SZ * 0.5);
    sunGlow.rotation.z = -0.3;
    scene.add(sunGlow);

    const causticG = new THREE.PlaneGeometry(22, 10);
    const causticM = new THREE.MeshBasicMaterial({
      color: 0x44ddbb,
      transparent: true,
      opacity: 0.04,
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

    const clock = new THREE.Clock();
    let raf = 0;

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.1);
      const t = clock.getElapsedTime();

      cam.position.x += (mx * 0.55 - cam.position.x) * 0.02;
      cam.position.y += (-my * 0.28 - cam.position.y + 1) * 0.02;
      cam.lookAt(0, 0, 0);

      cloudTimer += dt;
      if (cloudTimer > cloudInterval) {
        cloudTimer = 0;
        cloudInterval = 6 + Math.random() * 14;
        cloudTarget = 0.3 + Math.random() * 0.7;
      }
      cloudState += (cloudTarget - cloudState) * Math.min(1, dt * 60 * 0.003);

      rayLines.forEach((beam) => {
        const u = beam.userData as BeamUserData;
        const cloud = cloudState * (0.7 + u.cloudAmp * Math.sin(t * u.cloudSpeed + u.cloudPhase));
        const wave = 1.0 + u.waveAmp * Math.sin(t * u.waveSpeed + u.wavePhase);
        const finalOp = u.baseOp * cloud * wave;

        beam.children.forEach((child) => {
          const line = child as THREE.Line;
          const mat = line.material as THREE.LineBasicMaterial;
          const scale = (line.userData.opacityScale as number) ?? 1;
          mat.opacity = Math.max(0, Math.min(1, finalOp * scale));
        });

        beam.rotation.z = u.angleDrift * Math.sin(t * u.angleSpeed + u.anglePhase);
      });

      sunGlowM.opacity = 0.07 * cloudState + 0.02 * Math.sin(t * 0.3);
      causticM.opacity = 0.03 * cloudState + 0.015 * Math.sin(t * 0.5 + 1.2);

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
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
      style={{ width: "100%", height: "100%" }}
      aria-hidden="true"
    />
  );
}
