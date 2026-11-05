# Frontend implementation brief

Redesign Scripture Hero's existing frontend using `docs/frontend-redesign/DESIGN_SYSTEM.md` and its original Gather reference images. The target is warm ivory, deep forest green, editorial serif headings, Nunito interface/body text, lightly bordered cards, calm photography and restrained botanical decoration.

Read the root `AGENTS.md`, `PRODUCT_SPEC.md`, current `DESIGN_SYSTEM.md`, frontend styles and the relevant views before editing. Preserve unrelated changes. Keep the existing React/Vite stack, MVC boundaries, navigation behavior, services and contracts.

Treat the new guide as the requested visual direction. Reconcile the visual section of root `AGENTS.md` and root `DESIGN_SYSTEM.md` with it as part of the change. All architecture, privacy, moderation and mobile requirements remain in effect. Do not introduce a framework or component-library dependency for this redesign.

Start with shared tokens in `frontend/src/views/styles.css`, then the shell in `App.tsx`, shared components, Home, Circles, and the remaining pages. Use the existing token names where possible. Keep day/evening themes and existing appearance behavior. Put colors, spacing, shadows and radii in tokens rather than individual component literals.

Match `references/01-home.png` for visual hierarchy and surface treatment. Keep the Scripture Hero name/logo. Keep the Circles terminology and translate generic reflections to scriptural insights. Preserve existing helpful, save, comment, report and filtering semantics. Do not add features merely because the mockups depict them.

Soul Questions are always private. Never add a share control or audience selector to them. Do not expose matching details or helped-user identities. Post composers retain a required single destination and audience explanation; submitted posts remain pending until moderation approves them. Preserve guest isolation and membership gates.

Design at 375px first. Progressively add the sidebar and right rail at the specified widths. No feature may depend on the rail, hover, or desktop navigation. Keep 44px targets, visible focus, semantic headings, text scaling and reduced-motion support. Provide loading, empty, error and success states.

Validate using the repository's required typecheck, test and build commands and inspect representative mobile/desktop screens in day/evening modes. Include Home, a Circle, post details/composer, Soul Questions and a settings page. Report implementation scope, checks performed and any remaining limitations. Do not claim visual or accessibility verification unless actually performed.
