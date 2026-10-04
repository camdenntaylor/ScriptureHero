import { z } from 'zod'

const envSchema = z
  .object({
    HOST: z.string().default('0.0.0.0'),
    PORT: z.coerce.number().int().positive().default(3000),
    FRONTEND_ORIGIN: z.string().default('http://localhost:5173'),
    NODE_ENV: z.string().optional(),
    SUPABASE_URL: z.url().optional(),
    SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional(),
    SUPABASE_SECRET_KEY: z.string().min(1).optional(),
  })
  .superRefine((env, ctx) => {
    const supabase = [env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY, env.SUPABASE_SECRET_KEY]
    if (supabase.some(Boolean) && !supabase.every(Boolean)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Set SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, and SUPABASE_SECRET_KEY together, or none of them.',
      })
    }
  })

export type AppConfig = z.infer<typeof envSchema>

// A blank value in a .env file (`SUPABASE_URL=`) counts as unset.
export function readConfig(source: NodeJS.ProcessEnv = process.env): AppConfig {
  const cleaned = Object.fromEntries(Object.entries(source).filter(([, value]) => value !== ''))
  return envSchema.parse(cleaned)
}
