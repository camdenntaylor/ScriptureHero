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
import { RequestClientSource, createAuthClient } from './shared/supabase.js'
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

type SupabaseConfig = AppConfig & { SUPABASE_URL: string; SUPABASE_PUBLISHABLE_KEY: string }

export function hasSupabaseConfig(config: AppConfig): config is SupabaseConfig {
  return Boolean(config.SUPABASE_URL && config.SUPABASE_PUBLISHABLE_KEY)
}

// Uses only the project URL and publishable key. Database calls carry the
// caller's own access token (see RequestClientSource), so no secret key is needed.
export function createSupabaseDependencies(config: SupabaseConfig): AppDependencies {
  const source = new RequestClientSource(config.SUPABASE_URL, config.SUPABASE_PUBLISHABLE_KEY)
  return {
    authenticator: new SupabaseAuthenticator(createAuthClient(config.SUPABASE_URL, config.SUPABASE_PUBLISHABLE_KEY)),
    posts: new SupabasePostRepository(source),
    savedPosts: new SupabaseSavedPostRepository(source),
    heroes: new SupabaseHeroRepository(source),
  }
}
