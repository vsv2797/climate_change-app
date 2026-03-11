# 🌍 ClimateRisk.live — Global Climate Intelligence Globe

An interactive 3-D globe showing country-level climate risk indices.
Drag to rotate · Click a country · Switch between 4 climate metrics.

---

## 📁 Project Structure

```
climate-globe/
│
├── index.html              ← Page structure (HTML only, no logic/styles inline)
│
├── css/
│   ├── reset.css           ← Browser normalization
│   ├── theme.css           ← ⭐ ALL design tokens (colours, fonts, spacing)
│   ├── layout.css          ← Page structure, flex/grid, responsive breakpoints
│   ├── components.css      ← Every UI widget (buttons, panels, tooltip, etc.)
│   └── animations.css      ← Keyframes and transitions
│
└── js/
    ├── data.js             ← Country list + metric definitions (pure data)
    ├── engine.js           ← ⭐ Maths engine (projection, rotation, scoring, colours)
    ├── globe.js            ← Canvas renderer (draws the globe each frame)
    ├── ui.js               ← DOM builder + event handlers
    └── main.js             ← Entry point (boots everything)
```

---

## ✏️ How to Customise

### Change colours / theme
Edit **`css/theme.css`** — every colour, font, and spacing value is a CSS variable.
Change `--risk-extreme` and the dot colours update automatically on both the globe and the legend.

### Add a new climate metric
1. Open **`js/data.js`** and add an entry to the `METRICS` array.
2. Open **`js/engine.js`** → `generateScores()` and add the new key to the returned object.
   (Or wire it to your real API there.)

### Add more countries
Open **`js/data.js`** and append to the `COUNTRIES` array:
```js
{ iso:"BRN", name:"Brunei", flag:"🇧🇳", cont:"Asia", lat:4, lng:115 },
```

### Connect to a real API
Open **`js/engine.js`** → find `generateScores()` and replace the seeded-random
logic with a `fetch()` call to your data endpoint.
The rest of the app will work unchanged.

---

## 🚀 Deploy to GitHub Pages (step-by-step)

### Prerequisites
- A free GitHub account → https://github.com/signup

---

### Step 1 — Create a new repository

1. Go to https://github.com/new
2. Fill in:
   - **Repository name:** `climate-globe`  (or any name you like)
   - **Visibility:** ✅ Public  *(GitHub Pages requires public for free accounts)*
   - **Initialize:** tick "Add a README file"
3. Click **"Create repository"**

---

### Step 2 — Upload all the files

#### Option A — Drag & Drop (easiest, no Git needed)

1. On your new repo page click **"Add file" → "Upload files"**
2. Open your local `climate-globe/` folder
3. Drag **all files and folders** into the GitHub upload area:
   ```
   index.html
   css/   (drag the whole folder)
   js/    (drag the whole folder)
   README.md
   ```
4. Scroll down, write a commit message like `Initial upload`
5. Click **"Commit changes"**

#### Option B — Git command line

```bash
# Clone your empty repo
git clone https://github.com/YOUR-USERNAME/climate-globe.git
cd climate-globe

# Copy all project files into this folder, then:
git add .
git commit -m "Initial upload"
git push origin main
```

---

### Step 3 — Enable GitHub Pages

1. In your repo, click the **"Settings"** tab (top right area)
2. In the left sidebar scroll down and click **"Pages"**
3. Under **"Source"** select:
   - Branch: `main`
   - Folder: `/ (root)`
4. Click **"Save"**

GitHub will show a banner:
> *"Your site is being published…"*

---

### Step 4 — Wait ~60 seconds then open your site

Your live URL will be:
```
https://YOUR-USERNAME.github.io/climate-globe/
```

Refresh the Settings → Pages tab to see the live URL appear.
Click it — your globe is live! 🎉

---

## 🔄 Making updates later

After any edit, just re-upload changed files via the GitHub web UI
(click the file → pencil icon to edit, or upload again to replace),
or use `git push` if you set up the command line.

Changes go live within ~30 seconds.

---

## 📌 Tech stack

| Layer        | Technology                        |
|--------------|-----------------------------------|
| Rendering    | HTML5 Canvas 2D (no dependencies) |
| Maths        | Vanilla JS (no libraries)         |
| Styling      | Pure CSS with custom properties   |
| Hosting      | GitHub Pages (free, static)       |

Zero npm, zero bundlers, zero frameworks required.
