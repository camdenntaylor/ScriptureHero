import { describe, expect, it } from 'vitest'
import { buildApp } from './application.js'

describe('API', () => {
  it('reports its health', async () => {
    const app = await buildApp({ HOST: '127.0.0.1', PORT: 3000, FRONTEND_ORIGIN: 'http://localhost:5173' })
    const response = await app.inject({ method: 'GET', url: '/api/health' })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ status: 'ok' })
    await app.close()
  })

  it('returns the initial feed', async () => {
    const app = await buildApp({ HOST: '127.0.0.1', PORT: 3000, FRONTEND_ORIGIN: 'http://localhost:5173' })
    const response = await app.inject({ method: 'GET', url: '/api/posts' })

    expect(response.statusCode).toBe(200)
    expect(response.json().data).toHaveLength(2)
    await app.close()
  })

  it('allows profile updates from the configured frontend origin', async () => {
    const app = await buildApp({ HOST: '127.0.0.1', PORT: 3000, FRONTEND_ORIGIN: 'http://localhost:5173' })
    const response = await app.inject({
      method: 'OPTIONS',
      url: '/api/v1/me',
      headers: {
        origin: 'http://localhost:5173',
        'access-control-request-method': 'PATCH',
        'access-control-request-headers': 'authorization,content-type',
      },
    })

    expect(response.statusCode).toBe(204)
    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173')
    expect(response.headers['access-control-allow-methods']).toContain('PATCH')
    expect(response.headers['access-control-allow-headers']).toContain('authorization,content-type')
    await app.close()
  })
})
