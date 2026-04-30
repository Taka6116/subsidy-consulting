(function () {
  const data = window.__HYPERFRAMES_VIDEO_DATA__;
  const root = document.getElementById("scene-root");

  if (!data || !root) {
    throw new Error("HyperFrames video data is missing");
  }

  // totalDurationSec を video-data.js から読み取り、stage の data-duration を動的に更新する。
  // これにより音声長に合わせた映像尺が正確にレンダリングされる。
  const stage = document.getElementById("stage");
  if (stage && data.totalDurationSec) {
    stage.dataset.duration = String(data.totalDurationSec);
  }

  function esc(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function setTiming(element, start, duration) {
    element.style.setProperty("--start", `${start}s`);
    element.style.setProperty("--duration", `${duration}s`);
  }

  function renderCaptions(scene) {
    return (scene.captions || [])
      .map((caption) => {
        const duration = Math.max(1, caption.end - caption.start);
        return `<div class="caption" style="--caption-start:${caption.start}s;--caption-duration:${duration}s">${esc(caption.text)}</div>`;
      })
      .join("");
  }

  function renderMetrics(scene) {
    return `<div class="metrics">${(scene.metrics || [])
      .map(
        (metric, index) => `
          <div class="metric card" style="--i:${index}">
            <div class="metric-label">${esc(metric.label)}</div>
            <div class="metric-value">${esc(metric.value)}</div>
            ${metric.note ? `<div class="metric-note">${esc(metric.note)}</div>` : ""}
          </div>
        `,
      )
      .join("")}</div>`;
  }

  function renderIssues(scene) {
    return `<div class="issue-list">${(scene.lines || [])
      .slice(0, 3)
      .map(
        (line, index) => `
          <div class="issue card" style="--i:${index}">
            <div class="issue-no">ISSUE ${String(index + 1).padStart(2, "0")}</div>
            <div class="issue-text">${esc(line)}</div>
          </div>
        `,
      )
      .join("")}</div>`;
  }

  function renderUseCases(scene) {
    return `<div class="usecase-grid">${(scene.useCases || [])
      .map(
        (useCase, index) => `
          <article class="usecase card" style="--i:${index}">
            <div class="usecase-visual">
              <img src="${esc(useCase.image)}" alt="" />
            </div>
            <div class="usecase-body">
              <div class="persona">CASE ${String(index + 1).padStart(2, "0")} — ${esc(useCase.persona)}</div>
              <div class="usecase-title">${esc(useCase.label)}</div>
              <div class="usecase-text">${esc(useCase.body)}</div>
            </div>
          </article>
        `,
      )
      .join("")}</div>`;
  }

  function renderSteps(scene) {
    return `<div class="timeline">${(scene.steps || [])
      .map(
        (step, index) => `
          <div class="step card" style="--i:${index}">
            <div class="step-no">${index + 1}</div>
            <div class="step-text">${esc(step)}</div>
          </div>
        `,
      )
      .join("")}</div>`;
  }

  function renderDefault(scene) {
    return `<p class="lead">${esc((scene.lines || []).join("。"))}</p>`;
  }

  function renderSceneBody(scene) {
    if (scene.id === "overview") return renderMetrics(scene);
    if (scene.id === "problem") return renderIssues(scene);
    if (scene.id === "useCases") return renderUseCases(scene);
    if (scene.id === "process") return renderSteps(scene);
    if (scene.id === "cta") {
      return `
        <div class="cta-panel card">
          <div>
            <div class="kicker">${esc(scene.kicker)}</div>
            <h1 class="title">${esc(scene.title)}</h1>
            <p class="lead">${esc((scene.lines || [])[1] || "日本提携支援が伴走します")}</p>
            <div class="cta-button">無料相談で確認する</div>
          </div>
          <div class="url-box">
            <div>詳しくはこちら</div>
            <div>${esc(data.lpUrl)}</div>
          </div>
        </div>
      `;
    }
    return renderDefault(scene);
  }

  root.innerHTML = data.scenes
    .map((scene) => {
      const sceneElement = document.createElement("section");
      sceneElement.className = `scene scene-${scene.id}`;
      setTiming(sceneElement, scene.start, scene.duration);
      sceneElement.innerHTML = `
        <div class="scene-inner">
          ${scene.id === "cta" ? "" : `<div class="kicker">${esc(scene.kicker)}</div>`}
          ${scene.id === "cta" ? "" : `<h1 class="title">${esc(scene.title)}</h1>`}
          ${renderSceneBody(scene)}
        </div>
      `;
      return sceneElement.outerHTML;
    })
    .join("");

  root.insertAdjacentHTML("afterend", data.scenes.map(renderCaptions).join(""));
})();
