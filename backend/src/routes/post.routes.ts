import type { FastifyInstance } from 'fastify'
import type { PostController } from '../controllers/post.controller.js'

export async function registerPostRoutes(app: FastifyInstance, controller: PostController) {
  app.get('/posts', controller.getFeed)
}
