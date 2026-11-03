import { useEffect, useState } from 'react'
import type { AppearanceMode } from '../models/appearance'
import { applyAppearance, readAppearance, saveAppearance } from '../services/appearance'

export function useAppearanceController(guest = false) {
  const [mode, setMode] = useState<AppearanceMode>(() => guest ? 'system' : readAppearance())
  useEffect(() => { setMode(guest ? 'system' : readAppearance()) }, [guest])
  useEffect(() => { applyAppearance(mode) }, [mode])

  function update(mode: AppearanceMode) {
    if (!guest) saveAppearance(mode)
    setMode(mode)
  }

  return { mode, update }
}
