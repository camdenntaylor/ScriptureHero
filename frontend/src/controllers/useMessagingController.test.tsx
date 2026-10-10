import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { useMessagingController } from './useMessagingController'

function capture(ownerKey: string | null) {
  let controller: ReturnType<typeof useMessagingController> | undefined
  function Harness() {
    controller = useMessagingController(ownerKey)
    return null
  }
  renderToStaticMarkup(<Harness />)
  return controller!
}

describe('mock messaging account initialization', () => {
  it('does not populate messages or contacts for a signed-out visitor', () => {
    const messaging = capture(null)
    expect(messaging.conversations).toEqual([])
    expect(messaging.contacts).toEqual([])
    expect(messaging.notifications).toEqual([])
    expect(messaging.unreadTotal).toBe(0)
    expect(messaging.send('Hello')).toBe(false)
    expect(messaging.sendThanks({ id: 'person', name: 'Person', initials: 'P', location: '', color: 'sage' }, 'Thank you', false)).toBe(false)
  })

  it('gives each signed-in account its own complete copy of the mock chats', () => {
    const first = capture('first-account')
    const second = capture('second-account')
    expect(first.conversations).toHaveLength(3)
    expect(second.conversations).toEqual(first.conversations)
    expect(second.state).not.toBe(first.state)
    expect(second.state.conversations[0]!.messages).not.toBe(first.state.conversations[0]!.messages)
    first.state.conversations[0]!.messages[0]!.body = 'Changed in the first account only'
    expect(second.state.conversations[0]!.messages[0]!.body).not.toBe('Changed in the first account only')
    expect(capture('first-account').state.conversations[0]!.messages[0]!.body).not.toBe('Changed in the first account only')
  })
})
