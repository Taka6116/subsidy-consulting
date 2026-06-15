const { chromium } = require("playwright");
const path = require("path");
(async () => {
  const WORK = process.env.WORK;
  const b = await chromium.launch();
  const shots = [{n:"a1-hook",t:5000},{n:"a2-overview",t:18000},{n:"a3-usecases",t:34000},{n:"a4-cta",t:49000}];
  for (const s of shots) {
    const page = await b.newPage({ viewport: { width: 1280, height: 720 } });
    // 仮想時計を使い、ロード直後に時刻を固定 → そこへ全アニメをseek
    await page.goto("file://" + path.join(WORK, "index.html"));
    await page.waitForTimeout(200);
    await page.evaluate((tMs) => {
      for (const a of document.getAnimations()) {
        a.pause();
        const delay = (a.effect && a.effect.getTiming && a.effect.getTiming().delay) || 0;
        // currentTime はアニメ開始基準。シーンの delay を考慮して相対時刻に。
        a.currentTime = tMs;
      }
    }, s.t);
    await page.waitForTimeout(150);
    await page.screenshot({ path: path.join(WORK, "anim-" + s.n + ".png") });
    await page.close();
    console.log("shot", s.n);
  }
  await b.close();
})();
