const { chromium } = require("playwright");
const path = require("path");
(async () => {
  const WORK = process.env.WORK;
  const b = await chromium.launch();
  const page = await b.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto("file://" + path.join(WORK, "index.html"));
  await page.waitForTimeout(300);
  await page.addStyleTag({ content: `
    *, *::before, *::after { animation: none !important; transition: none !important; }
    .reveal, .rise, .cardFocus { opacity: 1 !important; transform: none !important; }
    .scene { opacity: 0 !important; }
    .scene.__show { opacity: 1 !important; z-index: 100 !important; }
  `});
  await page.evaluate(() => {
    document.querySelector(".scene-cta").classList.add("__show");
  });
  await page.waitForTimeout(200);
  const m = await page.evaluate(() => {
    const sel = s => { const el=document.querySelector(s); if(!el) return null; const r=el.getBoundingClientRect(); const cs=getComputedStyle(el); return {w:Math.round(r.width),h:Math.round(r.height),display:cs.display,gridCols:cs.gridTemplateColumns}; };
    return {
      panel: sel(".cta-panel"),
      left: sel(".cta-left"),
      right: sel(".cta-right"),
      qrFrame: sel(".qr-frame"),
      qrSvg: sel(".qr-svg"),
    };
  });
  console.log(JSON.stringify(m, null, 2));
  await b.close();
})();
