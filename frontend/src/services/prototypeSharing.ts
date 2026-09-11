import { publicShareText, type Insight } from '../models/prototype'

export async function copyInsight(post: Insight): Promise<string> {
  const text = publicShareText(post)
  if (!navigator.clipboard?.writeText) throw new Error('Copy is unavailable here. You can select and copy the text below.')
  await navigator.clipboard.writeText(text)
  return text
}
