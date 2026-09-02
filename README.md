# Youth Football Tracker

A phone-friendly web app for tracking player physical testing (Phase 1).
Play-by-play film charting and a reporting dashboard are planned for later
phases — the database is already shaped to support them (see
`prisma/schema.prisma` for the roadmap notes).

**What's here:**

- Add players (name, jersey number, position, birth year)
- Record physical test results (starts with the 20-yard sprint; more test
  types can be added any time without a deploy)
- A low-friction entry form for standing on the field with a phone
- A results view with team averages and rankings per test, plus a
  sortable table of every result
- A single shared password gate, so randoms can't edit your team's data

Everything below assumes no prior web development experience. Follow it in
order.

## 1. Install prerequisites (one time)

- **Node.js** (version 20 or newer): download from [nodejs.org](https://nodejs.org)
- A code editor like [VS Code](https://code.visualstudio.com) (optional, but
  helpful for editing `.env`)
- A free [GitHub](https://github.com) account (to hold the code and connect
  to Vercel)

## 2. Create your database (free)

Pick **one** of these — both have a generous free tier and work the same
way for this app:

- [Neon](https://neon.tech) — click "Create a project", accept the
  defaults.
- [Supabase](https://supabase.com) — click "New project".

Once created, find the **connection string** (sometimes called a "connection
URI" or "pooled connection string"). It looks like:

```
postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require
```

Copy it — you'll use the *same* database for both local testing and the
live deployed app, so you only need to do this once.

## 3. Configure the project

In the project folder, copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Open `.env` in your editor and fill in three values:

- `DATABASE_URL` — the connection string from step 2
- `COACH_PASSWORD` — any password you and your assistant coaches will use
  to log in
- `AUTH_SECRET` — a random string used to sign the login cookie. Generate
  one with:

  ```bash
  openssl rand -hex 32
  ```

## 4. Install dependencies and set up the database tables

```bash
npm install
npx prisma migrate dev
npx prisma db seed
```

- `npm install` downloads everything the app needs.
- `prisma migrate dev` creates the `players`, `test_types`, and
  `testing_results` tables in your database.
- `prisma db seed` adds the starting test type ("20-yard sprint").

## 5. Run it locally and confirm it works

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), log in with your
`COACH_PASSWORD`, add a player under **Players**, then record a result on
**Entry** and check it shows up on **Results**.

## 6. Deploy to Vercel (so it works from any phone, no computer needed)

1. Push this project to a GitHub repository (create one on GitHub, then
   follow its instructions to push this folder to it — or ask your AI
   assistant to do this for you).
2. Go to [vercel.com/new](https://vercel.com/new), sign in with GitHub, and
   import the repository.
3. Before deploying, open **Environment Variables** and add the same three
   values from your `.env` file: `DATABASE_URL`, `COACH_PASSWORD`,
   `AUTH_SECRET`.
4. Click **Deploy**. Vercel will give you a URL like
   `your-app.vercel.app` — that's your app, reachable from any device.

Because it's the same database you migrated in step 4, there's nothing
else to set up — the deployed app and your local copy share the same data.

### Add to Home Screen (iPhone / iPad)

Open the Vercel URL in Safari, tap the **Share** button, then **Add to Home
Screen**. It'll launch like a regular app, full-screen, no browser bar.

## Adding more test types later

Open `prisma/seed.ts`, add a line to the `testTypes` array, e.g.:

```ts
{ name: "Vertical jump", unit: "inches", lowerIsBetter: false, sortOrder: 2 },
```

Set `lowerIsBetter: false` for tests where a higher number is better (like a
jump), or `true` for tests where a lower number is better (like a sprint
time). Then run:

```bash
npx prisma db seed
```

against the database you want to update (works the same locally or against
your production `DATABASE_URL`).

## Everyday commands

```bash
npm run dev          # run locally at http://localhost:3000
npm run build         # production build (also used by Vercel)
npx prisma studio     # a simple UI to browse/edit the database directly
npx prisma migrate dev --name <description>  # after changing schema.prisma
```

## Project structure

```
prisma/schema.prisma        Database schema (players, test_types, testing_results)
prisma/seed.ts               Starting test types
src/proxy.ts                 Login gate — protects every page except /login
src/lib/auth.ts               Password check + session cookie signing
src/app/login/                Login page + actions
src/app/(app)/                Everything behind the login gate
  page.tsx                    Entry form (home page)
  players/                    Player roster (add/remove)
  results/                    Standings + full results table
```

## Tech stack

Next.js (App Router) · Postgres via Prisma · Tailwind CSS · deployed on
Vercel. No separate backend server — Next.js Server Actions handle reads
and writes directly against Postgres.
