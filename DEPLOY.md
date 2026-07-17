# Deploying the E-book Leads page to Vercel

This app was originally built for an always-on Node server (Google AI Studio / Cloud
Run). It has been adapted to run on Vercel as a **static SPA + one serverless API
function**. Below is everything needed to go live.

## Architecture after the changes

- **Frontend**: Vite builds the React app into `dist/` — served statically by Vercel.
- **API**: `server.ts` (the Express app) is exported and mounted as a single serverless
  function via `api/[...path].ts`, handling every `/api/*` route.
- **Storage**: Firestore is the single source of truth. All local-disk writes are
  disabled on Vercel (the filesystem is read-only there).
- **Admin auth**: stateless signed tokens (works across serverless invocations).
- **Assets**: the e-book PDF and profile picture are served from Firestore (with the
  committed files in `public/` as a fallback) via `/api/asset/ebook` and
  `/api/asset/profile`, so admin uploads take effect without a redeploy.

## 1. Firebase service account (required for secure storage)

You need access to the Firebase project `gen-lang-client-0738488525` (the one in
`firebase-applet-config.json`).

1. Firebase Console → ⚙ Project Settings → **Service accounts** → **Generate new
   private key**. A JSON file downloads.
2. You'll paste that JSON into the `FIREBASE_SERVICE_ACCOUNT` env var (below).
3. Deploy the locked security rules in `firestore.rules`:
   ```
   npx firebase deploy --only firestore:rules
   ```
   (or paste them in Console → Firestore → Rules). These deny all direct browser
   access; only the server (via the service account) can read/write leads.

> **No access to that Firebase project?** Then skip the service account. The app falls
> back to the client SDK using the public config, but you must keep the OLD permissive
> `firestore.rules` (anyone can read your leads — not recommended). Best fix: create
> your own Firebase project, drop its config into `firebase-applet-config.json`, and use
> its service account.

## 2. Environment variables (Vercel → Settings → Environment Variables)

See `.env.example` for the full list with notes. At minimum:

| Variable | Notes |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT` | The whole service-account JSON, on one line. |
| `FIRESTORE_DATABASE_ID` | `ai-studio-af0b81c8-4316-4daf-b62e-310d8448737a` (this project uses a named DB). |
| `ADMIN_PASSWORD` | Strong password for the `/#admin` portal (replaces the `admin123` default). |
| `SESSION_SECRET` | Long random string for signing admin tokens. |
| `SMTP_USER` | Gmail address that sends the e-book. |
| `SMTP_PASS` | Gmail **App Password** (16 chars, no spaces). |
| `SMTP_HOST` / `SMTP_PORT` | Optional; default to `smtp.gmail.com` / `465`. |

Add these for the **Production** (and Preview, if you want) environment.

## 3. Deploy

Push this repo to GitHub, then in Vercel: **Add New → Project → import the repo**.
`vercel.json` already sets the build command (`vite build`), output dir (`dist`), and
bundles `public/**` into the function. No framework preset changes needed — just add the
env vars from step 2 and deploy.

## 4. Smoke test after deploy

1. Open the site → submit the lead form → you should see the success/confetti state.
2. Check the inbox used → the delivery email with the PDF should arrive (check spam).
3. Go to `<your-site>/#admin`, log in with `ADMIN_PASSWORD` → the new lead appears.
4. Click "Download E-Book Instantly" → the PDF downloads from `/api/asset/ebook`.

## Notes / known limitations

- The "books downloaded today" counter and "10,000+ readers" / press logos are
  **decorative placeholders**, not real analytics (unchanged from the original).
- Gmail SMTP works from Vercel but has daily send limits (~500/day). For higher volume
  switch to a transactional provider (Resend, SendGrid, Postmarks) later.
- The admin PDF/photo upload writes to Firestore (as base64). Very large PDFs are capped
  at 10 MB by the UI; Firestore documents max out at ~1 MB, so keep uploaded PDFs small,
  or move large assets to Firebase Storage if you hit that limit.
