import type { PostSubmission, SubmitSpacePost } from '@scripture-hero/contracts'
import { postSubmissionSchema } from '@scripture-hero/contracts'
import { AppError, notFound } from '../../shared/errors.js'
import type { InMemoryDatabase } from '../../shared/in-memory-database.js'
import { GLOBAL_SPACE_ID, type ClientSource } from '../../shared/supabase.js'

export interface PostSubmissionRepository {
  submit(userId: string, spaceId: string, input: SubmitSpacePost): Promise<Pick<PostSubmission, 'id' | 'status'>>
}

export class InMemoryPostSubmissionRepository implements PostSubmissionRepository {
  constructor(private readonly db: InMemoryDatabase) {}
  async submit(userId: string, spaceId: string, input: SubmitSpacePost) {
    const space = this.db.spaces.get(spaceId)
    if (!space) throw notFound('This Space could not be found.')
    if (spaceId !== GLOBAL_SPACE_ID && this.db.memberships.get(`${spaceId}:${userId}`)?.status !== 'active')
      throw new AppError(403, 'space_membership_required', 'Join this Space before sharing an insight there.')
    if (!this.db.profiles.has(userId)) throw new AppError(409, 'profile_required', 'Finish setting up your profile first.')
    const existing = this.db.posts.find(p => p.id === input.id)
    if (existing) {
      if (existing.authorId !== userId || (existing.spaceId ?? GLOBAL_SPACE_ID) !== spaceId || existing.body !== input.body || existing.title !== null || existing.scriptureReference !== null)
        throw new AppError(409, 'submission_conflict', 'This submission has changed. Start a new submission.')
      return { id: existing.id, status: existing.status }
    }
    this.db.posts.push({ id: input.id, authorId: userId, spaceId, body: input.body, title: null, scriptureReference: null, status: 'pending_moderation', createdAt: this.db.now() })
    return { id: input.id, status: 'pending_moderation' as const }
  }
}

export class SupabasePostSubmissionRepository implements PostSubmissionRepository {
  constructor(private readonly source: ClientSource) {}
  async submit(_userId: string, spaceId: string, input: SubmitSpacePost) {
    const { data, error } = await this.source.current().rpc('submit_space_post', { p_id: input.id, p_space: spaceId, p_body: input.body })
    if (error?.code === '42501') throw new AppError(403, 'space_membership_required', 'Join this Space before sharing an insight there.')
    if (error?.code === 'P0002') throw notFound('This Space could not be found.')
    if (error?.code === '23503') throw new AppError(409, 'profile_required', 'Finish setting up your profile first.')
    if (error?.code === '23505') throw new AppError(409, 'submission_conflict', 'This submission has changed. Start a new submission.')
    if (error) throw new Error(`Submit post failed (${error.code})`)
    return postSubmissionSchema.pick({ id: true, status: true }).parse(data)
  }
}
