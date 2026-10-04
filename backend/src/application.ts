import cors from '@fastify/cors'
import Fastify from 'fastify'
import type { FastifyInstance } from 'fastify'
import { registerApiV1 } from './api-v1.js'
import type { AppConfig } from './config/env.js'
import { PostController } from './controllers/post.controller.js'
import {
  createInMemoryDependencies,
  createSupabaseDependencies,
  hasSupabaseConfig,
  type AppDependencies,
} from './dependencies.js'
import { InMemoryPostRepository } from './repositories/in-memory-post.repository.js'
import { registerPostRoutes } from './routes/post.routes.js'
import { PostService } from './services/post.service.js'
import { registerAccountRoutes } from './modules/profiles/routes.js'
import { requestContext } from './shared/request-context.js'
import { registerErrorHandler } from './shared/errors.js'

// `dependencies` defaults to Supabase when it is configured. With no Supabase
// settings the /api/v1 posts, saves, and messages reject every request.
export async function configureApp(app: FastifyInstance, config: AppConfig, dependencies?: AppDependencies) {
  const resolved =
    dependencies ?? (hasSupabaseConfig(config) ? createSupabaseDependencies(config) : createInMemoryDependencies())

  await app.register(cors, {
    origin: config.FRONTEND_ORIGIN,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'],
  })
  app.addHook('onRequest', (_request, _reply, done) => requestContext.run({}, done))
  registerErrorHandler(app)

  const postRepository = new InMemoryPostRepository()
  const postService = new PostService(postRepository)
  const postController = new PostController(postService)

  app.get('/api/health', async () => ({ status: 'ok' }))
  await app.register(async (api) => registerPostRoutes(api, postController), { prefix: '/api' })
  await app.register(async (api) => registerAccountRoutes(api, config), { prefix: '/api/v1' })
  await registerApiV1(app, resolved)

  return app
}

export function buildApp(config: AppConfig, dependencies?: AppDependencies) {
  return configureApp(Fastify({ logger: true }), config, dependencies)
}
