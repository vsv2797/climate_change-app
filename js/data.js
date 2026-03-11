/* ═══════════════════════════════════════════════════════════════
   data.js  —  Country list & metric definitions
   ───────────────────────────────────────────────────────────────
   HOW TO EXTEND:
   • Add a country to COUNTRIES with {iso, name, flag, cont, lat, lng}
   • Add a metric to METRICS with {key, label, icon, color, bg}
   • Plug in real API data in engine.js → generateScores()
   ═══════════════════════════════════════════════════════════════ */

"use strict";

/* ── Country list ─────────────────────────────────────────────── */
const COUNTRIES = [
  { iso:"PAK", name:"Pakistan",       flag:"🇵🇰", cont:"Asia",      lat:30,  lng:70   },
  { iso:"IND", name:"India",          flag:"🇮🇳", cont:"Asia",      lat:20,  lng:80   },
  { iso:"IRN", name:"Iran",           flag:"🇮🇷", cont:"Asia",      lat:32,  lng:53   },
  { iso:"SAU", name:"Saudi Arabia",   flag:"🇸🇦", cont:"Asia",      lat:24,  lng:45   },
  { iso:"IRQ", name:"Iraq",           flag:"🇮🇶", cont:"Asia",      lat:33,  lng:44   },
  { iso:"ARE", name:"UAE",            flag:"🇦🇪", cont:"Asia",      lat:24,  lng:54   },
  { iso:"YEM", name:"Yemen",          flag:"🇾🇪", cont:"Asia",      lat:15,  lng:48   },
  { iso:"AFG", name:"Afghanistan",    flag:"🇦🇫", cont:"Asia",      lat:33,  lng:65   },
  { iso:"SYR", name:"Syria",          flag:"🇸🇾", cont:"Asia",      lat:35,  lng:38   },
  { iso:"BGD", name:"Bangladesh",     flag:"🇧🇩", cont:"Asia",      lat:24,  lng:90   },
  { iso:"MMR", name:"Myanmar",        flag:"🇲🇲", cont:"Asia",      lat:17,  lng:96   },
  { iso:"THA", name:"Thailand",       flag:"🇹🇭", cont:"Asia",      lat:15,  lng:101  },
  { iso:"VNM", name:"Vietnam",        flag:"🇻🇳", cont:"Asia",      lat:14,  lng:108  },
  { iso:"PHL", name:"Philippines",    flag:"🇵🇭", cont:"Asia",      lat:13,  lng:122  },
  { iso:"IDN", name:"Indonesia",      flag:"🇮🇩", cont:"Asia",      lat:-5,  lng:120  },
  { iso:"CHN", name:"China",          flag:"🇨🇳", cont:"Asia",      lat:35,  lng:105  },
  { iso:"JPN", name:"Japan",          flag:"🇯🇵", cont:"Asia",      lat:36,  lng:138  },
  { iso:"KOR", name:"South Korea",    flag:"🇰🇷", cont:"Asia",      lat:37,  lng:128  },
  { iso:"KAZ", name:"Kazakhstan",     flag:"🇰🇿", cont:"Asia",      lat:48,  lng:68   },
  { iso:"MNG", name:"Mongolia",       flag:"🇲🇳", cont:"Asia",      lat:46,  lng:105  },
  { iso:"UZB", name:"Uzbekistan",     flag:"🇺🇿", cont:"Asia",      lat:41,  lng:64   },
  { iso:"NPL", name:"Nepal",          flag:"🇳🇵", cont:"Asia",      lat:28,  lng:84   },
  { iso:"LKA", name:"Sri Lanka",      flag:"🇱🇰", cont:"Asia",      lat:7,   lng:81   },
  { iso:"RUS", name:"Russia",         flag:"🇷🇺", cont:"Europe",    lat:61,  lng:105  },
  { iso:"TUR", name:"Turkey",         flag:"🇹🇷", cont:"Europe",    lat:39,  lng:35   },
  { iso:"GRC", name:"Greece",         flag:"🇬🇷", cont:"Europe",    lat:39,  lng:22   },
  { iso:"ITA", name:"Italy",          flag:"🇮🇹", cont:"Europe",    lat:42,  lng:12   },
  { iso:"ESP", name:"Spain",          flag:"🇪🇸", cont:"Europe",    lat:40,  lng:-4   },
  { iso:"PRT", name:"Portugal",       flag:"🇵🇹", cont:"Europe",    lat:39,  lng:-8   },
  { iso:"FRA", name:"France",         flag:"🇫🇷", cont:"Europe",    lat:46,  lng:2    },
  { iso:"DEU", name:"Germany",        flag:"🇩🇪", cont:"Europe",    lat:51,  lng:10   },
  { iso:"GBR", name:"UK",             flag:"🇬🇧", cont:"Europe",    lat:54,  lng:-2   },
  { iso:"NOR", name:"Norway",         flag:"🇳🇴", cont:"Europe",    lat:65,  lng:13   },
  { iso:"SWE", name:"Sweden",         flag:"🇸🇪", cont:"Europe",    lat:60,  lng:15   },
  { iso:"POL", name:"Poland",         flag:"🇵🇱", cont:"Europe",    lat:52,  lng:20   },
  { iso:"UKR", name:"Ukraine",        flag:"🇺🇦", cont:"Europe",    lat:49,  lng:32   },
  { iso:"SOM", name:"Somalia",        flag:"🇸🇴", cont:"Africa",    lat:6,   lng:46   },
  { iso:"ETH", name:"Ethiopia",       flag:"🇪🇹", cont:"Africa",    lat:9,   lng:40   },
  { iso:"SDN", name:"Sudan",          flag:"🇸🇩", cont:"Africa",    lat:15,  lng:30   },
  { iso:"NER", name:"Niger",          flag:"🇳🇪", cont:"Africa",    lat:17,  lng:8    },
  { iso:"MLI", name:"Mali",           flag:"🇲🇱", cont:"Africa",    lat:17,  lng:-4   },
  { iso:"TCD", name:"Chad",           flag:"🇹🇩", cont:"Africa",    lat:15,  lng:19   },
  { iso:"DZA", name:"Algeria",        flag:"🇩🇿", cont:"Africa",    lat:28,  lng:3    },
  { iso:"EGY", name:"Egypt",          flag:"🇪🇬", cont:"Africa",    lat:26,  lng:30   },
  { iso:"NGA", name:"Nigeria",        flag:"🇳🇬", cont:"Africa",    lat:10,  lng:8    },
  { iso:"KEN", name:"Kenya",          flag:"🇰🇪", cont:"Africa",    lat:1,   lng:38   },
  { iso:"COD", name:"DR Congo",       flag:"🇨🇩", cont:"Africa",    lat:-4,  lng:24   },
  { iso:"ZAF", name:"South Africa",   flag:"🇿🇦", cont:"Africa",    lat:-29, lng:25   },
  { iso:"MDG", name:"Madagascar",     flag:"🇲🇬", cont:"Africa",    lat:-20, lng:47   },
  { iso:"MOZ", name:"Mozambique",     flag:"🇲🇿", cont:"Africa",    lat:-18, lng:35   },
  { iso:"NAM", name:"Namibia",        flag:"🇳🇦", cont:"Africa",    lat:-22, lng:18   },
  { iso:"GHA", name:"Ghana",          flag:"🇬🇭", cont:"Africa",    lat:8,   lng:-1   },
  { iso:"CMR", name:"Cameroon",       flag:"🇨🇲", cont:"Africa",    lat:6,   lng:12   },
  { iso:"AGO", name:"Angola",         flag:"🇦🇴", cont:"Africa",    lat:-12, lng:18   },
  { iso:"AUS", name:"Australia",      flag:"🇦🇺", cont:"Oceania",   lat:-25, lng:133  },
  { iso:"NZL", name:"New Zealand",    flag:"🇳🇿", cont:"Oceania",   lat:-41, lng:174  },
  { iso:"PNG", name:"Papua N. Guinea",flag:"🇵🇬", cont:"Oceania",   lat:-6,  lng:144  },
  { iso:"BRA", name:"Brazil",         flag:"🇧🇷", cont:"S.America", lat:-14, lng:-51  },
  { iso:"ARG", name:"Argentina",      flag:"🇦🇷", cont:"S.America", lat:-34, lng:-64  },
  { iso:"CHL", name:"Chile",          flag:"🇨🇱", cont:"S.America", lat:-30, lng:-71  },
  { iso:"COL", name:"Colombia",       flag:"🇨🇴", cont:"S.America", lat:4,   lng:-74  },
  { iso:"PER", name:"Peru",           flag:"🇵🇪", cont:"S.America", lat:-9,  lng:-75  },
  { iso:"VEN", name:"Venezuela",      flag:"🇻🇪", cont:"S.America", lat:8,   lng:-66  },
  { iso:"BOL", name:"Bolivia",        flag:"🇧🇴", cont:"S.America", lat:-17, lng:-65  },
  { iso:"PRY", name:"Paraguay",       flag:"🇵🇾", cont:"S.America", lat:-23, lng:-58  },
  { iso:"MEX", name:"Mexico",         flag:"🇲🇽", cont:"N.America", lat:23,  lng:-102 },
  { iso:"USA", name:"United States",  flag:"🇺🇸", cont:"N.America", lat:38,  lng:-97  },
  { iso:"CAN", name:"Canada",         flag:"🇨🇦", cont:"N.America", lat:60,  lng:-96  },
  { iso:"HTI", name:"Haiti",          flag:"🇭🇹", cont:"N.America", lat:19,  lng:-73  },
  { iso:"GTM", name:"Guatemala",      flag:"🇬🇹", cont:"N.America", lat:15,  lng:-90  },
  { iso:"HND", name:"Honduras",       flag:"🇭🇳", cont:"N.America", lat:15,  lng:-87  },
  { iso:"CUB", name:"Cuba",           flag:"🇨🇺", cont:"N.America", lat:22,  lng:-79  },
];

/* ── Metric definitions ──────────────────────────────────────── */
const METRICS = [
  {
    key:   "heat",
    label: "Heatwave Risk",
    icon:  "🌡️",
    color: "#ff3355",
    bg:    "rgba(255,51,85,0.10)",
    desc:  "Temperature anomaly above 95th percentile threshold (Copernicus C3S)"
  },
  {
    key:   "drought",
    label: "Drought Severity",
    icon:  "🏜️",
    color: "#ff8c00",
    bg:    "rgba(255,140,0,0.10)",
    desc:  "Palmer Drought Severity Index composite (PDSI, NOAA)"
  },
  {
    key:   "precip",
    label: "Precip. Anomaly",
    icon:  "🌧️",
    color: "#00aaff",
    bg:    "rgba(0,170,255,0.10)",
    desc:  "Departure from 1981–2010 precipitation baseline (Open-Meteo)"
  },
  {
    key:   "cri",
    label: "Climate Risk Index",
    icon:  "⚠️",
    color: "#cc44ff",
    bg:    "rgba(200,60,255,0.10)",
    desc:  "Composite vulnerability score (Germanwatch CRI 2026)"
  },
];
