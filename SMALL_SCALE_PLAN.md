# Scripture Hero Small-Scale Beta Plan

## Purpose

This plan moves Scripture Hero from its current full-stack skeleton to an invite-only, mobile-first beta that friends and family can use on their phones and desktop browsers. The beta should be large enough to reveal product, privacy, usability, and reliability problems without requiring production-scale operations.

The plan assumes one-week sprints, but completion is determined by exit criteria rather than dates. A solo developer may stretch a sprint across multiple weeks without changing the order of work.

## Target outcome

At the end of this plan:

- 15–30 invited testers can sign in securely.
- Testers can create a profile and join invited Spaces.
- Testers can publish text and image posts after moderation.
- Approved posts appear in Global and private Space feeds.
- Testers can privately create and manage Soul Questions.
- The backend can recommend approved posts based on private Soul Questions.
- Testers can anonymously confirm that a post helped them.
- Authors can see that their posts helped someone without learning who, why, or which Soul Question was involved.
- The app is comfortable to use from a phone browser and remains functional on desktop.
- The developer can review moderation cases, observe failures, collect feedback, and deploy fixes safely.

## Beta scope

### Included

- Invite-only email authentication
- Basic user profiles
- Global Space and invite-only private Spaces
- Text posts with a scripture reference
- One or more images with optional alternative text
- Draft, moderation, publication, rejection, and hidden post states
- Human moderation fallback
- Mobile-first feeds with cursor pagination
- Private Soul Question creation, editing, archiving, and deletion
- Private post recommendations
- Anonymous helpful confirmations and aggregate helpful counts
- Basic notifications inside the app
- Content reporting
- Installable mobile-web experience where practical
- Feedback and bug-report workflow
- Staging and production environments

### Deferred until after the first beta

- Native iOS or Android application packaging
- Video posts and video processing
- Public self-service registration
- Direct messaging and comments
- Following, public friend graphs, and algorithmic engagement ranking
- Push notifications
- Advanced organization or congregation administration
- Automated appeals and a full moderator team workflow
- Monetization
- Large-scale localization
- Public user discovery

Deferring these items is a scope decision, not a statement that they are unimportant.

## Non-negotiable release constraints

- Soul Questions and all derived matching data remain private to their owner and privileged backend matching services.
- No Soul Question text, embedding, inferred topic, match score, or user identity may reach a post author.
- No submitted post becomes visible before moderation approval.
- Private Space content is unavailable to non-members at both the API and database-policy layers.
- Service credentials never reach a browser bundle.
- Important mutations are safe to retry from an unreliable mobile connection.
- Every primary workflow is tested at a narrow phone viewport and a desktop viewport.
- Raw Soul Question text is excluded from logs, analytics, URLs, notifications, and error payloads.

## Working method

At the beginning of each sprint:

- [ ] Confirm the sprint goal and exit criteria.
- [ ] Break checklist items into small issues.
- [ ] Identify privacy, authorization, and migration risks before coding.
- [ ] Confirm that required external accounts or secrets are available.

During each sprint:

- [ ] Keep the application runnable after each meaningful change.
- [ ] Add tests with the behavior rather than at the end.
- [ ] Check the most important flow on a real phone when UI changes are involved.
- [ ] Record newly discovered work without silently expanding the active sprint.

At the end of each sprint:

- [ ] Run `pnpm typecheck`.
- [ ] Run `pnpm test`.
- [ ] Run `pnpm build`.
- [ ] Perform the sprint's manual acceptance checks.
- [ ] Update documentation and environment examples.
- [ ] Demonstrate the completed user path from a clean account.
- [ ] Move incomplete work forward explicitly.

---

## Sprint 0 — Product baseline and delivery guardrails

### Goal

Turn the agreed architecture into actionable release boundaries and establish a repeatable development workflow.

### Product and policy checklist

- [ ] Define the first beta cohort and target size: begin with 5 internal testers, then expand to 15–30.
- [ ] Decide whether all beta testers must be adults. If minors are allowed, stop and design parental consent and child-safety requirements before invitations.
- [ ] Choose the beta login method. Recommended initial choice: email magic link or email one-time password.
- [ ] Define the minimum profile fields: display name, optional avatar, optional location, and short bio.
- [ ] Write concise Community Guidelines centered on sincere, uplifting, non-confrontational participation.
- [ ] Write a plain-language beta privacy notice covering Soul Questions, moderation, matching, storage, and deletion.
- [ ] Define what testers should do when they encounter harmful content or feel unsafe.
- [ ] Establish the initial moderation decision categories and reason codes.
- [ ] Define beta success indicators:
  - invited users who complete onboarding;
  - users who create at least one post;
  - users who create a Soul Question;
  - recommendations opened;
  - anonymous helpful confirmations;
  - moderation false positives and false negatives;
  - critical bugs and privacy incidents.

### Engineering workflow checklist

- [ ] Add a CI workflow that installs dependencies, type-checks, tests, and builds every pull request.
- [ ] Add pull-request and issue templates if more than one contributor will work in the repository.
- [ ] Define issue labels such as `privacy`, `security`, `bug`, `beta-blocker`, `mobile`, `backend`, and `frontend`.
- [ ] Choose staging and production hosting for the web client and Fastify API.
- [ ] Create separate Supabase staging and production projects.
- [ ] Document environment names and secret ownership without recording secret values.
- [ ] Decide how production migrations are applied and who can apply them.
- [ ] Add architecture decision records for Supabase, the modular monolith, and mobile-first web as the first beta client.

### Exit criteria

- [ ] Beta scope and deferred scope are accepted.
- [ ] Community, privacy, and moderation drafts exist.
- [ ] CI passes on the current skeleton.
- [ ] Staging and production ownership decisions are documented.

---

## Sprint 1 — Shared contracts, database, and authorization foundation

### Goal

Replace the in-memory persistence seam with a secure Supabase-backed foundation and establish contracts reusable by web and future mobile clients.

### Shared contracts

- [ ] Add a `packages/contracts/` pnpm workspace.
- [ ] Add Zod schemas for identifiers, timestamps, pagination, errors, profiles, Spaces, posts, Soul Questions, and helpful confirmations.
- [ ] Infer TypeScript types from schemas instead of duplicating frontend and backend interfaces.
- [ ] Define a consistent success and error envelope.
- [ ] Add contract tests for valid and invalid payloads.

### Database and migrations

- [ ] Add Supabase CLI configuration and a committed migrations directory.
- [ ] Create migrations for:
  - `profiles`;
  - `spaces`;
  - `space_members`;
  - `posts`;
  - `post_media`;
  - `soul_questions`;
  - `post_question_matches`;
  - `helpful_marks`;
  - `moderation_reviews`;
  - `notifications`;
  - `outbox_events`.
- [ ] Represent Global as a seeded public Space.
- [ ] Add foreign keys, uniqueness constraints, state checks, and UTC timestamps.
- [ ] Add indexes for membership checks, feed ordering, post state, owner lookups, and queued events.
- [ ] Add updated-at behavior only where the application uses it.
- [ ] Add deterministic local seed data without real personal questions or production content.

### Security policies

- [ ] Enable Row Level Security on every user-data table.
- [ ] Allow users to read and update only their own profile data where appropriate.
- [ ] Allow public reads only for approved Global posts.
- [ ] Allow Space reads only for active members.
- [ ] Allow owners to manage their own Soul Questions.
- [ ] Deny every other user access to Soul Questions, embeddings, inferred topics, and match records.
- [ ] Ensure helpful relationships are not directly readable by post authors.
- [ ] Add database-policy tests for owner, member, non-member, anonymous, moderator, and service identities.

### Backend integration

- [ ] Add validated Supabase configuration to the backend.
- [ ] Create separate user-scoped and privileged Supabase client factories.
- [ ] Add authentication middleware that verifies the caller and creates a request-scoped identity.
- [ ] Implement a Supabase `PostRepository` behind the existing repository contract.
- [ ] Move new endpoints to `/api/v1`.
- [ ] Preserve `/api/health` or provide a deliberate compatibility redirect.
- [ ] Ensure backend logs do not include authorization headers or request bodies containing sensitive content.

### Exit criteria

- [ ] A clean database can be created entirely from committed migrations.
- [ ] Seed data loads without manual table edits.
- [ ] The API reads approved seeded posts from Supabase.
- [ ] Automated tests prove private data and Spaces cannot be read by unauthorized users.
- [ ] No service key appears in frontend source, build output, or committed files.

---

## Sprint 2 — Mobile application shell, authentication, and profiles

### Goal

Give invited testers a complete mobile-first entry path from sign-in through profile setup.

### Navigation and design foundation

- [ ] Add client-side routing.
- [ ] Create routes for sign-in, onboarding, feed, Spaces, Soul Questions, notifications, and profile.
- [ ] Build a phone-first application shell with bottom navigation or another mobile-appropriate primary navigation pattern.
- [ ] Add desktop enhancement without changing the underlying navigation concepts.
- [ ] Define reusable colors, spacing, typography, elevation, focus, and state tokens.
- [ ] Ensure primary touch targets are at least 44 by 44 CSS pixels.
- [ ] Support safe-area padding, text zoom, portrait layouts, reduced motion, and the virtual keyboard.
- [ ] Add route-level loading, error, unauthorized, and not-found states.

### Authentication

- [ ] Configure Supabase Auth for the selected email login method.
- [ ] Implement an invite allowlist or invitation record checked during onboarding.
- [ ] Add sign-in, callback, session restoration, sign-out, and expired-link flows.
- [ ] Keep access tokens out of logs and error reporting.
- [ ] Verify redirect configuration for localhost, staging, production, and future mobile deep links.
- [ ] Add rate limiting or provider-supported abuse protection to authentication entry points.

### Profiles

- [ ] Create profile setup and edit screens.
- [ ] Validate display name, bio length, avatar metadata, and optional location.
- [ ] Add authenticated `GET /api/v1/me` and profile update endpoints.
- [ ] Display a minimal private account/settings screen.
- [ ] Add a sign-out action that is easy to find on mobile and desktop.

### Installable web experience

- [ ] Add application icons, theme metadata, and a web app manifest.
- [ ] Confirm the web app can be added to a phone home screen where supported.
- [ ] Do not cache authenticated API responses or private content in a public service-worker cache.
- [ ] Show a useful offline/network-error state without claiming unsupported offline functionality.

### Tests and acceptance

- [ ] Test invited and non-invited sign-in behavior.
- [ ] Test session expiry and sign-out.
- [ ] Test profile validation and authorization.
- [ ] Complete onboarding using mobile Safari or an iOS simulator.
- [ ] Complete onboarding using mobile Chrome or an Android emulator.
- [ ] Complete onboarding at a desktop viewport using only the keyboard.

### Exit criteria

- [ ] An invited user can sign in, complete a profile, refresh safely, and sign out.
- [ ] A non-invited user cannot finish onboarding.
- [ ] The shell works at representative phone and desktop widths.
- [ ] No private response is stored in a public browser cache.

---

## Sprint 3 — Spaces, membership, and invitations

### Goal

Allow testers to participate in Global and a small number of private communities without leaking restricted content.

### Backend

- [ ] Implement feature-first `spaces` and membership modules.
- [ ] Add endpoints to list a user's Spaces and read permitted Space details.
- [ ] Add endpoints to create a private Space, update basic details, and archive it.
- [ ] Add invite creation, acceptance, expiration, revocation, and single-use enforcement.
- [ ] Use opaque, high-entropy invitation tokens and avoid exposing membership lists publicly.
- [ ] Define initial roles: owner and member. Add moderator only if the beta workflow requires it.
- [ ] Prevent removal of the final active owner.
- [ ] Add audit records for membership and invitation changes.

### Frontend

- [ ] Build a Space switcher suitable for one-handed phone use.
- [ ] Build Global and private Space landing screens.
- [ ] Build invitation acceptance, expired invitation, and already-used invitation states.
- [ ] Build owner controls for copying, revoking, and regenerating invitations.
- [ ] Clearly label whether a Space is public or restricted.
- [ ] Avoid showing content previews before membership authorization succeeds.

### Tests and acceptance

- [ ] Prove a non-member cannot query a private Space or its posts through API or direct database access.
- [ ] Prove an expired or revoked invitation cannot be used.
- [ ] Prove a valid invitation cannot be accepted twice.
- [ ] Test invitation links from a phone email client into the web app.
- [ ] Verify membership changes take effect without requiring a new login.

### Exit criteria

- [ ] A tester can view Global, accept a private Space invitation, and switch between Space contexts.
- [ ] Private Space existence and content are not leaked to unauthorized users.
- [ ] Owners can safely manage invitations for the beta cohort.

---

## Sprint 4 — Text posts and moderation lifecycle

### Goal

Implement the complete safe publishing loop for text-based scriptural insights.

### Post creation

- [ ] Create a feature-first `posts` module.
- [ ] Add draft creation, editing, submission, viewing, and archival.
- [ ] Require a destination Space and post body; define whether a scripture reference is required or recommended.
- [ ] Add Zod validation and conservative beta length limits.
- [ ] Add idempotency support to submission so mobile retries cannot create duplicate posts.
- [ ] Record author, Space, and state transitions without trusting client-supplied ownership fields.

### Moderation

- [ ] Create a moderation provider interface so the first provider can be replaced.
- [ ] Define safe, rejected, and uncertain results with structured reason codes.
- [ ] Submit new and materially edited posts as `pending_moderation`.
- [ ] Ensure only `published` posts appear in feeds.
- [ ] Route uncertain posts to `needs_review`.
- [ ] Build a small protected moderator screen for pending human decisions.
- [ ] Record reviewer, decision, reason, policy version, provider/model version, and timestamps.
- [ ] Return supportive, non-argumentative user messages for rejected or review-pending posts.
- [ ] Add a hidden state for reports or later moderator action.
- [ ] Make moderation processing retryable and idempotent.

### Frontend

- [ ] Build a mobile composer with draft preservation during ordinary navigation.
- [ ] Show character limits and clear validation near the relevant input.
- [ ] Show submitting, awaiting moderation, needs review, published, rejected, and retry states.
- [ ] Prevent double submission from repeated taps.
- [ ] Build a user's own-post list that clearly displays moderation state.
- [ ] Confirm virtual keyboards do not hide the primary action or validation errors.

### Tests and acceptance

- [ ] Test every valid state transition and reject invalid transitions.
- [ ] Test that pending, rejected, and hidden posts never appear in public or Space feeds.
- [ ] Test resubmission and repeated moderation delivery.
- [ ] Test that a materially edited published post returns to moderation.
- [ ] Manually test safe, obviously harmful, and ambiguous examples.
- [ ] Review false positives and false negatives with the written moderation policy.

### Exit criteria

- [ ] A tester can draft and submit a text post from a phone.
- [ ] Safe posts can be approved and appear in the correct feed.
- [ ] Ambiguous posts can be reviewed manually.
- [ ] No unapproved content is visible to another user.

---

## Sprint 5 — Image posts, feeds, and content reporting

### Goal

Deliver a useful mobile feed and safe image-sharing experience while accounting for bandwidth and retry behavior.

### Media pipeline

- [ ] Create private upload staging and published-media storage policies.
- [ ] Generate short-lived signed upload instructions from the backend.
- [ ] Validate file count, type, declared size, actual size, and ownership.
- [ ] Strip unnecessary metadata where practical, especially location metadata.
- [ ] Generate appropriately sized display variants and thumbnails.
- [ ] Require or strongly prompt for useful image alternative text.
- [ ] Add upload progress, cancellation, retry, and abandoned-upload cleanup.
- [ ] Do not attach staged media to a published post until moderation permits it.
- [ ] Decide how images are included in automated and human moderation.

### Feeds

- [ ] Implement cursor-paginated Global and Space feeds.
- [ ] Sort the first beta chronologically; defer opaque engagement ranking.
- [ ] Return explicit, bounded feed response contracts.
- [ ] Add loading, empty, error, end-of-feed, and retry states.
- [ ] Avoid downloading full-resolution media for feed cards.
- [ ] Preserve scroll position when opening and returning from a post.
- [ ] Add an individual post-detail screen that can be deep-linked when authorized.

### Reporting

- [ ] Add a report action with structured categories and optional notes.
- [ ] Prevent report details from being visible to the reported author.
- [ ] Route reports to the moderator view.
- [ ] Allow moderators to leave published, hide, or escalate reported content.
- [ ] Rate-limit reporting and record abuse signals without discouraging legitimate reports.

### Tests and acceptance

- [ ] Test unsupported, oversized, truncated, duplicate, and cancelled uploads.
- [ ] Test image access before and after publication.
- [ ] Test feed pagination without duplicates or missing posts.
- [ ] Test feeds after Space membership is revoked.
- [ ] Test report authorization and moderator resolution.
- [ ] Test the feed under a throttled mobile network and with images disabled or failed.

### Exit criteria

- [ ] A tester can publish an approved image post from a phone.
- [ ] Feeds remain usable on a constrained connection.
- [ ] Restricted images are inaccessible without authorization.
- [ ] A tester can report content and a moderator can resolve the report.

---

## Sprint 6 — Private Soul Questions, matching, and Scripture Hero feedback

### Goal

Implement the product's central private-help loop without exposing a user's question or identity.

### Soul Questions

- [ ] Create a feature-first `soul-questions` module.
- [ ] Add owner-only create, list, read, update, archive, and delete endpoints.
- [ ] Build a private mobile UI that repeatedly explains who can access the question and why.
- [ ] Avoid placing question text in URLs, page titles, browser notifications, analytics, or general application logs.
- [ ] Ensure API validation errors do not echo raw question text.
- [ ] Decide whether deletion removes derived embeddings and matches immediately or through a guaranteed cleanup job.
- [ ] Add an account-level action to remove all Soul Questions and derived data.

### Matching

- [ ] Create a matching service interface independent of a specific embedding provider.
- [ ] Complete a privacy and retention review before sending question text to any external AI provider.
- [ ] Enable the selected Postgres vector capability through a migration.
- [ ] Generate embeddings only in a privileged backend or Edge Function context.
- [ ] Store embeddings and match records behind owner-only RLS and service access.
- [ ] Match only against approved posts the question owner is authorized to read.
- [ ] Combine semantic similarity with simple safety and recency constraints.
- [ ] Establish a conservative threshold and a maximum recommendation count.
- [ ] Provide a neutral recommendation explanation that does not reveal inferred sensitive labels.
- [ ] Make embedding and matching jobs idempotent and safe to retry.
- [ ] Recompute or invalidate matches when questions change, posts are hidden, or Space membership changes.

### Anonymous helpful confirmation

- [ ] Add a one-per-user-per-post helpful confirmation.
- [ ] Allow a recommendation recipient to say that a post helped without sending a message to the author.
- [ ] Store the internal relationship for deduplication and abuse prevention.
- [ ] Expose only an anonymous aggregate count and generic notification to the post author.
- [ ] Ensure author-facing responses exclude helper identity, Soul Question ID, text, embedding, inferred topic, match score, and explanation.
- [ ] Consider delaying or grouping low-volume notifications if timing could reveal who submitted the confirmation.
- [ ] Add an undo window or explicit confirmation to prevent accidental taps.

### Privacy tests

- [ ] Prove another ordinary user cannot access a Soul Question by guessing its ID.
- [ ] Prove a Space owner or moderator cannot read member Soul Questions.
- [ ] Prove a post author cannot infer the helper or question from API responses.
- [ ] Inspect logs, traces, analytics, database events, and notification payloads for raw question leakage.
- [ ] Test deletion and verify question text, embeddings, and matches are removed as promised.
- [ ] Test recommendation authorization after Space membership changes.

### Exit criteria

- [ ] A tester can privately create a Soul Question and receive relevant approved recommendations.
- [ ] A tester can anonymously confirm that a post helped.
- [ ] The author sees only an anonymous notification and aggregate count.
- [ ] Privacy and authorization tests pass across API and RLS boundaries.

---

## Sprint 7 — Beta operations, deployment, and release candidate

### Goal

Make the application safe and operable outside the developer's machine.

### Environments and deployment

- [ ] Deploy the web client, Fastify API, and Supabase resources to staging.
- [ ] Configure production separately with distinct credentials and data.
- [ ] Require HTTPS and configure allowed origins narrowly.
- [ ] Automate or document repeatable frontend and backend deployments.
- [ ] Run migrations as an explicit deployment step with failure handling.
- [ ] Define a rollback procedure for application code and forward-fix procedure for migrations.
- [ ] Configure a custom domain or stable beta URL.
- [ ] Verify authentication and invitation redirects on every deployed origin.

### Reliability and security

- [ ] Add structured error reporting with Soul Question and authorization redaction.
- [ ] Add health and readiness checks that do not expose secrets.
- [ ] Add rate limits for authentication-adjacent endpoints, posting, invitations, reports, and helpful confirmations.
- [ ] Add request-size and upload-size limits.
- [ ] Review dependency and secret scanning results.
- [ ] Confirm database backups and perform one test restore into a non-production environment.
- [ ] Add an emergency method to disable posting or matching without taking down account access.
- [ ] Document how to rotate every production secret.
- [ ] Verify that production service credentials are restricted to the minimum required systems.

### User controls and support

- [ ] Publish Community Guidelines and the beta privacy notice inside the app.
- [ ] Add a simple feedback and bug-report entry point.
- [ ] Capture app version, browser, device class, and route with feedback, but never private content.
- [ ] Add account sign-out and account-deletion request paths.
- [ ] Define a response process for privacy, safety, and account-access issues.
- [ ] Create a short tester guide explaining beta expectations and how to report problems.

### Release-candidate testing

- [ ] Run the complete automated suite against the release candidate.
- [ ] Test production builds rather than only development servers.
- [ ] Complete end-to-end journeys for two users in Global and one private Space.
- [ ] Complete the Soul Question journey and inspect every author-facing response.
- [ ] Test invitation links from real phone email applications.
- [ ] Test mobile Safari, mobile Chrome, and one desktop browser.
- [ ] Test slow network, interrupted upload, expired session, duplicate submission, and backend restart behavior.
- [ ] Check keyboard navigation, screen-reader names, color contrast, focus visibility, and text zoom.
- [ ] Confirm no seeded, test, or real Soul Question appears in logs or analytics.

### Exit criteria

- [ ] Staging has passed release-candidate testing.
- [ ] Production can be deployed and rolled back through a documented process.
- [ ] No open critical security, privacy, authorization, or data-loss defects remain.
- [ ] The first five testers have accounts and clear support instructions.

---

## Sprint 8 — Friends-and-family beta and stabilization

### Goal

Release gradually, observe real behavior, fix the most important problems, and learn whether the core help loop is valuable.

### Rollout stages

#### Stage A: five trusted testers

- [ ] Invite five testers across at least two households or friend groups.
- [ ] Create one private Space and ask testers to use Global as well.
- [ ] Ask each tester to complete onboarding, post once, create a private Soul Question, open a recommendation, and report feedback.
- [ ] Hold a short interview after their first session.
- [ ] Observe confusion without explaining the interface immediately; record where help was needed.
- [ ] Resolve all critical and high-severity defects before expanding.

#### Stage B: 15 testers

- [ ] Expand after Stage A data and privacy checks remain clean.
- [ ] Include different phone sizes, operating systems, ages, technical comfort levels, and religious backgrounds where practical.
- [ ] Ask testers to use the app naturally for at least one week.
- [ ] Review moderation decisions and reports daily.
- [ ] Review failed jobs, API errors, invitation failures, and upload failures daily.
- [ ] Conduct brief interviews focused on trust, usefulness, and emotional safety.

#### Stage C: up to 30 testers

- [ ] Expand only after the first 15 testers can use the main flows without direct developer help.
- [ ] Monitor load, database growth, storage growth, and moderation volume.
- [ ] Test whether invitations and private Spaces remain understandable without guided setup.
- [ ] Keep public registration disabled.

### Bug triage

Use these severities:

- **Critical:** Soul Question or private Space exposure, authentication bypass, service credential exposure, irreversible data loss, or harmful unmoderated content published. Disable the affected feature if necessary and address immediately.
- **High:** Core flow unavailable, repeated data corruption, incorrect authorization without confirmed exposure, broken moderation queue, or widespread sign-in failure. Fix before expanding the cohort.
- **Medium:** A major workflow has a workaround, important mobile layout failure, unreliable upload, or confusing state that causes user mistakes. Schedule in the active or next stabilization sprint.
- **Low:** Cosmetic defects, copy improvements, minor accessibility issues without blocked access, or low-impact enhancements. Prioritize after higher-severity work.

For every reported defect:

- [ ] Record reproducible steps, expected behavior, actual behavior, environment, and app version.
- [ ] Remove or redact private user content from screenshots and logs.
- [ ] Assign severity and affected domain.
- [ ] Add a regression test when technically practical.
- [ ] Verify the fix at mobile and desktop sizes when UI is affected.
- [ ] Tell the reporter when a meaningful fix is available.

### Weekly beta review

- [ ] Count successful invitations and completed onboarding sessions.
- [ ] Review feed, post, Space, matching, and helpful-confirmation usage.
- [ ] Review moderation false positives, false negatives, and uncertain cases.
- [ ] Review reports and user-safety feedback.
- [ ] Review privacy-sensitive logs and access patterns.
- [ ] Review error rates, failed background jobs, and slow endpoints.
- [ ] Summarize the three most important user problems.
- [ ] Select the next week's fixes based on severity and core-loop impact, not raw engagement.

### Exit criteria

The small-scale beta is considered stable when:

- [ ] 15–30 invited testers have had a reasonable opportunity to use it.
- [ ] At least 80% of invited testers can complete onboarding without developer intervention.
- [ ] Testers can publish, join a Space, create a Soul Question, and act on a recommendation from a phone.
- [ ] No known critical privacy, security, authorization, moderation, or data-loss bug remains.
- [ ] Moderation and report queues can be handled by the available human reviewer.
- [ ] Error and failed-job rates are understood and operationally manageable.
- [ ] Testers understand that Soul Questions are private and trust the explanation of matching.
- [ ] Feedback indicates whether recommendations are genuinely useful, not merely clicked.
- [ ] A prioritized post-beta backlog has been created from observed behavior.

---

## Suggested post-beta decision point

After stabilization, review evidence before adding more features. Decide whether to:

1. Improve trust, moderation, and matching quality.
2. Improve onboarding, Spaces, posting, or media reliability.
3. Begin the dedicated mobile client and select its framework through an architecture decision.
4. Expand the beta cohort cautiously.
5. Stop or redesign a feature that does not produce safe, genuine help.

Do not begin native packaging solely because the web beta exists. Begin it when core workflows are stable enough that the team is not duplicating rapidly changing UI and domain behavior across clients.

## First actions from the current repository state

These are the next concrete tasks to start Sprint 0 and Sprint 1:

- [ ] Create the initial beta scope and policy documents.
- [ ] Add CI for `pnpm typecheck`, `pnpm test`, and `pnpm build`.
- [ ] Create Supabase staging and production projects.
- [ ] Add the Supabase CLI and migration structure.
- [ ] Add `packages/contracts/` with the first Zod API contracts.
- [ ] Design and review the initial SQL schema and RLS matrix before implementing UI features.
- [ ] Replace duplicate post types with shared inferred contract types.
- [ ] Replace the in-memory repository with a Supabase implementation.
- [ ] Add authenticated `/api/v1` foundations.
- [ ] Begin mobile-first routing and authentication only after the data-access boundaries are tested.
