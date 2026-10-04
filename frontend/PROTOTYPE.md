# Scripture Hero UX prototype

Start from the repository root with `pnpm --filter @scripture-hero/frontend dev`. Open the frontend URL. The existing backend is not needed for this assignment.

## Walkthrough

1. Welcome (`#welcome`): “Learn through connection” is the dominant affordance. “Find your community” opens Home.
2. Home (`#home`): read fictional global insights, play the nature video, toggle likes, add local comments, and copy an insight to share it. “Add to helplist” opens a private Soul Question selector. “Your helplist” shows saved posts. Repeated saves do not duplicate them.
3. Scripture Heroes (`#heroes`): saved authors appear in “Your Scripture Heroes.” “Send a little thanks” simulates an anonymous note. “People you’ve helped” shows anonymous aggregate impact and separate fictional members who opted in to share appreciation and receive replies.
4. Login (`#login`): sign in or create an account with Supabase email/password Auth. Welcome and Home link here.
5. Profile (`#profile`): edit the signed-in user's display name, location, and bio, and upload a profile photo to Supabase Storage. Signed-in users can reach it from the header and navigation.
6. Soul Questions (`#questions`): open this private screen from Profile to record or remove questions through the backend API. Questions do not appear on the profile or in the feed.

The logo and Welcome navigation return to screen 1. Browser back/forward work. Phone layouts use bottom navigation. The private screens require a verified Supabase session.

The feed, likes, comments, saved-post helplist, Heroes, messages, and drafted posts remain prototype fixtures and in-memory interactions. Login, profile edits, photo uploads, and Soul Questions use Supabase and `/api/v1` backend endpoints. The backend verifies the Auth token on every account request and uses that user's token with Row Level Security. Raw Soul Questions are returned only through the owner-scoped endpoint, never in profile or public responses. Local development needs `frontend/.env` and `backend/.env` with the project URL and publishable key; the key can be found in Supabase Dashboard → Settings → API Keys. Do not use a secret or service-role key in the frontend.

## Assets

- `public/images/community.webp`: original image generated with the built-in ImageGen tool for this assignment, converted to WebP for delivery (1200 × 800, about 144 KiB). It depicts fictional people and is not a testimonial from real members.
- `public/media/quiet-moments.mp4`: MDN's flower sample, downloaded from <https://developer.mozilla.org/shared-assets/videos/flower.mp4>, used as a short silent nature clip for the fictional video post. Source example: <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/video>. The original asset is distributed in MDN's `media/cc0-videos` collection: <https://github.com/mdn/interactive-examples/tree/main/live-examples/media/cc0-videos>.
- Theme: Golden hour (see `../DESIGN_SYSTEM.md`). Day uses cream paper and brown ink; Evening uses neutral-gray backgrounds and cards with off-white text. Olive-green actions and honey scripture and privacy accents remain in both modes.
- Fonts: Nunito throughout, with system sans-serif fallbacks. Fonts are the only external page resources; photo and video are served locally.
- Logo and interface icons: repository-native outlined SVG. The logo depicts two people reaching toward one another with a shared heart shape.

### ImageGen prompt

```text
Use case: photorealistic-natural
Asset type: right-hand website hero photograph for a Scripture Hero UX prototype, displayed beside a large headline outside the image.
Primary request: A candid editorial photograph of four diverse adult friends, men and women of varied ages from late 20s to 60s, sitting closely around a small wooden outdoor garden table. One person warmly shares a personal story while the others listen with natural, engaged expressions. An open book and tea are on the table.
Scene/backdrop: a comfortable outdoor garden in warm late afternoon sunlight.
Style/medium: photorealistic natural editorial photography, subtle film grain, real skin texture and wrinkles, natural fabric and wooden-table grain.
Composition/framing: landscape 3:2 composition; faces in the upper central area; intimate conversational group framing, no posed camera eye contact.
Lighting/mood: warm late afternoon sun; heartfelt, comfortable community moment.
Color palette: earthy creams, terracotta, and olive.
Constraints: exactly four adult friends; natural anatomy and gestures; no text, logos, watermark, or interface. No added headline inside the image.
```
