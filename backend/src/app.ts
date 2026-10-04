import Fastify from 'fastify'
import { configureApp } from './application.js'
import { readConfig } from './config/env.js'

const app = await configureApp(Fastify({ logger: true }), readConfig())
await app.ready()

export default app.server
