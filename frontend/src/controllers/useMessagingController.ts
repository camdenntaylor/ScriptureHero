import { useEffect, useState } from 'react'
import type { Person } from '../models/prototype'
import { findNamedConversation, messageNotifications, messagingReducer, orderedConversations, unreadCount, type DemoMessage, type MessagingAction } from '../models/messaging'
import { createDemoMessaging, messagingContacts } from '../services/prototypeMessages'

export function useMessagingController(ownerKey: string) {
  const [session, setSession] = useState(() => ({ ownerKey, state: createDemoMessaging(), selectedId: null as string | null }))
  // Hide the old owner's state immediately, including the render before effects.
  const current = session.ownerKey === ownerKey ? session : { ownerKey, state: createDemoMessaging(), selectedId: null }
  useEffect(() => {
    setSession(previous => previous.ownerKey === ownerKey ? previous : { ownerKey, state: createDemoMessaging(), selectedId: null })
  }, [ownerKey])

  function dispatch(action: MessagingAction) {
    setSession(previous => {
      const next = previous.ownerKey === ownerKey ? previous : { ownerKey, state: createDemoMessaging(), selectedId: null }
      return { ...next, state: messagingReducer(next.state, action) }
    })
  }

  function openThread(id: string) {
    if (!current.state.conversations.some(thread => thread.id === id)) return
    setSession({ ...current, selectedId: id, state: messagingReducer(current.state, { type: 'read', conversationId: id }) })
    window.location.hash = '#chat'
  }

  function startChat(person: Person) {
    const id = findNamedConversation(current.state, person.id)?.id ?? crypto.randomUUID()
    const state = messagingReducer(current.state, { type: 'open', person, conversationId: id })
    setSession({ ...current, selectedId: id, state: messagingReducer(state, { type: 'read', conversationId: id }) })
    window.location.hash = '#chat'
  }

  function message(body: string, kind: DemoMessage['kind']): DemoMessage {
    return { id: crypto.randomUUID(), direction: 'outgoing', kind, body, createdAt: new Date().toISOString() }
  }

  function sendThanks(person: Person, body: string, anonymous: boolean) {
    const action: MessagingAction = { type: 'thanks', person, anonymous, conversationId: crypto.randomUUID(), message: message(body, 'thanks') }
    const state = messagingReducer(current.state, action)
    if (state === current.state) return false
    const thread = state.conversations.find(item => item.mode === (anonymous ? 'anonymous-sent' : 'named') && item.person?.id === person.id)!
    setSession({ ...current, state: messagingReducer(state, { type: 'read', conversationId: thread.id }), selectedId: thread.id })
    window.location.hash = '#chat'
    return true
  }

  const selected = current.state.conversations.find(thread => thread.id === current.selectedId) ?? null
  function send(body: string) {
    if (!selected) return false
    const action: MessagingAction = { type: 'send', conversationId: selected.id, message: message(body, 'message') }
    if (messagingReducer(current.state, action) === current.state) return false
    dispatch(action)
    return true
  }

  function reset() {
    setSession({ ownerKey, state: createDemoMessaging(), selectedId: null })
  }

  return {
    state: current.state,
    conversations: orderedConversations(current.state),
    contacts: messagingContacts,
    selected,
    unreadTotal: current.state.conversations.reduce((total, thread) => total + unreadCount(current.state, thread), 0),
    notifications: messageNotifications(current.state),
    openThread, startChat, sendThanks, send, reset,
    setDraft: (id: string, body: string) => dispatch({ type: 'draft', conversationId: id, body }),
    markAllRead: () => setSession({ ...current, state: { ...current.state, readMessageIds: current.state.conversations.flatMap(thread => thread.messages.map(item => item.id)) } }),
  }
}
