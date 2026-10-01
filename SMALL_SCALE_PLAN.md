# Scripture Hero prototype plan

**Deadline: Monday, October 5, 2026**

**Team: you and two friends**

Build one low-fidelity, working path from first visit to an approved Global post. Use the existing mobile-first web app and Golden hour design system. The current Welcome, Home, and Heroes screens contain demo data and interactions; replace only what this prototype needs with real flows.

## What must work on Monday

1. **A new visitor can preview the app.** Without signing in, they can open Welcome and browse a read-only preview of approved Global posts on Home. Actions that need an account lead to a clear create-account page.
2. **A visitor can create an account and sign in.** Support email/password and Google through Supabase Auth. After signing in, they can open their profile, see their posts and each post's status, and create or edit their own Soul Questions. Soul Questions appear only in a private section of the owner's profile, never on a public profile or in a feed.
3. **A signed-in user can share a text post with Global.** Submission saves the post as pending moderation. A simple reviewer path can approve it. Only approved posts appear in the public Global feed and visitor preview.

## Suggested split for three builders

| Owner | Main work |
| --- | --- |
| You | Visitor preview, create-account entry points, integration, and Monday demo. |
| Friend 1 | Supabase sign-up/sign-in, profile, and owner-only Soul Question editing. |
| Friend 2 | Global text-post submission, minimal approval path, and approved-post feed API. |

Agree on the smallest shared profile and post shapes before building in parallel. New application endpoints use `/api/v1`; the browser uses Supabase directly only for authentication. Commit the database migration and Row Level Security policies with the related feature.

## Keep the prototype small

- Text posts only. Use a basic form and a simple approval control for the reviewer.
- Basic profile details only: display name and optional short bio. Show the owner's draft, pending, and published posts; show only approved posts to everyone else.
- Soul Questions need create, read, and edit for their owner. Matching and recommendations can wait.
- Reuse the existing layout and classes in `DESIGN_SYSTEM.md`. Check a narrow phone screen and desktop in Day and Evening modes.
- Defer private Spaces, media uploads, comments, messaging, notifications, hero recognition, advanced moderation, and a native app.

## Monday acceptance check

- [ ] A signed-out visitor can browse Welcome and an approved-post preview, but cannot create a post or see private data.
- [ ] Email/password and Google sign-up/sign-in work from a clean browser session.
- [ ] A signed-in user can open their profile, see their posts and statuses, and edit a Soul Question.
- [ ] Another user and a signed-out visitor cannot read that Soul Question through the UI or API.
- [ ] A signed-in user can submit a Global text post; it stays private while pending and appears in the feed only after approval.
- [ ] `pnpm typecheck`, `pnpm test`, and `pnpm build` pass, and the main path is demonstrated at phone and desktop widths.

Never put raw Soul Question text in logs, URLs, notifications, or analytics. Keep service credentials on the backend. If a task threatens these privacy rules or would publish an unapproved post, reduce scope instead of weakening the rule.
