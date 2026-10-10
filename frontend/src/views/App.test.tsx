import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { usePrototypeController, type PrototypeController } from '../controllers/usePrototypeController'
import { messageNotifications, orderedConversations } from '../models/messaging'
import type { Screen } from '../models/prototype'
import { createDemoMessaging, messagingContacts } from '../services/prototypeMessages'
import { App } from './App'

vi.mock('../controllers/usePrototypeController', () => ({ usePrototypeController: vi.fn() }))
vi.mock('../services/supabase', () => ({ supabase: null, avatarUrl: () => null }))

function renderAccount(screen: Screen, signedIn: boolean, authLoading = false) {
  const state = createDemoMessaging()
  // Deliberately include fixtures even for signed-out renders: the shell must
  // gate private content regardless of what a controller happens to return.
  vi.mocked(usePrototypeController).mockReturnValue({
    screen,
    profile: signedIn ? { id: 'account', name: 'Cooper', bio: '', location: '', avatarPath: null } : null,
    authLoading, accountError: '', dialog: null, notice: '', heroes: [], saved: [], thanked: [],
    messaging: {
      state, conversations: orderedConversations(state), notifications: messageNotifications(state),
      selected: state.conversations[0], unreadTotal: 2, contacts: messagingContacts,
    },
  } as unknown as PrototypeController)
  return renderToStaticMarkup(<App />)
}

beforeEach(() => vi.clearAllMocks())

describe('messaging account access', () => {
  it('hides Messages and the notification bell from signed-out navigation', () => {
    const html = renderAccount('heroes', false)
    expect(html).not.toContain('href="#messages"')
    expect(html).not.toContain('href="#notifications"')
    expect(html).toContain('Log in to message')
    expect(html).toContain('href="#home"')
  })

  it.each(['messages', 'chat', 'notifications'] as const)('requires sign-in for a direct #%s link', screen => {
    const html = renderAccount(screen, false)
    expect(html).toContain('Welcome back.')
    expect(html).not.toContain('Marcus Bell')
    expect(html).not.toContain('message-history')
    expect(html).not.toContain('mobile-nav')
  })

  it.each(['messages', 'chat', 'notifications'] as const)('keeps #%s private while account verification is pending', screen => {
    const html = renderAccount(screen, false, true)
    expect(html).toContain('Loading your account')
    expect(html).not.toContain('Marcus Bell')
    expect(html).not.toContain('href="#messages"')
  })

  it.each(['messages', 'chat', 'notifications'] as const)('shows seeded mock content to a signed-in account on #%s', screen => {
    const html = renderAccount(screen, true)
    expect(html).toContain('Marcus Bell')
    expect(html).toContain('href="#messages"')
    expect(html).not.toContain('Welcome back.')
    expect(html).toContain('Mock')
  })

  it('marks Messages active without also marking Profile active in a chat', () => {
    const html = renderAccount('chat', true)
    expect(html).toContain('href="#messages" aria-current="page"')
    expect(html).not.toContain('href="#profile" aria-current="page"')
  })
})
