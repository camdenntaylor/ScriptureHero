// One-time seed script: creates fictional demo author accounts and 100 themed
// text posts through the real Supabase Auth + REST API (publishable key +
// each author's own access token), so RLS applies exactly as it does for a
// real user. No service-role key is used anywhere in this script.
const SUPABASE_URL = process.env.SUPABASE_URL
const PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY
if (!SUPABASE_URL || !PUBLISHABLE_KEY) {
  throw new Error('Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY env vars first.')
}

const GLOBAL_SPACE_ID = '00000000-0000-4000-8000-000000000001'
const EMAIL_DOMAIN = 'scripturehero.invalid' // RFC 2606 reserved TLD: never a deliverable address

// Fictional demo authors, named after Book of Mormon figures so they're
// obviously seed data in any admin view or export (never real users).
const AUTHORS = [
  'nephi', 'lehi', 'alma', 'ammon', 'mormon',
  'moroni', 'helaman', 'mosiah', 'abinadi', 'jacob',
]

function displayName(handle) {
  return handle[0].toUpperCase() + handle.slice(1)
}

function password(handle) {
  return `Seed-${displayName(handle)}-1830!`
}

async function signUpOrSignIn(handle) {
  const email = `${handle}@${EMAIL_DOMAIN}`
  const pass = password(handle)
  const signUp = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: { apikey: PUBLISHABLE_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: pass, data: { display_name: displayName(handle), seed: true } }),
  })
  const signUpBody = await signUp.json()
  if (signUp.ok && signUpBody.access_token) {
    return { id: signUpBody.user.id, accessToken: signUpBody.access_token, email }
  }
  // Already exists from a prior run of this script: sign in instead.
  const signIn = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: PUBLISHABLE_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: pass }),
  })
  const signInBody = await signIn.json()
  if (!signIn.ok) throw new Error(`Could not sign up or sign in ${email}: ${JSON.stringify(signUpBody)} / ${JSON.stringify(signInBody)}`)
  return { id: signInBody.user.id, accessToken: signInBody.access_token, email }
}

const OPENINGS = [
  'This week at work, everything that could go wrong did.',
  "Walking home after a hard conversation with my sister, I didn't have any answers.",
  'During the quiet of early morning prayer, my mind kept drifting to everything I was afraid of.',
  "When the test results didn't go the way we hoped, I sat in the car for a long time before driving home.",
  "Standing in line at the grocery store, I realized how long it had been since I'd really talked to anyone.",
  'After losing my job last month, I kept waiting to feel okay again.',
  'Watching my kids argue and then make up within the hour, I thought about how quickly I hold onto my own grudges.',
  "On the anniversary of losing my dad, I almost didn't get out of bed.",
  'During a long night shift, I had a lot of time to think about where my life was headed.',
  'After moving to a new city where I knew no one, the silence in my apartment felt louder than I expected.',
  'When my prayers felt like they were hitting the ceiling, I almost stopped praying altogether.',
  "Sitting with a friend going through a divorce, I didn't know what to say, so I just stayed.",
  'After finally forgiving someone I thought I never could, I felt lighter than I had in years.',
  'On the hardest day of treatment so far, a stranger in the waiting room smiled at me and it changed my whole afternoon.',
  'When the bills piled up faster than the paychecks, I started to dread opening the mailbox.',
  'After a sleepless night worrying about my teenager, I finally just prayed instead of planning.',
  "During the quiet after the funeral, everyone else went back to their lives and I didn't know how to.",
  'When I finally asked for help instead of pretending I had it together, something in me relaxed.',
  "After a long season of waiting for something that still hasn't come, I had to decide what to do with the waiting.",
  'On a regular Tuesday that somehow felt heavier than it should have, I almost missed the small kindness that turned it around.',
]

const INSIGHTS = [
  "I keep learning that peace isn't the absence of hard things, it's a presence that stays with me inside them.",
  "I'm starting to believe trust isn't a feeling I wait to have, it's a choice I make again every morning.",
  "Gratitude didn't erase what was wrong, but it made room for something else to exist alongside it.",
  'Forgiveness turned out to be less about them and more about setting myself down.',
  'Patience has stopped feeling like punishment and started feeling like preparation.',
  'Hope showed up smaller than I expected, more like a flicker than a floodlight, but it was enough to take the next step.',
  "Service reminded me that I didn't need to have my own life figured out to still be useful to someone else's.",
  'Community found me exactly when I stopped pretending I didn\'t need it.',
  'Humility felt like a loss at first, until I realized it was just honesty wearing a different name.',
  "Courage, I'm learning, usually looks like doing the small next thing while still afraid.",
  "Renewal didn't come all at once. It came in pieces, on ordinary days, when I wasn't looking for it.",
  'Grace met me before I had cleaned myself up, which somehow made it mean more, not less.',
  'Listening without trying to fix anything turned out to be its own kind of love.',
  'Faith stopped being about certainty and started being about showing up anyway.',
  'Joy and grief sat together in the same room that day, and neither one asked the other to leave.',
  'Compassion for myself was harder to practice than compassion for anyone else, but just as necessary.',
  "Perseverance isn't loud. Most days it just looks like getting up and trying again.",
  "Kindness from a stranger reminded me that I'm not just passing through other people's lives unnoticed.",
  'Surrender wasn\'t giving up. It was finally setting down something I was never strong enough to carry alone.',
]

const CLOSINGS = [
  "If you're in a season like that right now, I don't think you're behind. I think you're exactly where growth happens.",
  "I'm not sharing this because I have it figured out. I'm sharing it because someone else might need to hear it today.",
  "I don't know who needs this, but if it's you, I hope it meets you gently.",
  "I used to think I had to get through things alone. I'm learning that's not actually required of me.",
  'This is a small thing, but it mattered enough that I wanted to write it down and share it.',
  'If nothing else, I hope this is proof that ordinary days can still hold something sacred.',
  "I'm still in the middle of this, not on the other side of it, and I think that's okay to admit out loud.",
  "Maybe the point isn't to arrive somewhere. Maybe it's just to keep walking with people who'll walk with you.",
  'I wanted to put this into words before the feeling faded, in case it helps someone else hold onto theirs.',
  "It's not a big breakthrough, just a quiet one, and those count too.",
  'I\'m grateful for whoever reads this and recognizes a piece of their own week in it.',
  "If you're waiting for a sign that it's okay to keep going, let this be a small one.",
  "I don't say this to sound like I have wisdom. I say it because I needed someone to say it to me once.",
  'However small this feels, I believe it\'s the kind of thing worth saying out loud instead of carrying silently.',
  "I'm learning slowly, but I'm learning, and I wanted to share the lesson while it's still fresh.",
  'To anyone having a harder week than they\'re letting on, I see you, and this is for you.',
  "I don't have a neat ending for this, just gratitude that I noticed it at all.",
]

const SCRIPTURES = [
  'John 14:27', 'Proverbs 3:5-6', 'Mosiah 4:9', '1 Thessalonians 5:18', 'Alma 7:23',
  'Colossians 3:13', 'Mosiah 26:30', 'James 1:3-4', 'Alma 32:41', 'Romans 15:13',
  'Ether 12:4', 'Galatians 5:13', 'Mosiah 2:17', 'Romans 12:13', 'Mosiah 18:9',
  'Micah 6:8', 'Alma 32:8', 'Joshua 1:9', 'Alma 26:27', 'Isaiah 40:31',
  '2 Corinthians 12:9', 'Moroni 7:45', 'Psalm 34:18', 'Ether 12:6', '1 Nephi 3:7',
]

function buildPost(i) {
  const opening = OPENINGS[i % OPENINGS.length]
  const insight = INSIGHTS[i % INSIGHTS.length]
  const closing = CLOSINGS[i % CLOSINGS.length]
  const scripture = SCRIPTURES[i % SCRIPTURES.length]
  return { body: `${opening} ${insight} ${closing}`, scriptureReference: scripture }
}

async function createPost(session, post) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/posts`, {
    method: 'POST',
    headers: {
      apikey: PUBLISHABLE_KEY,
      Authorization: `Bearer ${session.accessToken}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      author_id: session.id,
      space_id: GLOBAL_SPACE_ID,
      body: post.body,
      scripture_reference: post.scriptureReference,
    }),
  })
  if (!res.ok) throw new Error(`Post insert failed (${res.status}): ${await res.text()}`)
}

const sessions = []
for (const handle of AUTHORS) {
  const session = await signUpOrSignIn(handle)
  sessions.push(session)
  console.log(`author ready: ${session.email}`)
}

const TOTAL_POSTS = 100
for (let i = 0; i < TOTAL_POSTS; i++) {
  const session = sessions[i % sessions.length]
  await createPost(session, buildPost(i))
  if ((i + 1) % 10 === 0) console.log(`seeded ${i + 1}/${TOTAL_POSTS} posts`)
}

console.log('Done.')
