const { chromium } = require("playwright");
const path = require("path");
(async () => {
  const WORK = process.env.WORK;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto("file://" + path.join(WORK, "index.html"));
  await page.waitForTimeout(300);
  // 検証用: 全アニメを無効化し、reveal/rise/cardFocus を最終状態に固定
  await page.addStyleTag({ content: `
    *, *::before, *::after { animation: none !important; transition: none !important; }
    .reveal, .rise, .cardFocus { opacity: 1 !important; transform: none !important; }
    .scene { opacity: 0 !important; }
    .scene.__show { opacity: 1 !important; z-index: 100 !important; }
  `});
  const scenes = ["hook","overview","useCases","cta"];
  const fileMap = {hook:"1-hook",overview:"2-overview",useCases:"3-usecases",cta:"4-cta"};
  for (const id of scenes) {
    await page.evaluate((sid) => {
      document.querySelectorAll(".scene").forEach(el => el.classList.remove("__show"));
      const el = document.querySelector(".scene-" + sid);
      if (el) el.classList.add("__show");
    }, id);
    await page.waitForTimeout(250);
    await page.screenshot({ path: path.join(WORK, "v2-" + fileMap[id] + ".png") });
    console.log("shot", id);
  }
  await browser.close();
})();
