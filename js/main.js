/* ═══════════════════════════════════════════════════════════════
   main.js  —  Entry point
   ───────────────────────────────────────────────────────────────
   Wires together: data.js → engine.js → globe.js → ui.js
   This is the ONLY file that knows about all the others.
   ═══════════════════════════════════════════════════════════════ */

"use strict";

(function bootstrap() {

  const canvas = document.getElementById("globe");

  if (!canvas) {
    console.error("ClimateRisk: #globe canvas not found.");
    return;
  }

  // 1. Start the 3-D renderer (begins animation loop immediately)
  GlobeRenderer.init(canvas);

  // 2. Build UI panels and attach all events
  UI.init(canvas);

  // 3. Log version info
  console.log(
    "%cClimateRisk.live",
    "color:#00e5ff;font-size:16px;font-weight:bold;"
  );
  console.log(
    `%c${DATA.length} countries loaded · ${METRICS.length} metrics`,
    "color:#445566;"
  );

})();
