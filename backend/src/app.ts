import cors from '@fastify/cors'
import Fastify from 'fastify'
import type { AppConfig } from './config/env.js'
import { PostController } from './controllers/post.controller.js'
import { createInMemoryDependencies, type AppDependencies } from './dependencies.js'
import { HeroController } from './modules/heroes/controller.js'
import { registerHeroRoutes } from './modules/heroes/routes.js'
import { HeroService } from './modules/heroes/service.js'
import { PostController as PostsV1Controller } from './modules/posts/controller.js'
import { registerPostRoutes as registerPostsV1Routes } from './modules/posts/routes.js'
import { PostService as PostsV1Service } from './modules/posts/service.js'
import { SavedPostController } from './modules/saved-posts/controller.js'
import { registerSavedPostRoutes } from './modules/saved-posts/routes.js'
import { SavedPostService } from './modules/saved-posts/service.js'
import { InMemoryPostRepository } from './repositories/in-memory-post.repository.js'
import { registerPostRoutes } from './routes/post.routes.js'
import { PostService } from './services/post.service.js'
import { createRequireUser } from './shared/auth.js'
import { registerErrorHandler } from './shared/errors.js'

export async function buildApp(config: AppConfig, dependencies: AppDependencies = createInMemoryDependencies()) {
  const app = Fastify({ logger: true })
  await app.register(cors, {
    origin: config.FRONTEND_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  })
  registerErrorHandler(app)

  // Skeleton endpoint kept until the frontend moves to /api/v1.
  const postRepository = new InMemoryPostRepository()
  const postService = new PostService(postRepository)
  const postController = new PostController(postService)

  app.get('/api/health', async () => ({ status: 'ok' }))
  await app.register(async (api) => registerPostRoutes(api, postController), { prefix: '/api' })

  const requireUser = createRequireUser(dependencies.authenticator)
  const postsController = new PostsV1Controller(new PostsV1Service(dependencies.posts))
  const savedPostController = new SavedPostController(new SavedPostService(dependencies.savedPosts))
  const heroController = new HeroController(
    new HeroService(dependencies.heroes, dependencies.posts, dependencies.savedPosts),
  )

  await app.register(
    async (v1) => {
      await registerPostsV1Routes(v1, postsController, requireUser)
      await registerSavedPostRoutes(v1, savedPostController, requireUser)
      await registerHeroRoutes(v1, heroController, requireUser)
    },
    { prefix: '/api/v1' },
  )

  return app
}
