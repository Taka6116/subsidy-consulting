import QRCode from "qrcode";
import fs from "node:fs";
import path from "node:path";
import { Resvg } from "@resvg/resvg-js";

const TARGET_URL = "https://subsidy-nts-v2.vercel.app/subsidies";
const OUT_DIR = path.join(process.cwd(), "scripts", "heygen", "output");

async function main() {
fs.mkdirSync(OUT_DIR, { recursive: true });

// ── QRコード単体PNG ──
await QRCode.toFile(path.join(OUT_DIR, "qr-subsidies.png"), TARGET_URL, {
  width: 400,
  margin: 2,
  color: { dark: "#0f2451", light: "#ffffff" },
});
console.log("✅ QR単体: scripts/heygen/output/qr-subsidies.png");

// ── シーン5 CTA スライド全体（1280×720） ──
const qrDataUrl = await QRCode.toDataURL(TARGET_URL, {
  width: 300,
  margin: 2,
  color: { dark: "#0f2451", light: "#ffffff" },
});

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1280" height="720" viewBox="0 0 1280 720">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f0f7ff"/>
      <stop offset="100%" stop-color="#dbeafe"/>
    </linearGradient>
    <filter id="sh"><feDropShadow dx="0" dy="8" stdDeviation="14" flood-color="#1d4ed8" flood-opacity="0.15"/></filter>
    <filter id="sh2"><feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000" flood-opacity="0.12"/></filter>
  </defs>

  <!-- 背景 -->
  <rect width="1280" height="720" fill="url(#bg)"/>
  <circle cx="1150" cy="100" r="280" fill="#93c5fd" opacity="0.2"/>
  <circle cx="100" cy="620" r="200" fill="#bfdbfe" opacity="0.2"/>

  <!-- NTSロゴエリア -->
  <rect x="48" y="40" width="200" height="44" rx="22" fill="#0f2451"/>
  <text x="148" y="68" text-anchor="middle" font-family="sans-serif" font-size="18" font-weight="800" fill="#ffffff">NTS 日本提携支援</text>

  <!-- メインメッセージ -->
  <text x="440" y="200" text-anchor="middle" font-family="sans-serif" font-size="38" font-weight="900" fill="#0f2451">補助金のご相談、まずはお気軽に</text>
  <text x="440" y="258" text-anchor="middle" font-family="sans-serif" font-size="48" font-weight="900" fill="#2563eb">日本提携支援へ</text>

  <!-- サブテキスト -->
  <text x="440" y="316" text-anchor="middle" font-family="sans-serif" font-size="22" fill="#475569">無料診断ツールで今すぐ対象補助金を確認できます</text>

  <!-- CTAボタン風 -->
  <rect x="180" y="360" width="520" height="72" rx="36" fill="#2563eb" filter="url(#sh)"/>
  <text x="440" y="405" text-anchor="middle" font-family="sans-serif" font-size="26" font-weight="800" fill="#ffffff">無料診断ツールを試す →</text>

  <!-- URL テキスト -->
  <text x="440" y="468" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#64748b">subsidy-nts-v2.vercel.app/subsidies</text>

  <!-- 区切り線 -->
  <line x1="780" y1="160" x2="780" y2="560" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="6,4"/>

  <!-- QRコード -->
  <rect x="860" y="160" width="320" height="320" rx="20" fill="#ffffff" filter="url(#sh2)"/>
  <image x="870" y="170" width="300" height="300" xlink:href="${qrDataUrl}"/>

  <!-- QRラベル -->
  <text x="1020" y="510" text-anchor="middle" font-family="sans-serif" font-size="18" font-weight="700" fill="#475569">QRコードで今すぐアクセス</text>
  <text x="1020" y="536" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#94a3b8">スマホのカメラで読み取り</text>
</svg>`;

const resvg = new Resvg(svg, {
  fitTo: { mode: "width", value: 1280 },
  font: { loadSystemFonts: true },
});
const png = Buffer.from(resvg.render().asPng());
fs.writeFileSync(path.join(OUT_DIR, "slide-cta.png"), png);
console.log("✅ CTAスライド: scripts/heygen/output/slide-cta.png");
console.log(`   対象URL: ${TARGET_URL}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
