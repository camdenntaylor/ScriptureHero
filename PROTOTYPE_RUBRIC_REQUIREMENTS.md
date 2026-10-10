# Low-Fidelity Prototype — rubric status

**Due Saturday, October 10, 2026, 11:59pm. 200 points. Submit a public link — an inaccessible link is a zero.**

This checks the app against the actual grading rubric, not `SMALL_SCALE_PLAN.md`. That plan intentionally scoped down to one narrow engineering path (feed, saves, messages) and is a good foundation, but the rubric grades a different thing: a broad, clearly-labeled, goal-driven prototype with many screens.

**Public link:** <https://scripture-hero-frontend.vercel.app> — confirmed live and serving the current build.

## Status by rubric line

| Rubric criterion | Points | Status | Notes |
| --- | --- | --- | --- |
| Instructions followed | 20 | ✅ Done | Public link, notices, and screen count are all done. Worth a final team walkthrough before submitting. |
| Low-fidelity look + early-stage notice | 20 | ✅ Done | Stated in plain English via two quiet lines in `LandingPage.tsx`'s Welcome copy — no modal, nothing to dismiss, keeps the calm feel `DESIGN_SYSTEM.md` asks for. |
| Entry screen signifies overarching capability | 40 | ✅ Done | Welcome's "Learn through connection" headline + single `button-primary` CTA leads with capability over feature detail. |
| Conventions, attention, grouping, usability principles | 40 | ✅ Done | Audited every screen against `DESIGN_SYSTEM.md`'s own rules. Found and fixed: missing page headings on Home, Profile, and Public Profile; zero hex colors, inline styles, or emoji anywhere in the app. |
| Design library and component reuse | 40 | ✅ Done | Found and fixed a double-primary-button state on Heroes (empty state + "Share an insight" both showing at once). Every new screen reuses existing classes (`profile-card`, `question-choices`, `space-card`, etc.) instead of inventing near-duplicates. |
| Fully functional, non-linear, goal-driven | 40 | ✅ Done | Goal stated in Welcome copy. Screen count well above the floor (see below). Welcome/Home/Heroes/Spaces/Library/Public Profile/About/Help/Terms/Privacy are all reachable with no sign-in required. |

## Full page inventory

**25 top-level routes, ~32 distinct views counting tab/mode states within a screen as their own view.** Both numbers sit inside the rubric's 20-30 floor (25 strict) or just past it (32 with sub-states) — comfortable margin either way a grader counts.

| # | Route | Page | Access | Reached from | Sub-states |
| --- | --- | --- | --- | --- | --- |
| 1 | `#welcome` | Welcome | Public | Entry point / logo | — |
| 2 | `#home` | Home / Global feed | Public | Main nav | For you · Saved · Topics (browse) · Topics (results) — 4 |
| 3 | `#spaces` | Spaces directory | Public | Main nav | Directory · a Space's feed — 2 |
| 4 | `#heroes` | Scripture Heroes | Public | Main nav | Your Heroes · People you've helped — 2 |
| 5 | `#library` | Soul Questions Library (public FAQ/prompt directory) | Public | Soul Questions page, Home's aside card | — |
| 6 | `#login` | Login | Public | Header "Log in" | Sign in · Sign up · Check your email — 3 |
| 7 | `#profile` | My Profile (Overview) | Private | Main nav (signed in) | — |
| 8 | `#profile-edit` | Edit Profile | Private | Profile Overview | — |
| 9 | `#questions` | Soul Questions (private, yours) | Private | Profile Overview, Home's aside card | — |
| 10 | `#settings-privacy` | Account & Privacy Settings | Private | Profile Overview | — |
| 11 | `#notifications` | Notifications Center | Private | Header bell icon | — |
| 12 | `#notification-settings` | Notification Preferences | Private | Notifications page | — |
| 13 | `#public-profile` | Public Profile (view another member) | Public | Tap a name/avatar in the feed or a Scripture Hero card | — |
| 14 | `#about` | About Scripture Hero | Public | Welcome footer | — |
| 15 | `#help` | Help & Support | Public | Welcome footer | — |
| 16 | `#terms` | Terms of Service | Public | Welcome footer | — |
| 17 | `#privacy` | Privacy Policy | Public | Welcome footer | — |
| 18 | `#blocked-accounts` | Blocked Accounts | Private | Account & Privacy Settings | — |
| 19 | `#delete-account` | Delete Account | Private | Account & Privacy Settings | — |
| 20 | `#appearance` | Appearance (Day / Evening / Match device) | Private | Account & Privacy Settings | — |
| 21 | `#post` | Post Detail | Public | Tap a post's title in the feed | — |
| 22 | `#report` | Report a Post | Public | "Report this post" on Post Detail | — |
| 23 | `#settings-account` | Account Settings (sign-in method, password reset) | Private | Account & Privacy Settings | — |
| 24 | `#invite` | Invite Friends | Private | Account & Privacy Settings | — |
| 25 | `#messages` | Messages | Private | Notifications page | — |

"Private" means it requires signing in; signed-out visitors are redirected to Login. Everything else is browsable by a first-time, signed-out visitor, satisfying the non-linear visitor-preview requirement.

Dropped along the way: a "most commonly asked questions" trending panel was considered for the Soul Questions Library, then cut — it ran against the product's own privacy principle that Soul Questions are never disclosed to anyone, even in aggregate.

## What got built, in order

1. **Early-stage notice + goal** — two quiet lines in Welcome's copy (replaced an earlier modal version that didn't match the app's calm feel).
2. **Design-system audit #1** — fixed missing page headings on Home and Profile, and a double-primary-button state on Heroes.
3. **Topics** (route 2's third tab) **+ Spaces** (routes 3) — search/browse insights by topic; a directory of simulated groups (a congregation, a family, friends, a city community), each with its own feed.
4. **Soul Questions Library** (route 5) — a searchable public library of common prompts; picking one prefills the private Soul Questions form.
5. **Profile split + Settings + Notifications** (routes 7–12) — Profile Overview (stats, badges) separated from Edit Profile (adds a favorite-verse field), plus Account & Privacy Settings, Notifications Center, and Notification Preferences. Added a header bell icon since Notifications isn't in the main nav.
6. **Design-system audit #2** — re-verified all of the above against `DESIGN_SYSTEM.md`; everything passed.
7. **8 more standard pages** (routes 13–20) — Public Profile, About, Help & Support, Terms, Privacy, Blocked Accounts, Delete Account, Appearance. Added specifically to clear the screen-count floor by strict route count, not just by counting tab-states. None of these touch the main nav — they're reachable the same way real apps surface them (footer links, settings sub-pages, tapping someone's name), so nothing about the app's primary navigation changed or got more complicated.
8. **Final fix** — Public Profile was missing its page heading; caught and fixed before the last commit.
9. **5 more pages** (routes 21–25) — Post Detail, Report a Post, Account Settings, Invite Friends, Messages. Added to clear 20 routes with real margin (requested target: 25). Same rule as the last batch: no changes to the main nav, reached through tapping a post title, Post Detail's report link, and two more entries in Settings' "More" list.

## Also worth doing before submission

- A final team walkthrough confirming nothing forces a visitor into one linear path.
- A visual spot-check of Evening/dark mode on the newest screens (Spaces, Library, Profile, Settings, Public Profile) — the code is 100% token-driven with zero hardcoded colors, so it should render correctly, but no one has eyeballed it yet.

## Submission note (paste alongside the public link)

> Scripture Hero's core design feature is helping people find and share personal spiritual insight with others beyond their usual circle, built around a simple connection loop: browse a global feed of real experiences, save the ones that speak to you, and privately thank or message the person who shared it as your "Scripture Hero." Every screen in this prototype serves that loop — Welcome leads with the capability and value (connection) before any feature detail, Home demonstrates finding and sharing insight, and Scripture Heroes makes the resulting connection and gratitude tangible. We deliberately minimized or deferred functions discovery research didn't support as essential to that core loop: no public commenting or debate, no algorithmic ranking, no group chat, no media beyond simple text and an optional scripture reference, and no visible moderation queue. Private "Soul Questions" exist only to connect a saver's situation to a post, never to invite public advice-seeking, keeping the feed about shared insight rather than open debate.

Feel free to edit this to sound like your own team's voice before submitting — it's a starting draft, not final copy.
