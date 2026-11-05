**_SCRIPTURE HERO_**

This is an app meant to facilitate conversations about Jesus throughout the world. It is deliberately non-denominational and open to anyone.

_Teaching the world about Jesus, one verse at a time._

Social media style platform that provides a space for people to share their insights and experiences with their friends, family, and others across the world.

**Platform Goal**

Scripture Hero is a mobile-first product. The primary long-term experience will be a mobile app designed for phones, with desktop and mobile web experiences also supported. Product flows, navigation, APIs, authentication, media handling, performance, and accessibility should be designed for mobile use first and enhanced for larger screens.

**Guest beta testing**

Visitors without an existing account session automatically enter a temporary guest preview with a fictional profile, private sample Soul Questions, community content, Circles, and mock conversations. Guests can use the account screens, edit their profile and photo, record questions, save insights, create and join sample Circles, and submit temporary posts. Each visit is isolated. All guest edits, drafts, photos, preferences, and conversations stay in page memory and clear on refresh or when leaving the page, including back/forward restoration. No guest account, post, media, question, or message is written to Supabase or sent to analytics. Guest post submissions remain pending moderation and never enter public results. Guest messages and invitations are simulated. Existing signed-in accounts retain their normal account flow; guests may open sign-in from Account settings, which discards guest changes.

**Soul Questions**

Each user has the option to privately record soul questions. These can be deeply theological questions, pleas for advice, or anything a user is struggling with and needs help figuring out. Soul questions are never shown on a profile or disclosed to other users. A privileged backend matching service reads them to recommend approved posts that may be helpful. Become someone else's "scripture hero" by contributing insights that help answer soul questions without learning the question, problem, or identity behind the match.

Context matching shows posts of people in similar situations as you. Recommends posts by people with similar soul questions.

\*All religions welcome
\*NOT a place for debate or criticism
\*Help gather Israel by connecting people across the world to mutually benefit them from their testimonies of Jesus
\*Learn from people you wouldn't otherwise be able to connect with

**Circles**

Navigation, discovery, membership, composer, and settings use Circle/Circles. Browser URLs are `#circles`, `#circle/<uuid>`, and `#create-circle`. Old `#spaces`, `#space/<uuid>`, and `#create-space` bookmarks resolve to the same screens and update to the current URL without reloading the page. Internal identifiers such as `Space`, `spaces`, and backend API paths remain stable. Circles discovery provides name/description search, interest search shortcuts, and a separate list of the viewer’s memberships and invitations. Public/private authorization and moderation rules below apply equally to Circles.

Users can be a member of many different circles:
-friends
-family
-ward
-city
-church congregation
-global circle

Explore searches public profile fields, Circle names, and approved posts the viewer may read. Soul Questions and their derived data are never searchable. Public Circles allow anyone to join and read approved posts. Private Circles have discoverable names and descriptions, but posts require active membership. A private join request waits for the owner to approve it. Owners may invite existing members of Scripture Hero; recipients see invitations on their Circles page and choose whether to accept. The owner manages requests and invitations from the Circle overview.

Profiles show approved posts visible to the viewer. The account owner's "Your posts" section also shows their own unpublished posts and their review state, without disclosing them to other people. Private Circle membership is still required to read a post there.

Circles are restricted to only show posts to other members in that circle, but the global circle is unrestricted

**Posts**

Posts can be text, image with text, video, or video with text. Deliberately open to allow for as much personal detail & connection as the sharer wants. Posts are immediately analyzed by an agent upon submission to restrict harmful, aggressive, confrontational posts. Only posts that are uplifting and genuine are allowed.

The composer requires one destination: Global or a Circle where the author is an active member. It names the selected Circle and explains the audience before submission. Opening the composer from a Circle preselects that Circle; the author can change it. Public Circle posts can be read by anyone after approval. Private Circle posts can be read only by active members after approval. Submissions are saved as pending moderation and appear privately under the author's posts while awaiting review. Requests and invitations do not grant posting permission, and a failed submission never falls back to another destination.

**Becoming a Scripture Hero**

The account owner's Profile contains the “Your words matter” impact dashboard, their Scripture Heroes, and community appreciation. Scripture Heroes is part of Profile rather than a separate navigation destination. Helpful confirmations remain anonymous; named appreciation is separate and opt-in.

Become a scripture hero when your post genuinely helps someone else find an answer to a question or benefits them in some other way. This is a big deal, and central to the success of the platform. Rewarding genuine sharing.
