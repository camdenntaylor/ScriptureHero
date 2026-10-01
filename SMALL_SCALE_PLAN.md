# Scripture Hero prototype plan

**Deadline: Monday, October 5, 2026**

**Team: you and two friends**

Build one low-fidelity, working path from first visit to sharing and saving a Global post. Use the existing mobile-first web app and Golden hour design system. The current Welcome, Home, and Heroes screens contain demo data and interactions; replace only what this prototype needs with real flows.

## What must work on Monday

1. **A new visitor can preview the app.** Without signing in, they can open Welcome and browse a read-only preview of Global posts on Home. Actions that need an account lead to a clear create-account page.
2. **A visitor can create an account and sign in.** Support email/password and Google through Supabase Auth. After signing in, they can open their profile, see their posts, and create or edit their own Soul Questions. Soul Questions appear only in a private section of the owner's profile, never on a public profile or in a feed.
3. **A signed-in user can share a text post with Global.** The post appears in the Global feed immediately after submission. There is no approval or review step in this prototype; moderation comes later.
4. **A signed-in user can save a post and message a Scripture Hero.** Saved posts and the resulting Scripture Heroes list are private to the user. From that list, the user can send and receive simple one-to-one messages with a Hero. A message reveals only what its sender chooses to write; saving a post never sends the author a Soul Question, save record, or automatic notification.

## Suggested split for three builders

| Owner | Main work |
| --- | --- |
| You | Visitor preview, saved-post and Heroes messaging screens, integration, and Monday demo. |
| Friend 1 | Supabase sign-up/sign-in, profile, and owner-only Soul Question editing. |
| Friend 2 | Global text-post and feed API, plus persistence for saves and messages. |

Agree on the smallest shared profile and post shapes before building in parallel. New application endpoints use `/api/v1`; the browser uses Supabase directly only for authentication. Commit the database migration and Row Level Security policies with the related feature.

## Keep the prototype small

- Text posts only. Submission publishes to Global immediately for this prototype. Add moderation and review after Monday.
- Basic profile details only: display name and optional short bio. Show the owner's posts on their profile.
- Soul Questions need create, read, and edit for their owner. Matching and recommendations can wait.
- A private saved list and basic one-to-one message threads are enough. No search, attachments, group chat, or message notifications.
- Reuse the existing layout and classes in `DESIGN_SYSTEM.md`. Check a narrow phone screen and desktop in Day and Evening modes.
- Defer private Spaces, media uploads, comments, notifications, automated matching, moderation, and a native app.

## Monday acceptance check

- [ ] A signed-out visitor can browse Welcome and a read-only Global feed, but cannot create or save a post, message anyone, or see private data.
- [ ] Email/password and Google sign-up/sign-in work from a clean browser session.
- [ ] A signed-in user can open their profile, see their posts, and edit a Soul Question.
- [ ] Another user and a signed-out visitor cannot read that Soul Question through the UI or API.
- [ ] A signed-in user can submit a Global text post and see it immediately in the feed and on their profile.
- [ ] A signed-in user can save a post, find its author in their private Scripture Heroes list, and exchange messages with that person. Other users cannot read their saves or messages.
- [ ] `pnpm typecheck`, `pnpm test`, and `pnpm build` pass, and the main path is demonstrated at phone and desktop widths.

Never put raw Soul Question text in logs, URLs, notifications, analytics, or messages automatically. Keep service credentials on the backend. Immediate Global publishing is an explicit, temporary prototype exception to the moderation rule in `AGENTS.md`; add approval before a broader release.
