export type AppearanceMode = 'system' | 'day' | 'evening'

export function appearanceMode(value: string | null): AppearanceMode {
  return value === 'day' || value === 'evening' ? value : 'system'
}
