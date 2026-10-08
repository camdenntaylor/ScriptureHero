# Low-Fidelity Prototype — rubric gap check

**Due Saturday, October 10, 2026, 11:59pm. 200 points. Submit a public link — an inaccessible link is a zero.**

This checks the current app against the actual grading rubric, not `SMALL_SCALE_PLAN.md`. That plan intentionally scoped down to one narrow engineering path (feed, saves, messages) and is a good foundation, but the rubric grades a different thing: a broad, clearly-labeled, goal-driven prototype with many screens. Treat this file as the punch list for the next three days.

**Public link:** <https://scripture-hero-frontend.vercel.app> — confirmed live and serving the real app.

## Status by rubric line

| Rubric criterion | Points | Status | What's missing |
| --- | --- | --- | --- |
| Instructions followed | 20 | At risk | Public link and both notices are done; still depends on screen count below before Saturday. |
| Low-fidelity look + early-stage notice | 20 | ✅ Done | `LandingPage.tsx`'s footer label is live, and `OnboardingModal.tsx` restates it on first visit. |
| Entry screen signifies overarching capability | 40 | ✅ Done | Verified: Welcome's "Learn through connection" headline + single `button-primary` CTA leads with capability over feature detail, no hex colors or inline styles bypassing the design system. |
| Conventions, attention, grouping, usability principles | 40 | ✅ Fixed | Checked every screen against `DESIGN_SYSTEM.md`'s own rules and found (then fixed) two real violations: `HomePage.tsx` and `ProfilePage.tsx` had no page heading at all (one was commented out, the other never had one) — both now have a `.page-heading h1`, so every screen tells the user where they are. |
| Design library and component reuse | 40 | ✅ Fixed | Found `HeroesPage.tsx` could show **two** `.button-primary` buttons at once (the empty-state "Explore your feed" CTA plus the always-present "Share an insight" one) — exactly the state a brand-new visitor with zero saved Heroes would see first. The system's own rule is one solid-green button per view. Changed the empty-state button to `button-soft`. No hex colors, inline styles, or emoji found anywhere in the components — tokens and the icon set are used consistently. |
| Fully functional, non-linear, goal-driven | 40 | Partial | The goal/onboarding modal is done (see below). Screen count is the one piece still missing — see below. |

## The one real gap left: screen count (20–30+ screens, non-linear)

The app currently has about 6 real screens: Welcome, Home, Heroes, Login, Profile, Soul Questions (plus a couple of tab-states inside Home and Heroes). The rubric wants enough screens that it "feels like a fully functional app," with multiple valid routes — not one path.

This doesn't mean building real backend features for all of them. A lo-fi prototype is allowed to fake it: static or fixture-backed screens are fine as long as they're navigable and look finished. Fastest ways to add real screen count without new backend work:
- Break existing screens into their natural sub-screens (e.g., a post's own detail view, a user's public profile view distinct from "my profile," an edit-profile screen distinct from view-profile, a notifications screen, a settings screen, a search/explore screen, an individual conversation thread as its own screen distinct from the Heroes list, empty states, a "create account" step separate from "sign in").
- Add the Spaces concept from `PRODUCT_SPEC.md` (friends / family / ward / city / congregation / global) as its own set of screens, even if only the Global space is wired to real data — the others can be static previews.
- Each settings/help/about/report-a-post/share-sheet type screen counts.

Assign this across the team — it's the single highest-point-value item left (`40 pts`) and the most labor, so don't leave it to one person this late.

## Also worth doing before submission

- Do a final pass confirming nothing forces a visitor into one linear path (e.g., browsing the feed and Welcome/Heroes should all be reachable without signing in first, per `SMALL_SCALE_PLAN.md`'s visitor-preview requirement).

## Done

- ✅ Public link confirmed live: <https://scripture-hero-frontend.vercel.app>
- ✅ Early-stage notice: `LandingPage.tsx`'s footer label is live (was commented out).
- ✅ Early-stage notice + goal: folded into two quiet lines of Welcome-page copy instead of a modal, to keep the calm feel `DESIGN_SYSTEM.md` asks for. No popup, nothing to dismiss.
- ✅ Submission write-up drafted below — paste it into the comment box with the public link.
- ✅ Design-system audit: checked every screen against `DESIGN_SYSTEM.md`'s own rules (page headings, one primary button per view, tokens-only colors, no emoji). Found and fixed two real violations — missing page headings on Home and Profile, and a double-primary-button state on Heroes when a visitor has no saved Heroes yet.

### Submission note (paste alongside the public link)

> Scripture Hero's core design feature is helping people find and share personal spiritual insight with others beyond their usual circle, built around a simple connection loop: browse a global feed of real experiences, save the ones that speak to you, and privately thank or message the person who shared it as your "Scripture Hero." Every screen in this prototype serves that loop — Welcome leads with the capability and value (connection) before any feature detail, Home demonstrates finding and sharing insight, and Scripture Heroes makes the resulting connection and gratitude tangible. We deliberately minimized or deferred functions discovery research didn't support as essential to that core loop: no public commenting or debate, no algorithmic ranking, no group chat, no media beyond simple text and an optional scripture reference, and no visible moderation queue. Private "Soul Questions" exist only to connect a saver's situation to a post, never to invite public advice-seeking, keeping the feed about shared insight rather than open debate.

Feel free to edit this to sound like your own team's voice before submitting — it's a starting draft, not final copy.
