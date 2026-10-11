import type { Person } from './prototype'

export const MESSAGE_LIMIT = 500

export interface DemoMessage {
  id: string
  direction: 'incoming' | 'outgoing'
  kind: 'message' | 'thanks'
  body: string
  createdAt: string
}

// Anonymous received notes contain no sender identity. Sent anonymous notes
// retain only the recipient for the sender's own history; they never become chats.
export type DemoConversation = {
  id: string
  messages: DemoMessage[]
} & (
  | { mode: 'named' | 'anonymous-sent'; person: Person }
  | { mode: 'anonymous-received'; person: null }
)

export interface MessagingState {
  conversations: DemoConversation[]
  readMessageIds: string[]
  drafts: Record<string, string>
}

export type MessagingAction =
  | { type: 'open'; person: Person; conversationId: string }
  | { type: 'read'; conversationId: string }
  | { type: 'draft'; conversationId: string; body: string }
  | { type: 'send'; conversationId: string; message: DemoMessage }
  | { type: 'thanks'; person: Person; anonymous: boolean; conversationId: string; message: DemoMessage }

function publicPerson(person: Person): Person {
  return { id: person.id, name: person.name, location: person.location, initials: person.initials, color: person.color }
}

function cleanMessage(message: DemoMessage): DemoMessage | null {
  const body = message.body.trim()
  if (!body || body.length > MESSAGE_LIMIT) return null
  return { id: message.id, direction: 'outgoing', kind: message.kind, body, createdAt: message.createdAt }
}

export function findNamedConversation(state: MessagingState, personId: string) {
  return state.conversations.find(thread => thread.mode === 'named' && thread.person.id === personId)
}

export function messagingReducer(state: MessagingState, action: MessagingAction): MessagingState {
  if (action.type === 'open') {
    if (findNamedConversation(state, action.person.id)) return state
    return { ...state, conversations: [...state.conversations, { id: action.conversationId, mode: 'named', person: publicPerson(action.person), messages: [] }] }
  }
  if (action.type === 'read') {
    const thread = state.conversations.find(item => item.id === action.conversationId)
    if (!thread) return state
    return { ...state, readMessageIds: [...new Set([...state.readMessageIds, ...thread.messages.map(message => message.id)])] }
  }
  if (action.type === 'draft') {
    if (!state.conversations.some(thread => thread.id === action.conversationId && thread.mode === 'named')) return state
    return { ...state, drafts: { ...state.drafts, [action.conversationId]: action.body.slice(0, MESSAGE_LIMIT) } }
  }

  const message = cleanMessage(action.message)
  if (!message || state.conversations.some(thread => thread.messages.some(item => item.id === message.id))) return state
  if (action.type === 'thanks') {
    const mode = action.anonymous ? 'anonymous-sent' : 'named'
    const existing = state.conversations.find(thread => thread.mode === mode && thread.person?.id === action.person.id)
    const thanks = { ...message, kind: 'thanks' as const }
    return {
      ...state,
      conversations: existing
        ? state.conversations.map(thread => thread.id === existing.id ? { ...thread, messages: [...thread.messages, thanks] } : thread)
        : [...state.conversations, { id: action.conversationId, mode, person: publicPerson(action.person), messages: [thanks] }],
    }
  }
  const thread = state.conversations.find(item => item.id === action.conversationId)
  if (!thread || thread.mode !== 'named') return state
  return {
    ...state,
    conversations: state.conversations.map(item => item.id === thread.id ? { ...item, messages: [...item.messages, message] } : item),
    drafts: { ...state.drafts, [thread.id]: '' },
  }
}

export function unreadCount(state: MessagingState, thread: DemoConversation): number {
  return thread.messages.filter(message => message.direction === 'incoming' && !state.readMessageIds.includes(message.id)).length
}

export function conversationName(thread: DemoConversation): string {
  return thread.person?.name ?? 'Anonymous appreciation'
}

export function orderedConversations(state: MessagingState): DemoConversation[] {
  return [...state.conversations].sort((a, b) => {
    const lastA = a.messages.at(-1)?.createdAt ?? ''
    const lastB = b.messages.at(-1)?.createdAt ?? ''
    return lastB.localeCompare(lastA)
  })
}

// Notifications reference the same message as the thread; no copy of its body,
// Soul Question, save, or inferred matching information is added to a notification.
export function messageNotifications(state: MessagingState) {
  return state.conversations.flatMap(thread => thread.messages
    .filter(message => message.direction === 'incoming' || message.kind === 'thanks')
    .map(message => ({
      id: message.id,
      conversationId: thread.id,
      createdAt: message.createdAt,
      unread: message.direction === 'incoming' && !state.readMessageIds.includes(message.id),
      text: message.direction === 'outgoing'
        ? `Your ${thread.mode === 'anonymous-sent' ? 'anonymous ' : ''}thank-you note to ${conversationName(thread)} is saved.`
        : thread.mode === 'anonymous-received'
          ? 'Someone sent you an anonymous thank-you note.'
          : `${conversationName(thread)} sent you ${message.kind === 'thanks' ? 'a thank-you note' : 'a message'}.`,
    })))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}
