# Low-Fidelity Prototype — rubric gap check

**Due Saturday, October 10, 2026, 11:59pm. 200 points. Submit a public link — an inaccessible link is a zero.**

This checks the current app against the actual grading rubric, not `SMALL_SCALE_PLAN.md`. That plan intentionally scoped down to one narrow engineering path (feed, saves, messages) and is a good foundation, but the rubric grades a different thing: a broad, clearly-labeled, goal-driven prototype with many screens. Treat this file as the punch list for the next three days.

**Public link:** <https://scripture-hero-frontend.vercel.app> — confirmed live and serving the real app.

## Status by rubric line

| Rubric criterion | Points | Status | What's missing |
| --- | --- | --- | --- |
| Instructions followed | 20 | ✅ Done | Public link, notices, and screen count are all done. Worth a final team walkthrough before submitting, but nothing blocking left. |
| Low-fidelity look + early-stage notice | 20 | ✅ Done | Stated in plain English via two quiet lines in `LandingPage.tsx`'s Welcome copy (not a modal — kept the calm feel `DESIGN_SYSTEM.md` asks for). |
| Entry screen signifies overarching capability | 40 | ✅ Done | Verified: Welcome's "Learn through connection" headline + single `button-primary` CTA leads with capability over feature detail, no hex colors or inline styles bypassing the design system. |
| Conventions, attention, grouping, usability principles | 40 | ✅ Fixed | Checked every screen against `DESIGN_SYSTEM.md`'s own rules and found (then fixed) two real violations: `HomePage.tsx` and `ProfilePage.tsx` had no page heading at all (one was commented out, the other never had one) — both now have a `.page-heading h1`, so every screen tells the user where they are. |
| Design library and component reuse | 40 | ✅ Fixed | Found `HeroesPage.tsx` could show **two** `.button-primary` buttons at once (the empty-state "Explore your feed" CTA plus the always-present "Share an insight" one) — exactly the state a brand-new visitor with zero saved Heroes would see first. The system's own rule is one solid-green button per view. Changed the empty-state button to `button-soft`. No hex colors, inline styles, or emoji found anywhere in the components — tokens and the icon set are used consistently. |
| Fully functional, non-linear, goal-driven | 40 | ✅ Done | The goal is stated in Welcome copy. Screen count is complete — see below. Non-linearity: Welcome/Home/Heroes/Spaces/Library are all reachable without signing in, per the visitor-preview requirement. |

## The one real gap left: screen count (20–30+ screens, non-linear)

Concrete plan the team agreed on, being built in chunks:

| # | Screen | Status |
| --- | --- | --- |
| 1 | Welcome | ✅ existing |
| 2 | Home / Global feed | ✅ existing |
| 3 | **Topics** (search/browse insights by topic) | ✅ done — third tab next to "For you" on Home |
| 4 | **Spaces directory** (simulated groups — congregation, family, friends, city) | ✅ done |
| 5 | **A Space's feed** | ✅ done — one template screen, reused per space |
| 6 | Scripture Heroes | ✅ existing |
| 7 | **Soul Questions Directory** (public FAQ/prompt library) | ✅ done — `#library`, linked from Soul Questions and Home's aside |
| 8 | Soul Questions (private, yours) | ✅ existing |
| 9 | Login | ✅ existing |
| 10 | **My Profile (Overview)** | ✅ done — stats, saved count, badges, link-cards out to the three below |
| 11 | **Edit Profile** | ✅ done — split out from Profile, adds a favorite-verse field |
| 12 | **Account & Privacy Settings** | ✅ done |
| 13 | **Notifications Center** | ✅ done — header bell links here since it's not in top nav |
| 14 | **Notification Preferences** | ✅ done |

Dropped: a "most commonly asked questions" trending panel was considered for the Soul Questions Directory but cut — it ran against the product's own privacy principle that Soul Questions are never disclosed to anyone, even in aggregate.

**Plan complete, with margin.** Added 8 more standard pages beyond the original plan to clear the floor by strict route count too, not just the sub-state count: Public Profile (view another member), About, Help & Support, Terms, Privacy (all linked from Welcome's footer), and Blocked Accounts / Delete Account / Appearance (linked from Account & Privacy Settings). None of these touch the main nav or add visible clutter — they're reachable the same way real apps surface them (footer links, settings sub-pages, tapping someone's name).

**Strict top-level route count: 20.** Counting sub-states too (Home's 3 tabs, Heroes' 2 tabs, Login's 3 modes, Spaces' directory/feed): **~28.** Clears the rubric's 20-30 floor either way it's counted.

## Also worth doing before submission

- Do a final pass confirming nothing forces a visitor into one linear path (e.g., browsing the feed and Welcome/Heroes should all be reachable without signing in first, per `SMALL_SCALE_PLAN.md`'s visitor-preview requirement).

## Done

- ✅ Public link confirmed live: <https://scripture-hero-frontend.vercel.app>
- ✅ Early-stage notice + goal: two quiet lines of Welcome-page copy, no modal, no popup to dismiss.
- ✅ Submission write-up drafted below — paste it into the comment box with the public link.
- ✅ Design-system audit: checked every screen against `DESIGN_SYSTEM.md`'s own rules (page headings, one primary button per view, tokens-only colors, no emoji). Found and fixed two real violations — missing page headings on Home and Profile, and a double-primary-button state on Heroes when a visitor has no saved Heroes yet.
- ✅ Topics + Spaces screens (see table above).
- ✅ Soul Questions Directory, Profile split (Overview/Edit), Account & Privacy Settings, Notifications Center, Notification Preferences (see table above). Screen-count plan is complete: 20 distinct views.

### Submission note (paste alongside the public link)

> Scripture Hero's core design feature is helping people find and share personal spiritual insight with others beyond their usual circle, built around a simple connection loop: browse a global feed of real experiences, save the ones that speak to you, and privately thank or message the person who shared it as your "Scripture Hero." Every screen in this prototype serves that loop — Welcome leads with the capability and value (connection) before any feature detail, Home demonstrates finding and sharing insight, and Scripture Heroes makes the resulting connection and gratitude tangible. We deliberately minimized or deferred functions discovery research didn't support as essential to that core loop: no public commenting or debate, no algorithmic ranking, no group chat, no media beyond simple text and an optional scripture reference, and no visible moderation queue. Private "Soul Questions" exist only to connect a saver's situation to a post, never to invite public advice-seeking, keeping the feed about shared insight rather than open debate.

Feel free to edit this to sound like your own team's voice before submitting — it's a starting draft, not final copy.
