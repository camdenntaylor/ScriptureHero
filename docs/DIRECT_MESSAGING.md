# Direct messaging screen prototype

Branch: `direct-messaging-screens`, based on `main` at `965ee5d`.

This branch adds a reviewable messaging experience using fictional contacts and
the existing Golden hour design system. The team chose screens first and an
explicit choice between anonymous thanks and named chat. It does not deliver
messages to real users or modify the backend or database.

## Try it

Use Node 22 or newer and the pnpm version specified in the root `package.json`.
From the repository root:

```sh
pnpm install --frozen-lockfile
pnpm --filter @scripture-hero/frontend dev
```

Sign in through the existing account flow, then open Messages or
`http://localhost:5173/#messages`. The tab and notification bell appear only when
signed in. Direct links to Messages, chats, and Notifications require sign-in too.
Each signed-in account gets a fresh copy of the fictional chats automatically;
there is no messaging database setup. Existing Auth/profile services still need
their normal frontend/backend Supabase configuration.

1. Open Marcus’s thank-you in Notifications. The same note appears in his chat;
   its unread status clears in the inbox and notification center.
2. Reply in the chat. Empty messages are disabled; messages are limited to 500
   characters and displayed as plain text. A sent message clears only that draft.
3. Choose “Send a little thanks.” Anonymous is selected by default. Choose named
   chat explicitly to place the thank-you in the existing named conversation.
   Both choices also appear in the notification center as sent confirmations.
4. Send anonymous thanks to the same person. These notes have a separate history
   and cannot receive replies. Receiving anonymous thanks reveals no sender name
   or profile, and offers no reply action.
5. Start a new message, search fictional contacts, and draft a hello. Navigate
   away and return: each chat retains its own draft until reload or account change.
6. Filter Unread and mark all notifications read. Entries remain accessible in All.
7. Verify Heroes → People you’ve helped → Send a message opens the named chat;
   Heroes → Your Scripture Heroes → Send a little thanks opens the privacy choice.

## Implementation boundaries

- `models/messaging.ts` owns immutable conversation, validation, deduplication,
  draft, and unread rules. `controllers/useMessagingController.ts` owns UI state
  and navigation. `services/prototypeMessages.ts` supplies fictional fixtures.
- Notifications derive from the same message records as conversations, so a note
  is not copied or deleted when opened. They contain no message-body preview.
- One named conversation per fictional contact; anonymous sent histories are
  separate. Anonymous received histories contain no sender identity.
- Message defaults never include a Soul Question, question label, saved-post
  details, or match explanation. Named contacts come from public fictional
  profiles and opted-in appreciation fixtures, never from private helpful marks.
- State and drafts stay in memory; nothing is added to URLs, browser storage,
  analytics, or network requests. Reload and account transitions reset the preview.
- Signed-out visitors have no mock chat state or contacts. Account verification
  shows a loading state before any messaging content. Switching accounts starts
  fresh mock conversations instead of carrying another account's notes or drafts.
- The privacy and notification preference screens still simulate settings;
  they do not establish messaging permissions or deliver push/email notifications.
- `#chat` holds no person or conversation ID. Reloading it asks the visitor to
  select a conversation; it is not a persistent deep link.

## Verification

```sh
pnpm typecheck
pnpm test
pnpm build
```

Regression tests cover named thank-you linking, anonymous separation and denied
replies, unread synchronization, draft isolation, duplicate/invalid writes, and
exclusion of private context. Check the inbox, chat, thank-you dialog, and
notifications at phone and desktop sizes in both Day and Evening modes. Check
keyboard focus, long text, no-results search, unread-empty state, and reload.

Completed for the initial screen prototype: type checking, all 48 tests (13 frontend and 35
backend), and production builds passed. Browser verification covered 375 × 812
and 1366 × 900 layouts in Day and Evening modes, plus a 320-pixel long-message
check with no horizontal overflow. Sending, both thank-you choices, notification
links, draft preservation, no-results search, unread-empty state, and reload
recovery were exercised. Live two-account delivery remains outside this prototype.

The signed-in-only follow-up passed type checking, production builds, and all 61
tests (26 frontend and 35 backend). Local browser checks with intercepted mock
Auth/profile responses verified signed-out navigation and direct-link gating,
sign-in, seeded chats, sending, sign-out, and switching to a fresh second account
at 375 × 812 and 1366 × 900 in both themes. No real accounts were created and no
messages were delivered. To manually review, confirm Messages is absent while
signed out, then sign in and check that the default chats appear.

## Connecting real accounts later

The existing `/api/v1/conversations` endpoints and participant-only RLS policies
are described in `backend/API_V1.md`. They currently support named conversations
per saved post, not anonymous notes or one thread per pair of people. Before
wiring these screens, agree on the conversation model and shared Zod contracts,
then implement persisted anonymous thanks, unread state, notifications, and
idempotent sends with committed migrations and allowed/denied identity tests.
Keep anonymous notes separate from contracts that expose `senderId` and use
backend authorization for message permissions. Do not treat these fixtures or UI
restrictions as an authorization boundary.

## Review with your collaborator

The feature branch keeps `main` unchanged. Review its diff, then share the branch
and open a pull request when ready. Ask your brother to try the flows above before
merging. A local commit is a checkpoint; pushing shares the branch; merging is the
separate action that changes `main`. Publishing the feature branch shares it for review; a pull request merge integrates it into `main`.

## Main integration

The feature branch incorporates `main` at `78b5623`, including the expanded
public profile, post detail/report, information, and account settings screens.
Messages retains the working inbox/conversation flow; Appearance retains saved
device preferences. Shared controller and route conflicts were resolved to keep
both sets of features, and incoming profile spacers use the verified CSS gaps.
Signed-in members can reach the information pages from the community footer,
whose back links return Home; visitors retain Welcome's information links.

Verification after integration: type checking, all 80 tests (45 frontend and 35
backend), and production builds passed with pinned pnpm 11.19.0. The build has a
non-blocking warning for its roughly 510 kB main JavaScript bundle. Isolated
browser checks at 375 × 812 and 1366 × 900 covered the incoming routes, feed →
public profile → post detail → report, Heroes → chat, named/anonymous thanks and
notification links, settings spacing, and saved appearance in both themes.
