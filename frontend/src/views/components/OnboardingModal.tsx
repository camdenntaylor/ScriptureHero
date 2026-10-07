import { useEffect, useRef, useState } from 'react'
import { Icon } from './Icon'
import { Logo } from './Logo'

const STORAGE_KEY = 'scripture-hero-onboarding-dismissed'

function alreadyDismissed(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function OnboardingModal() {
  const ref = useRef<HTMLDialogElement>(null)
  const [dismissed, setDismissed] = useState(alreadyDismissed)

  useEffect(() => {
    if (dismissed) return
    const dialog = ref.current
    dialog?.showModal()
    return () => dialog?.close()
  }, [dismissed])

  if (dismissed) return null

  const dismiss = () => {
    try {
      sessionStorage.setItem(STORAGE_KEY, '1')
    } catch {
      /* Private browsing or storage disabled: still dismiss for this screen. */
    }
    setDismissed(true)
  }

  return (
    <dialog ref={ref} className="prototype-modal onboarding-modal" aria-labelledby="onboarding-title" onCancel={dismiss}>
      <button className="icon-button modal-close" onClick={dismiss} aria-label="Skip the introduction">
        <Icon name="close" />
      </button>
      <span className="round-icon">
        <Logo />
      </span>
      <h2 id="onboarding-title">This is an early look, not a finished app.</h2>
      <p className="modal-description">
        Scripture Hero is a class project. What you're about to see is a low-fidelity, early-stage prototype — some
        screens are simulated, and your activity here resets when you reload the page.
      </p>
      <p className="modal-description">
        <strong>Something to try:</strong> look through the Global feed on Home, and when an insight speaks to you,
        see what it takes to save it and find it again in your Scripture Heroes.
      </p>
      <p className="modal-description">
        There's no single path through this prototype — explore Welcome, Home, and Scripture Heroes in whatever
        order you like.
      </p>
      <div className="onboarding-actions">
        <button className="button button-primary full-width" onClick={dismiss}>
          Start exploring
        </button>
        <button className="button-link onboarding-skip" onClick={dismiss}>
          Skip the introduction
        </button>
      </div>
    </dialog>
  )
}
