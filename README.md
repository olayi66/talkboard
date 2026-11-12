# TalkBoard AAC

A symbol-based communication board (AAC) with speech that runs in the browser and installs as an offline app on Windows, Chromebook, iPhone/iPad, Mac and Android.

- Symbols: Unicode emoji (drawn by each device's own font) and the family's own photos — no licensed symbol sets.
- Voices: the device's built-in text-to-speech.
- Data: everything (boards, photos, child profile) stays on the device. Nothing is sent to a server.

## Install on a device
- **Windows 11 / Chromebook:** open the site in Edge or Chrome → click the install icon in the address bar.
- **iPhone / iPad:** open in Safari → Share → Add to Home Screen.
- **Mac:** Safari → File → Add to Dock (or install from Chrome/Edge).
- **Android:** open in Chrome → Install app.
Open it once with internet; after that it works offline.

## Deploying
No build step. Netlify publishes the `public/` folder and deploys the functions in `netlify/functions/` (see `netlify.toml`).

- `/api/photos?q=…` and `/api/photo-thumb/:id` are a small proxy to the Openverse API (public-domain and CC0 photos only). Netlify's CDN caches results (a week) and thumbnails (a year) for everyone.
- Optional: set `OPENVERSE_CLIENT_ID` and `OPENVERSE_CLIENT_SECRET` (an email-verified Openverse app) in Netlify environment variables, scoped to Functions, for higher Openverse rate limits. Without them the proxy works anonymously.

**When you change any file, bump `VERSION` in `public/sw.js`** (e.g. `talkboard-v7`) so installed devices fetch the update.

## Files
| File | Purpose |
|---|---|
| `public/index.html` | The whole app (HTML, CSS, JavaScript) |
| `public/sw.js` | Offline cache (service worker) |
| `netlify/functions/` | Photo search proxy (server side) |
| `manifest.webmanifest` | Install name, icons, colours |
| `icon-*.png`, `apple-touch-icon.png` | App icons |
| `netlify.toml` | Netlify settings and headers |

## Status
Pilot version. Test on real devices before wider use. The child profile questionnaire (TB-Q-1.0) and rules (TB-R-1.0) are product proposals to be reviewed by an AAC-experienced speech-language pathologist; they are not a clinical assessment.
