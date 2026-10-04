import { describe, expect, it } from 'vitest'
import { readConfig } from './config/env.js'
import { hasSupabaseConfig } from './dependencies.js'
import { keysetFilter, normalizeTimestamp } from './shared/supabase.js'
import { SupabaseAuthenticator } from './shared/supabase-authenticator.js'

describe('Supabase configuration', () => {
  it('runs without Supabase when nothing is set, treating blanks as unset', () => {
    const config = readConfig({ SUPABASE_URL: '', SUPABASE_PUBLISHABLE_KEY: '', SUPABASE_SECRET_KEY: '' })
    expect(hasSupabaseConfig(config)).toBe(false)
  })

  it('accepts all three values together', () => {
    const config = readConfig({
      SUPABASE_URL: 'https://example.supabase.co',
      SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_x',
      SUPABASE_SECRET_KEY: 'sb_secret_x',
    })
    expect(hasSupabaseConfig(config)).toBe(true)
  })

  it('rejects a partial configuration so a missing secret is not silently ignored', () => {
    expect(() => readConfig({ SUPABASE_URL: 'https://example.supabase.co' })).toThrow(/together/)
  })
})

describe('Supabase helpers', () => {
  it('keeps microseconds when normalizing PostgREST timestamps', () => {
    expect(normalizeTimestamp('2026-10-03T13:35:49.460123+00:00')).toBe('2026-10-03T13:35:49.460123Z')
  })

  it('builds keyset filters for both directions', () => {
    const cursor = { createdAt: '2026-10-03T13:35:49.460123Z', id: 'abc' }
    expect(keysetFilter(cursor, 'desc', 'created_at', 'id')).toBe(
      'created_at.lt.2026-10-03T13:35:49.460123Z,and(created_at.eq.2026-10-03T13:35:49.460123Z,id.lt.abc)',
    )
    expect(keysetFilter(cursor, 'asc', 'created_at', 'id')).toContain('created_at.gt.')
  })
})

describe('SupabaseAuthenticator', () => {
  const clientFor = (result: () => Promise<{ data: { user: { id: string } | null }; error: unknown }>) => ({
    auth: { getUser: result },
  })

  it('returns the user id for a valid token', async () => {
    const auth = new SupabaseAuthenticator(clientFor(async () => ({ data: { user: { id: 'u1' } }, error: null })))
    expect(await auth.verify('good')).toEqual({ id: 'u1' })
  })

  it('rejects a token Supabase refuses, or when Supabase is unreachable', async () => {
    const refused = new SupabaseAuthenticator(clientFor(async () => ({ data: { user: null }, error: new Error('bad') })))
    const down = new SupabaseAuthenticator(
      clientFor(async () => {
        throw new Error('network')
      }),
    )
    expect(await refused.verify('bad')).toBeNull()
    expect(await down.verify('any')).toBeNull()
  })
})
