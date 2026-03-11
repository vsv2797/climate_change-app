/* ═══════════════════════════════════════════════════════════════
   ui.js  —  DOM builders, panel updates, event handlers
   ───────────────────────────────────────────────────────────────
   Responsibilities:
     • Build metric buttons and top-list dynamically
     • Update right detail panel on country selection
     • Update stats numbers
     • Handle all pointer/touch events on the canvas
     • Draw sparkline in the detail panel
     • Expose: UI.init()

   Reads from: engine.js (DATA, helpers), globe.js (GlobeRenderer)
   ═══════════════════════════════════════════════════════════════ */

"use strict";

const UI = (() => {

  let currentMetric = "heat";
  let selectedCountry = null;

  /* ══ METRIC BUTTONS ════════════════════════════════════════════ */

  function buildMetricButtons() {
    const container = document.getElementById("metric-buttons");
    container.innerHTML = "";

    METRICS.forEach(m => {
      const avg = globalAvg(m.key);
      const btn = document.createElement("button");
      btn.className  = "idx-btn";
      btn.id         = "mb-" + m.key;
      btn.setAttribute("aria-label", m.label);
      btn.innerHTML  = `
        <span class="idx-icon">${m.icon}</span>
        <div class="idx-info">
          <div class="idx-label">${m.label}</div>
          <div class="idx-avg">avg ${avg}/100</div>
        </div>
        <div class="idx-score" style="color:${m.color}">${avg}</div>
      `;
      btn.addEventListener("click", () => selectMetric(m.key));
      container.appendChild(btn);
    });
  }

  function selectMetric(key) {
    currentMetric = key;
    const m = METRICS.find(x => x.key === key);

    // Update button styles
    METRICS.forEach(x => {
      const btn = document.getElementById("mb-" + x.key);
      if (!btn) return;
      if (x.key === key) {
        btn.classList.add("active");
        btn.style.borderColor = m.color + "55";
        btn.style.background  = m.bg;
      } else {
        btn.classList.remove("active");
        btn.style.borderColor = "";
        btn.style.background  = "";
      }
    });

    // Metric badge in globe overlay
    const badge = document.getElementById("metric-badge");
    badge.textContent   = m.icon + " " + m.label.toUpperCase();
    badge.style.color   = m.color;
    badge.style.borderColor = m.color + "44";

    // Propagate to renderer
    GlobeRenderer.setMetric(key);

    // Refresh derived UI
    updateTopList();
    updateStats();

    // Refresh detail panel if open
    if (selectedCountry) openDetail(selectedCountry);
  }

  /* ══ TOP LIST ══════════════════════════════════════════════════ */

  function updateTopList() {
    const container = document.getElementById("top-list");
    container.innerHTML = "";
    const top = topN(currentMetric, 6);

    top.forEach((c, i) => {
      const s   = c.scores[currentMetric];
      const col = scoreToColor(s);
      const row = document.createElement("div");
      row.className = "top-row";
      row.innerHTML = `
        <div class="top-rank">#${i + 1}</div>
        <div class="top-flag">${c.flag}</div>
        <div class="top-name">${c.name}</div>
        <div class="top-score" style="color:${col}">${s}</div>
      `;
      row.addEventListener("click", () => openDetail(c));
      container.appendChild(row);
    });
  }

  /* ══ STATS ═════════════════════════════════════════════════════ */

  function updateStats() {
    document.getElementById("stat-avg").textContent     = globalAvg(currentMetric) + "/100";
    document.getElementById("stat-extreme").textContent = countAbove(currentMetric, 80);
    document.getElementById("stat-severe").textContent  = countAbove(currentMetric, 65);
    document.getElementById("country-count").textContent = "LIVE · " + DATA.length + " COUNTRIES";
  }

  /* ══ DETAIL PANEL ══════════════════════════════════════════════ */

  function openDetail(country) {
    selectedCountry = country;
    GlobeRenderer.setSelected(country.iso);
    GlobeState.spinToFace(country.lat, country.lng);

    const s   = country.scores[currentMetric];
    const col = scoreToColor(s);
    const lbl = scoreToLabel(s);

    document.getElementById("d-flag").textContent  = country.flag;
    document.getElementById("d-name").textContent  = country.name;
    document.getElementById("d-iso").textContent   = country.iso + " · " + country.cont;

    const scoreEl = document.getElementById("d-score");
    scoreEl.textContent  = s;
    scoreEl.style.color  = col;

    const riskEl = document.getElementById("d-risk");
    riskEl.textContent = lbl + " RISK";
    riskEl.style.color = col;

    const trendEl = document.getElementById("d-trend");
    trendEl.textContent = (country.trend > 0 ? "↑" : "↓") + " " + Math.abs(country.trend) + "% 7-day trend";
    trendEl.style.color = country.trend > 0 ? "#ff3355" : "#00ff88";

    // Metric bars
    const metricsEl = document.getElementById("d-metrics");
    metricsEl.innerHTML = "";
    METRICS.forEach(m => {
      const ms  = country.scores[m.key];
      const mc  = scoreToColor(ms);
      const row = document.createElement("div");
      row.className = "metric-row";
      row.innerHTML = `
        <div class="metric-hdr">
          <span class="metric-name">${m.icon} ${m.label}</span>
          <span class="metric-val" style="color:${mc}">${ms}</span>
        </div>
        <div class="bar-track">
          <div class="bar-fill" style="width:${ms}%; background:${mc}"></div>
        </div>
      `;
      metricsEl.appendChild(row);
    });

    // Rank
    const rank = rankOf(country, currentMetric);
    document.getElementById("d-rank").textContent  = "#" + rank;
    document.getElementById("d-rankof").textContent = "of " + DATA.length + " countries";

    // Sparkline
    drawSparkline(country, currentMetric, col);

    document.getElementById("right-panel").classList.add("open");
  }

  function closeDetail() {
    selectedCountry = null;
    GlobeRenderer.setSelected(null);
    document.getElementById("right-panel").classList.remove("open");
  }

  /* ══ SPARKLINE ═════════════════════════════════════════════════ */

  function drawSparkline(country, metricKey, color) {
    const idx     = COUNTRIES.findIndex(c => c.iso === country.iso);
    const history = generateHistory(idx, metricKey);
    const c2      = document.getElementById("spark-canvas");
    if (!c2) return;
    const ctx2    = c2.getContext("2d");
    const W = c2.width, H = c2.height;

    ctx2.clearRect(0, 0, W, H);

    const min  = Math.min(...history);
    const max  = Math.max(...history) || 1;
    const padX = 4, padY = 6;

    // Area fill
    ctx2.beginPath();
    history.forEach((v, i) => {
      const x = padX + (i / (history.length - 1)) * (W - padX * 2);
      const y = H - padY - ((v - min) / (max - min)) * (H - padY * 2);
      i === 0 ? ctx2.moveTo(x, y) : ctx2.lineTo(x, y);
    });
    ctx2.lineTo(W - padX, H);
    ctx2.lineTo(padX, H);
    ctx2.closePath();
    ctx2.fillStyle = color + "22";
    ctx2.fill();

    // Line
    ctx2.beginPath();
    history.forEach((v, i) => {
      const x = padX + (i / (history.length - 1)) * (W - padX * 2);
      const y = H - padY - ((v - min) / (max - min)) * (H - padY * 2);
      i === 0 ? ctx2.moveTo(x, y) : ctx2.lineTo(x, y);
    });
    ctx2.strokeStyle = color;
    ctx2.lineWidth   = 1.5;
    ctx2.stroke();
  }

  /* ══ TOOLTIP ═══════════════════════════════════════════════════ */

  function updateTooltip(country, screenX, screenY) {
    const el = document.getElementById("tooltip");
    if (!country) { el.style.display = "none"; return; }

    const s   = country.scores[currentMetric];
    const col = scoreToColor(s);
    document.getElementById("t-flag").textContent  = country.flag;
    document.getElementById("t-name").textContent  = country.name;
    document.getElementById("t-score").textContent = s + "/100 · " + scoreToLabel(s);
    document.getElementById("t-score").style.color = col;

    el.style.display = "block";
    el.style.left    = (screenX + 16) + "px";
    el.style.top     = (screenY - 54) + "px";
  }

  /* ══ CANVAS EVENT HANDLERS ═════════════════════════════════════ */

  function attachCanvasEvents(canvas) {

    canvas.addEventListener("mousemove", e => {
      const rect = canvas.getBoundingClientRect();
      const x    = e.clientX - rect.left;
      const y    = e.clientY - rect.top;
      GlobeRenderer.setMouse(x, y);

      if (GlobeState.dragging) {
        GlobeState.velY += (x - GlobeState.lastX) * 0.007;
        GlobeState.velX += (y - GlobeState.lastY) * 0.007;
        GlobeState.lastX = x;
        GlobeState.lastY = y;
      }

      // Tooltip driven by hover from renderer
      const hov = GlobeRenderer.getHovered();
      updateTooltip(hov, e.clientX, e.clientY);

      canvas.style.cursor = hov ? "pointer" : (GlobeState.dragging ? "grabbing" : "crosshair");
    });

    canvas.addEventListener("mouseleave", () => {
      GlobeRenderer.clearMouse();
      GlobeState.dragging = false;
      updateTooltip(null);
      canvas.style.cursor = "crosshair";
    });

    canvas.addEventListener("mousedown", e => {
      const rect       = canvas.getBoundingClientRect();
      GlobeState.dragging  = true;
      GlobeState.autoSpin  = false;
      GlobeState.lastX     = e.clientX - rect.left;
      GlobeState.lastY     = e.clientY - rect.top;
      canvas.style.cursor  = "grabbing";
    });

    window.addEventListener("mouseup", () => {
      GlobeState.dragging = false;
      canvas.style.cursor = "crosshair";
      setTimeout(() => { GlobeState.autoSpin = true; }, 2500);
    });

    canvas.addEventListener("click", e => {
      if (Math.abs(GlobeState.velY) > 0.05) return; // ignore click after fast drag
      const rect = canvas.getBoundingClientRect();
      const hit  = GlobeRenderer.hitTest(
        e.clientX - rect.left,
        e.clientY - rect.top,
        canvas.offsetWidth,
        canvas.offsetHeight
      );
      if (hit) openDetail(hit);
    });

    // Touch
    canvas.addEventListener("touchstart", e => {
      const rect       = canvas.getBoundingClientRect();
      GlobeState.dragging  = true;
      GlobeState.autoSpin  = false;
      GlobeState.lastX     = e.touches[0].clientX - rect.left;
      GlobeState.lastY     = e.touches[0].clientY - rect.top;
    }, { passive: true });

    canvas.addEventListener("touchmove", e => {
      const rect = canvas.getBoundingClientRect();
      const tx   = e.touches[0].clientX - rect.left;
      const ty   = e.touches[0].clientY - rect.top;
      GlobeState.velY += (tx - GlobeState.lastX) * 0.007;
      GlobeState.velX += (ty - GlobeState.lastY) * 0.007;
      GlobeState.lastX = tx;
      GlobeState.lastY = ty;
    }, { passive: true });

    canvas.addEventListener("touchend", () => {
      GlobeState.dragging = false;
      setTimeout(() => { GlobeState.autoSpin = true; }, 2500);
    });

    // Close button
    document.getElementById("close-btn").addEventListener("click", closeDetail);
  }

  /* ── Public API ───────────────────────────────────────────────── */
  return {
    init(canvasEl) {
      buildMetricButtons();
      selectMetric("heat");  // sets active state + badge + calls updateTopList/Stats
      attachCanvasEvents(canvasEl);
    },
    selectMetric,
    openDetail,
  };

})();
