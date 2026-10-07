import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { buildApp } from './application.js'
import { createInMemoryDependencies } from './dependencies.js'
import type { Authenticator } from './shared/auth.js'
import { InMemoryDatabase } from './shared/in-memory-database.js'

const alice = '11111111-1111-4111-8111-111111111111'
const bob = '22222222-2222-4222-8222-222222222222'
const carol = '33333333-3333-4333-8333-333333333333'
const nobody = '99999999-9999-4999-8999-999999999999'

const authenticator: Authenticator = {
  async verify(token) {
    return token.startsWith('token-') ? { id: token.slice('token-'.length) } : null
  },
}
const as = (userId: string) => ({ authorization: `Bearer token-${userId}` })

type App = Awaited<ReturnType<typeof buildApp>>
let app: App

beforeEach(async () => {
  let time = Date.parse('2026-10-01T12:00:00.000Z')
  const db = new InMemoryDatabase(() => new Date((time += 1000)))
  db.addProfile(alice, 'Alice')
  db.addProfile(bob, 'Bob')
  db.addProfile(carol, 'Carol')
  app = await buildApp(
    { HOST: '127.0.0.1', PORT: 3000, FRONTEND_ORIGIN: 'http://localhost:5173' },
    createInMemoryDependencies(db, authenticator),
  )
})

afterEach(() => app.close())

async function publish(userId: string, body: string, extra: Record<string, string> = {}) {
  const response = await app.inject({
    method: 'POST',
    url: '/api/v1/posts',
    headers: as(userId),
    payload: { body, ...extra },
  })
  expect(response.statusCode).toBe(201)
  return response.json().data as { id: string }
}

async function save(userId: string, postId: string) {
  return app.inject({ method: 'PUT', url: `/api/v1/saved-posts/${postId}`, headers: as(userId) })
}

async function startConversation(userId: string, postId: string) {
  return app.inject({ method: 'POST', url: '/api/v1/conversations', headers: as(userId), payload: { postId } })
}

describe('Global feed and publishing', () => {
  it('lets a signed-out visitor read the feed, newest first', async () => {
    await publish(alice, 'first')
    await publish(bob, 'second')

    const response = await app.inject({ method: 'GET', url: '/api/v1/posts' })

    expect(response.statusCode).toBe(200)
    const { data, nextCursor } = response.json()
    expect(data.map((p: { body: string }) => p.body)).toEqual(['second', 'first'])
    expect(data[0].author).toEqual({ id: bob, displayName: 'Bob' })
    expect(nextCursor).toBeNull()
  })

  it('returns only explicit public post fields', async () => {
    await publish(alice, 'hello', { title: 'A title', scriptureReference: 'John 3:16' })

    const [post] = (await app.inject({ method: 'GET', url: '/api/v1/posts' })).json().data
    expect(Object.keys(post).sort()).toEqual(
      ['author', 'body', 'createdAt', 'id', 'scriptureReference', 'title'].sort(),
    )
    expect(Object.keys(post.author).sort()).toEqual(['displayName', 'id'])
  })

  it('pages through the feed with a cursor', async () => {
    for (const body of ['one', 'two', 'three', 'four', 'five']) await publish(alice, body)

    const first = (await app.inject({ method: 'GET', url: '/api/v1/posts?limit=2' })).json()
    expect(first.data.map((p: { body: string }) => p.body)).toEqual(['five', 'four'])
    expect(first.nextCursor).toEqual(expect.any(String))

    const second = (
      await app.inject({ method: 'GET', url: `/api/v1/posts?limit=2&cursor=${first.nextCursor}` })
    ).json()
    expect(second.data.map((p: { body: string }) => p.body)).toEqual(['three', 'two'])

    const last = (
      await app.inject({ method: 'GET', url: `/api/v1/posts?limit=2&cursor=${second.nextCursor}` })
    ).json()
    expect(last.data.map((p: { body: string }) => p.body)).toEqual(['one'])
    expect(last.nextCursor).toBeNull()
  })

  it('rejects a malformed cursor and an out-of-range limit', async () => {
    const cursor = await app.inject({ method: 'GET', url: '/api/v1/posts?cursor=nonsense' })
    expect(cursor.statusCode).toBe(400)
    expect(cursor.json().error.code).toBe('invalid_cursor')

    const limit = await app.inject({ method: 'GET', url: '/api/v1/posts?limit=500' })
    expect(limit.statusCode).toBe(400)
    expect(limit.json().error.code).toBe('validation_error')
  })

  it('requires sign-in to publish', async () => {
    const anonymous = await app.inject({ method: 'POST', url: '/api/v1/posts', payload: { body: 'hi' } })
    expect(anonymous.statusCode).toBe(401)
    expect(anonymous.json().error.code).toBe('unauthenticated')

    const badToken = await app.inject({
      method: 'POST',
      url: '/api/v1/posts',
      headers: { authorization: 'Bearer forged' },
      payload: { body: 'hi' },
    })
    expect(badToken.statusCode).toBe(401)
  })

  it('validates the post body and ignores a spoofed author', async () => {
    const empty = await app.inject({
      method: 'POST',
      url: '/api/v1/posts',
      headers: as(alice),
      payload: { body: '   ' },
    })
    expect(empty.statusCode).toBe(400)

    const spoofed = await app.inject({
      method: 'POST',
      url: '/api/v1/posts',
      headers: as(alice),
      payload: { body: 'hi', authorId: bob },
    })
    expect(spoofed.statusCode).toBe(400)
  })

  it('shows a new post immediately in the feed and on the author profile filter', async () => {
    await publish(bob, 'from bob')
    const mine = await publish(alice, 'from alice')

    const filtered = (await app.inject({ method: 'GET', url: `/api/v1/posts?authorId=${alice}` })).json()
    expect(filtered.data.map((p: { id: string }) => p.id)).toEqual([mine.id])
  })

  it('asks a user without a profile to finish setup', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/posts',
      headers: as(nobody),
      payload: { body: 'hi' },
    })
    expect(response.statusCode).toBe(409)
    expect(response.json().error.code).toBe('profile_required')
  })
})

describe('Saved posts', () => {
  it('requires sign-in for every saved-post route', async () => {
    const post = await publish(alice, 'hello')
    for (const [method, url] of [
      ['GET', '/api/v1/saved-posts'],
      ['PUT', `/api/v1/saved-posts/${post.id}`],
      ['DELETE', `/api/v1/saved-posts/${post.id}`],
    ] as const) {
      expect((await app.inject({ method, url })).statusCode).toBe(401)
    }
  })

  it('saves idempotently and keeps the list private to the saver', async () => {
    const post = await publish(alice, 'hello')

    const first = await save(bob, post.id)
    const again = await save(bob, post.id)
    expect(first.statusCode).toBe(200)
    expect(again.json().data.savedAt).toBe(first.json().data.savedAt)

    const mine = (await app.inject({ method: 'GET', url: '/api/v1/saved-posts', headers: as(bob) })).json()
    expect(mine.data).toHaveLength(1)
    expect(mine.data[0].post.id).toBe(post.id)

    for (const other of [alice, carol]) {
      const theirs = (await app.inject({ method: 'GET', url: '/api/v1/saved-posts', headers: as(other) })).json()
      expect(theirs.data).toEqual([])
    }
  })

  it('returns 404 for a post that does not exist', async () => {
    const response = await save(bob, '55555555-5555-4555-8555-555555555555')
    expect(response.statusCode).toBe(404)
    expect(response.json().error.code).toBe('not_found')
  })

  it('unsaves, and unsaving something not saved is fine', async () => {
    const post = await publish(alice, 'hello')
    await save(bob, post.id)

    const removed = await app.inject({ method: 'DELETE', url: `/api/v1/saved-posts/${post.id}`, headers: as(bob) })
    const repeat = await app.inject({ method: 'DELETE', url: `/api/v1/saved-posts/${post.id}`, headers: as(bob) })
    expect(removed.statusCode).toBe(204)
    expect(repeat.statusCode).toBe(204)

    const mine = (await app.inject({ method: 'GET', url: '/api/v1/saved-posts', headers: as(bob) })).json()
    expect(mine.data).toEqual([])
  })

  it('never tells the author, or anyone else, that a post was saved', async () => {
    const post = await publish(alice, 'hello')
    await save(bob, post.id)

    const feed = await app.inject({ method: 'GET', url: '/api/v1/posts' })
    expect(feed.body).not.toContain('savedAt')
    expect(feed.body).not.toContain(bob)

    const heroes = (await app.inject({ method: 'GET', url: '/api/v1/heroes', headers: as(alice) })).json()
    const conversations = (
      await app.inject({ method: 'GET', url: '/api/v1/conversations', headers: as(alice) })
    ).json()
    expect(heroes.data).toEqual([])
    expect(conversations.data).toEqual([])
  })
})

describe('Scripture Heroes and messages', () => {
  it('lists the authors of saved posts as the saver’s private Heroes', async () => {
    const aliceFirst = await publish(alice, 'a1')
    const aliceSecond = await publish(alice, 'a2')
    const bobPost = await publish(bob, 'b1')
    await save(carol, aliceFirst.id)
    await save(carol, bobPost.id)
    await save(carol, aliceSecond.id)

    const { data } = (await app.inject({ method: 'GET', url: '/api/v1/heroes', headers: as(carol) })).json()

    expect(data.map((h: { hero: { id: string } }) => h.hero.id)).toEqual([alice, bob])
    expect(data[0]).toMatchObject({
      hero: { id: alice, displayName: 'Alice' },
      savedPostCount: 2,
      latestSavedPost: { id: aliceSecond.id, conversationId: null },
    })
  })

  it('excludes your own posts from your Heroes', async () => {
    const mine = await publish(alice, 'mine')
    await save(alice, mine.id)

    const { data } = (await app.inject({ method: 'GET', url: '/api/v1/heroes', headers: as(alice) })).json()
    expect(data).toEqual([])
  })

  it('requires a saved post, and not your own, to start a conversation', async () => {
    const post = await publish(alice, 'hello')

    const unsaved = await startConversation(bob, post.id)
    expect(unsaved.statusCode).toBe(403)
    expect(unsaved.json().error.code).toBe('save_required')

    await save(alice, post.id)
    const own = await startConversation(alice, post.id)
    expect(own.statusCode).toBe(400)
    expect(own.json().error.code).toBe('cannot_message_self')

    const missing = await startConversation(bob, '55555555-5555-4555-8555-555555555555')
    expect(missing.statusCode).toBe(404)

    const anonymous = await app.inject({ method: 'POST', url: '/api/v1/conversations', payload: { postId: post.id } })
    expect(anonymous.statusCode).toBe(401)
  })

  it('creates one conversation per saved post, even on retry', async () => {
    const post = await publish(alice, 'hello')
    await save(bob, post.id)

    const first = await startConversation(bob, post.id)
    const retry = await startConversation(bob, post.id)

    expect(first.statusCode).toBe(201)
    expect(retry.statusCode).toBe(200)
    expect(retry.json().data.id).toBe(first.json().data.id)
    expect(first.json().data).toMatchObject({
      role: 'initiator',
      with: { id: alice, displayName: 'Alice' },
      originPostId: post.id,
    })

    const heroes = (await app.inject({ method: 'GET', url: '/api/v1/heroes', headers: as(bob) })).json()
    expect(heroes.data[0].latestSavedPost.conversationId).toBe(first.json().data.id)
  })

  it('lets the two participants exchange messages in order, and nobody else', async () => {
    const post = await publish(alice, 'hello')
    await save(bob, post.id)
    const conversationId = (await startConversation(bob, post.id)).json().data.id as string
    const url = `/api/v1/conversations/${conversationId}/messages`

    const sent = await app.inject({ method: 'POST', url, headers: as(bob), payload: { body: 'Thank you for this.' } })
    const reply = await app.inject({ method: 'POST', url, headers: as(alice), payload: { body: 'I’m glad it helped.' } })
    expect(sent.statusCode).toBe(201)
    expect(reply.statusCode).toBe(201)
    expect(sent.json().data).toMatchObject({ senderId: bob, conversationId })

    for (const participant of [alice, bob]) {
      const { data } = (await app.inject({ method: 'GET', url, headers: as(participant) })).json()
      expect(data.map((m: { body: string }) => m.body)).toEqual(['Thank you for this.', 'I’m glad it helped.'])
    }

    // The author sees the thread, with the saver as the other person.
    const authorThreads = (
      await app.inject({ method: 'GET', url: '/api/v1/conversations', headers: as(alice) })
    ).json()
    expect(authorThreads.data[0]).toMatchObject({ id: conversationId, role: 'hero', with: { id: bob } })

    const outsiderRead = await app.inject({ method: 'GET', url, headers: as(carol) })
    const outsiderWrite = await app.inject({ method: 'POST', url, headers: as(carol), payload: { body: 'hi' } })
    const anonymous = await app.inject({ method: 'GET', url })
    expect(outsiderRead.statusCode).toBe(404)
    expect(outsiderWrite.statusCode).toBe(404)
    expect(anonymous.statusCode).toBe(401)

    const outsiderThreads = (
      await app.inject({ method: 'GET', url: '/api/v1/conversations', headers: as(carol) })
    ).json()
    expect(outsiderThreads.data).toEqual([])
  })

  it('sends only what the sender wrote and validates messages', async () => {
    const post = await publish(alice, 'hello')
    await save(bob, post.id)
    const conversationId = (await startConversation(bob, post.id)).json().data.id as string
    const url = `/api/v1/conversations/${conversationId}/messages`

    const empty = await app.inject({ method: 'POST', url, headers: as(bob), payload: { body: '  ' } })
    const extra = await app.inject({ method: 'POST', url, headers: as(bob), payload: { body: 'hi', soulQuestion: 'x' } })
    const tooLong = await app.inject({ method: 'POST', url, headers: as(bob), payload: { body: 'x'.repeat(4001) } })
    expect(empty.statusCode).toBe(400)
    expect(extra.statusCode).toBe(400)
    expect(tooLong.statusCode).toBe(400)

    const ok = await app.inject({ method: 'POST', url, headers: as(bob), payload: { body: 'Hello' } })
    expect(Object.keys(ok.json().data).sort()).toEqual(['body', 'conversationId', 'createdAt', 'id', 'senderId'])
  })

  it('pages through a long thread oldest first', async () => {
    const post = await publish(alice, 'hello')
    await save(bob, post.id)
    const conversationId = (await startConversation(bob, post.id)).json().data.id as string
    const url = `/api/v1/conversations/${conversationId}/messages`
    for (const body of ['m1', 'm2', 'm3']) {
      await app.inject({ method: 'POST', url, headers: as(bob), payload: { body } })
    }

    const first = (await app.inject({ method: 'GET', url: `${url}?limit=2`, headers: as(bob) })).json()
    expect(first.data.map((m: { body: string }) => m.body)).toEqual(['m1', 'm2'])
    const second = (
      await app.inject({ method: 'GET', url: `${url}?limit=2&cursor=${first.nextCursor}`, headers: as(bob) })
    ).json()
    expect(second.data.map((m: { body: string }) => m.body)).toEqual(['m3'])
    expect(second.nextCursor).toBeNull()
  })

  it('keeps message text out of error responses', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/conversations/not-a-uuid/messages',
      headers: as(bob),
      payload: { body: 'private words' },
    })
    expect(response.statusCode).toBe(400)
    expect(response.body).not.toContain('private words')
  })
})
