import type { MessagingState } from '../models/messaging'
import { appreciations, insights } from './prototypeData'

// Every contact opted in for this fictional preview. Never sourced from private
// questions or helpful matches. This does not establish production permissions.
export const messagingContacts = [...new Map([
  ...insights.map(post => post.author),
  ...appreciations.map(item => item.person),
].map(person => [person.id, person])).values()]

export function createDemoMessaging(): MessagingState {
  const marcus = messagingContacts.find(person => person.id === 'marcus')!
  const ruth = messagingContacts.find(person => person.id === 'ruth')!
  return {
    conversations: [
      { id: 'demo-marcus', mode: 'named', person: marcus, messages: [
        { id: 'marcus-thanks', direction: 'incoming', kind: 'thanks', body: 'Thank you for reminding me that showing up for someone can be enough. Your words stayed with me.', createdAt: '2026-10-08T16:00:00.000Z' },
      ] },
      { id: 'demo-ruth', mode: 'named', person: ruth, messages: [
        { id: 'ruth-thanks', direction: 'incoming', kind: 'thanks', body: 'I shared your insight with my family over dinner. It started such a thoughtful conversation. Thank you for sharing.', createdAt: '2026-10-06T18:00:00.000Z' },
        { id: 'ruth-reply', direction: 'outgoing', kind: 'message', body: 'That means a lot. I’m glad it gave you a moment together.', createdAt: '2026-10-06T18:15:00.000Z' },
      ] },
      { id: 'demo-anonymous', mode: 'anonymous-received', person: null, messages: [
        { id: 'anonymous-thanks', direction: 'incoming', kind: 'thanks', body: 'Your insight brought a little light to my day. Thank you for sharing it.', createdAt: '2026-10-05T12:00:00.000Z' },
      ] },
    ],
    readMessageIds: ['ruth-thanks', 'ruth-reply'],
    drafts: {},
  }
}

export function messageTime(value: string): string {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value))
}
