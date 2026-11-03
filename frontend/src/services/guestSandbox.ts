import {
  createSpaceSchema,
  submitSpacePostSchema,
  type Page,
  type PublicProfile,
  type Space,
  type SpaceMember,
  type VisiblePost,
} from '@scripture-hero/contracts'
import { GLOBAL_SPACE_ID } from '../models/postDestination'
import { insights, questions as sampleQuestions } from './prototypeData'
import type { AccountProfile, PrivateQuestion } from './accountApi'

export class GuestError extends Error {
  constructor(message: string, readonly code = 'guest_request_failed', readonly status = 400) {
    super(message)
  }
}

/** A separate, disposable world for one tester. No database, storage, or network access. */
export function createGuestSandbox() {
  const createdAt = new Date().toISOString()
  // Fixture links survive refresh; visitor-created resources intentionally do not.
  const fixtureId = (group: number, index: number) => `${group}0000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`
  let profile: AccountProfile = {
    id: crypto.randomUUID(), name: 'Avery Guest', location: 'Your little corner',
    bio: 'Learning, sharing, and finding a little light along the way.', avatarPath: null,
  }
  const questions: PrivateQuestion[] = sampleQuestions.map(q => ({ id: crypto.randomUUID(), title: q.title, createdAt }))
  const people: PublicProfile[] = insights.map((p, i) => ({
    id: fixtureId(1, i), name: p.author.name, location: p.author.location,
    bio: 'Sharing a little encouragement with the community.', avatarPath: null, createdAt,
  }))
  const spaces: Space[] = [
    { id: GLOBAL_SPACE_ID, name: 'Global', description: 'Uplifting insights from around the world.', visibility: 'public', ownerId: null, createdAt, membership: 'active' },
    { id: fixtureId(2, 0), name: 'Quiet mornings', description: 'A private circle for a little daily encouragement.', visibility: 'private', ownerId: profile.id, createdAt, membership: 'active' },
    { id: fixtureId(2, 1), name: 'Everyday kindness', description: 'Finding small ways to care for each other.', visibility: 'public', ownerId: people[0]!.id, createdAt, membership: 'none' },
    { id: fixtureId(2, 2), name: 'Friends around the table', description: 'A private place to connect with friends.', visibility: 'private', ownerId: people[1]!.id, createdAt, membership: 'invited' },
  ]
  const members = new Map<string, SpaceMember[]>([[spaces[1]!.id, [
    { user: people[0]!, status: 'active', createdAt },
    { user: people[1]!, status: 'requested', createdAt },
  ]]])
  const posts: VisiblePost[] = insights.map((post, i) => ({
    id: fixtureId(3, i), title: post.title, body: post.body, scriptureReference: post.scripture,
    createdAt, author: people[i]!, space: destination(spaces[0]!), status: 'published',
  }))
  posts.unshift({
    id: fixtureId(4, 0), title: 'A little light for today.',
    body: 'Today I am making room to listen, learn, and notice the kindness around me.',
    scriptureReference: 'Matthew 5:16', createdAt, author: publicProfile(),
    space: destination(spaces[0]!), status: 'published',
  })
  posts.push({
    id: fixtureId(4, 1), title: 'A quiet moment together.', body: 'Grateful for a little circle of encouragement today.',
    scriptureReference: null, createdAt, author: people[0]!, space: destination(spaces[1]!), status: 'published',
  })

  function publicProfile(): PublicProfile { return { ...profile, createdAt } }
  function destination(space: Space) { return { id: space.id, name: space.name, visibility: space.visibility } }
  function fail(message: string, code = 'guest_request_failed', status = 400): never { throw new GuestError(message, code, status) }
  function findSpace(id: string) { return spaces.find(s => s.id === id) ?? fail('This sample Space is unavailable.', 'not_found', 404) }
  function canRead(space: Space) { return space.visibility === 'public' || space.membership === 'active' }
  function readablePosts() { return posts.filter(p => p.status === 'published' && canRead(findSpace(p.space.id))) }
  function page<T>(items: T[], cursor: string | null): Page<T> {
    const start = cursor && /^\d+$/.test(cursor) ? Number(cursor) : 0
    return { items: items.slice(start, start + 20), nextCursor: start + 20 < items.length ? String(start + 20) : null }
  }

  function handle(path: string, init: RequestInit = {}): unknown {
    if (init.signal?.aborted) throw new DOMException('Request cancelled.', 'AbortError')
    const url = new URL(path, 'https://guest.invalid')
    const parts = url.pathname.split('/').filter(Boolean)
    const method = init.method ?? 'GET'
    const cursor = url.searchParams.get('cursor')
    const input = init.body ? JSON.parse(String(init.body)) as Record<string, unknown> : {}

    if (url.pathname === '/me') {
      if (method === 'PATCH') {
        if (typeof input.name !== 'string' || !input.name.trim() || input.name.trim().length > 80 ||
            typeof input.location !== 'string' || input.location.trim().length > 80 ||
            typeof input.bio !== 'string' || input.bio.trim().length > 280) fail('Check your profile details.')
        profile = { ...profile, name: (input.name as string).trim(), location: (input.location as string).trim(), bio: (input.bio as string).trim() }
        for (const post of posts) if (post.author.id === profile.id) post.author = publicProfile()
      } else if (method !== 'GET') fail('This guest action is unavailable.')
      return profile
    }
    if (parts[0] === 'soul-questions') {
      if (method === 'GET' && parts.length === 1) return questions
      if (method === 'POST' && parts.length === 1) {
        if (typeof input.text !== 'string' || !input.text.trim() || input.text.trim().length > 500 || typeof input.id !== 'string') fail('Enter a question up to 500 characters.')
        const previous = questions.find(q => q.id === input.id)
        if (previous) return previous
        const question = { id: input.id as string, title: (input.text as string).trim(), createdAt: new Date().toISOString() }
        questions.unshift(question)
        return question
      }
      if (method === 'DELETE' && parts.length === 2) {
        const index = questions.findIndex(q => q.id === parts[1])
        if (index >= 0) questions.splice(index, 1)
        return undefined
      }
    }
    if (url.pathname === '/me/posting-spaces' && method === 'GET') return page(spaces.filter(s => s.membership === 'active' || s.id === GLOBAL_SPACE_ID), cursor)
    if (url.pathname === '/me/posts' && method === 'GET') return page(posts.filter(p => p.author.id === profile.id && canRead(findSpace(p.space.id))), cursor)
    if (url.pathname === '/spaces') {
      if (method === 'GET') return page(spaces.filter(s => url.searchParams.get('mine') !== 'true' || s.membership !== 'none'), cursor)
      if (method === 'POST') {
        const parsed = createSpaceSchema.safeParse(input)
        if (!parsed.success) fail('Check your Space name and description.')
        const details = parsed.data!
        const previous = spaces.find(s => s.id === details.id)
        if (previous) {
          if (previous.ownerId !== profile.id || previous.name !== details.name || previous.description !== details.description || previous.visibility !== details.visibility) fail('This Space ID is already in use.', 'conflict', 409)
          return previous
        }
        const space: Space = { ...details, ownerId: profile.id, membership: 'active', createdAt: new Date().toISOString() }
        spaces.push(space)
        return space
      }
    }
    if (parts[0] === 'spaces' && parts[1]) {
      const space = findSpace(parts[1])
      if (parts.length === 2 && method === 'GET') return space
      if (parts[2] === 'posts') {
        if (method === 'GET') {
          if (!canRead(space)) fail('Join this private Space to read its posts.', 'forbidden', 403)
          return page(readablePosts().filter(p => p.space.id === space.id), cursor)
        }
        if (method === 'POST') {
          if (space.membership !== 'active' && space.id !== GLOBAL_SPACE_ID) fail('Join this Space before sharing an insight.', 'forbidden', 403)
          const parsed = submitSpacePostSchema.safeParse(input)
          if (!parsed.success) fail('Enter an insight up to 1,500 characters.')
          const details = parsed.data!
          const previous = posts.find(p => p.id === details.id)
          if (previous && (previous.author.id !== profile.id || previous.body !== details.body || previous.space.id !== space.id)) fail('This submission ID is already in use.', 'conflict', 409)
          const post: VisiblePost = previous ?? {
            ...details, title: null, scriptureReference: null, createdAt: new Date().toISOString(),
            author: publicProfile(), space: destination(space), status: 'pending_moderation',
          }
          if (!previous) posts.unshift(post)
          return { id: post.id, status: post.status, space: post.space }
        }
      }
      if (parts[2] === 'members' && method === 'GET') {
        if (space.ownerId !== profile.id) fail('Only the Space owner can manage members.', 'forbidden', 403)
        return page([{ user: publicProfile(), status: 'active' as const, createdAt }, ...(members.get(space.id) ?? [])], cursor)
      }
      if (parts[2] === 'memberships' && method === 'POST') {
        const { action, userId } = input
        if (userId && userId !== profile.id) {
          if (space.ownerId !== profile.id) fail('Only the Space owner can manage members.', 'forbidden', 403)
          const user = people.find(p => p.id === userId) ?? fail('Choose a sample member.')
          const list = members.get(space.id) ?? []
          const member = list.find(m => m.user.id === user.id)
          if (action === 'invite' && !member) list.push({ user, status: 'invited', createdAt })
          else if (action === 'approve' && member?.status === 'requested') member.status = 'active'
          else if (action === 'decline' && member && member.status !== 'active') list.splice(list.indexOf(member), 1)
          else if (!(action === 'invite' && member)) fail('This membership action is unavailable.')
          members.set(space.id, list)
        } else if (action === 'join' && space.membership === 'none') space.membership = space.visibility === 'public' ? 'active' : 'requested'
        else if (action === 'accept' && space.membership === 'invited') space.membership = 'active'
        else if (action === 'decline' && ['invited', 'requested'].includes(space.membership)) space.membership = 'none'
        else fail('This membership action is unavailable.')
        return space
      }
    }
    if (parts[0] === 'profiles' && parts[1] && method === 'GET') {
      const person = parts[1] === profile.id ? publicProfile() : people.find(p => p.id === parts[1])
      if (!person) fail('This sample member is unavailable.', 'not_found', 404)
      if (parts.length === 2) return person
      if (parts[2] === 'posts') return page(readablePosts().filter(p => p.author.id === person!.id), cursor)
    }
    if (parts[0] === 'insights' && method === 'GET') {
      return posts.find(p => p.id === parts[1] && canRead(findSpace(p.space.id)) && (p.status === 'published' || p.author.id === profile.id)) ?? fail('This sample insight is unavailable.', 'not_found', 404)
    }
    if (url.pathname === '/explore' && method === 'GET') {
      const term = (url.searchParams.get('q') ?? '').trim().toLowerCase()
      const kind = url.searchParams.get('kind') ?? 'all'
      const matches = (...values: (string | null)[]) => values.some(v => v?.toLowerCase().includes(term))
      return {
        users: page(kind === 'all' || kind === 'users' ? [publicProfile(), ...people].filter(p => matches(p.name, p.bio, p.location)) : [], cursor),
        spaces: page(kind === 'all' || kind === 'spaces' ? spaces.filter(s => matches(s.name, s.description)) : [], cursor),
        posts: page(kind === 'all' || kind === 'posts' ? readablePosts().filter(p => matches(p.title, p.body, p.scriptureReference)) : [], cursor),
      }
    }
    // Never fall through to a live API for an unsupported guest operation.
    fail('This action is unavailable in the guest preview.', 'guest_action_unavailable', 404)
  }

  return {
    request(path: string, init?: RequestInit): unknown { return structuredClone(handle(path, init)) },
    setAvatar(path: string) {
      profile = { ...profile, avatarPath: path }
      for (const post of posts) if (post.author.id === profile.id) post.author = publicProfile()
      return { ...profile }
    },
  }
}
