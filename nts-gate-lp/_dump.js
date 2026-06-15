const { chromium } = require("playwright");
const path = require("path");
(async () => {
  const WORK = process.env.WORK;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = [];
  page.on("console", m => { if (m.type()==="error") errs.push(m.text()); });
  page.on("pageerror", e => errs.push("PAGEERR: "+e.message));
  await page.goto("file://" + path.join(WORK, "index.html"));
  await page.waitForTimeout(500);
  const info = await page.evaluate(() => {
    const scenes = [...document.querySelectorAll(".scene")].map(s => s.className);
    const rootChildren = document.getElementById("scene-root")?.children.length;
    return { scenes, rootChildren, hasData: !!window.__HYPERFRAMES_VIDEO_DATA__ };
  });
  console.log("errs:", JSON.stringify(errs));
  console.log("info:", JSON.stringify(info));
  await browser.close();
})();
