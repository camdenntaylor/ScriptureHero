import { describe, expect, it } from 'vitest'
import { addToHelplist, getHeroes, publicShareText, resourceIdFromHash, screenFromHash, screenForAccount, screenHash, canonicalCircleHash, type Insight } from './prototype'
import { appreciations, insights, questions } from '../services/prototypeData'

describe('the prototype help loop', () => {
  it('uses Circle URLs and resolves legacy bookmarks without changing resource IDs', () => {
    const id = '10000000-0000-4000-8000-000000000001'
    for (const [legacy, canonical, screen] of [
      ['#spaces', '#circles', 'spaces'],
      [`#space/${id}`, `#circle/${id}`, 'space'],
      ['#create-space', '#create-circle', 'create-space'],
    ] as const) {
      expect(canonicalCircleHash(legacy)).toBe(canonical)
      expect(canonicalCircleHash(canonical)).toBe(canonical)
      expect(screenFromHash(legacy)).toBe(screen)
      expect(screenFromHash(canonical)).toBe(screen)
    }
    expect(screenHash('spaces')).toBe('#circles')
    expect(screenHash('space')).toBe('#circle')
    expect(screenHash('create-space')).toBe('#create-circle')
    expect(resourceIdFromHash(`#circle/${id}`)).toBe(id)
    expect(resourceIdFromHash('#circle/not-an-id')).toBe('')
    expect(canonicalCircleHash('#spaceship')).toBe('#spaceship')
    expect(canonicalCircleHash('#main-content')).toBe('#main-content')
  })
  it('restores resource deep links with bounded IDs and preserves top-level navigation', () => {
    const id = '10000000-0000-4000-8000-000000000001'
    for (const screen of ['space', 'member', 'insight'] as const) {
      expect(screenFromHash(`#${screen}/${id}`)).toBe(screen)
      expect(resourceIdFromHash(`#${screen}/${id}`)).toBe(id)
    }
    expect(screenFromHash('#explore')).toBe('explore')
    expect(resourceIdFromHash('#space/not-an-id')).toBe('')
    expect(resourceIdFromHash('#space/%3Cscript%3E')).toBe('')
  })
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

  it('supports community and account screen links with a safe landing fallback', () => {
    expect(screenFromHash('')).toBe('welcome')
    expect(screenFromHash('#welcome')).toBe('welcome')
    expect(screenFromHash('#home')).toBe('home')
    expect(screenFromHash('#heroes')).toBe('profile')
    expect(screenFromHash('#messages')).toBe('messages')
    expect(screenFromHash('#chat')).toBe('chat')
    expect(screenFromHash('#appearance')).toBe('appearance')
    for (const screen of ['public-profile', 'about', 'help', 'terms', 'privacy', 'blocked-accounts', 'delete-account', 'post', 'report', 'settings-account', 'invite'] as const) {
      expect(screenFromHash(`#${screen}`)).toBe(screen)
    }
    expect(screenFromHash('#login')).toBe('login')
    expect(screenFromHash('#profile')).toBe('profile')
    expect(screenFromHash('#questions')).toBe('questions')
    expect(screenFromHash('#unknown')).toBe('welcome')
  })

  it('keeps Welcome for visitors and sends returning members to Home', () => {
    expect(screenForAccount('welcome', false)).toBe('welcome')
    expect(screenForAccount('login', false)).toBe('login')
    expect(screenForAccount('welcome', true)).toBe('home')
    expect(screenForAccount('login', true)).toBe('home')
    expect(screenForAccount('appearance', true)).toBe('appearance')
    expect(screenForAccount('messages', true)).toBe('messages')
    expect(screenForAccount('heroes', true)).toBe('profile')
    expect(screenForAccount('heroes', false)).toBe('profile')
  })
})
