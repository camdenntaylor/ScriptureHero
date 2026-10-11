import { useEffect, useState } from 'react'
import type { AppearanceMode } from '../models/appearance'
import { applyAppearance, readAppearance, saveAppearance } from '../services/appearance'

export function useAppearanceController() {
  const [mode, setMode] = useState(readAppearance)
  useEffect(() => { applyAppearance(mode) }, [mode])

  function update(mode: AppearanceMode) {
    saveAppearance(mode)
    setMode(mode)
  }

  return { mode, update }
}
