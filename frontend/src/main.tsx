import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './views/App'
import './posthog'
import './views/styles.css'
import { endGuestSession, guestSession } from './services/guestSession'

const root = document.getElementById('root')

if (!root) {
  throw new Error('Root element not found')
}

const appRoot = createRoot(root)
appRoot.render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Discard private React state even if the browser keeps this page in its back/forward cache.
let guestPageDiscarded = false
window.addEventListener('pagehide', () => {
  if (guestSession()) {
    guestPageDiscarded = true
    appRoot.unmount()
    endGuestSession()
  }
})
window.addEventListener('pageshow', (event) => {
  if (event.persisted && guestPageDiscarded) window.location.reload()
})
