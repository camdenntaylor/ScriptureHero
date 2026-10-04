import type { FastifyReply, FastifyRequest } from 'fastify'
import { currentUser } from '../../shared/auth.js'
import { toPageRequest } from '../../shared/pagination.js'
import { toPostResponse } from '../posts/controller.js'
import type { SavedPostRecord } from './model.js'
import { savedPostParamsSchema, savedPostsQuerySchema } from './schemas.js'
import type { SavedPostService } from './service.js'

export function toSavedPostResponse(saved: SavedPostRecord) {
  return { post: toPostResponse(saved.post), savedAt: saved.savedAt }
}

export class SavedPostController {
  constructor(private readonly service: SavedPostService) {}

  list = async (request: FastifyRequest) => {
    const query = savedPostsQuerySchema.parse(request.query)
    const page = await this.service.list(currentUser(request).id, toPageRequest(query))
    return { data: page.items.map(toSavedPostResponse), nextCursor: page.nextCursor }
  }

  save = async (request: FastifyRequest) => {
    const { postId } = savedPostParamsSchema.parse(request.params)
    const saved = await this.service.save(currentUser(request).id, postId)
    return { data: toSavedPostResponse(saved) }
  }

  unsave = async (request: FastifyRequest, reply: FastifyReply) => {
    const { postId } = savedPostParamsSchema.parse(request.params)
    await this.service.unsave(currentUser(request).id, postId)
    return reply.status(204).send()
  }
}
