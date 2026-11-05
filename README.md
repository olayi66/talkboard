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
Static site, no build step. Netlify publishes the repository root (see `netlify.toml`).

**When you change any file, bump `VERSION` in `sw.js`** (e.g. `talkboard-v7`) so installed devices fetch the update.

## Files
| File | Purpose |
|---|---|
| `index.html` | The whole app (HTML, CSS, JavaScript) |
| `sw.js` | Offline cache (service worker) |
| `manifest.webmanifest` | Install name, icons, colours |
| `icon-*.png`, `apple-touch-icon.png` | App icons |
| `netlify.toml` | Netlify settings and headers |

## Status
Pilot version. Test on real devices before wider use. The child profile questionnaire (TB-Q-1.0) and rules (TB-R-1.0) are product proposals to be reviewed by an AAC-experienced speech-language pathologist; they are not a clinical assessment.
