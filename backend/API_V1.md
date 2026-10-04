# Backend `/api/v1` — Global posts, saves, and Hero messages

Handoff notes for people and coding agents building on this branch (`feature/feed-api-persistence`). This is the Friend 2 slice of `SMALL_SCALE_PLAN.md`: the Global text-post and feed API, plus saves and one-to-one messages. Read `AGENTS.md` first; this file only describes what was added.

## Status

| Area | State |
| --- | --- |
| Routes, controllers, services, Zod validation, error envelope, cursor pagination | Done and tested (`src/api-v1.test.ts`) |
| In-memory repositories (run locally and in tests) | Done |
| Supabase-backed repositories (`supabase.repository.ts` in each module) | Written and type-checked, **not yet run against the live project**. Used only when all three `SUPABASE_*` variables are set. |
| Supabase access-token verification (`shared/supabase-authenticator.ts`) | Written and unit-tested with a fake client, **not yet run against live Auth**. |
| Frontend calls to these endpoints | **Not built.** The frontend still uses fixtures. |
| Message-send idempotency key | Skipped; needs a migration. |

## Endpoints

All JSON. Lists return `{ data: [...], nextCursor: string | null }`. Single items return `{ data: {...} }`. Auth is `Authorization: Bearer <Supabase access token>`.

| Method and path | Auth | Notes |
| --- | --- | --- |
| `GET /api/v1/posts?limit&cursor&authorId` | Public | Published Global posts, newest first. `authorId` filters for a profile page. |
| `POST /api/v1/posts` | Yes | Body `{ body, title?, scriptureReference? }`. Returns 201. Publishes immediately (prototype exception). The author is always the caller. |
| `GET /api/v1/saved-posts?limit&cursor` | Yes | The caller's saves, newest save first. Items are `{ post, savedAt }`. |
| `PUT /api/v1/saved-posts/:postId` | Yes | Idempotent; 404 if the post is not a published Global post. |
| `DELETE /api/v1/saved-posts/:postId` | Yes | 204, also when nothing was saved. |
| `GET /api/v1/heroes?limit&cursor` | Yes | Authors of the caller's saved posts (never the caller). Items: `{ hero, lastSavedAt, savedPostCount, latestSavedPost: { id, title, scriptureReference, conversationId } }`. |
| `POST /api/v1/conversations` | Yes | Body `{ postId }`. The post must be saved by the caller and not their own. 201 when created, 200 when it already existed. |
| `GET /api/v1/conversations?limit&cursor` | Yes | Threads the caller is in. Items: `{ id, originPostId, role: 'initiator' \| 'hero', with: { id, displayName }, createdAt }`. |
| `GET /api/v1/conversations/:id/messages?limit&cursor` | Participant | Oldest first. |
| `POST /api/v1/conversations/:id/messages` | Participant | Body `{ body }` (1–4000 chars). Returns 201. |

Response shapes:

```text
Post:    { id, author: { id, displayName }, title | null, body, scriptureReference | null, createdAt }
Message: { id, conversationId, senderId, body, createdAt }
```

Pagination: `limit` is 1–50 (default 20). `cursor` is opaque; pass back `nextCursor` unchanged. Lists are keyed by `(createdAt, id)`.

Errors: `{ error: { code, message, issues? } }`. Codes in use: `unauthenticated` (401), `validation_error` and `invalid_cursor` and `cannot_message_self` (400), `save_required` (403), `not_found` (404), `profile_required` (409), `internal_error` (500).

## Privacy rules these routes enforce

- No Soul Question data exists anywhere in this slice. Keep it that way: never add it to a post, save, hero, conversation, or message response.
- Saving a post tells nobody. The author sees nothing until the saver starts a conversation and writes a message.
- A conversation is the only thing that reveals the saver to the author. A message contains only what its sender typed.
- Non-participants get a 404 (not 403) on someone else's thread, so IDs reveal nothing.
- Responses are built by explicit mapper functions in each `controller.ts`. Do not serialize repository rows directly.
- Request bodies are never logged or echoed in errors.

## Layout

```text
src/dependencies.ts              AppDependencies + createInMemoryDependencies()
src/application.ts               configureApp(app, config, dependencies?) — shared by server.ts and the Vercel entry (app.ts)
src/api-v1.ts                    registers this slice under /api/v1 (account routes in modules/profiles share the prefix)
src/shared/request-context.ts    per-request access token so Supabase calls run as the caller (RLS applies)
src/shared/auth.ts               Authenticator interface, requireUser hook, currentUser()
src/shared/errors.ts             AppError, notFound(), error-envelope handler
src/shared/pagination.ts         Cursor encode/decode, toPage(), sliceCursorPage() (in-memory keyset)
src/shared/in-memory-database.ts Stand-in tables shared by the in-memory repositories
src/shared/dev-mode.ts           Seeded users + dev-only sign-in used by `pnpm dev`
src/modules/posts/               model, repository, schemas, service, controller, routes
src/modules/saved-posts/         same layout
src/modules/heroes/              same layout (heroes list, conversations, messages)
```

Each module's `model.ts` holds the repository interface. Repositories return up to `limit + 1` rows; the service trims the extra row and builds `nextCursor`.

## Next steps

1. **Run against Supabase.** Put `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` in `backend/.env` (git-ignored; `server.ts` loads it). No secret key is needed. Then verify the Supabase repositories with two real users: the same scenarios as `src/api-v1.test.ts`, including the denied-identity cases. Queries most worth checking: the `posts!inner(...)` embedded filters in `saved-posts` and `heroes`, and keyset cursors on microsecond timestamps.
2. **Confirm the database schema.** The live project's latest migration was `profile_photos`, which is not in `supabase/migrations/` on `main`. Make sure `monday_prototype` is applied and that migration is committed before relying on the tables.
3. **Frontend.** Replace the fixtures in `frontend/src/services/prototypeData.ts` with calls to these endpoints through `frontend/src/services/api.ts` (base `/api/v1`). Send the Supabase access token, and use Supabase directly only for sign-in.
4. **Production hardening later:** moderation (posts publish immediately today), message idempotency keys, and bounding the Heroes query beyond the latest 500 saves.

## Configuration

`src/config/env.ts` validates everything once. This slice needs only `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`, the same two the account routes use. No secret key is used anywhere.

**How database access works.** `requireUser` verifies the bearer token with Supabase Auth, then stores it in a per-request context. `RequestClientSource` builds a Supabase client from the publishable key plus that token, so every query runs as the signed-in user and Postgres row level security applies (public routes run as `anon`). The services still authorize every action; RLS is defense in depth. Do not introduce a service-role client without an explicit decision, because it would bypass RLS.

**Without Supabase settings:** `pnpm dev` falls back to seeded in-memory data and a development-only sign-in (`shared/dev-mode.ts`). Deployed environments never do; without Supabase these routes reject every request.

## Run it

```bash
pnpm install
pnpm dev                         # backend on :3000 with seeded in-memory data
pnpm typecheck && pnpm test && pnpm build
```

Local sign-in (development only): `Authorization: Bearer dev:11111111-1111-4111-8111-111111111111` (Amara) or `dev:22222222-2222-4222-8222-222222222222` (Mateo). The seeded post IDs are `33333333-3333-4333-8333-333333333333` and `44444444-4444-4444-8444-444444444444`.
