# Scripture Hero Design System: Golden hour

Read this before you design or style any screen. All tokens and component classes live in `frontend/src/views/styles.css`. Pages compose those classes. New colors, radii, or shadows become tokens there first.

## Feel

Peaceful, warm, and inviting, like late afternoon sun on a garden table. The design should feel like a quiet conversation with a friend, not a social feed competing for attention.

- Warm paper backgrounds and deep brown ink. Never pure white or black, and never cool greys or blues.
- One calm primary color, olive green, for actions and "where you are."
- One warm secondary color, honey, for anything reflective or private: scripture, Soul Questions, privacy notes, encouragement.
- Soft, rounded shapes. Pill controls, 18–20px cards, low warm shadows.
- Generous whitespace. One heading per page and one filled primary button per view.

## Color tokens

Always use `var(--token)`. Do not write hex values in components.

| Token | Day | Evening | Use |
| --- | --- | --- | --- |
| `--paper` | `#FBF6EC` | `#1C1611` | Page background, dialogs, comment panels |
| `--surface` | `#FFFDF8` | `#251D16` | Cards, header, inputs |
| `--raised` | `#F5ECDC` | `#2D241B` | Hover fills, neutral pills, segmented tracks |
| `--ink` | `#3B2A1E` | `#F4EADC` | Headings and primary text |
| `--muted` | `#75604D` | `#BBA88F` | Body copy, meta text, inactive nav |
| `--line` | `#ECE2D0` | `#3A2F24` | Borders and dividers |
| `--accent` | `#5B6741` | `#B4BE8C` | Primary buttons, links, active icons, focus ring |
| `--accent-strong` | `#46512F` | `#CBD3A6` | Primary hover, text on `--accent-soft` |
| `--accent-fill` | `#DCE3C4` | `#3A3F27` | Count pills, selection, liked-heart fill |
| `--accent-soft` | `#EFF0E2` | `#272819` | Active nav/tab, soft buttons, impact banner |
| `--accent-line` | `#DCE0C6` | `#3A3C27` | Borders on accent-soft areas, soft hover |
| `--on-accent` | `#FBF8EE` | `#1C1611` | Text and icons on `--accent` |
| `--warm` | `#9A5C14` | `#E3AE5C` | Scripture text, private and reflective text |
| `--warm-strong` | `#7A4610` | `#F2C67F` | Headings inside warm panels |
| `--warm-soft` | `#FBF0DA` | `#30251A` | Scripture quotes, Soul Questions, encouragement panels |
| `--warm-line` | `#EFDBB2` | `#4A3A27` | Dividers inside warm panels |

Avatar pairs are `--av-clay`, `--av-sage`, `--av-gold` and `--av-lilac`, each with a matching `-ink` token. Use them through the `.avatar-*` classes.

Media uses `--media-bg` as a fallback, `--on-media` for text over photos or video, `--media-overlay` and `--overlay` for image shading, and `--media-text-shadow` for readable video text. Dialog backdrops use `--backdrop`.

### Role rules

- **Green (`--accent`)** means "do this" or "you are here." Use it for buttons, links, the active nav item and active tabs. Use at most one solid-green button per view.
- **Honey (`--warm`)** means "this is sacred or private." Use it for scripture, Soul Questions, the lock or privacy notes, items saved to your helplist, and "keep sharing" prompts. Never use honey for a primary action.
- Body text is `--muted` on `--surface` or `--paper`. Headings are `--ink`.
- Text must reach 4.5:1 contrast. Every token pair above (ink/muted on paper/surface, accent-strong on accent-soft, warm on warm-soft, on-accent on accent) passes in both modes.

### Evening mode

Evening mode follows the OS setting by default. To force a mode, set `<html data-theme="day">` or `<html data-theme="evening">`. Because every component uses tokens, nothing else needs to change. Check new screens in both modes.

## Typography

**Nunito** is the only typeface, loaded in `styles.css`. Its rounded ends give the softer voice. Do not add a second family.

| Role | Size / weight | Notes |
| --- | --- | --- |
| Display (Welcome h1) | `clamp(3.5rem, 6.1vw, 5.5rem)` / 800 | `letter-spacing: -.035em`, line-height 1.06 |
| Page heading (`.page-heading h1`) | `clamp(1.9rem, 2.9vw, 2.6rem)` / 800 | One per page |
| Post / card title | 1.4–1.5rem / 800 | `text-wrap: pretty` |
| Section heading | 1.1–1.4rem / 800 | |
| Body | 1rem / 400, line-height 1.8 | `--muted` |
| Scripture | 1rem / 500 *italic* | Always italic, always `--warm` on `--warm-soft` |
| Label / button | .88–.95rem / 700 | |
| Meta | .8rem / 400 | `--muted` |
| Eyebrow | .75rem / 800, `letter-spacing: .14em`, uppercase | `.eyebrow`, `.sidebar-label` |

Minimum text size is .75rem (12px), used only for eyebrows and counts.

## Shape and elevation

| Token | Value | Use |
| --- | --- | --- |
| `--radius-sm` | 10px | Small inner elements |
| `--radius-md` | 14px | Scripture quotes, inputs, choice rows, notes |
| `--radius-lg` | 18px | Composer, floating cards |
| `--radius-xl` | 20px | Cards, panels, dialogs |
| `--radius-pill` | 999px | Every button, tab, nav item, badge, toast |
| `--shadow` | soft warm | Cards and composer |
| `--shadow-lg` | deep warm | Dialogs and toasts only |

Cards use a 1px `--line` border plus `--shadow`. Do not add colored left-border accents.

## Components (class reference)

| Component | Classes | Notes |
| --- | --- | --- |
| Primary button | `.button .button-primary` | Solid green. One per view. |
| Soft button | `.button .button-soft` | Secondary actions such as "Send a little thanks" |
| Outline button | `.button .button-outline` | Tertiary actions, "done" states |
| Text link | `.button-link` | Inline navigation ("Meet your Scripture Heroes →") |
| Icon button | `.icon-button` | 44×44 target, round |
| Avatar | `.avatar .avatar-{clay,sage,gold,lilac}` (+ `.avatar-large`) | Initials, weight 800 |
| Side nav | `.side-nav a[aria-current]` | Pill; active uses accent-soft |
| Mobile nav | `.mobile-nav` | Bottom bar under 760px; translucent surface |
| Tabs | `.feed-tabs` / `.heroes-tabs` with `button.active` and `.count-pill` | Pill tabs; no underline |
| Composer | `.composer-prompt` + `.compose-icon` | Round green plus |
| Insight card | `.insight-card` → `.post-header`, `.post-copy`, `.scripture-quote` or `.reflection-video`, `.post-actions` | |
| Scripture quote | `.scripture-quote` (book icon, `<p>` verse, `<cite>` ref) | Honey panel, italic |
| Post actions | `.post-action`, `.save-action`, `.is-liked`, `.is-saved` | Saved state turns honey |
| Comments | `.comments-panel`, `.comment`, `.comment-form` | Pill input |
| Soul Questions | `.questions-card`, `.aside-heading`, `.question-dot`, `.privacy-note` | Honey panel. Always shows a lock. |
| Impact banner | `.impact-banner`, `.impact-stats` | Green-soft panel, large green numbers |
| Person card | `.hero-person-card`, `.hero-badge`, `.opted-in-label`, `.saved-post-summary` | |
| Encouragement | `.keep-sharing` | Honey panel with one primary button |
| Empty state | `.empty-state` | Dashed `--line` border, icon, h2, one soft/primary button |
| Dialog | `.prototype-modal`, `.question-choices`, `.field-label`, `textarea`, `.field-hint` | Native `<dialog>`; checked choice turns green |
| Toast | `.toast-region` › `.toast` | Ink pill with paper text, dismiss button |
| Pending note | `.pending-note` | Green-soft status line |

Icons come from `views/components/Icon.tsx` (24px grid, 1.65 stroke, round caps). Add new icons there in the same outlined style. Do not use emoji or filled icon sets. The logo is `views/components/Logo.tsx` and is always tinted with `--accent`.

## Building a new page

1. Start inside the existing shell (`App.tsx`): the header, the `.workspace` sidebar, and `.mobile-nav`. Add the page to the `navigation` array only if it is a top-level destination.
2. Design at 375px width first, then widen. The sidebar disappears below 760px and the bottom nav takes over.
3. Give the page exactly one `.page-heading h1` in warm, plain language ("We’re part of each other’s story.").
4. Put content in `--surface` cards on `--paper`. Use a honey (`--warm-soft`) panel for anything private or devotional, and a green-soft (`--accent-soft`) panel for impact or status.
5. Give the view one `.button-primary`. Everything else is soft, outline, or a link.
6. Every async view needs loading, empty (`.empty-state`), error, and success states.
7. Add new reusable styles to `styles.css` under a commented section, using tokens only. Prefer extending an existing class over creating a near-duplicate.
8. Check day and evening modes, keyboard focus (green ring), 44px touch targets, and reduced motion.

## Voice

Gentle, personal, and short. Speak like a kind friend: "What’s on your heart, Avery?", "Take a little light with you.", "Just for you. Always private." Avoid hype, metrics language, and exclamation marks. Never frame Soul Questions as shareable.
