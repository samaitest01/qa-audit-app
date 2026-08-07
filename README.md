# QA Audit Platform

A standalone version of the QA audit tool with a real database, at a real URL.
No login yet (deferred on purpose — see "Adding accounts later" below).

This guide is written for the **no-terminal path** — everything below happens by
clicking through websites. There's no VS Code, no npm, no command line. The
starter checklist data (Core / Web & Cloud / IoT / Automotive) loads itself
automatically the first time the app opens — nothing to run manually.

---

## Step 1 — Create the database (Supabase, free)

1. Go to **supabase.com** → sign up → **New project** (any name/region is fine).
2. Once it's ready, open **SQL Editor** in the left sidebar → **New query**.
3. Open the file `supabase/schema.sql` from this folder, copy its entire contents, paste into the SQL editor, and click **Run**. This creates the 4 tables the app needs. You should see "Success" — that's it for this step.
4. Go to **Project Settings** (gear icon) → **API**. Keep this tab open — you'll copy two values from here in Step 3:
   - **Project URL**
   - **service_role key** (NOT the `anon` key — scroll to find the one labeled `service_role`, `secret`)

## Step 2 — Put the code on GitHub (no git needed)

1. Go to **github.com** → sign up if you don't have an account → click the **+** in the top right → **New repository**. Name it anything (e.g. `qa-audit-app`), keep it **Private**, click **Create repository**.
2. On the new repo's page, click **"uploading an existing file"** (a link on the empty repo page).
3. Unzip the project folder on your computer, then **drag the entire contents** of the `qa-audit-app` folder (not the outer folder itself — its contents: `pages`, `lib`, `components`, `package.json`, etc.) into the GitHub upload box.
4. Scroll down, click **Commit changes**. Done — your code is now on GitHub, no terminal used.

## Step 3 — Deploy it (Vercel, free)

1. Go to **vercel.com** → sign up using your GitHub account (this connects them automatically).
2. Click **Add New** → **Project**. Find your `qa-audit-app` repo in the list and click **Import**.
3. Before clicking Deploy, expand **Environment Variables** and add four:
   | Name | Value |
   |---|---|
   | `SUPABASE_URL` | the Project URL you copied in Step 1.4 |
   | `SUPABASE_SERVICE_ROLE_KEY` | the service_role key you copied in Step 1.4 |
   | `SITE_PASSWORD` | a password your QA team will use to get in — pick anything |
   | `SESSION_SECRET` | any long random string (e.g. mash the keyboard for 30+ characters) — this isn't something anyone types in, it's just used internally to sign login sessions |
4. Click **Deploy**. Wait ~1-2 minutes.
5. Vercel gives you a link like `https://qa-audit-app-yourname.vercel.app` — **that's your live app.** Open it. The checklist data loads itself automatically on this first visit.

That's the whole setup. Anyone with that link can now use the app from any device, anywhere — no installs, no terminal, on their end either.

---

## Making a change later

If you ever want to tweak the code: on GitHub, open the file, click the pencil (✏️) icon to edit it right in the browser, then **Commit changes**. Vercel automatically redeploys within a minute or two, no extra steps.

## Security — what's protected now vs. still open

- **Password gate**: the whole app now sits behind one shared team password (`SITE_PASSWORD`) — nobody gets in without it, including the API itself. Share the password with your QA team directly (not in the URL, not in a public place).
- **Row Level Security** is enabled on all 4 database tables, as defense-in-depth.
- **Still open**: this is one shared password for the whole team, not individual accounts — there's no way to tell which auditor did what beyond what they type into the Auditor field, and everyone who has the password can edit or delete anything. That's a reasonable tradeoff for an internal pilot; real per-person accounts (via Supabase Auth) are the natural next step if this grows beyond a small trusted team or starts holding anything genuinely client-confidential.
- **Before uploading to GitHub**: always double-check `.env.local` (if you created one for local testing) is NOT among the files you drag in — it contains real secrets. `.gitignore` is included for anyone using real `git`, but the drag-and-drop web upload doesn't check it, so verify by hand.

## If something goes wrong

- **Blank page or "Couldn't load data"**: double check the two Environment Variables in Vercel (Project Settings → Environment Variables on your Vercel project) exactly match what Supabase's API page shows — a stray space or the wrong key (anon instead of service_role) is the most common cause.
- **"relation does not exist" or similar database error**: Step 1.3 (running `schema.sql`) didn't complete — go back to the Supabase SQL Editor and re-run it.
- Anything else: copy the exact error text and send it over — that's always enough to work from.

---

## For reference — what's in this project

- `pages/api/*` — the backend (all create/read/update/delete for domains, checklist items, projects, audits), including auto-setup on first load
- `components/QAAuditApp.jsx` — the entire frontend UI
- `lib/seedData.js` — the starter checklist content, fully editable afterward inside the app itself
- `supabase/schema.sql` — database structure

### Optional: local testing (only if you want VS Code/terminal)

If you do want to run it on your own machine first: `npm install`, then
`npm run dev`, using a `.env.local` file (copy `.env.example`) with the same
two Supabase values. This is optional — the browser-only path above skips it
entirely.
