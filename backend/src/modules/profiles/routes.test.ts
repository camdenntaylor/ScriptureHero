import Fastify from 'fastify'
import { describe, expect, it } from 'vitest'
import { registerAccountRoutes } from './routes.js'

const owner = '10000000-0000-4000-8000-000000000001'
const author = '10000000-0000-4000-8000-000000000002'
const questionId = '20000000-0000-4000-8000-000000000001'
const config = { HOST: '127.0.0.1', PORT: 3000, FRONTEND_ORIGIN: 'http://localhost:5173', SUPABASE_URL: 'https://example.supabase.co', SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test' }

function mockFetch(calls: string[]): typeof fetch {
  return (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    calls.push(`${init?.method ?? 'GET'} ${url}`)
    if (url.endsWith('/auth/v1/user')) {
      const token = new Headers(init?.headers).get('Authorization')
      if (token === 'Bearer owner') return Response.json({ id: owner })
      if (token === 'Bearer author') return Response.json({ id: author })
      return Response.json({}, { status: 401 })
    }
    if (url.includes('/profiles?')) return Response.json([{ id: owner, display_name: 'Avery', bio: null, location: null, avatar_path: null, question_text: 'must not leak' }])
    if (url.includes('/soul_questions?')) {
      if (url.includes(`owner_id=eq.${author}`)) return Response.json([])
      if (init?.method === 'DELETE') return new Response(null, { status: 204 })
      if (init?.method === 'POST' && JSON.parse(String(init.body)).owner_id !== owner) return Response.json({}, { status: 403 })
      return Response.json([{ id: questionId, question_text: 'A private question', created_at: '2026-10-01T00:00:00Z', owner_id: owner, match_score: 0.9 }])
    }
    return Response.json({}, { status: 404 })
  }) as typeof fetch
}

async function makeApp(calls: string[]) {
  const app = Fastify({ logger: false })
  await app.register(async api => registerAccountRoutes(api, config, mockFetch(calls)), { prefix: '/api/v1' })
  return app
}

describe('private account API', () => {
  it('rejects missing and invalid tokens before reading data', async () => {
    const calls: string[] = []
    const app = await makeApp(calls)
    const missing = await app.inject({ method: 'GET', url: '/api/v1/soul-questions' })
    const invalid = await app.inject({ method: 'GET', url: '/api/v1/soul-questions', headers: { authorization: 'Bearer invalid' } })
    expect(missing.statusCode).toBe(401)
    expect(invalid.statusCode).toBe(401)
    expect(calls.some(call => call.includes('/rest/v1/'))).toBe(false)
    await app.close()
  })

  it('scopes question reads to the verified owner and returns only owner fields', async () => {
    const calls: string[] = []
    const app = await makeApp(calls)
    const own = await app.inject({ method: 'GET', url: '/api/v1/soul-questions', headers: { authorization: 'Bearer owner' } })
    const other = await app.inject({ method: 'GET', url: '/api/v1/soul-questions', headers: { authorization: 'Bearer author' } })
    expect(own.statusCode).toBe(200)
    expect(own.json()).toEqual({ data: [{ id: questionId, title: 'A private question', createdAt: '2026-10-01T00:00:00Z' }] })
    expect(own.headers['cache-control']).toBe('private, no-store')
    expect(other.json()).toEqual({ data: [] })
    expect(calls.some(call => call.includes(`owner_id=eq.${owner}`))).toBe(true)
    expect(calls.some(call => call.includes(`owner_id=eq.${author}`))).toBe(true)
    await app.close()
  })

  it('keeps Soul Questions out of profile responses and ignores supplied owner IDs', async () => {
    const calls: string[] = []
    const app = await makeApp(calls)
    const profile = await app.inject({ method: 'GET', url: '/api/v1/me', headers: { authorization: 'Bearer owner' } })
    const created = await app.inject({ method: 'POST', url: '/api/v1/soul-questions', headers: { authorization: 'Bearer owner' }, payload: { id: questionId, text: 'A private question', owner_id: author } })
    expect(profile.json()).toEqual({ data: { id: owner, name: 'Avery', bio: '', location: '', avatarPath: null } })
    expect(JSON.stringify(profile.json())).not.toContain('private question')
    expect(created.statusCode).toBe(201)
    expect(created.json().data).not.toHaveProperty('owner_id')
    await app.close()
  })
})
