import type { Appreciation, Insight, SavedInsight, SoulQuestion } from '../models/prototype'

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
  },
  {
    id: 'quiet-growth', author: { id: 'daniel', name: 'Daniel Costa', location: 'Lisbon, Portugal', initials: 'DC', color: 'sage' },
    title: 'Growth happens in the quiet, too.',
    body: 'A little reminder from my morning walk: flowers don’t rush to bloom. I’m learning to give myself the same grace, and to trust that God is at work even when I can’t see it.',
    scripture: 'Ecclesiastes 3:11', verse: '“He hath made every thing beautiful in his time.”', time: '4 hours ago', likes: 18,
    comments: [{ name: 'Elena', body: 'Learning to slow down with you. Thank you for this moment of peace.' }], video: '/media/quiet-moments.mp4',
  },
  {
    id: 'room-at-table', author: { id: 'mei', name: 'Mei Chen', location: 'Vancouver, Canada', initials: 'MC', color: 'gold' },
    title: 'There is always room at the table.',
    body: 'Moving to a new city made me feel like a stranger everywhere. A family from my neighborhood invited me to dinner, and something as small as an extra place setting changed my whole week.\n\nWhen Jesus made room for people, He didn’t wait for them to have everything figured out. I’m trying to remember that when I meet someone new.',
    scripture: 'Romans 12:13', verse: '“Distributing to the necessity of saints; given to hospitality.”', time: 'Yesterday', likes: 31, comments: [],
  },
]

export const initialSaved: SavedInsight[] = [{ postId: 'room-at-table', questionId: 'connection' }]

// These people chose to send public appreciation. They are NOT identities from private helpful marks.
export const appreciations: Appreciation[] = [
  { person: { id: 'sofia', name: 'Sofia Reyes', location: 'Barcelona, Spain', initials: 'SR', color: 'lilac' }, quote: '“Your words reminded me that I don’t have to have all the answers to keep moving forward. Thank you.”', postTitle: 'Faith is taking the next small step' },
  { person: { id: 'james', name: 'James Wilson', location: 'Bristol, United Kingdom', initials: 'JW', color: 'sage' }, quote: '“I shared your insight with my family over dinner. It started a conversation we really needed.”', postTitle: 'The beauty of simply showing up' },
  { person: { id: 'elena', name: 'Elena Santos', location: 'São Paulo, Brazil', initials: 'ES', color: 'clay' }, quote: '“This gave me a new way to think about kindness. I’m carrying it with me this week.”', postTitle: 'The beauty of simply showing up' },
]

// Anonymous aggregate supplied by the fictional backend, not derived from the named appreciations.
export const impact = { peopleHelped: 12, insightsShared: 4, countriesReached: 6 }
