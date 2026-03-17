const fs = require('fs');

async function main() {
  const file = './index.html';
  let content = fs.readFileSync(file, 'utf8');

  // Insert climate_data script
  content = content.replace('<script src="//unpkg.com/globe.gl"></script>',
    '<script src="//unpkg.com/globe.gl"></script>\n<script src="js/climate_data.js"></script>');

  // Replace COUNTRIES and DATA block
  const startMarker = '/* ═══════════════ DATA ═══════════════ */';
  const endMarker = '/* COLOUR */';
  const startIdx = content.indexOf(startMarker);
  const endIdx = content.indexOf(endMarker);

  const newDataBlock = `/* ═══════════════ DATA ═══════════════ */
let DATA = [];
let GEOJSON_DATA = null;

const METRICS=[
  {key:"co2",   label:"CO₂ Emissions",     icon:"☁️",color:"#ff3355",bg:"rgba(255,51,85,0.1)"},
  {key:"temp",  label:"Temp Anomaly",  icon:"🌡️",color:"#ff8c00",bg:"rgba(255,140,0,0.1)"},
  {key:"cri",   label:"Climate Risk Index",icon:"⚠️", color:"#cc44ff",bg:"rgba(200,60,255,0.1)"},
];

let curMetric = "co2";

/* RNG for fallback data */
function rng(seed){let s=seed;return()=>{s=(s*9301+49297)%233280;return s/233280}}
function genHistory(i,v){return Array.from({length:30},(_,d)=>{const r=rng(i*137+d*17);return Math.max(0,v+(r()-0.5)*1.5)})}

`;
  content = content.substring(0, startIdx) + newDataBlock + content.substring(endIdx);

  // Update color logic
  const colorStart = content.indexOf('/* COLOUR */');
  const statsStart = content.indexOf('/* STATS */');
  
  const newColor = `/* COLOUR */
function sColor(s, k){
  if(k==="co2"){
    if(s>=15)return"#ff2244";if(s>=8)return"#ff6600";if(s>=3)return"#ffaa00";if(s>=1)return"#ccdd00";return"#44ee88";
  }else if(k==="temp"){
    if(s>=2.0)return"#ff2244";if(s>=1.7)return"#ff6600";if(s>=1.4)return"#ffaa00";if(s>=1.0)return"#ccdd00";return"#44ee88";
  }
  if(s>=80)return"#ff2244";if(s>=65)return"#ff6600";if(s>=50)return"#ffaa00";if(s>=35)return"#ccdd00";return"#44ee88";
}
function sLabel(s, k){
  if(k==="co2"||k==="temp"){
    if(s>=15||s>=2.0)return"CRITICAL";if(s>=8||s>=1.7)return"SEVERE";if(s>=3||s>=1.4)return"HIGH";if(s>=1||s>=1.0)return"MODERATE";return"LOW";
  }
  if(s>=80)return"EXTREME";if(s>=65)return"SEVERE";if(s>=50)return"HIGH";if(s>=35)return"MODERATE";if(s>=20)return"LOW";return"MINIMAL";
}
`;
  content = content.substring(0, colorStart) + newColor + content.substring(statsStart);

  // Stats Logic Fix
  const sStart = content.indexOf('/* STATS */');
  const statsEnd = content.indexOf('/* ═══════════════ GLOBE GL SETUP');
  const newStats = `/* STATS */
function gAvg(k){if(!DATA.length)return 0;return (DATA.reduce((a,c)=>a+(c.scores[k]||0),0)/DATA.length).toFixed(1)}
function topN(k,n){return[...DATA].sort((a,b)=>(b.scores[k]||0)-(a.scores[k]||0)).slice(0,n)}
function rankOf(c,k){return[...DATA].sort((a,b)=>(b.scores[k]||0)-(a.scores[k]||0)).findIndex(x=>x.iso===c.iso)+1}
`;
  content = content.substring(0, sStart) + newStats + content.substring(statsEnd);

  fs.writeFileSync(file, content, 'utf8');
}
main();
