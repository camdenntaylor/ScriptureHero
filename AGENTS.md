# Scripture Hero Agent Guide

This file defines the repository-wide rules for humans and coding agents working on Scripture Hero. Follow it unless a more specific `AGENTS.md` exists deeper in the directory tree. Direct user instructions take precedence.

## Product mission

Scripture Hero connects people around the world through personal scriptural insights and testimonies of Jesus. It is non-denominational, open to people of any religion, and intentionally designed for uplifting conversation rather than debate or criticism.

The core product outcome is helping someone through a sincere post. Protect user dignity, privacy, and emotional safety over engagement metrics.

## Architecture decisions

Scripture Hero is a TypeScript pnpm monorepo built as a modular monolith.

- Scripture Hero is a mobile-first product. A dedicated mobile app is a long-term goal, and desktop web remains supported.
- `frontend/`: the current React single-page web application built with Vite. It must be designed from phone-sized screens upward.
- The current web client is the first delivery client, not the permanent boundary of the product architecture.
- Keep domain behavior, API contracts, authentication flows, and media workflows portable to a future native mobile client.
- `backend/`: Fastify REST API and application services.
- Supabase is the intended managed platform for PostgreSQL, Auth, Storage, Realtime, Row Level Security, and Edge Functions.
- The browser uses Supabase directly only for authentication and signed media transfers. Feed queries, application mutations, authorization-sensitive operations, moderation, and matching go through the backend API.
- Use REST endpoints under `/api/v1` for new application APIs. The existing skeleton endpoints under `/api` may remain until migrated deliberately.
- Keep one deployable backend until measured scaling needs justify extracting a service.
- Prefer asynchronous, idempotent background work for moderation, matching, notifications, and media processing.

Do not introduce microservices, a second database, a separate vector database, GraphQL, or a new state-management framework without an explicit architecture decision.

Do not choose a native mobile framework implicitly while implementing a web feature. When native mobile development begins, record the framework choice in an architecture decision and place the client in a dedicated workspace such as `mobile/`.

## Domain modules

New backend features should be organized by domain under `backend/src/modules/`:

```text
backend/src/modules/
  auth/
  profiles/
  spaces/
  posts/
  soul-questions/
  moderation/
  matching/
  heroes/
  notifications/
```

A module may contain:

```text
model.ts
repository.ts
service.ts
controller.ts
routes.ts
schemas.ts
*.test.ts
```

Use only the files a module needs. Shared technical infrastructure belongs in `backend/src/shared/`; shared product behavior should remain in the domain that owns it.

The initial `backend/src/controllers`, `models`, `repositories`, `routes`, and `services` directories are skeleton code. Migrate them incrementally when working on the related feature; do not perform unrelated reorganizations.

Frontend code currently follows MVC-style boundaries:

- `frontend/src/models/`: client-side domain types.
- `frontend/src/controllers/`: hooks and UI-flow orchestration.
- `frontend/src/services/`: API and external-service clients.
- `frontend/src/views/`: React pages, components, and styles.

Keep React views focused on rendering and interaction. Network access and business rules do not belong directly in view components.

When shared API contracts are introduced, place Zod request, response, and event schemas in a workspace package such as `packages/contracts/`. Infer TypeScript types from those schemas rather than maintaining duplicate handwritten interfaces.

## Core data model

The planned initial relational model includes:

- `profiles`
- `spaces`
- `space_members`
- `posts`
- `post_media`
- `soul_questions`
- `post_question_matches`
- `helpful_marks`
- `moderation_reviews`
- `notifications`
- `outbox_events`

Important invariants:

- A post belongs to exactly one Space.
- Global is a public Space, not a separate post type.
- Only approved posts may appear in feeds or matching results.
- A user may mark a post helpful only once.
- Scripture Hero recognition is derived from helpful confirmations, not an editable counter.
- Prefer archival or visibility-state changes over hard deletion of published content when auditability or user safety matters.
- Persist timestamps in UTC and expose opaque identifiers rather than sequential public IDs.

All schema changes must be migrations committed to the repository. Add indexes for foreign keys, feed ordering, membership checks, moderation status, and other demonstrated query paths. Avoid speculative indexes.

## Soul Question privacy — non-negotiable

Soul Questions are always private. They are sensitive personal data, not social content.

- Only the question owner and privileged backend matching services may read raw question content.
- Soul Questions must never appear on profiles, in Spaces, feeds, search results, public APIs, analytics payloads, or author notifications.
- There is no public, friends, or Space visibility option for a Soul Question.
- Embeddings, inferred topics, match scores, and `post_question_matches` are private because they can reveal the question.
- Recommendations produced from a question are visible only to its owner.
- Post authors may learn only that their post helped someone and may see an anonymous aggregate count.
- Never expose the helped user's identity, question, inferred problem, match explanation, or match score to a post author.
- Internal relationships may be retained for deduplication, abuse prevention, and auditing, but must not be returned through author-facing contracts.
- Do not place raw Soul Question text in logs, traces, error messages, notification payloads, URLs, analytics, or third-party monitoring.
- Minimize raw question transmission to AI providers. Any provider must meet the project's privacy and retention requirements before integration.

Enforce these rules in API authorization and PostgreSQL Row Level Security. UI hiding alone is not a security boundary. Supabase service credentials must never be sent to the browser.

## Spaces and authorization

- Global posts are publicly readable only after approval.
- Restricted Space content is readable only by active members of that Space.
- Users can manage their own drafts but cannot bypass moderation when publishing or materially editing a published post.
- Authorization checks belong close to the data boundary and must be enforced server-side even when the UI also restricts an action.
- RLS is defense in depth, not a replacement for application-level authorization tests.
- Administrative and moderation access must be explicit, least-privileged, and auditable.

## Moderation lifecycle

Use an explicit post state machine:

```text
draft -> pending_moderation -> published
                            -> needs_review -> published | rejected
                            -> rejected
published -> hidden
```

- Never make a submitted post public before it is approved.
- AI may triage content, but uncertain cases must go to human review.
- Store structured reason codes and the moderation policy/model version used.
- Do not expose private moderation reasoning or unsafe content through client errors.
- A materially edited published post must be moderated again.
- Design moderation jobs to be retryable and idempotent.

## Backend conventions

- Controllers adapt HTTP requests and responses; they do not contain business logic.
- Services implement application use cases and domain rules.
- Repositories isolate persistence and return domain-oriented results.
- Routes define transport details and connect controllers to Fastify.
- Validate every external input with Zod at the boundary.
- Return consistent error envelopes and stable machine-readable error codes.
- Pass dependencies explicitly; avoid mutable global singletons.
- Do not read `process.env` throughout the application. Validate configuration once in `config/` and inject it.
- Keep privileged Supabase clients server-only.
- Use cursor pagination for feeds. Do not introduce unbounded list endpoints.
- Keep mobile payloads bounded and avoid chatty request sequences. Prefer endpoints that support a complete screen or user action without over-fetching sensitive data.
- Design uploads for progress, cancellation, retry, and eventual resumability.
- Authentication and invitation flows must support mobile deep-link redirects as well as web URLs.
- Make externally retried writes idempotent where practical.
- Use an outbox/event pattern for reliable asynchronous side effects once persistent storage is connected.

## Frontend conventions

- Use React function components and hooks.
- Design and validate the phone experience first. Tablet and desktop layouts should progressively enhance the same workflows.
- Core functionality must not depend on hover, a mouse, a physical keyboard, wide tables, persistent sidebars, or multiple simultaneous panels.
- Use touch targets of at least 44 by 44 CSS pixels and account for comfortable thumb reach in primary actions.
- Account for mobile safe areas, virtual keyboards, portrait layouts, and text scaling.
- Navigation concepts should map cleanly to mobile stacks, tabs, modals, and deep links. Do not make URL-only behavior the domain model.
- Pages own route-level composition; reusable components should remain focused and accessible.
- Controllers/hooks coordinate loading, mutation, and error states.
- Service modules own HTTP calls and translate transport failures into typed application errors.
- Keep reusable domain logic free of React DOM, `window`, `document`, `localStorage`, and other browser-only dependencies.
- Do not duplicate server authorization logic as if it were authoritative. Client checks are for user experience only.
- Every async view must provide loading, empty, error, and success states.
- Preserve keyboard navigation, visible focus, semantic HTML, and useful accessible names.
- Avoid exposing private identifiers or Soul Question-derived data in browser storage, URLs, telemetry, or cached public responses.
- Avoid hover-only disclosure and interactions. Desktop keyboard and hover behavior are enhancements, not prerequisites.
- Respect reduced-motion preferences and avoid unnecessary animation, bandwidth, battery use, and background processing.
- Optimize images and video for constrained networks. Provide useful upload progress and recovery feedback.
- Preserve feature parity on desktop web unless a platform limitation is documented.

## API and contract rules

- New endpoints use `/api/v1`.
- Prefer resource-oriented routes and explicit action endpoints only when an action is not naturally CRUD.
- Use ISO 8601 UTC timestamps in JSON.
- Never return database rows blindly; map them to explicit response contracts.
- Additive response changes are preferred. Coordinate and document breaking changes.
- Soul Question, moderation, and match contracts require explicit tests proving that sensitive fields are absent from unauthorized responses.

## Testing and verification

Every behavior change should be verified at the cheapest meaningful level.

- Unit-test domain rules and services.
- Integration-test repositories and RLS policies against a real local/test database when persistence is involved.
- Test Fastify routes with `app.inject()`.
- Test privacy and authorization with both allowed and denied identities.
- Verify user-facing flows at a representative narrow mobile viewport and at a desktop viewport.
- Test interrupted, slow, retried, and duplicate requests for important mobile mutations and uploads.
- Add regression tests for every security or privacy bug.
- Do not weaken or delete a test merely to make a change pass.

Before handing off a normal code change, run:

```bash
pnpm typecheck
pnpm test
pnpm build
```

If a command cannot run, report the exact reason and what remains unverified.

## Local development

Use Node.js 22 or newer and the pnpm version pinned in the root `package.json`.

```bash
pnpm install
pnpm dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- Health check: `http://localhost:3000/api/health`

Copy `.env.example` files to `.env` only when needed. Never commit `.env` files, tokens, service-role keys, production data, or user-provided sensitive content.

## Change discipline

- Read `PRODUCT_SPEC.md` before making product-level changes.
- Preserve unrelated user changes in a dirty worktree.
- Keep changes scoped to the requested outcome.
- Prefer small, reversible migrations and commits.
- Update documentation when architecture, commands, contracts, or privacy behavior changes.
- Treat mobile as the primary experience in product and technical decisions while continuing to support desktop web.
- Do not make a browser-specific implementation part of a backend contract or domain invariant.
- Do not add a dependency when the platform or current stack already provides the capability adequately.
- Do not implement engagement mechanics that reward controversy, outrage, or exposure of another person's vulnerability.
- When product requirements conflict with privacy or safety invariants, stop and request an explicit decision.

## Definition of done

A change is complete when:

- The requested behavior works through the relevant user path.
- Domain, authorization, and Soul Question privacy rules remain intact.
- Inputs and failures are handled deliberately.
- Appropriate tests are added and passing.
- Type checking and production builds succeed.
- Database changes include migrations and policy updates.
- Documentation reflects any new architectural decision.
