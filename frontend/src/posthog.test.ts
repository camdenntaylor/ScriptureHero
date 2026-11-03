import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const sdk = vi.hoisted(() => ({ init: vi.fn(), capture: vi.fn(), identify: vi.fn(), setPersonProperties: vi.fn(), reset: vi.fn(), logger: { info: vi.fn() } }))
vi.mock('posthog-js', () => ({ default: sdk }))

beforeEach(() => {
  vi.resetModules()
  vi.clearAllMocks()
  vi.stubEnv('VITE_POSTHOG_KEY', 'test-project')
  vi.stubEnv('VITE_POSTHOG_HOST', 'https://analytics.example.test')
})
afterEach(() => vi.unstubAllEnvs())

describe('guest analytics privacy', () => {
  it('does not initialize analytics or send guest interactions, identities, or logs', async () => {
    const { startGuestSession } = await import('./services/guestSession')
    const { default: analytics, enableAccountAnalytics } = await import('./posthog')
    analytics.capture('before_account_resolution')
    startGuestSession()
    enableAccountAnalytics()
    analytics.capture('soul_question_created')
    analytics.identify('guest')
    analytics.setPersonProperties({ name: 'Guest input' })
    analytics.logger.info('profile_updated')
    for (const method of [sdk.init, sdk.capture, sdk.identify, sdk.setPersonProperties, sdk.logger.info]) expect(method).not.toHaveBeenCalled()
  })

  it('allows explicit account events with automatic content capture disabled, then suppresses guest events', async () => {
    const { startGuestSession } = await import('./services/guestSession')
    const { default: analytics, enableAccountAnalytics } = await import('./posthog')
    enableAccountAnalytics()
    analytics.capture('profile_updated')
    expect(sdk.init).toHaveBeenCalledWith('test-project', expect.objectContaining({
      persistence: 'memory', autocapture: false, capture_pageview: false,
      capture_pageleave: false, disable_session_recording: true, capture_exceptions: false,
    }))
    expect(sdk.capture).toHaveBeenCalledTimes(1)
    startGuestSession()
    analytics.capture('guest_edit')
    analytics.logger.info('guest_message')
    expect(sdk.capture).toHaveBeenCalledTimes(1)
    expect(sdk.logger.info).not.toHaveBeenCalled()
  })
})
