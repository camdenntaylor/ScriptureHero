import cors from '@fastify/cors'
import Fastify from 'fastify'
import type { AppConfig } from './config/env.js'
import { PostController } from './controllers/post.controller.js'
import { InMemoryPostRepository } from './repositories/in-memory-post.repository.js'
import { registerPostRoutes } from './routes/post.routes.js'
import { PostService } from './services/post.service.js'

export async function buildApp(config: AppConfig) {
  const app = Fastify({ logger: true })
  await app.register(cors, { origin: config.FRONTEND_ORIGIN })

  const postRepository = new InMemoryPostRepository()
  const postService = new PostService(postRepository)
  const postController = new PostController(postService)

  app.get('/api/health', async () => ({ status: 'ok' }))
  await app.register(async (api) => registerPostRoutes(api, postController), { prefix: '/api' })

  return app
}
