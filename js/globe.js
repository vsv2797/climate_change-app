/* ═══════════════════════════════════════════════════════════════
   globe.js  —  Canvas renderer
   ───────────────────────────────────────────────────────────────
   Responsibilities:
     • Resize canvas on window resize
     • Draw stars, ocean, atmosphere, grid, dots, spikes each frame
     • Hit-test mouse position to find hovered country
     • Expose: GlobeRenderer.init(), .getHovered()

   Reads from: engine.js (GlobeState, DATA, helpers)
   No direct DOM panel manipulation (that's ui.js).
   ═══════════════════════════════════════════════════════════════ */

"use strict";

const GlobeRenderer = (() => {

  let canvas, ctx;
  let frameCount  = 0;
  let currentMetric = "heat";
  let selectedISO   = null;
  let hoveredCountry = null;
  let mouseX = -9999, mouseY = -9999;

  /* ── Resize ──────────────────────────────────────────────────── */
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const w   = canvas.parentElement.offsetWidth;
    const h   = canvas.parentElement.offsetHeight;
    canvas.width  = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width  = w + "px";
    canvas.style.height = h + "px";
    ctx.scale(dpr, dpr);
  }

  /* ── Globe geometry helpers ──────────────────────────────────── */
  function globeR(W, H) { return Math.min(W, H) * 0.39; }

  /* ── Draw stars (stable seed so no flicker) ─────────────────── */
  function drawStars(W, H) {
    const sr = seededRng(7777);
    for (let i = 0; i < 180; i++) {
      const sx = sr() * W, sy = sr() * H, ss = sr() * 1.3;
      ctx.globalAlpha = 0.12 + sr() * 0.45;
      ctx.fillStyle   = "#aac8ff";
      ctx.beginPath();
      ctx.arc(sx, sy, ss, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  /* ── Draw atmosphere glow ────────────────────────────────────── */
  function drawAtmosphere(cx, cy, R) {
    const atm = ctx.createRadialGradient(cx, cy, R * 0.88, cx, cy, R * 1.3);
    atm.addColorStop(0,   "rgba(0,160,255,0)");
    atm.addColorStop(0.5, "rgba(0,160,255,0.07)");
    atm.addColorStop(1,   "rgba(0,60,180,0)");
    ctx.fillStyle = atm;
    ctx.beginPath();
    ctx.arc(cx, cy, R * 1.3, 0, Math.PI * 2);
    ctx.fill();
  }

  /* ── Draw ocean sphere ───────────────────────────────────────── */
  function drawOcean(cx, cy, R) {
    const oc = ctx.createRadialGradient(cx - R*0.28, cy - R*0.28, 0, cx, cy, R);
    oc.addColorStop(0, "#0e2444");
    oc.addColorStop(1, "#020810");
    ctx.fillStyle   = oc;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(0,150,255,0.2)";
    ctx.lineWidth   = 1.5;
    ctx.stroke();
  }

  /* ── Draw lat/lng grid ───────────────────────────────────────── */
  function drawGrid(cx, cy, R) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.clip();

    ctx.strokeStyle = "rgba(0,200,255,0.07)";
    ctx.lineWidth   = 0.6;

    // Latitude circles
    for (let lat = -75; lat <= 75; lat += 30) {
      ctx.beginPath();
      let started = false;
      for (let lng = 0; lng <= 360; lng += 3) {
        const [x, y, z]     = latLngToXYZ(lat, lng);
        const [rx, ry, rz]  = rotatePoint(x, y, z, GlobeState.rotX, GlobeState.rotY);
        if (rz > 0.05) { started = false; continue; }
        const px = cx + rx * R, py = cy - ry * R;
        started ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
        started = true;
      }
      ctx.stroke();
    }

    // Longitude lines
    for (let lng = 0; lng < 360; lng += 30) {
      ctx.beginPath();
      let started = false;
      for (let lat = -88; lat <= 88; lat += 3) {
        const [x, y, z]    = latLngToXYZ(lat, lng);
        const [rx, ry, rz] = rotatePoint(x, y, z, GlobeState.rotX, GlobeState.rotY);
        if (rz > 0.05) { started = false; continue; }
        const px = cx + rx * R, py = cy - ry * R;
        started ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
        started = true;
      }
      ctx.stroke();
    }

    ctx.restore();
  }

  /* ── Draw specular highlight ─────────────────────────────────── */
  function drawSpecular(cx, cy, R) {
    const sp = ctx.createRadialGradient(
      cx - R*0.4, cy - R*0.38, 0,
      cx - R*0.35, cy - R*0.35, R * 0.75
    );
    sp.addColorStop(0, "rgba(120,190,255,0.10)");
    sp.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = sp;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fill();
  }

  /* ── Project all countries for the current frame ─────────────── */
  function projectCountries(cx, cy, R) {
    return DATA.map(c => {
      const [x, y, z]    = latLngToXYZ(c.lat, c.lng);
      const [rx, ry, rz] = rotatePoint(x, y, z, GlobeState.rotX, GlobeState.rotY);
      const { px, py, fade } = projectToCanvas(rx, ry, rz, cx, cy, R);
      const score  = c.scores[currentMetric];
      const color  = scoreToColor(score);
      const isHov  = hoveredCountry && hoveredCountry.iso === c.iso;
      const isSel  = selectedISO === c.iso;
      return { c, px, py, rz, fade, score, color, isHov, isSel, rx, ry };
    }).filter(p => p.fade > 0.01);
  }

  /* ── Draw a single country dot + spike ───────────────────────── */
  function drawCountry(p, R, cx, cy) {
    const { c, px, py, fade, score, color, isHov, isSel } = p;
    const dotMin = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--globe-dot-min-r") || 4
    );
    const dotMax = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--globe-dot-max-r") || 12
    );
    const spikeScale = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--globe-spike-scale") || 0.30
    );

    const r = dotMin + (score / 100) * (dotMax - dotMin);

    ctx.globalAlpha = fade;

    // Glow halo for elevated risk
    if (score > 58) {
      const pulse = 0.45 + Math.sin(frameCount * 0.07 + c.lat * 0.5) * 0.3;
      const gr    = ctx.createRadialGradient(px, py, 0, px, py, r * 2.6);
      gr.addColorStop(0, color + "55");
      gr.addColorStop(1, "transparent");
      ctx.globalAlpha = fade * pulse * 0.5;
      ctx.fillStyle   = gr;
      ctx.beginPath();
      ctx.arc(px, py, r * 2.6, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = fade;

    // Selected rings
    if (isSel) {
      ctx.strokeStyle = "#00e5ff";
      ctx.lineWidth   = 2;
      ctx.beginPath(); ctx.arc(px, py, r + 7,  0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = "rgba(0,229,255,0.2)";
      ctx.lineWidth   = 1;
      ctx.beginPath(); ctx.arc(px, py, r + 13, 0, Math.PI * 2); ctx.stroke();
    }

    // Hover ring
    if (isHov && !isSel) {
      ctx.strokeStyle = "rgba(255,255,255,0.55)";
      ctx.lineWidth   = 1.5;
      ctx.beginPath(); ctx.arc(px, py, r + 5, 0, Math.PI * 2); ctx.stroke();
    }

    // Spike
    const factor = 1 + (score / 100) * spikeScale;
    const [sx, sy, sz]     = latLngToXYZ(c.lat, c.lng);
    const [srx, sry, srz]  = rotatePoint(sx * factor, sy * factor, sz * factor, GlobeState.rotX, GlobeState.rotY);
    if (srz < 0.2) {
      const tx = cx + srx * R, ty = cy - sry * R;
      ctx.strokeStyle = color;
      ctx.lineWidth   = 1.5;
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(tx, ty); ctx.stroke();
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(tx, ty, 2.5, 0, Math.PI * 2); ctx.fill();
    }

    // Main dot
    const dg = ctx.createRadialGradient(px - r*0.3, py - r*0.3, 0, px, py, r);
    dg.addColorStop(0, color + "ff");
    dg.addColorStop(1, color + "99");
    ctx.fillStyle = dg;
    ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();

    // ISO label for selected / extreme
    if (isSel || score >= 78) {
      ctx.globalAlpha = fade;
      ctx.fillStyle   = "#ffffff";
      ctx.font        = `bold ${isSel ? 11 : 9}px monospace`;
      ctx.textAlign   = "center";
      ctx.fillText(c.iso, px, py - r - 5);
    }

    ctx.globalAlpha = 1;
  }

  /* ── Hit-test: find country under mouse ──────────────────────── */
  function findHovered(pts) {
    let best = null, bestD = 24;
    pts.forEach(p => {
      const d = Math.hypot(mouseX - p.px, mouseY - p.py);
      if (d < bestD) { bestD = d; best = p.c; }
    });
    return best;
  }

  /* ── Main render loop ────────────────────────────────────────── */
  function render() {
    requestAnimationFrame(render);
    frameCount++;

    GlobeState.tick();

    const W  = canvas.offsetWidth;
    const H  = canvas.offsetHeight;
    const cx = W / 2, cy = H / 2;
    const R  = globeR(W, H);

    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = "#060c18";
    ctx.fillRect(0, 0, W, H);

    drawStars(W, H);
    drawAtmosphere(cx, cy, R);
    drawOcean(cx, cy, R);
    drawGrid(cx, cy, R);
    drawSpecular(cx, cy, R);

    // Countries — sorted back-to-front
    const pts = projectCountries(cx, cy, R).sort((a, b) => b.rz - a.rz);
    pts.forEach(p => drawCountry(p, R, cx, cy));

    // Update hover
    hoveredCountry = findHovered(pts);
  }

  /* ── Public API ──────────────────────────────────────────────── */
  return {
    init(canvasEl) {
      canvas = canvasEl;
      ctx    = canvas.getContext("2d");
      resize();
      window.addEventListener("resize", resize);
      render();
    },

    setMetric(key)    { currentMetric = key; },
    setSelected(iso)  { selectedISO   = iso; },
    getHovered()      { return hoveredCountry; },

    setMouse(x, y)    { mouseX = x; mouseY = y; },
    clearMouse()      { mouseX = -9999; mouseY = -9999; },

    /** Find closest visible country to canvas-space (x, y) */
    hitTest(x, y, W, H) {
      const R   = globeR(W, H);
      const cx  = W / 2, cy = H / 2;
      let best  = null, bestD = 26;
      DATA.forEach(c => {
        const [vx, vy, vz] = rotatePoint(...latLngToXYZ(c.lat, c.lng), GlobeState.rotX, GlobeState.rotY);
        if (vz >= 0.15) return;
        const px = cx + vx * R, py = cy - vy * R;
        const d  = Math.hypot(x - px, y - py);
        if (d < bestD) { bestD = d; best = c; }
      });
      return best;
    },
  };

})();
