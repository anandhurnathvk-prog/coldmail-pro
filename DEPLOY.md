# ColdMail Pro — Deployment Guide
## Deploy to Vercel in 10 Minutes (Free)

---

## STEP 1 — Create a GitHub Account (if you don't have one)
1. Go to github.com
2. Click "Sign up" — it's free
3. Create your account

---

## STEP 2 — Upload Your Project to GitHub
1. Go to github.com and click the "+" button → "New repository"
2. Name it: coldmail-pro
3. Set it to Public
4. Click "Create repository"
5. On the next page, click "uploading an existing file"
6. Upload ALL the files from the coldmail-pro folder (keep the folder structure intact)
7. Click "Commit changes"

---

## STEP 3 — Deploy on Vercel
1. Go to vercel.com
2. Click "Sign Up" → choose "Continue with GitHub"
3. Authorize Vercel to access your GitHub
4. Click "Add New Project"
5. Find your "coldmail-pro" repository and click "Import"
6. Vercel will auto-detect it as a Vite project ✓
7. Before clicking Deploy — do STEP 4 first!

---

## STEP 4 — Add Your Gemini API Key (IMPORTANT)
On the Vercel deploy screen:
1. Click "Environment Variables"
2. In the "Name" field type exactly: GEMINI_API_KEY
3. In the "Value" field paste your Gemini API key (from aistudio.google.com)
4. Click "Add"
5. NOW click "Deploy"

---

## STEP 5 — Your App is Live!
- Vercel will build and deploy in about 60 seconds
- You'll get a URL like: https://coldmail-pro.vercel.app
- Share this link with ANYONE in the world
- They can sign up and use it for free

---

## UPDATING YOUR APP IN THE FUTURE
If you want to make changes:
1. Edit the files
2. Upload to GitHub again
3. Vercel automatically redeploys — takes 60 seconds

---

## TROUBLESHOOTING
- "API key not configured" error → Check Step 4, make sure the env variable name is exactly GEMINI_API_KEY
- Build fails → Make sure you uploaded all files including package.json and vercel.json
- Blank page → Open browser console (F12) and check for errors

---

## YOUR FILE STRUCTURE (must match exactly)
coldmail-pro/
├── api/
│   └── generate.js        ← Secure backend (your API key lives here safely)
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   └── storage.js
├── public/
│   └── favicon.svg
├── index.html
├── package.json
├── vite.config.js
└── vercel.json
