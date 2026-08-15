import type { FastifyReply, FastifyRequest } from 'fastify'
import type { PostService } from '../services/post.service.js'

export class PostController {
  constructor(private readonly postService: PostService) {}

  getFeed = async (_request: FastifyRequest, reply: FastifyReply) => {
    const posts = await this.postService.getFeed()
    return reply.send({ data: posts })
  }
}
