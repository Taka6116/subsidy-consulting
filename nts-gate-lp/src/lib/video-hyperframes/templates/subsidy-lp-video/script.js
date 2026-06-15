(function () {
  const data = window.__HYPERFRAMES_VIDEO_DATA__;
  const root = document.getElementById("scene-root");

  if (!data || !root) {
    throw new Error("HyperFrames video data is missing");
  }

  const stage = document.getElementById("stage");
  if (stage && data.totalDurationSec) {
    stage.dataset.duration = String(data.totalDurationSec);
  }

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function setTiming(element, start, duration) {
    element.style.setProperty("--start", start + "s");
    element.style.setProperty("--duration", duration + "s");
  }

  // インライン SVG アイコン辞書（24x24 / currentColor）
  const ICONS = {
    yen: '<path d="M12 3l5 8h-3v2h3v2h-3v6h-4v-6H4v-2h3v-2H4l5-8 .9 1.5L12 9.6 14.1 5.5 15 4z" fill="currentColor"/>',
    rate: '<path d="M7.5 4a3.5 3.5 0 100 7 3.5 3.5 0 000-7zm0 5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM18 5L6 19h-1.5L16.5 5H18zm-1.5 8a3.5 3.5 0 100 7 3.5 3.5 0 000-7zm0 5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" fill="currentColor"/>',
    calendar: '<path d="M7 2v2H5a2 2 0 00-2 2v13a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2V2h-2v2H9V2H7zM5 9h14v10H5V9z" fill="currentColor"/>',
    bell: '<path d="M12 22a2.5 2.5 0 002.45-2h-4.9A2.5 2.5 0 0012 22zm7-5l-1.6-1.6V10a5.4 5.4 0 00-4-5.2V4a1.4 1.4 0 00-2.8 0v.8A5.4 5.4 0 006.6 10v5.4L5 17v1h14v-1z" fill="currentColor"/>',
    target: '<path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 4a6 6 0 110 12 6 6 0 010-12zm0 4a2 2 0 100 4 2 2 0 000-4z" fill="currentColor"/>',
    check: '<path d="M9 16.2l-3.5-3.5L4 14.2l5 5 11-11-1.5-1.5z" fill="currentColor"/>',
    spark: '<path d="M12 2l1.8 5.6L19 9.4l-5.2 1.8L12 17l-1.8-5.8L5 9.4l5.2-1.8z" fill="currentColor"/>'
  };

  function icon(name, cls) {
    const body = ICONS[name];
    if (!body) return "";
    return '<svg class="icon ' + (cls || "") + '" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' + body + "</svg>";
  }

  function renderCaptions(scene) {
    return (scene.captions || [])
      .map(function (caption) {
        const duration = Math.max(1, caption.end - caption.start);
        return '<div class="caption" style="--caption-start:' + caption.start + "s;--caption-duration:" + duration + 's">' + esc(caption.text) + "</div>";
      })
      .join("");
  }

  function renderHook(scene) {
    const lead = scene.lines && scene.lines[1] ? scene.lines[1] : "";
    const alertHtml = scene.alert
      ? '<div class="hook-alert reveal" style="--d:3">' + icon("bell", "alert-icon") + "<span>" + esc(scene.alert) + "</span></div>"
      : "";
    const leadHtml = lead
      ? '<div class="hook-lead reveal" style="--d:2">' + icon("spark", "lead-icon") + "<span>" + esc(lead) + "</span></div>"
      : "";
    return (
      '<div class="hook-wrap">' +
      '<div class="hook-eyebrow reveal" style="--d:0">この動画で解説する補助金</div>' +
      '<h1 class="hook-title reveal" style="--d:1">' + esc(scene.summary || scene.title) + "</h1>" +
      '<div class="hook-accent reveal" style="--d:1"></div>' +
      leadHtml +
      alertHtml +
      "</div>"
    );
  }

  function renderOverview(scene) {
    const cards = (scene.metrics || [])
      .map(function (metric, index) {
        const note = metric.note ? '<div class="metric-note">' + esc(metric.note) + "</div>" : "";
        return (
          '<div class="metric card accent-' + esc(metric.accent || "amount") + ' rise" style="--i:' + index + '">' +
          '<span class="metric-label">' + esc(metric.label) + "</span>" +
          '<div class="metric-value">' + esc(metric.value) + "</div>" +
          note +
          "</div>"
        );
      })
      .join("");

    const targetBadge = scene.target
      ? '<span class="pill pill-target">' + icon("target") + "対象: " + esc(scene.target) + "</span>"
      : "";
    const badges = targetBadge
      ? '<div class="overview-badges reveal" style="--d:1">' + targetBadge + "</div>"
      : "";
    const note = scene.alert ? '<div class="overview-note reveal" style="--d:4">' + esc(scene.alert) + "</div>" : "";

    return badges + '<div class="metrics">' + cards + "</div>" + note;
  }

  function renderUseCases(scene) {
    const cards = (scene.useCases || [])
      .map(function (useCase, index) {
        const no = ("0" + (index + 1)).slice(-2);
        return (
          '<article class="usecase card cardFocus" style="--i:' + index + '">' +
          '<div class="usecase-visual">' +
          '<span class="usecase-tag">CASE ' + no + "</span>" +
          '<img src="' + esc(useCase.image) + '" alt="" />' +
          "</div>" +
          '<div class="usecase-body">' +
          '<div class="persona">' + icon("target", "persona-icon") + esc(useCase.persona) + "</div>" +
          '<div class="usecase-title">' + esc(useCase.label) + "</div>" +
          '<div class="usecase-text">' + esc(useCase.body) + "</div>" +
          "</div>" +
          "</article>"
        );
      })
      .join("");
    return '<div class="usecase-grid">' + cards + "</div>";
  }

  function renderCta(scene) {
    const lead = (scene.lines || [])[1] || "日本提携支援が伴走します";
    const qrBlock = scene.qrSvg
      ? (
          '<div class="qr-box reveal" style="--d:2">' +
          '<div class="qr-frame">' + scene.qrSvg + "</div>" +
          '<div class="qr-caption">スマホでQRを読み取り</div>' +
          '<div class="qr-sub">そのまま無料診断ページへ</div>' +
          "</div>"
        )
      : (
          '<div class="url-box reveal" style="--d:2">' +
          '<div class="url-label">QRコードから無料診断ページへ</div>' +
          '<div class="url-value">' + esc(scene.qrUrl || data.lpUrl) + "</div>" +
          "</div>"
        );

    return (
      '<div class="cta-panel card">' +
      '<div class="cta-left">' +
      '<div class="kicker reveal" style="--d:0">' + esc(scene.kicker) + "</div>" +
      '<h1 class="title reveal" style="--d:0">お気軽にご相談ください</h1>' +
      '<div class="cta-brand reveal" style="--d:1">日本提携支援</div>' +
      '<p class="lead reveal" style="--d:1">' + esc(lead) + "</p>" +
      '<div class="cta-button reveal" style="--d:2">' + icon("check") + "無料相談で確認する</div>" +
      "</div>" +
      '<div class="cta-divider"></div>' +
      '<div class="cta-right">' + qrBlock + "</div>" +
      "</div>"
    );
  }

  function renderDefault(scene) {
    return '<p class="lead">' + esc((scene.lines || []).join("。")) + "</p>";
  }

  function renderSceneBody(scene) {
    if (scene.id === "hook") return renderHook(scene);
    if (scene.id === "overview") return renderOverview(scene);
    if (scene.id === "useCases") return renderUseCases(scene);
    if (scene.id === "cta") return renderCta(scene);
    return renderDefault(scene);
  }

  root.innerHTML = data.scenes
    .map(function (scene) {
      const sceneElement = document.createElement("section");
      sceneElement.className = "scene scene-" + scene.id;
      setTiming(sceneElement, scene.start, scene.duration);
      const showHeader = scene.id === "overview" || scene.id === "useCases";
      const header = showHeader
        ? '<div class="kicker reveal" style="--d:0">' + esc(scene.kicker) + "</div>" +
          '<h1 class="title reveal" style="--d:0">' + esc(scene.title) + "</h1>" +
          '<div class="title-rule reveal" style="--d:0"></div>'
        : "";
      sceneElement.innerHTML = '<div class="scene-inner">' + header + renderSceneBody(scene) + "</div>";
      return sceneElement.outerHTML;
    })
    .join("");

  root.insertAdjacentHTML("afterend", data.scenes.map(renderCaptions).join(""));
})();
