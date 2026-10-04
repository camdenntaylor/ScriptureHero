import { createInMemoryDependencies, type AppDependencies } from '../dependencies.js'
import type { Authenticator } from './auth.js'
import { InMemoryDatabase } from './in-memory-database.js'

export const devUsers = {
  amara: '11111111-1111-4111-8111-111111111111',
  mateo: '22222222-2222-4222-8222-222222222222',
} as const

// Local-only: `Authorization: Bearer dev:<user id>` signs in as a seeded user.
// This is replaced by Supabase token verification and must never run in production.
const devAuthenticator: Authenticator = {
  async verify(token) {
    const id = token.startsWith('dev:') ? token.slice(4) : null
    return id && Object.values<string>(devUsers).includes(id) ? { id } : null
  },
}

export function createDevDependencies(): AppDependencies {
  const db = new InMemoryDatabase()
  db.addProfile(devUsers.amara, 'Amara')
  db.addProfile(devUsers.mateo, 'Mateo')
  db.posts.push(
    {
      id: '33333333-3333-4333-8333-333333333333',
      authorId: devUsers.amara,
      title: null,
      body: 'Peace did not arrive when every question was answered. It arrived when I trusted that Christ was present with me inside the questions.',
      scriptureReference: 'John 14:27',
      status: 'published',
      createdAt: '2026-10-01T16:30:00.000Z',
    },
    {
      id: '44444444-4444-4444-8444-444444444444',
      authorId: devUsers.mateo,
      title: null,
      body: 'Faith becomes visible when we carry one another’s burdens. Today that looked like listening without rushing to fix anything.',
      scriptureReference: 'Mosiah 18:9',
      status: 'published',
      createdAt: '2026-10-01T21:10:00.000Z',
    },
  )
  return createInMemoryDependencies(db, devAuthenticator)
}
