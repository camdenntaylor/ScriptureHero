import type { AppConfig } from './config/env.js'
import { InMemoryHeroRepository } from './modules/heroes/in-memory.repository.js'
import type { HeroRepository } from './modules/heroes/model.js'
import { SupabaseHeroRepository } from './modules/heroes/supabase.repository.js'
import { InMemoryPostRepository } from './modules/posts/in-memory.repository.js'
import type { PostRepository } from './modules/posts/model.js'
import { SupabasePostRepository } from './modules/posts/supabase.repository.js'
import { InMemorySavedPostRepository } from './modules/saved-posts/in-memory.repository.js'
import type { SavedPostRepository } from './modules/saved-posts/model.js'
import { SupabaseSavedPostRepository } from './modules/saved-posts/supabase.repository.js'
import { denyAllAuthenticator, type Authenticator } from './shared/auth.js'
import { InMemoryDatabase } from './shared/in-memory-database.js'
import { createAuthClient, createServiceClient } from './shared/supabase.js'
import { SupabaseAuthenticator } from './shared/supabase-authenticator.js'

export interface AppDependencies {
  authenticator: Authenticator
  posts: PostRepository
  savedPosts: SavedPostRepository
  heroes: HeroRepository
}

export function createInMemoryDependencies(
  db: InMemoryDatabase = new InMemoryDatabase(),
  authenticator: Authenticator = denyAllAuthenticator,
): AppDependencies {
  return {
    authenticator,
    posts: new InMemoryPostRepository(db),
    savedPosts: new InMemorySavedPostRepository(db),
    heroes: new InMemoryHeroRepository(db),
  }
}

export function hasSupabaseConfig(
  config: AppConfig,
): config is AppConfig & { SUPABASE_URL: string; SUPABASE_PUBLISHABLE_KEY: string; SUPABASE_SECRET_KEY: string } {
  return Boolean(config.SUPABASE_URL && config.SUPABASE_PUBLISHABLE_KEY && config.SUPABASE_SECRET_KEY)
}

export function createSupabaseDependencies(
  config: AppConfig & { SUPABASE_URL: string; SUPABASE_PUBLISHABLE_KEY: string; SUPABASE_SECRET_KEY: string },
): AppDependencies {
  const service = createServiceClient(config.SUPABASE_URL, config.SUPABASE_SECRET_KEY)
  const auth = createAuthClient(config.SUPABASE_URL, config.SUPABASE_PUBLISHABLE_KEY)
  return {
    authenticator: new SupabaseAuthenticator(auth),
    posts: new SupabasePostRepository(service),
    savedPosts: new SupabaseSavedPostRepository(service),
    heroes: new SupabaseHeroRepository(service),
  }
}
