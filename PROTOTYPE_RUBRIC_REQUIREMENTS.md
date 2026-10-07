# Low-Fidelity Prototype — rubric gap check

**Due Saturday, October 10, 2026, 11:59pm. 200 points. Submit a public link — an inaccessible link is a zero.**

This checks the current app against the actual grading rubric, not `SMALL_SCALE_PLAN.md`. That plan intentionally scoped down to one narrow engineering path (feed, saves, messages) and is a good foundation, but the rubric grades a different thing: a broad, clearly-labeled, goal-driven prototype with many screens. Treat this file as the punch list for the next three days.

**Public link:** <https://scripture-hero-frontend.vercel.app> — confirmed live and serving the real app.

## Status by rubric line

| Rubric criterion | Points | Status | What's missing |
| --- | --- | --- | --- |
| Instructions followed | 20 | At risk | Depends on everything below landing before Saturday — public link itself is done. |
| Low-fidelity look + early-stage notice | 20 | **Missing** | `frontend/src/views/LandingPage.tsx` has a `prototype-label` span ("UX prototype · fictional community") but it's commented out. Nothing currently tells a user this is early-stage. Needs a visible label or modal, in plain English. |
| Entry screen signifies overarching capability | 40 | Likely done | Welcome's "Learn through connection" headline + single filled CTA already leads with capability over feature detail. Worth a final look once other screens exist, so it still reads as the clear entry point. |
| Conventions, attention, grouping, usability principles | 40 | Likely done, needs a dedicated pass | Grouping/proximity work is documented in `README.md`'s design-justification section. Rubric wants this reviewed **once per principle, across the whole prototype** — do that pass once new screens exist. |
| Design library and component reuse | 40 | Likely done | `DESIGN_SYSTEM.md` plus shared CSS classes (`button-primary`, `button-outline`, card/section patterns in `styles.css`) already give a reusable library. Confirm new screens draw from it instead of one-off styles. |
| Fully functional, non-linear, goal-driven | 40 | **Missing two pieces** | See below — this is the biggest gap. |

## The two real gaps to close

### 1. Screen count (20–30+ screens, non-linear)

The app currently has about 6 real screens: Welcome, Home, Heroes, Login, Profile, Soul Questions (plus a couple of tab-states inside Home and Heroes). The rubric wants enough screens that it "feels like a fully functional app," with multiple valid routes — not one path.

This doesn't mean building real backend features for all of them. A lo-fi prototype is allowed to fake it: static or fixture-backed screens are fine as long as they're navigable and look finished. Fastest ways to add real screen count without new backend work:
- Break existing screens into their natural sub-screens (e.g., a post's own detail view, a user's public profile view distinct from "my profile," an edit-profile screen distinct from view-profile, a notifications screen, a settings screen, a search/explore screen, an individual conversation thread as its own screen distinct from the Heroes list, empty states, a "create account" step separate from "sign in").
- Add the Spaces concept from `PRODUCT_SPEC.md` (friends / family / ward / city / congregation / global) as its own set of screens, even if only the Global space is wired to real data — the others can be static previews.
- Each settings/help/about/report-a-post/share-sheet type screen counts.

Assign this across the team — it's the single highest-point-value item left (`40 pts`) and the most labor, so don't leave it to one person this late.

### 2. User goal given upfront + non-linear confirmation

The rubric wants a goal handed to the user before they start (e.g., "find an insight that speaks to you and save it" or "share something you're learning"), delivered via a modal or written instructions, with multiple valid routes to get there — and if there's an onboarding flow, it must be skippable.

`PrototypeModal.tsx` only handles in-app actions (save/message/share/compose) today — there's no onboarding/goal modal on first load. Needs a new modal (shown once per session, skippable) that: states plainly this is an early-stage prototype (closing gap #1 above too), and gives the visitor a concrete goal with no forced single path to it.

## Also worth doing before submission

- Do a final pass confirming nothing forces a visitor into one linear path (e.g., browsing the feed and Welcome/Heroes should all be reachable without signing in first, per `SMALL_SCALE_PLAN.md`'s visitor-preview requirement).

## Done

- ✅ Public link confirmed live: <https://scripture-hero-frontend.vercel.app>
- ✅ Early-stage notice: `LandingPage.tsx`'s footer label is live (was commented out).
- ✅ Onboarding/goal modal: shows once per browser session on first load, states this is an early-stage prototype, gives a concrete goal ("save an insight, see who becomes your Scripture Hero"), and is explicitly skippable (`OnboardingModal.tsx`).
- ✅ Submission write-up drafted below — paste it into the comment box with the public link.

### Submission note (paste alongside the public link)

> Scripture Hero's core design feature is helping people find and share personal spiritual insight with others beyond their usual circle, built around a simple connection loop: browse a global feed of real experiences, save the ones that speak to you, and privately thank or message the person who shared it as your "Scripture Hero." Every screen in this prototype serves that loop — Welcome leads with the capability and value (connection) before any feature detail, Home demonstrates finding and sharing insight, and Scripture Heroes makes the resulting connection and gratitude tangible. We deliberately minimized or deferred functions discovery research didn't support as essential to that core loop: no public commenting or debate, no algorithmic ranking, no group chat, no media beyond simple text and an optional scripture reference, and no visible moderation queue. Private "Soul Questions" exist only to connect a saver's situation to a post, never to invite public advice-seeking, keeping the feed about shared insight rather than open debate.

Feel free to edit this to sound like your own team's voice before submitting — it's a starting draft, not final copy.
