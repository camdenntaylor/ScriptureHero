import { z } from 'zod'

const envSchema = z.object({
  HOST: z.string().default('0.0.0.0'),
  PORT: z.coerce.number().int().positive().default(3000),
  FRONTEND_ORIGIN: z.string().default('http://localhost:5173'),
})

export type AppConfig = z.infer<typeof envSchema>

export function readConfig(source: NodeJS.ProcessEnv = process.env): AppConfig {
  return envSchema.parse(source)
}
