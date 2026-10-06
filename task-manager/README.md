# Task Manager

A simple internal task manager for an Admin and a small team.
React + Vite + Tailwind CSS + Supabase (auth and database) + Lucide icons.

## 1. Create the Supabase project
1. Go to https://supabase.com and create a free project.
2. Open **SQL Editor → New query**, paste the contents of `supabase/schema.sql`, and click **Run**.
   This creates the tables, security rules and helper functions.
3. Open **Authentication → Providers → Email** and turn **off** "Confirm email"
   (needed so the Admin can add members who can log in straight away).
4. Open **Project Settings → API** and copy the **Project URL** and the **anon public** key.

## 2. Configure and run
```
cp .env.example .env     # then paste your URL and anon key into .env
npm install
npm run dev
```
Open http://localhost:5173

## 3. Create the first Admin
In Supabase go to **Authentication → Users → Add user → Create new user**
(tick "Auto Confirm User"), enter an email and password, then sign in with it.
**The first user created automatically becomes the Admin.** Everyone added afterwards is a Team Member.

From then on the Admin adds and removes members on the **Team** page.

## Roles
| | Admin | Team Member |
|---|---|---|
| View tasks | All | Only their own |
| Create / edit / delete tasks | Yes | No |
| Change status | Any task | Own tasks |
| Add / remove team members | Yes | No |

Permissions are enforced in the database (Row Level Security), not only in the UI.

## Notes
- Sign in uses email and password.
- Because the Admin creates accounts with the public sign-up API, also consider restricting
  sign-ups for production (e.g. enable CAPTCHA under Authentication → Attack Protection).
- Deploy anywhere that hosts static sites (`npm run build` creates `dist/`); add the two env vars there.
