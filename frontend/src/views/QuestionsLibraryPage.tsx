import { useState } from 'react'
import type { PrototypeController } from '../controllers/usePrototypeController'
import { soulQuestionPrompts } from '../services/prototypeData'
import { Icon } from './components/Icon'

export function QuestionsLibraryPage({ app }: { app: PrototypeController }) {
  const [query, setQuery] = useState('')
  const matches = soulQuestionPrompts.filter((prompt) => prompt.toLowerCase().includes(query.trim().toLowerCase()))

  function usePrompt(prompt: string) {
    app.setPromptDraft(prompt)
    window.location.hash = app.profile ? '#questions' : '#login'
  }

  return (
    <div className="library-page">
      <header className="page-heading">
        <p className="eyebrow">
          <Icon name="book" size={16} /> A PLACE TO START
        </p>
        <h1>Questions others are asking.</h1>
        <p>Not sure where to begin? Browse common questions and make one your own.</p>
      </header>
      <label className="sr-only" htmlFor="library-search">
        Search prompts
      </label>
      <div className="topics-search">
        <Icon name="search" size={18} />
        <input id="library-search" placeholder="Search common questions…" value={query} onChange={(event) => setQuery(event.target.value)} />
      </div>
      <ul className="prompt-list">
        {matches.map((prompt) => (
          <li className="prompt-card" key={prompt}>
            <p>{prompt}</p>
            <button className="button button-soft" onClick={() => usePrompt(prompt)}>
              Make this mine <Icon name="arrow" size={16} />
            </button>
          </li>
        ))}
      </ul>
      {matches.length === 0 && <p className="muted">No prompts match “{query}” yet. Try a different word.</p>}
      <p className="privacy-note">
        <Icon name="lock" size={14} /> These are just starting points. What you write stays private, always.
      </p>
    </div>
  )
}
