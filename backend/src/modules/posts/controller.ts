import type { FastifyReply, FastifyRequest } from 'fastify'
import { currentUser } from '../../shared/auth.js'
import { toPageRequest } from '../../shared/pagination.js'
import type { PostRecord } from './model.js'
import { createPostSchema, feedQuerySchema } from './schemas.js'
import type { PostService } from './service.js'

// Explicit response contract: never serialize a repository row directly.
export function toPostResponse(post: PostRecord) {
  return {
    id: post.id,
    author: { id: post.author.id, displayName: post.author.displayName },
    title: post.title,
    body: post.body,
    scriptureReference: post.scriptureReference,
    createdAt: post.createdAt,
  }
}

export class PostController {
  constructor(private readonly service: PostService) {}

  getFeed = async (request: FastifyRequest) => {
    const query = feedQuerySchema.parse(request.query)
    const page = await this.service.listFeed({
      ...toPageRequest(query),
      ...(query.authorId ? { authorId: query.authorId } : {}),
    })
    return { data: page.items.map(toPostResponse), nextCursor: page.nextCursor }
  }

  publish = async (request: FastifyRequest, reply: FastifyReply) => {
    const input = createPostSchema.parse(request.body)
    const post = await this.service.publish(currentUser(request).id, input)
    return reply.status(201).send({ data: toPostResponse(post) })
  }
}
