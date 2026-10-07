import type { FastifyInstance } from 'fastify'
import type { RequireUser } from '../../shared/auth.js'
import type { SavedPostController } from './controller.js'

// Saves are private to the caller, so every route requires sign-in.
export async function registerSavedPostRoutes(
  app: FastifyInstance,
  controller: SavedPostController,
  requireUser: RequireUser,
) {
  app.get('/saved-posts', { preHandler: requireUser }, controller.list)
  app.put('/saved-posts/:postId', { preHandler: requireUser }, controller.save)
  app.delete('/saved-posts/:postId', { preHandler: requireUser }, controller.unsave)
}
