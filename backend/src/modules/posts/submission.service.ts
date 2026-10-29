import type { PostSubmission, SubmitSpacePost } from '@scripture-hero/contracts'
import type { SpaceRepository } from '../spaces/model.js'
import type { PostSubmissionRepository } from './submission.repository.js'
import { AppError, notFound } from '../../shared/errors.js'
import { GLOBAL_SPACE_ID } from '../../shared/supabase.js'

export class PostSubmissionService {
  constructor(private readonly spaces: SpaceRepository, private readonly submissions: PostSubmissionRepository) {}
  async submit(userId: string, spaceId: string, input: SubmitSpacePost): Promise<PostSubmission> {
    const space = await this.spaces.find(spaceId, userId)
    if (!space) throw notFound('This Space could not be found.')
    if (spaceId !== GLOBAL_SPACE_ID && space.membership !== 'active')
      throw new AppError(403, 'space_membership_required', 'Join this Space before sharing an insight there.')
    const receipt = await this.submissions.submit(userId, spaceId, input)
    return { ...receipt, space: { id: space.id, name: space.name, visibility: space.visibility } }
  }
}
