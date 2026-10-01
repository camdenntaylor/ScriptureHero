# Monday database contract

The migration in `migrations/` is the source of truth for the October 5 prototype. It assumes a new Supabase project. Do not paste schema changes into the dashboard without also adding a migration.

## Tables

| Table | Monday use | Who may read through RLS |
| --- | --- | --- |
| `profiles` | Public display name and optional bio; created after Auth signup | Everyone |
| `spaces` | One seeded Global Space | Everyone sees Global |
| `posts` | Text posts, initially published in Global | Everyone sees published Global posts; authors see their own other states |
| `soul_questions` | Owner's private question text and optional private label | Owner only |
| `saved_posts` | Private `(user_id, post_id)` saves | Saver only |
| `hero_conversations` | Saver-initiated thread with the saved post's author | The two participants only |
| `hero_messages` | Text messages in a Hero conversation | The two participants only |

The Global Space ID is `00000000-0000-4000-8000-000000000001`. All primary IDs are UUIDs. All timestamps are `timestamptz` and should be serialized as UTC ISO 8601 strings. `saved_posts` intentionally has no Soul Question reference. Starting a conversation is the only action here that reveals a saver to the post author.

The initial post default is `published` so the Monday prototype can show a submitted post immediately. Before a broader release, change the write path to `pending_moderation` and implement approval, resubmission, and review. `posts.status` already supports the planned lifecycle, but that lifecycle is not enforced yet.

## Backend integration

The browser should use Supabase only for Auth. Application reads and writes go through `/api/v1` on the Fastify backend. Pass the user's access token to the backend; verify it there and authorize each operation. Keep any Supabase secret or service-role key server-only. A service-role client bypasses RLS, so backend authorization remains essential. Return explicit response objects: never serialize full table rows or attach Soul Questions to author-facing, feed, save, or message responses.

Suggested bounded queries:

- Global feed: `posts` where `space_id` is Global and `status = 'published'`, ordered by `(created_at desc, id desc)` with cursor pagination; join only public profile fields.
- Own profile: `profiles` plus that user's posts and separate, authenticated Soul Question calls.
- Saved posts: `saved_posts` for the caller, joined to currently published posts and public author profiles.
- Hero list: distinct authors from the caller's saves; opening a thread creates or finds `hero_conversations` for a saved post. Do not notify an author merely because a post was saved.
- Thread: confirm the caller is `initiator_id` or `hero_id`; paginate `hero_messages` by `(created_at, id)`.

Use `question_text` only in owner-facing API contracts. Keep it out of logs, URLs, analytics, notifications, and message defaults.

## Apply and verify

From the repository root, with the [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started) installed and the intended project selected:

```text
supabase link --project-ref wxqaatvbtasjnsyqxnev
supabase db push --dry-run
supabase db push
```

If the remote project already has application tables, inspect and baseline it before pushing. Do not reset the remote project. For local database tests, start Docker and run:

```text
supabase start
supabase db reset
supabase test db
```

The pgTAP test verifies visitor, owner, author, and outsider access to private tables. Configure email/password and Google Auth plus the appropriate web and future mobile redirect URLs in the Supabase Auth dashboard; database migrations do not configure Google OAuth credentials.
The CLI uses a Docker image for `supabase test db`, including `--linked`; start Docker Desktop before running it.

For this hosted project, Email is enabled and email confirmation is required. The hosted Auth Site URL and one allowed redirect URL are both `http://localhost:5173`. Add any deployed callback URL before testing sign-in away from local development. Google is currently disabled; it needs a Google OAuth client ID and secret in the Supabase provider settings. Do not commit those credentials.
