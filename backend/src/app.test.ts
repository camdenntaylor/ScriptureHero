import { describe, expect, it } from 'vitest'
import { buildApp } from './app.js'

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
})
