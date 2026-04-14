"use client";

import { useEffect, type RefObject } from "react";
import * as THREE from "three";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export type UseGalaxyOptions = {
  /** 1 = 既定。1.2 などで粒子の不透明度・コントラストを上げ視認性を上げる */
  particleIntensity?: number;
};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export function useGalaxy(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  options?: UseGalaxyOptions,
) {
  const particleIntensity = options?.particleIntensity ?? 1;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (prefersReducedMotion()) return;

    const pi = Math.max(0.7, Math.min(1.4, particleIntensity));

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xf8f7f4, 1);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 200);
    camera.position.set(0, 3.5, 7);
    camera.lookAt(0, 0, 0);

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      const W = Math.max(1, Math.floor(rect.width));
      const H = Math.max(1, Math.floor(rect.height));
      renderer.setSize(W, H, false);
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    const narrow = window.innerWidth < 768;
    const ARM_COUNT = 3;
    const P_PER_ARM = narrow ? 800 : 1800;
    const CORE_N = narrow ? 300 : 600;
    const TOTAL_P = ARM_COUNT * P_PER_ARM + CORE_N;

    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(TOTAL_P * 3);
    const colors = new Float32Array(TOTAL_P * 3);
    const colorDarken = pi <= 1 ? 1 : Math.max(0.78, 1.22 - 0.22 * pi);

    let idx = 0;
    for (let arm = 0; arm < ARM_COUNT; arm++) {
      const armAngle = (arm / ARM_COUNT) * Math.PI * 2;
      for (let i = 0; i < P_PER_ARM; i++) {
        const t = i / P_PER_ARM;
        const radius = 0.15 + t * 5.5;
        const angle = armAngle + t * Math.PI * 4.5;
        const spread = 0.12 + t * 0.45;

        positions[idx * 3] =
          Math.cos(angle) * radius + (Math.random() - 0.5) * spread;
        positions[idx * 3 + 1] =
          (Math.random() - 0.5) * (0.06 + t * 0.18);
        positions[idx * 3 + 2] =
          Math.sin(angle) * radius + (Math.random() - 0.5) * spread;

        const bright = 1.0 - t * 0.55;
        colors[idx * 3] = (0.62 + bright * 0.28) * colorDarken;
        colors[idx * 3 + 1] = (0.6 + bright * 0.26) * colorDarken;
        colors[idx * 3 + 2] = (0.56 + bright * 0.24) * colorDarken;
        idx++;
      }
    }
    for (let i = 0; i < CORE_N; i++) {
      const r = Math.random() * 0.5;
      const a = Math.random() * Math.PI * 2;
      positions[idx * 3] = Math.cos(a) * r;
      positions[idx * 3 + 1] = (Math.random() - 0.5) * 0.1;
      positions[idx * 3 + 2] = Math.sin(a) * r;
      colors[idx * 3] = 0.88 * colorDarken;
      colors[idx * 3 + 1] = 0.86 * colorDarken;
      colors[idx * 3 + 2] = 0.82 * colorDarken;
      idx++;
    }

    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.032,
      vertexColors: true,
      transparent: true,
      opacity: clamp01(0.85 * pi),
    });
    const galaxy = new THREE.Points(geo, mat);
    scene.add(galaxy);

    const bgGeo = new THREE.BufferGeometry();
    const bgPos = new Float32Array(400 * 3);
    for (let i = 0; i < 400; i++) {
      bgPos[i * 3] = (Math.random() - 0.5) * 30;
      bgPos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      bgPos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 6;
    }
    bgGeo.setAttribute("position", new THREE.BufferAttribute(bgPos, 3));
    const bgMat = new THREE.PointsMaterial({
      color: 0x999080,
      size: 0.025,
      transparent: true,
      opacity: clamp01(0.35 * pi),
    });
    const bgStars = new THREE.Points(bgGeo, bgMat);
    scene.add(bgStars);

    const clock = new THREE.Clock();
    let animId = 0;

    function animate() {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      galaxy.rotation.y = t * 0.055;
      camera.position.x = Math.sin(t * 0.05) * 0.8;
      camera.position.z = 7 + Math.sin(t * 0.07) * 0.5;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      geo.dispose();
      mat.dispose();
      bgGeo.dispose();
      bgMat.dispose();
    };
  }, [canvasRef, particleIntensity]);
}

