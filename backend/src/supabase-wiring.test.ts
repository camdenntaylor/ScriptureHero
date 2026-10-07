import { describe, expect, it } from 'vitest'
import { buildApp } from './application.js'
import { readConfig } from './config/env.js'
import { createInMemoryDependencies, hasSupabaseConfig } from './dependencies.js'
import { InMemoryDatabase } from './shared/in-memory-database.js'
import { requestContext } from './shared/request-context.js'
import { keysetFilter, normalizeTimestamp } from './shared/supabase.js'
import { SupabaseAuthenticator } from './shared/supabase-authenticator.js'

describe('Supabase configuration', () => {
  it('runs without Supabase when nothing is set, treating blanks as unset', () => {
    const config = readConfig({ SUPABASE_URL: '', SUPABASE_PUBLISHABLE_KEY: '' })
    expect(hasSupabaseConfig(config)).toBe(false)
  })

  it('enables Supabase with just the project URL and publishable key, no secret key', () => {
    const config = readConfig({
      SUPABASE_URL: 'https://example.supabase.co',
      SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_x',
    })
    expect(hasSupabaseConfig(config)).toBe(true)
  })

  it('stays off when only one of the two is set', () => {
    expect(hasSupabaseConfig(readConfig({ SUPABASE_URL: 'https://example.supabase.co' }))).toBe(false)
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

describe('Per-request access token', () => {
  it('reaches repositories on signed-in routes only, so RLS applies as that user', async () => {
    const seen: Record<string, string | undefined> = {}
    const base = createInMemoryDependencies(new InMemoryDatabase(), {
      async verify(token) {
        return token === 'good-token' ? { id: '11111111-1111-4111-8111-111111111111' } : null
      },
    })
    const app = await buildApp(
      { HOST: '127.0.0.1', PORT: 3000, FRONTEND_ORIGIN: 'http://localhost:5173' },
      {
        ...base,
        posts: {
          ...base.posts,
          async listGlobal() {
            seen.feed = requestContext.getStore()?.accessToken
            return []
          },
          async createGlobal() {
            seen.publish = requestContext.getStore()?.accessToken
            return null
          },
        },
      },
    )

    await app.inject({ method: 'GET', url: '/api/v1/posts', headers: { authorization: 'Bearer good-token' } })
    await app.inject({
      method: 'POST',
      url: '/api/v1/posts',
      headers: { authorization: 'Bearer good-token' },
      payload: { body: 'hi' },
    })
    await app.inject({
      method: 'POST',
      url: '/api/v1/posts',
      headers: { authorization: 'Bearer forged' },
      payload: { body: 'hi' },
    })

    expect(seen.feed).toBeUndefined() // public feed always runs as anon
    expect(seen.publish).toBe('good-token')
    await app.close()
  })
})
