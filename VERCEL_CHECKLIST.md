# Vercel Deployment Checklist (Shubham AI Bot)

## Project Settings
- Framework preset: Next.js
- Build command: `npm run build`
- Output directory: `.next`
- Install command: `npm install`

## Environment Variables (Required)
- `GEMINI_API_KEY` (Production + Preview)

## Security
- API key is server-side only (do not expose in client code)
- `.env.local` is not committed
- No database configured (no saved backend history)

## Runtime & Routes
- API route exists: `POST /api/generate`
- API route uses Node.js runtime (`export const runtime = "nodejs"`)
- `data/writing-style.md` exists in the repo and is readable at runtime

## Local Verification (Before Deploy)
- `npm run lint` passes
- `npm run build` passes
- `npm run dev` works and you can generate a response from the UI

## Post-Deploy Verification
- Open the deployed URL and generate a response
- If generation fails: confirm `GEMINI_API_KEY` is set in Vercel project settings
