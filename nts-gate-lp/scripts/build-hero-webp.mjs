// 一覧ページのヒーロー用人物写真のWebPを生成する
// 1) subsidies-list-hero-business-woman.webp        … 右端フェードのみ（モバイル用・矩形）
// 2) subsidies-list-hero-business-woman-circle.webp … 円デザインの外側を透過（デスクトップ用）
import sharp from "sharp";

const src = "public/images/subsidies-list-hero-business-woman.png";

const { width, height } = await sharp(src).metadata();

// --- モバイル用: 右端だけフェード ---
const edgeMask = `<svg width="${width}" height="${height}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0.84" stop-color="#fff" stop-opacity="1"/>
      <stop offset="0.94" stop-color="#fff" stop-opacity="0.4"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#g)"/>
</svg>`;

const rectInfo = await sharp(src)
  .ensureAlpha()
  .composite([{ input: Buffer.from(edgeMask), blend: "dest-in" }])
  .webp({ quality: 92, alphaQuality: 95 })
  .toFile("public/images/subsidies-list-hero-business-woman.webp");
console.log("rect:", JSON.stringify(rectInfo));

// --- デスクトップ用: 素材内の円デザインの外側を透過 ---
// 円は中心(742,388)・半径332（円弧のピクセル実測点を最小二乗フィットした値）。
// ジャケットは円の下側にはみ出すため、ポリゴンでマスクに含める。
// dest-in はアルファを参照するため、背景は透明のまま形状のみ不透明で描く
const circleMask = `<svg width="${width}" height="${height}">
  <circle cx="742" cy="388" r="332" fill="#fff"/>
  <polygon points="655,600 918,600 918,${height} 655,${height}" fill="#fff"/>
</svg>`;

const featheredCircle = await sharp(Buffer.from(circleMask))
  .ensureAlpha()
  .blur(10)
  .png()
  .toBuffer();

// 円の右側は素材の右端で切れるため、右端に狭いフェードを重ねて硬い縦の縁を消す
const rightGuard = `<svg width="${width}" height="${height}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0.86" stop-color="#fff" stop-opacity="1"/>
      <stop offset="0.96" stop-color="#fff" stop-opacity="0.35"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#g)"/>
</svg>`;

const circleInfo = await sharp(src)
  .ensureAlpha()
  .composite([
    { input: featheredCircle, blend: "dest-in" },
    { input: Buffer.from(rightGuard), blend: "dest-in" },
  ])
  .webp({ quality: 92, alphaQuality: 95 })
  .toFile("public/images/subsidies-list-hero-business-woman-circle.webp");
console.log("circle:", JSON.stringify(circleInfo));
