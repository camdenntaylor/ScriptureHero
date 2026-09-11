import { describe, expect, it } from 'vitest'
import { addToHelplist, getHeroes, publicShareText, screenFromHash, type Insight } from './prototype'
import { appreciations, insights, questions } from '../services/prototypeData'

describe('the prototype help loop', () => {
  it('deduplicates repeated saves without mutating the original collection', () => {
    const original = [{ postId: 'small-kindness', questionId: 'quiet' }]
    expect(addToHelplist(original, 'small-kindness', 'quiet')).toEqual(original)
    expect(addToHelplist(original, 'small-kindness', 'trust')).toHaveLength(2)
    expect(original).toHaveLength(1)
  })

  it('recognizes an author once across multiple saved posts and questions', () => {
    const post = insights[0]!
    const secondPost: Insight = { ...post, id: 'another-insight' }
    const saved = [{ postId: post.id, questionId: 'quiet' }, { postId: post.id, questionId: 'trust' }, { postId: secondPost.id, questionId: 'quiet' }]
    expect(getHeroes([post, secondPost], saved)).toEqual([post.author])
    expect(getHeroes([post, secondPost], [])).toEqual([])
  })

  it('shares only public insight fields, even if a source object contains private fields', () => {
    const post = { ...insights[0]!, soulQuestion: questions[0]!.title, questionId: 'private-question-sentinel', matchScore: 0.9324 }
    const text = publicShareText(post)
    expect(text).toContain(post.title)
    expect(text).toContain(post.author.name)
    expect(text).not.toContain(post.soulQuestion)
    expect(text).not.toContain(post.questionId)
    expect(text).not.toContain(String(post.matchScore))
  })

  it('keeps named appreciation independent from private helpful matches', () => {
    for (const item of appreciations) {
      expect(Object.keys(item).sort()).toEqual(['person', 'postTitle', 'quote'])
      expect(Object.keys(item.person).sort()).toEqual(['color', 'id', 'initials', 'location', 'name'])
      for (const question of questions) expect(JSON.stringify(item)).not.toContain(question.title)
    }
  })

  it('supports the three screen links and a safe landing fallback', () => {
    expect(screenFromHash('')).toBe('welcome')
    expect(screenFromHash('#welcome')).toBe('welcome')
    expect(screenFromHash('#home')).toBe('home')
    expect(screenFromHash('#heroes')).toBe('heroes')
    expect(screenFromHash('#unknown')).toBe('welcome')
  })
})
