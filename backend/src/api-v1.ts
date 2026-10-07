import type { FastifyInstance } from 'fastify'
import type { AppDependencies } from './dependencies.js'
import { HeroController } from './modules/heroes/controller.js'
import { registerHeroRoutes } from './modules/heroes/routes.js'
import { HeroService } from './modules/heroes/service.js'
import { PostController } from './modules/posts/controller.js'
import { registerPostRoutes } from './modules/posts/routes.js'
import { PostService } from './modules/posts/service.js'
import { SavedPostController } from './modules/saved-posts/controller.js'
import { registerSavedPostRoutes } from './modules/saved-posts/routes.js'
import { SavedPostService } from './modules/saved-posts/service.js'
import { createRequireUser } from './shared/auth.js'

// Global feed, publishing, saves, Scripture Heroes, and messages. Account routes
// (`/me`, `/soul-questions`) live in modules/profiles and share this prefix.
export async function registerApiV1(app: FastifyInstance, dependencies: AppDependencies) {
  const requireUser = createRequireUser(dependencies.authenticator)
  const posts = new PostController(new PostService(dependencies.posts))
  const savedPosts = new SavedPostController(new SavedPostService(dependencies.savedPosts))
  const heroes = new HeroController(
    new HeroService(dependencies.heroes, dependencies.posts, dependencies.savedPosts),
  )

  await app.register(
    async (v1) => {
      await registerPostRoutes(v1, posts, requireUser)
      await registerSavedPostRoutes(v1, savedPosts, requireUser)
      await registerHeroRoutes(v1, heroes, requireUser)
    },
    { prefix: '/api/v1' },
  )
}
