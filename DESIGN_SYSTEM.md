# Scripture Hero — Gather-inspired design system

Status: authoritative frontend design system. Implemented in `frontend/src/views/styles.css`; original visual references are in `redesign-system/references/`. Based on the original cream-and-forest Gather mockups, adapted to Scripture Hero's existing React/Vite frontend and product rules. Color values are deliberate implementation choices, not pixel samples from the generated images.

## 1. Design intent

A quiet, editorial space for scriptural insights, testimonies of Jesus, and uplifting connection. Warm ivory, deep forest green, refined serif headings, clean readable interface text, natural photography, and small botanical accents. The interface should feel personal and spacious rather than decorative or competitive.

Keep the Scripture Hero name, existing logo, product vocabulary, and behavior. Gather is a visual reference, not a rebrand. People of all religions remain welcome.

Priority order: readable content, clear audience and privacy, useful actions, then decoration.

## 2. What changes from Golden hour

| Existing direction | New direction |
| --- | --- |
| Nunito everywhere | Georgia for editorial headings; retain Nunito for interface and body |
| Brown ink and olive accents | Forest ink and deeper forest action green |
| Honey as the dominant reflective color | Restrained pale honey for scripture and private areas; clay for decorative warmth |
| Rounded, shadowed cards | 16px cards with fine warm borders and almost no shadow |
| Consistently soft rounded typography | Strong contrast between literary headings and practical interface text |
| Dense supporting modules | A clear feed, fewer supporting cards, more breathing room |

The serif/sans pairing is essential to matching the reference. Georgia is a practical starting choice with no added font request. Do not describe the generated mockup's font as a known exact font.

## 3. Color foundations

Map these roles onto existing custom-property names in `frontend/src/views/styles.css`; never scatter colors through view components. Evening mode uses neutral charcoal surfaces with lighter green and honey accents.

| Token | Day | Evening | Purpose |
| --- | --- | --- | --- |
| `--paper` | #FAF7F0 | #1E1F1F | Page canvas |
| `--surface` | #FFFCF7 | #272828 | Cards, inputs, dialogs |
| `--raised` | #F0EBE1 | #333535 | Hover surfaces and neutral chips |
| `--ink` | #233522 | #F2EFE7 | Headings, post text |
| `--muted` | #62675C | #BEC2B8 | Secondary text and metadata |
| `--line` | #DDD8CD | #494D48 | Decorative dividers and card outlines |
| `--accent` | #315334 | #BDD0A9 | Primary action and active state |
| `--accent-strong` | #243F28 | #D5E3C7 | Hover and emphasis |
| `--accent-soft` | #E8EBD9 | #343E31 | Selected navigation, soft buttons |
| `--accent-fill` | #D6DDBD | #43523A | Selection and subtle badges |
| `--accent-line` | #ADB89B | #829575 | Accent control boundaries |
| `--on-accent` | #FFFCF7 | #1E271B | Text on primary buttons |
| `--warm` | #87501A | #E8BB78 | Scripture references and private notes |
| `--warm-strong` | #693D16 | #F5D5A2 | Reflective headings |
| `--warm-soft` | #F8EEDC | #38332B | Scripture and Soul Question panels |
| `--warm-line` | #DDC8A5 | #897653 | Reflective panel separators |
| `--clay` (new) | #A24E30 | #ECB195 | Decorative warm labels and botanical details |
| `--control-line` (new) | #7B8174 | #9EA797 | Input boundaries when needed for identification |
| `--danger` (new) | #A12E35 | #FFB4B9 | Errors, destructive actions |
| `--danger-soft` (new) | #FBEAEB | #452D31 | Error backgrounds |

Primary button: on-accent over accent. Standard reading: ink or muted over paper/surface. Reflective reading: warm over warm-soft. Selected navigation: accent-strong over accent-soft. Decorative line is not a sufficient input boundary by itself. Use control-line for fields, or another accessible identifying treatment.

Green means action or location. Honey means scripture or private reflection. Privacy also requires a lock and explicit text; color alone never communicates privacy. Clay is decorative, never the only error or selection indicator. Keep existing avatar and media tokens unless a specific asset needs adjustment. Never invert photographs in evening mode.

## 4. Typography

| Role | Family | Mobile / desktop size | Weight / line height |
| --- | --- | --- | --- |
| Page h1 | Georgia, serif | 30 / 40px | 700 / 1.16 |
| Welcome display | Georgia, serif | 36 / 52px | 700 / 1.1 |
| Section h2 | Georgia, serif | 24 / 28px | 700 / 1.2 |
| Card heading h3 | Georgia, serif | 21 / 24px | 700 / 1.25 |
| Post and body | Nunito, sans-serif | 16 / 16px | 400–500 / 1.65 |
| Scripture | Georgia, serif, italic | 17 / 18px | 400 / 1.6 |
| Navigation and buttons | Nunito, sans-serif | 15 / 16px | 700 / 1.3 |
| Metadata | Nunito, sans-serif | 14 / 14px | 400–600 / 1.45 |
| Small labels | Nunito, sans-serif | 12 / 12px | 800 / 1.4 |

Use relative units during implementation; sizes above are at the default browser scale. Introduce `--font-display` and `--font-body`, keeping `--font-family` as a body alias while migrating. Preserve scripture italics and use a separate regular-style reference beneath the verse. Normal post prose stays sans-serif. Allow all headings to wrap; do not shrink them to fit fixed-height containers. Reading paragraphs should generally stay within 60–70 characters per line.

## 5. Spacing, shape, and elevation

Spacing scale, in px: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64. Introduce named spacing tokens and use them consistently. Typical card padding: 16 mobile, 24 desktop. Feed gap: 20 mobile, 24 desktop. Heading-to-content: 24–32.

Retain existing radius names: sm 8px, md 12px, lg 16px, xl 20px, pill 999px. Standard cards use lg; dialogs use xl; topic chips and buttons use pill. Navigation uses md for the broad softly rounded selected row in the reference.

Cards: 1px line border and no visible lift by default. Set the shared card shadow to none or a barely perceptible 0 1px 3px at 4% opacity. Elevated menus: 0 8px 24px at 12%; dialogs: 0 24px 64px at 20%. Define these centrally with neutral shadows in evening mode. Avoid colored left-border decorations on cards.

## 6. Responsive composition

Build at 375px first; verify 320px and 200% text scaling. Content height is always flexible.

| Width | Layout |
| --- | --- |
| Below 760px | Single column; 16px page gutters; existing mobile navigation; no persistent sidebar or rail |
| 760–1099px | 200px sidebar, flexible main; 24px gutters; supporting rail becomes normal-flow content |
| 1100–1399px | 216px sidebar, flexible feed, 280px right rail; 24px gaps |
| 1400px+ | Centered shell capped at 1520px; 232px sidebar, flexible feed, 320px rail; 32px gaps |

The feed must be allowed to shrink without horizontal overflow. At the narrow end of a breakpoint, reduce columns before reducing readable text. The reference's three columns are a desktop enhancement.

Desktop navigation: Scripture Hero logo, existing destinations, one clear Share an insight action. Keep existing route names and destination access rules. Mobile: preserve current destination availability and accessible overflow if needed; never squeeze all links into tiny targets. Bottom navigation and dialogs account for device safe areas and the on-screen keyboard.

Home order on a phone: heading, optional daily prompt, composer, existing filters, feed, then useful supporting discovery content. A Soul Question reminder may link to its private screen; never put raw question text into a public/discoverable card or search preview.

## 7. Component specifications

| Component / existing location | Visual and behavioral specification |
| --- | --- |
| Shell / `App.tsx`, `.side-nav`, `.mobile-nav` | Airy ivory canvas; forest logo and icons; selected row uses accent-soft plus aria-current; footer profile stays secondary |
| `.page-heading` | One visible serif h1, one short sans-serif supporting sentence. Suggested Home text: “A little connection. A deeper meaning.” |
| `.composer-prompt` | One warm compose card: profile photo or initials, smaller regular-weight Nunito “Share an insight, [first name]?” prompt, and green plus action. Uses warm-soft, warm-line, warm/strong text, and the existing keyboard-accessible compose button; no separate daily-question panel |
| `.feed-tabs` | Retain For you, Your helplist, Topics and existing filtering. Pill controls; selected state in green, with programmatic state. Wrap or horizontally scroll without hiding the current selection |
| `InsightCard.tsx`, `.insight-card` | Header with avatar, author, time, and Circle; body in ink; optional scripture or media; quiet action row. 16/24px inner padding. Separate metadata from body with 12px space |
| `.scripture-quote` | Pale honey inset; italic serif verse, reference underneath; book icon if useful. Avoid decorative quotation marks that dominate the content |
| Post actions | Preserve helpful, comment, save, report and existing semantics. Do not rename helpful to Resonate merely to match the concept. Selected state uses text plus icon/state; saving uses warm tone |
| `.questions-card`, `SoulQuestionsPage.tsx` | Lock and “Just for you. Always private.” Honey inset; no share control, audience selector, public reply, or social preview. Never confuse private questions with publishable reflections |
| `SpacesPage.tsx` | Circles discovery follows the reference: search, interest search shortcuts, a community banner, photo cards, and a “Your circles” membership/invitation rail. Explicit Public/Private labels, membership status and correct join/request actions remain visible |
| `SpaceOverviewPage.tsx` | Cover image, serif title, audience/access explanation, members and existing approved content. Private content remains gated; requested membership is not access |
| `ComposePostForm.tsx` | Required single destination, visible audience explanation, attachments and submission state. Preserve moderation: submission is pending, never an instant public post |
| `ProfilePage.tsx`, `components/ScriptureHeroes.tsx` | Profile owns the “Your words matter” dashboard and Scripture Heroes activity. Personal gratitude and meaningful impact; no competitive leaderboards. Anonymous aggregate helpful confirmations only; no recipient identity or Soul Question match detail |
| `ProfilePage.tsx`, public profiles | Serif name and quiet section headings; existing audience and post-visibility rules. Owner-only review states remain owner-only |
| Search and forms | Visible labels, control-line boundary, at least 44px target height; focus, error, hint and disabled states. Placeholders supplement labels |
| Dialog / `.prototype-modal` | Surface, 20px radius, restrained shadow; title and explicit close; focus management and keyboard dismissal; mobile fits visible viewport |
| Toast / `.toast` | Brief confirmation, accessible status announcement, dismiss control. Error messages stay near the affected action as well |

Buttons: one visually dominant primary action per local workflow; use soft/outline treatment for secondary actions. Preserve the repository's one-filled-primary-per-view convention. Minimum target 44×44px, including small-looking icon actions. Button labels are sans-serif, 15–16px, 700. Provide default, hover, focus, pressed, busy and disabled states. Busy actions preserve width, show readable progress, and prevent duplicate submission.

## 8. Imagery and icons

Natural daylight, candid people, mountain paths, gentle landscape photography, and restrained watercolor foliage. Photography supports actual content; it does not replace scripture or a useful post. Use a 16:9 feed-media container with an option to view the full asset when cropping would hide content. Circle covers can use a shallow 3:1 crop.

Use small botanical artwork in empty corners or a single daily-prompt banner, never behind reading text or on every card. Two small decorative accents per screen are usually enough. Keep the existing Scripture Hero logo; do not copy Gather's leaf logo. Use the existing outlined icons from `Icon.tsx` at their 24px grid and 1.65 stroke.

The enclosed generated images are design references, not finished image assets, actual member photographs, or accessible layouts. Do not crop their avatars or words into production components. Source or create production assets separately and provide appropriate alt text; purely decorative art has empty alt text.

## 9. Interaction, content, and accessibility

Warm, short, sincere language. Examples: “What’s on your heart?”, “Share an insight”, “This helped me”, “Saved to your helplist”, “Your insight is awaiting review.” Use a real Circle/audience name in composer guidance. No growth slogans, urgency counters, or pressure to share private experiences.

Every asynchronous view needs loading, empty, error, and success states. Skeletons mirror the final card structure without flashing. Empty feeds offer one useful next action. Errors preserve drafts and explain retry. Submitted posts show the existing pending-review state.

Use semantic landmarks, ordered headings, visible labels, native controls, an accessible skip link, and meaningful focus order. Focus ring: 3px accent, 3px offset; ensure it remains visible on both selected and normal surfaces. Do not use hue alone to distinguish selection, errors, saved state, or privacy. Support reduced motion; any small feedback transition should be 120–180ms and nonessential. Do not animate large backgrounds or auto-play media.

Validate text pairs to at least 4.5:1 and identifying controls/focus to at least 3:1 in both modes. These are palette requirements; actual overlays, opacity, photographs and component combinations must also be checked. Day/evening choice continues to use the existing appearance service and html data-theme mechanism.

## 10. Product mapping: reference versus repository

| Gather reference | Scripture Hero adaptation |
| --- | --- |
| Gather branding | Scripture Hero branding |
| Circles | Circles in the UI; existing `Space` domain and API names remain stable |
| Generic reflections | Scriptural insights / testimonies using existing posts |
| Resonate reaction | Existing helpful confirmation |
| Journal with a share selector | Do not apply to Soul Questions; private questions remain private |
| Upcoming gatherings | Omit unless an existing supported feature supplies it; use recommended Circles instead |
| Following / Discover / My circles | Existing For you / Your helplist / Topics workflows |

No new routes, gathering service, journaling feature, following model, or data schema is implied by this redesign.

## 11. Implementation sequence

1. Update the visual section of root `AGENTS.md` alongside the new design guide so it no longer requires Golden hour, only Nunito, or pills for every navigation item. Keep all product, mobile, privacy and architecture requirements.
2. Migrate tokens and typography centrally in `frontend/src/views/styles.css`, including explicit evening and system-preference blocks. Keep current aliases until their consumers are migrated.
3. Restyle shared shell, navigation, buttons, fields, cards, icons and scripture blocks. Retain existing component boundaries and controllers.
4. Restyle Home and `InsightCard` first; check mobile and desktop before extending the language to Circles and private screens.
5. Apply the same tokens to details, profiles, heroes, messages, authentication, settings, legal and moderation states. Avoid leaving old-themed pages behind.
6. Replace any temporary imagery with appropriate production assets; review image loading and small-screen performance.
7. Run existing typecheck, test and build checks, then visual checks at 375, 768, 1280 and 1440px in both modes. Also inspect 320px, 200% text, keyboard navigation, reduced motion and a slow/loading state.

Acceptance: the home screen reads as the original Gather direction at a glance—ivory canvas, forest headings/actions, editorial serif hierarchy, lightly bordered cards, calm photography—while every existing Scripture Hero flow still works.
