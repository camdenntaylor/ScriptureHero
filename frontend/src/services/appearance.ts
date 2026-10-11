import { appearanceMode, type AppearanceMode } from '../models/appearance'

const storageKey = 'scripture-hero-appearance'

export function readAppearance(): AppearanceMode {
  try { return appearanceMode(window.localStorage.getItem(storageKey)) }
  catch { return 'system' }
}

export function saveAppearance(mode: AppearanceMode) {
  // Only a non-sensitive color preference is stored; no account or message data.
  try { window.localStorage.setItem(storageKey, mode) }
  catch { /* The selected theme still works when device storage is unavailable. */ }
}

export function applyAppearance(mode: AppearanceMode) {
  if (mode === 'system') document.documentElement.removeAttribute('data-theme')
  else document.documentElement.setAttribute('data-theme', mode)
}
