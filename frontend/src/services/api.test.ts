import { afterEach, describe, expect, it, vi } from 'vitest'
import { getFeed } from './api'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('getFeed', () => {
  it('returns posts from the API envelope', async () => {
    const posts = [{
      id: 'post-1',
      author: { id: 'user-1', displayName: 'Amara', location: 'Accra, Ghana' },
      spaceName: 'Global',
      scriptureReference: 'John 14:27',
      body: 'Peace through Christ.',
      createdAt: '2026-08-14T16:30:00.000Z',
      heroCount: 18,
    }]
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: posts }))))

    await expect(getFeed()).resolves.toEqual(posts)
  })
})
