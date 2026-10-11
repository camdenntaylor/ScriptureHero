import { afterEach, describe, expect, it, vi } from 'vitest'
import { applyAppearance, readAppearance, saveAppearance } from './appearance'

afterEach(() => vi.unstubAllGlobals())

describe('appearance preference', () => {
  it('defaults to the device theme for missing, corrupt, or unavailable storage', () => {
    for (const value of [null, 'unexpected-theme']) {
      vi.stubGlobal('window', { localStorage: { getItem: () => value } })
      expect(readAppearance()).toBe('system')
    }
    vi.stubGlobal('window', { get localStorage() { throw new Error('Storage unavailable') } })
    expect(readAppearance()).toBe('system')
    expect(() => saveAppearance('evening')).not.toThrow()
  })

  it('saves only a color preference and restores automatic mode without a forced theme', () => {
    const storage = new Map<string, string>()
    vi.stubGlobal('window', { localStorage: { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => storage.set(key, value) } })
    const attributes = new Map<string, string>()
    vi.stubGlobal('document', { documentElement: { setAttribute: (key: string, value: string) => attributes.set(key, value), removeAttribute: (key: string) => attributes.delete(key) } })
    saveAppearance('evening')
    expect(readAppearance()).toBe('evening')
    applyAppearance(readAppearance())
    expect(attributes.get('data-theme')).toBe('evening')
    saveAppearance('system')
    applyAppearance(readAppearance())
    expect(attributes.has('data-theme')).toBe(false)
    expect([...storage.entries()]).toEqual([['scripture-hero-appearance', 'system']])
  })
})
