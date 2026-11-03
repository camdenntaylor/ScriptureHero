import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAppearanceController } from './useAppearanceController'
import { readAppearance, saveAppearance } from '../services/appearance'

vi.mock('../services/appearance', () => ({ readAppearance: vi.fn(() => 'evening'), saveAppearance: vi.fn(), applyAppearance: vi.fn() }))
beforeEach(() => vi.clearAllMocks())

function capture(guest: boolean) {
  let appearance: ReturnType<typeof useAppearanceController> | undefined
  function Harness() { appearance = useAppearanceController(guest); return null }
  renderToStaticMarkup(<Harness />)
  return appearance!
}

describe('temporary guest appearance', () => {
  it('uses the device theme and keeps guest preference changes out of storage', () => {
    const appearance = capture(true)
    expect(appearance.mode).toBe('system')
    appearance.update('day')
    expect(readAppearance).not.toHaveBeenCalled()
    expect(saveAppearance).not.toHaveBeenCalled()
    expect(capture(true).mode).toBe('system')
  })
  it('preserves saved preferences for real accounts', () => {
    const appearance = capture(false)
    expect(appearance.mode).toBe('evening')
    appearance.update('day')
    expect(saveAppearance).toHaveBeenCalledWith('day')
  })
})
