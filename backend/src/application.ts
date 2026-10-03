import cors from '@fastify/cors'
import Fastify from 'fastify'
import type { FastifyInstance } from 'fastify'
import type { AppConfig } from './config/env.js'
import { PostController } from './controllers/post.controller.js'
import { InMemoryPostRepository } from './repositories/in-memory-post.repository.js'
import { registerPostRoutes } from './routes/post.routes.js'
import { PostService } from './services/post.service.js'
import { registerAccountRoutes } from './modules/profiles/routes.js'

export async function configureApp(app: FastifyInstance, config: AppConfig) {
  await app.register(cors, { origin: config.FRONTEND_ORIGIN })

  const postRepository = new InMemoryPostRepository()
  const postService = new PostService(postRepository)
  const postController = new PostController(postService)

  app.get('/api/health', async () => ({ status: 'ok' }))
  await app.register(async (api) => registerPostRoutes(api, postController), { prefix: '/api' })
  await app.register(async (api) => registerAccountRoutes(api, config), { prefix: '/api/v1' })

  return app
}

export function buildApp(config: AppConfig) {
  return configureApp(Fastify({ logger: true }), config)
}
