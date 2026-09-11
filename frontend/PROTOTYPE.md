# Three-screen UX prototype

Start from the repository root with `pnpm --filter @scripture-hero/frontend dev`. Open the frontend URL. The existing backend is not needed for this assignment.

## Walkthrough

1. Welcome (`#welcome`): “Learn through connection” is the dominant affordance. “Find your community” opens Home.
2. Home (`#home`): read fictional global insights, play the nature video, toggle likes, add local comments, and copy an insight to share it. “Add to helplist” opens a private Soul Question selector. “Your helplist” shows saved posts. Repeated saves do not duplicate them.
3. Scripture Heroes (`#heroes`): saved authors appear in “Your Scripture Heroes.” “Send a little thanks” simulates an anonymous note. “People you’ve helped” shows anonymous aggregate impact and separate fictional members who opted in to share appreciation and receive replies.

The logo and Welcome navigation return to screen 1. Browser back/forward work. Phone layouts use bottom navigation. Secondary actions use dialogs within these three screens, not additional routes.

Everything is test data. Interaction state is held in memory and resets on reload. Messages are never sent; drafted posts remain pending review. No Soul Question or matching data is written to storage or added to share text or URLs. These client-only fixtures are not a production privacy or authorization boundary.

## Assets

- `public/images/community.webp`: original image generated with the built-in ImageGen tool for this assignment, converted to WebP for delivery (1200 × 800, about 144 KiB). It depicts fictional people and is not a testimonial from real members.
- `public/media/quiet-moments.mp4`: MDN's flower sample, downloaded from <https://developer.mozilla.org/shared-assets/videos/flower.mp4>, used as a short silent nature clip for the fictional video post. Source example: <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/video>. The original asset is distributed in MDN's `media/cc0-videos` collection: <https://github.com/mdn/interactive-examples/tree/main/live-examples/media/cc0-videos>.
- Theme: light-blue primary buttons, highlights, navigation, and impact cards, with darker blue text for readable contrast.
- Fonts: DM Sans throughout, with system sans-serif fallbacks. Fonts are the only external page resources; photo and video are served locally.
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
