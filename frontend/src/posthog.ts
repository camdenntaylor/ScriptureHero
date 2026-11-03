import sdk from 'posthog-js'
import { guestSession } from './services/guestSession'

let enabled = false

// Guests never initialize analytics, session recording, or automatic error capture.
// Only explicit events from a verified account may reach the analytics client.
export function enableAccountAnalytics() {
  if (enabled || guestSession()) return
  const key = import.meta.env.VITE_POSTHOG_KEY
  const host = import.meta.env.VITE_POSTHOG_HOST
  if (!key || !host) return
  sdk.init(key, {
    api_host: host,
    defaults: '2026-05-30',
    persistence: 'memory',
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: false,
    disable_session_recording: true,
    capture_exceptions: false,
    logs: { serviceName: 'scripture-hero-web', environment: import.meta.env.MODE },
  })
  enabled = true
}

const active = () => enabled && !guestSession()
export default {
  capture: (...args: Parameters<typeof sdk.capture>) => { if (active()) sdk.capture(...args) },
  identify: (...args: Parameters<typeof sdk.identify>) => { if (active()) sdk.identify(...args) },
  setPersonProperties: (...args: Parameters<typeof sdk.setPersonProperties>) => { if (active()) sdk.setPersonProperties(...args) },
  reset: () => { if (enabled) sdk.reset() },
  logger: {
    info: (...args: Parameters<typeof sdk.logger.info>) => { if (active()) sdk.logger.info(...args) },
  },
}
