import { buildApp } from './app.js'
import { readConfig } from './config/env.js'
import { createSupabaseDependencies, hasSupabaseConfig } from './dependencies.js'
import { createDevDependencies } from './shared/dev-mode.js'

const config = readConfig()

// With Supabase keys the API uses the real database and verifies real access
// tokens. Without them it runs on seeded in-memory data with a development-only
// sign-in, which must never run in production.
let dependencies
if (hasSupabaseConfig(config)) {
  dependencies = createSupabaseDependencies(config)
} else {
  if (config.NODE_ENV === 'production') {
    throw new Error('Supabase configuration is required in production.')
  }
  dependencies = createDevDependencies()
}

const app = await buildApp(config, dependencies)
app.log.info(hasSupabaseConfig(config) ? 'Using Supabase' : 'Using seeded in-memory data (development only)')

try {
  await app.listen({ host: config.HOST, port: config.PORT })
} catch (error) {
  app.log.error(error)
  process.exit(1)
}
