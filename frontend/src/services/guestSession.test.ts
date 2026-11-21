import { afterEach, describe, expect, it, vi } from 'vitest'
import { endGuestSession, guestSession, setGuestPhoto, startGuestSession } from './guestSession'
import { createGuestSandbox, GuestError } from './guestSandbox'
import { createMyQuestion, getMyProfile, listMyQuestions, saveMyProfile, uploadAvatar, deleteMyQuestion } from './accountApi'
import { changeMembership, createSpace, getInsight, getPublicProfile, getSpace, listMembers, listPostingSpaces, listProfilePosts, listSpacePosts, listSpaces, searchCommunity, submitSpacePost } from './communityApi'
import { GLOBAL_SPACE_ID } from '../models/postDestination'
import type { AccountProfile } from './accountApi'

const getSession = vi.hoisted(() => vi.fn(() => { throw new Error('Guest must never request real credentials') }))
vi.mock('./supabase', () => ({ supabase: { auth: { getSession } } }))

afterEach(() => { endGuestSession(); vi.restoreAllMocks(); vi.unstubAllGlobals() })

describe('disposable guest account through the application service boundary', () => {
  it('provides a sample profile and private questions without authentication or network calls', async () => {
    const fetcher = vi.fn(() => { throw new Error('Unexpected network request') })
    vi.stubGlobal('fetch', fetcher)
    startGuestSession()
    const profile = await getMyProfile()
    expect(profile.name).toBe('Avery Guest')
    expect(await listMyQuestions()).toHaveLength(3)
    await saveMyProfile({ name: 'Tester', location: 'Here', bio: 'Temporary biography' })
    const id = crypto.randomUUID()
    await createMyQuestion('A private test question', id)
    expect((await getMyProfile()).name).toBe('Tester')
    expect((await listMyQuestions())[0]?.title).toBe('A private test question')
    await deleteMyQuestion(id)
    expect(await listMyQuestions()).toHaveLength(3)
    expect(fetcher).not.toHaveBeenCalled()
    expect(getSession).not.toHaveBeenCalled()
  })

  it('discards changes and isolates each visitor, including detached response objects', async () => {
    const first = startGuestSession()
    const initial = await getMyProfile()
    initial.name = 'Mutated response'
    expect((await getMyProfile()).name).toBe('Avery Guest')
    await saveMyProfile({ name: 'Tester', location: '', bio: '' })
    await createMyQuestion('Only in the first visit', crypto.randomUUID())
    const second = createGuestSandbox()
    expect((second.request('/me') as AccountProfile).name).toBe('Avery Guest')
    expect(JSON.stringify(second.request('/soul-questions'))).not.toContain('Only in the first visit')
    expect((first.request('/me') as AccountProfile).name).toBe('Tester')
    endGuestSession()
    expect(guestSession()).toBeNull()
    startGuestSession()
    expect((await getMyProfile()).id).not.toBe(initial.id)
    expect((await getMyProfile()).name).toBe('Avery Guest')
    expect(await listMyQuestions()).toHaveLength(3)
  })

  it('supports Spaces, search, profiles, invitations, member management, and temporary creation', async () => {
    startGuestSession()
    const spaces = (await listSpaces(true)).items
    const owned = spaces.find(s => s.name === 'Quiet mornings')!
    const invited = spaces.find(s => s.membership === 'invited')!
    await expect(listSpacePosts(invited.id)).rejects.toMatchObject({ code: 'forbidden', status: 403 })
    await expect(submitSpacePost(invited.id, { id: crypto.randomUUID(), body: 'Cannot post yet' })).rejects.toMatchObject({ code: 'forbidden' })
    expect((await changeMembership(invited.id, 'accept')).membership).toBe('active')
    expect((await listPostingSpaces()).items.some(s => s.id === invited.id)).toBe(true)
    const member = (await listMembers(owned.id)).items.find(m => m.status === 'requested')!
    await changeMembership(owned.id, 'approve', member.user.id)
    expect((await listMembers(owned.id)).items.find(m => m.user.id === member.user.id)?.status).toBe('active')
    const search = await searchCommunity('Amara', 'users')
    const person = search.users.items[0]!
    expect((await getPublicProfile(person.id)).name).toBe('Amara Okafor')
    expect((await listProfilePosts(person.id, false)).items.length).toBeGreaterThan(0)
    const input = { id: crypto.randomUUID(), name: 'Tester circle', description: 'Only this visit', visibility: 'private' as const }
    const created = await createSpace(input)
    expect(await createSpace(input)).toEqual(created)
    await changeMembership(created.id, 'invite', person.id)
    expect((await listMembers(created.id)).items.some(m => m.user.id === person.id && m.status === 'invited')).toBe(true)
    expect((await getSpace(created.id)).ownerId).toBe((await getMyProfile()).id)
    startGuestSession()
    await expect(getSpace(created.id)).rejects.toMatchObject({ code: 'not_found' })
    // Seeded deep links still work after refresh.
    expect((await getSpace(owned.id)).name).toBe('Quiet mornings')
  })

  it('keeps submissions pending, retryable, private to their owner, and out of search', async () => {
    startGuestSession()
    const input = { id: crypto.randomUUID(), body: 'My temporary insight that awaits review' }
    const receipt = await submitSpacePost(GLOBAL_SPACE_ID, input)
    expect(receipt.status).toBe('pending_moderation')
    expect(await submitSpacePost(GLOBAL_SPACE_ID, input)).toEqual(receipt)
    const profile = await getMyProfile()
    expect((await listProfilePosts(profile.id, true)).items.filter(p => p.id === input.id)).toHaveLength(1)
    expect((await getInsight(input.id)).status).toBe('pending_moderation')
    expect((await listProfilePosts(profile.id, false)).items.some(p => p.id === input.id)).toBe(false)
    expect((await listSpacePosts(GLOBAL_SPACE_ID)).items.some(p => p.id === input.id)).toBe(false)
    expect((await searchCommunity('My temporary insight', 'all')).posts.items).toEqual([])
    await expect(submitSpacePost(GLOBAL_SPACE_ID, { ...input, body: 'Changed body' })).rejects.toMatchObject({ code: 'conflict' })
    startGuestSession()
    await expect(getInsight(input.id)).rejects.toMatchObject({ code: 'not_found' })
  })

  it('never includes raw Soul Questions or derived data in public or author-facing responses', async () => {
    startGuestSession()
    const secret = 'PRIVATE_SENTINEL_QUESTION'
    await createMyQuestion(secret, crypto.randomUUID())
    const owner = await getMyProfile()
    const owned = (await listSpaces(true)).items.find(s => s.ownerId === owner.id)!
    const responses = [
      await searchCommunity(secret, 'all'), await searchCommunity('', 'all'),
      await getPublicProfile(owner.id), await listProfilePosts(owner.id, false),
      await listSpacePosts(owned.id), await listMembers(owned.id),
    ]
    const json = JSON.stringify(responses)
    for (const field of [secret, 'questionId', 'questionText', 'matchScore', 'embedding', 'soulQuestions']) expect(json).not.toContain(field)
  })

  it('previews photos locally, validates files, and revokes previews on replacement and exit', async () => {
    startGuestSession()
    const create = vi.spyOn(URL, 'createObjectURL').mockReturnValueOnce('blob:first').mockReturnValueOnce('blob:second')
    const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    const photo = new File(['sample'], 'avatar.png', { type: 'image/png' })
    expect((await uploadAvatar(photo, (await getMyProfile()).id)).avatarPath).toBe('blob:first')
    expect(setGuestPhoto(photo).avatarPath).toBe('blob:second')
    expect(revoke).toHaveBeenCalledWith('blob:first')
    await expect(uploadAvatar(new File(['bad'], 'bad.svg', { type: 'image/svg+xml' }), 'guest')).rejects.toThrow('JPG, PNG, or WebP')
    expect(create).toHaveBeenCalledTimes(2)
    endGuestSession()
    expect(revoke).toHaveBeenCalledWith('blob:second')
  })

  it('fails closed for unsupported operations, invalid input, and cancelled reads', async () => {
    const sandbox = startGuestSession()
    expect(() => sandbox.request('/unsupported', { method: 'POST', body: '{}' })).toThrow(GuestError)
    await expect(saveMyProfile({ name: '', location: '', bio: '' })).rejects.toThrow('Check your profile')
    await expect(createSpace({ id: crypto.randomUUID(), name: '', description: '', visibility: 'private' })).rejects.toThrow('Check your Circle')
    const controller = new AbortController()
    controller.abort()
    await expect(listSpaces(true, undefined, controller.signal)).rejects.toMatchObject({ name: 'AbortError' })
  })
})
