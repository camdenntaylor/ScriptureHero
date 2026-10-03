import Fastify from 'fastify'
import { configureApp } from './application.js'
import { readConfig } from './config/env.js'
import { existsSync } from 'node:fs'
import { loadEnvFile } from 'node:process'
import { fileURLToPath } from 'node:url'

const envPath = fileURLToPath(new URL('../.env', import.meta.url))
if (existsSync(envPath)) loadEnvFile(envPath)
const config = readConfig()
const app = await configureApp(Fastify({ logger: true }), config)

try {
  await app.listen({ host: config.HOST, port: config.PORT })
} catch (error) {
  app.log.error(error)
  process.exit(1)
}
