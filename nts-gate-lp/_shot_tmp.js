const { chromium } = require("playwright");
const path = require("path");
(async () => {
  const WORK = process.env.WORK;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  await page.goto("file://" + path.join(WORK, "index.html"));
  await page.waitForTimeout(300);
  // 各シーンの「見せたい時刻」(秒)：start + 数秒
  const shots = [
    { name: "1-hook", t: 4 },
    { name: "2-overview", t: 18 },
    { name: "3-usecases", t: 33 },
    { name: "4-cta", t: 48 },
  ];
  for (const s of shots) {
    // 全 CSS アニメーションを指定時刻へ seek（ページ全体の時計を進める代わりに各アニメの currentTime を設定）
    await page.evaluate((tSec) => {
      const tMs = tSec * 1000;
      for (const a of document.getAnimations()) {
        try {
          a.pause();
          // 遅延込みの絶対時刻に合わせる
          a.currentTime = tMs;
        } catch (e) {}
      }
    }, s.t);
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(WORK, "shot-" + s.name + ".png") });
    console.log("shot", s.name);
  }
  await browser.close();
})();
