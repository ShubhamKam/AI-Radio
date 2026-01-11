# AI Radio Cursor

## Android app (Capacitor) — YouTube + Spotify OAuth sync

The Android app lives in `client/` and is built with **Vite + React + Capacitor**. It connects to **Spotify** and **YouTube (Google OAuth)** via **OAuth (PKCE)**, automatically syncs a subset of your content, and plays it via embedded players inside the app.

### Configure OAuth

- Copy env template:
  - `cp client/.env.example client/.env`
- Create apps + set redirect URIs:
  - **Spotify** redirect URI: `airadiocursor://oauth/spotify`
  - **Google** redirect URI: `airadiocursor://oauth/google`
- Fill in:
  - `VITE_SPOTIFY_CLIENT_ID`
  - `VITE_GOOGLE_CLIENT_ID`

### Run (web dev)

- `cd client`
- `npm install`
- `npm run dev`

### Build APK (recommended via GitHub Actions)

This repo includes a workflow that builds a **debug APK** and uploads it as an artifact:

- Workflow: `.github/workflows/android-apk.yml`

Local builds require an Android SDK (set `ANDROID_HOME` or `sdk.dir` in `client/android/local.properties`).

## Dev container / Docker

- Build: `docker build -t ai-radio-cursor:dev .`
- Run: `docker run --rm -it -v "$PWD:/workspace" -w /workspace ai-radio-cursor:dev bash`

## Planning document

See `PROJECT_PLAN.md` for the living feature plan, stories, tasks, and dependency policy.