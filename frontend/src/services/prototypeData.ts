import type { Appreciation, Insight, SavedInsight, Space, SoulQuestion } from '../models/prototype'

// Entirely fictional, owner-only fixtures for the UX assignment. Never persisted or sent to an API.
export const questions: SoulQuestion[] = [
  { id: 'quiet', title: 'How can I find peace when life feels uncertain?', label: 'Finding peace' },
  { id: 'trust', title: 'How do I trust God’s timing?', label: 'Learning to trust' },
  { id: 'connection', title: 'How can I feel closer to the people around me?', label: 'Feeling connected' },
]

export const insights: Insight[] = [
  {
    id: 'small-kindness', author: { id: 'amara', name: 'Amara Okafor', location: 'Accra, Ghana', initials: 'AO', color: 'clay' },
    title: 'Sometimes, peace looks like a person.',
    body: 'I used to wait for God to take the worry away all at once. Last week, a friend came over with tea and simply sat with me. No advice. No perfect answers. Just presence.\n\nIt reminded me that sometimes His peace comes through the people He puts beside us. Maybe we can be that person for someone today.',
    scripture: 'John 14:27', verse: '“Peace I leave with you, my peace I give unto you.”', time: '2 hours ago', likes: 24,
    comments: [{ name: 'Sofia', body: '“Just presence.” Such a beautiful reminder. Thank you for sharing this.' }, { name: 'James', body: 'I needed to hear this today. Sometimes showing up is enough.' }],
    topics: ['Peace', 'Friendship'],
  },
  {
    id: 'quiet-growth', author: { id: 'daniel', name: 'Daniel Costa', location: 'Lisbon, Portugal', initials: 'DC', color: 'sage' },
    title: 'Growth happens in the quiet, too.',
    body: 'A little reminder from my morning walk: flowers don’t rush to bloom. I’m learning to give myself the same grace, and to trust that God is at work even when I can’t see it.',
    scripture: 'Ecclesiastes 3:11', verse: '“He hath made every thing beautiful in his time.”', time: '4 hours ago', likes: 18,
    comments: [{ name: 'Elena', body: 'Learning to slow down with you. Thank you for this moment of peace.' }], video: '/media/quiet-moments.mp4',
    topics: ['Patience', 'Trust'],
  },
  {
    id: 'room-at-table', author: { id: 'mei', name: 'Mei Chen', location: 'Vancouver, Canada', initials: 'MC', color: 'gold' },
    title: 'There is always room at the table.',
    body: 'Moving to a new city made me feel like a stranger everywhere. A family from my neighborhood invited me to dinner, and something as small as an extra place setting changed my whole week.\n\nWhen Jesus made room for people, He didn’t wait for them to have everything figured out. I’m trying to remember that when I meet someone new.',
    scripture: 'Romans 12:13', verse: '“Distributing to the necessity of saints; given to hospitality.”', time: 'Yesterday', likes: 31, comments: [],
    topics: ['Community', 'Belonging'],
  },
  {
    id: 'grateful-table', author: { id: 'noah', name: 'Noah Whitfield', location: 'Austin, USA', initials: 'NW', color: 'sage' },
    title: 'Thankful even on the ordinary days.',
    body: 'I almost skipped grace tonight — it had been a long week and I just wanted to eat. But my daughter asked if we could still say thanks, even for “boring” spaghetti.\n\nShe was right. Gratitude isn’t just for the extraordinary days. It’s for the Tuesday-night, nothing-special ones too.',
    scripture: '1 Thessalonians 5:18', verse: '“In every thing give thanks: for this is the will of God.”', time: '5 hours ago', likes: 14, comments: [],
    topics: ['Gratitude', 'Family'],
  },
  {
    id: 'letting-go', author: { id: 'priya', name: 'Priya Anand', location: 'Chennai, India', initials: 'PA', color: 'lilac' },
    title: 'I finally set the grudge down.',
    body: 'I carried it for almost two years — replaying the argument, rehearsing what I should have said. Forgiving her didn’t make what happened okay. It just meant I stopped needing it to be okay before I could move forward.\n\nI called her yesterday. We didn’t solve everything. But I slept better than I have in months.',
    scripture: 'Colossians 3:13', verse: '“Forbearing one another, and forgiving one another.”', time: 'Yesterday', likes: 27,
    comments: [{ name: 'Marcus', body: 'This is exactly what I needed to read today.' }],
    topics: ['Forgiveness'],
  },
  {
    id: 'waiting-room', author: { id: 'marcus', name: 'Marcus Bell', location: 'Atlanta, USA', initials: 'MB', color: 'clay' },
    title: 'Hope looked smaller than I expected.',
    body: 'Three rounds of treatment in, I stopped expecting hope to feel like a burst of light. Now it’s quieter — a nurse who remembers my name, a text from a friend, a sunrise through the window.\n\nI’m learning hope doesn’t have to be loud to be real.',
    scripture: 'Romans 15:13', verse: '“That ye may abound in hope, through the power of the Holy Ghost.”', time: '2 days ago', likes: 41, comments: [],
    topics: ['Hope'],
  },
  {
    id: 'empty-chair', author: { id: 'hannah', name: 'Hannah Osei', location: 'Accra, Ghana', initials: 'HO', color: 'gold' },
    title: 'Grief and gratitude sat together today.',
    body: 'It’s been a year since we lost Mom, and the holidays bring her absence into sharp focus. But this year I noticed something: I can miss her and still laugh at the memory of her terrible singing voice in the same breath.\n\nGrief didn’t leave room for joy. It turns out there’s room for both.',
    scripture: 'Psalm 34:18', verse: '“The LORD is nigh unto them that are of a broken heart.”', time: '3 days ago', likes: 36, comments: [],
    topics: ['Grief', 'Family'],
  },
  {
    id: 'first-step', author: { id: 'diego', name: 'Diego Fuentes', location: 'Guadalajara, Mexico', initials: 'DF', color: 'sage' },
    title: 'Courage was just the next small step.',
    body: 'I kept waiting to feel ready before I changed careers at 40. Ready never came. What came instead was one small act of courage at a time — one application, one hard conversation, one leap of faith.\n\nI’m starting a new job Monday. Still scared. Going anyway.',
    scripture: 'Joshua 1:9', verse: '“Be strong and of a good courage… for the LORD thy God is with thee.”', time: '4 days ago', likes: 22, comments: [],
    topics: ['Courage'],
  },
  {
    id: 'sunday-table', author: { id: 'ruth', name: 'Ruth Castillo', location: 'San Juan, Puerto Rico', initials: 'RC', color: 'lilac' },
    title: 'Family is louder than I remember.',
    body: 'Three generations crammed into my grandmother’s kitchen, everyone talking over each other, someone always stirring something on the stove. It’s chaotic. It’s also the most grounded I feel all week.\n\nI used to take Sunday dinners for granted. I don’t anymore.',
    scripture: 'Psalm 133:1', verse: '“Behold, how good and how pleasant it is for brethren to dwell together in unity!”', time: '5 days ago', likes: 19, comments: [],
    topics: ['Family', 'Gratitude'],
  },
]

export const spaces: Space[] = [
  { id: 'oakwood-ward', name: 'Oakwood Ward', kind: 'Congregation', description: 'Insights shared by and for members of Oakwood Ward.', memberCount: 86, joinedByDefault: true },
  { id: 'garcia-family', name: 'The Garcia Family', kind: 'Family', description: 'A private space for the Garcia family to share and stay close.', memberCount: 12, joinedByDefault: true },
  { id: 'college-friends', name: 'College Friends', kind: 'Friends', description: 'The group chat that never really ended, just moved here.', memberCount: 9, joinedByDefault: false },
  { id: 'austin-community', name: 'Austin Community', kind: 'City', description: 'Neighbors in and around Austin sharing what they’re learning.', memberCount: 214, joinedByDefault: false },
]

export const spacePosts: Record<string, Insight[]> = {
  'oakwood-ward': [
    {
      id: 'ward-testimony', author: { id: 'pastor-lee', name: 'Pastor David Lee', location: 'Oakwood Ward', initials: 'DL', color: 'gold' },
      title: 'What I’m carrying into this Sunday.', body: 'This week reminded me that ministry isn’t about having the right words. It’s about showing up, again and again, for the same people, in the same pews, through the same ordinary weeks.', scripture: 'Galatians 6:9', verse: '“Let us not be weary in well doing.”', time: '1 day ago', likes: 12, comments: [], topics: ['Service', 'Community'],
    },
  ],
  'garcia-family': [
    {
      id: 'family-reunion', author: { id: 'abuela-rosa', name: 'Rosa Garcia', location: 'The Garcia Family', initials: 'RG', color: 'clay' },
      title: 'Thinking of all of you today.', body: 'I found your grandfather’s old scripture journal this week. His handwriting is almost impossible to read, but I recognized one line right away — he underlined it twice. I’ll bring it to dinner Sunday.', scripture: 'Deuteronomy 6:7', verse: '“Thou shalt teach them diligently unto thy children.”', time: '3 days ago', likes: 8, comments: [], topics: ['Family'],
    },
  ],
  'college-friends': [],
  'austin-community': [],
}

export const initialSaved: SavedInsight[] = [{ postId: 'room-at-table', questionId: 'connection' }]

// These people chose to send public appreciation. They are NOT identities from private helpful marks.
export const appreciations: Appreciation[] = [
  { person: { id: 'sofia', name: 'Sofia Reyes', location: 'Barcelona, Spain', initials: 'SR', color: 'lilac' }, quote: '“Your words reminded me that I don’t have to have all the answers to keep moving forward. Thank you.”', postTitle: 'Faith is taking the next small step' },
  { person: { id: 'james', name: 'James Wilson', location: 'Bristol, United Kingdom', initials: 'JW', color: 'sage' }, quote: '“I shared your insight with my family over dinner. It started a conversation we really needed.”', postTitle: 'The beauty of simply showing up' },
  { person: { id: 'elena', name: 'Elena Santos', location: 'São Paulo, Brazil', initials: 'ES', color: 'clay' }, quote: '“This gave me a new way to think about kindness. I’m carrying it with me this week.”', postTitle: 'The beauty of simply showing up' },
]

// Anonymous aggregate supplied by the fictional backend, not derived from the named appreciations.
export const impact = { peopleHelped: 12, insightsShared: 4, countriesReached: 6 }
