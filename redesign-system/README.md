# Scripture Hero frontend redesign handoff

This package translates the original Gather mockups into a reusable design system tailored to the current Scripture Hero repository. It contains documentation and visual references only. No frontend source was changed.

## Contents

- `DESIGN_SYSTEM.md`: proposed design-system replacement with semantic day/evening colors, type scale, layout, spacing, component guidance, accessibility and implementation sequence.
- `IMPLEMENTATION_BRIEF.md`: ready-to-use instructions for a coding agent working inside Scripture Hero.
- `references/01-home.png`: primary visual reference.
- `references/02-spaces.png`: community discovery reference; retain the Circles branding.
- `references/03-reflections.png`: typography and reflective-panel reference only. Its sharing controls must never be applied to Soul Questions.

## Put it in the repo

1. Copy this folder into `docs/frontend-redesign/` in Scripture Hero.
2. Use the implementation brief to guide the redesign. During implementation, reconcile the root `DESIGN_SYSTEM.md` and the visual-design section of root `AGENTS.md` with this direction so there is one authoritative system.
3. Keep existing frontend behaviors, backend boundaries, privacy and moderation rules.

The current repository guide mandates Nunito-only typography and the Golden hour theme. This proposal intentionally changes the visual direction to serif headings plus Nunito, forest green, and lighter cards. Updating those documentation rules is part of implementation, not a request to ignore unrelated repository requirements.

Reference images were generated with the built-in image tool during visual brainstorming. The written specifications govern details where the images differ, including terminology, existing functionality, mobile composition and private data handling. This package adds no dependencies, code, routes or product features.
