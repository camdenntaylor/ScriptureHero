import { describe, expect, it } from 'vitest'
import { conversationName, findNamedConversation, messageNotifications, messagingReducer, orderedConversations, unreadCount, type DemoMessage, type MessagingState } from './messaging'
import { createDemoMessaging, messagingContacts } from '../services/prototypeMessages'
import { questions } from '../services/prototypeData'

const person = messagingContacts[0]!
const empty = (): MessagingState => ({ conversations: [], readMessageIds: [], drafts: {} })
const message = (id = 'note', body = 'Thank you.'): DemoMessage => ({ id, body, direction: 'outgoing', kind: 'thanks', createdAt: '2026-10-09T01:00:00.000Z' })

describe('prototype conversations and appreciation privacy', () => {
  it('keeps a named thank-you in the same conversation and notification center', () => {
    let state = messagingReducer(empty(), { type: 'thanks', person, anonymous: false, conversationId: 'thread', message: message() })
    state = messagingReducer(state, { type: 'thanks', person, anonymous: false, conversationId: 'another-thread', message: message('another-note') })
    expect(state.conversations).toHaveLength(1)
    expect(state.conversations[0]!.messages).toHaveLength(2)
    expect(messageNotifications(state).map(note => note.conversationId)).toEqual(['thread', 'thread'])
    expect(messageNotifications(state)[0]!.id).toBe(state.conversations[0]!.messages[0]!.id)
    expect(findNamedConversation(state, person.id)?.id).toBe('thread')
  })

  it('keeps anonymous thanks separate even when a named chat exists', () => {
    const named = messagingReducer(empty(), { type: 'open', person, conversationId: 'named' })
    const anonymous = messagingReducer(named, { type: 'thanks', person, anonymous: true, conversationId: 'anonymous', message: message() })
    const again = messagingReducer(anonymous, { type: 'thanks', person, anonymous: true, conversationId: 'ignored', message: message('again') })
    expect(again.conversations).toHaveLength(2)
    expect(again.conversations.find(thread => thread.id === 'named')!.messages).toEqual([])
    expect(again.conversations.find(thread => thread.id === 'anonymous')!.messages).toHaveLength(2)
    expect(messagingReducer(again, { type: 'send', conversationId: 'anonymous', message: message('reply') })).toBe(again)
    expect(messageNotifications(again)[0]!.text).toContain('anonymous thank-you')
  })

  it('contains no sender identity for received anonymous notes and cannot reply to them', () => {
    const state = createDemoMessaging()
    const thread = state.conversations.find(item => item.mode === 'anonymous-received')!
    expect(thread.person).toBeNull()
    expect(conversationName(thread)).toBe('Anonymous appreciation')
    expect(JSON.stringify(thread)).not.toMatch(/senderId|questionId|matchScore|originPostId/)
    expect(messagingReducer(state, { type: 'send', conversationId: thread.id, message: message() })).toBe(state)
    expect(messagingReducer(state, { type: 'draft', conversationId: thread.id, body: 'reply' })).toBe(state)
    expect(messageNotifications(state).find(note => note.conversationId === thread.id)!.text).toBe('Someone sent you an anonymous thank-you note.')
  })

  it('updates unread status everywhere when the conversation is opened', () => {
    const original = createDemoMessaging()
    const thread = original.conversations[0]!
    expect(unreadCount(original, thread)).toBe(1)
    const state = messagingReducer(original, { type: 'read', conversationId: thread.id })
    expect(unreadCount(state, thread)).toBe(0)
    expect(messageNotifications(state).find(note => note.id === thread.messages[0]!.id)!.unread).toBe(false)
    expect(unreadCount(original, thread)).toBe(1)
    expect(state.conversations).toHaveLength(original.conversations.length)
  })

  it('preserves separate drafts and clears only the sent conversation draft', () => {
    let state = createDemoMessaging()
    state = messagingReducer(state, { type: 'draft', conversationId: 'demo-marcus', body: 'Hello Marcus' })
    state = messagingReducer(state, { type: 'draft', conversationId: 'demo-ruth', body: 'Hello Ruth' })
    state = messagingReducer(state, { type: 'send', conversationId: 'demo-marcus', message: message('reply', '  Hello Marcus  ') })
    expect(state.drafts['demo-marcus']).toBe('')
    expect(state.drafts['demo-ruth']).toBe('Hello Ruth')
    expect(state.conversations[0]!.messages.at(-1)!.body).toBe('Hello Marcus')
    expect(orderedConversations(state)[0]!.id).toBe('demo-marcus')
  })

  it('rejects empty, oversized, duplicate, and missing-thread writes without changing history', () => {
    const state = messagingReducer(empty(), { type: 'thanks', person, anonymous: false, conversationId: 'thread', message: message() })
    for (const note of [message('blank', '  '), message('long', 'x'.repeat(501)), message()]) {
      expect(messagingReducer(state, { type: 'send', conversationId: 'thread', message: note })).toBe(state)
    }
    expect(messagingReducer(state, { type: 'send', conversationId: 'missing', message: message('new') })).toBe(state)
    expect(messagingReducer(state, { type: 'thanks', person, anonymous: true, conversationId: 'new', message: message('blank', '') })).toBe(state)
  })

  it('whitelists message and person fields and never adds private context to notifications', () => {
    const enriched = { ...person, questionId: 'private-id', soulQuestion: 'private question sentinel', matchScore: 0.987 }
    const note = { ...message(), ...enriched, id: 'note' }
    const state = messagingReducer(empty(), { type: 'thanks', person: enriched, anonymous: false, conversationId: 'thread', message: note })
    const notifications = messageNotifications(state)
    expect(JSON.stringify(state)).not.toContain('private question sentinel')
    expect(JSON.stringify(state)).not.toContain('private-id')
    expect(JSON.stringify(state)).not.toContain('0.987')
    expect(notifications[0]).not.toHaveProperty('body')
    expect(notifications[0]!.text).not.toContain(note.body)
    for (const question of questions) expect(JSON.stringify(state)).not.toContain(question.title)
    expect(Object.keys(state.conversations[0]!.messages[0]!).sort()).toEqual(['body', 'createdAt', 'direction', 'id', 'kind'])
  })
})
