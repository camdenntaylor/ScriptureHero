import type { FastifyInstance } from 'fastify'
import type { RequireUser } from '../../shared/auth.js'
import type { PostController } from './controller.js'

export async function registerPostRoutes(app: FastifyInstance, controller: PostController, requireUser: RequireUser) {
  // The Global feed is public so signed-out visitors can preview it.
  app.get('/posts', controller.getFeed)
  app.post('/posts', { preHandler: requireUser }, controller.publish)
}
