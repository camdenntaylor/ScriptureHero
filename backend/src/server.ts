import { buildApp } from './app.js'
import { readConfig } from './config/env.js'

const config = readConfig()
const app = await buildApp(config)

try {
  await app.listen({ host: config.HOST, port: config.PORT })
} catch (error) {
  app.log.error(error)
  process.exit(1)
}
