import type { ReactNode } from 'react'
import { Icon } from './Icon'

export function StaticPage({
  eyebrow,
  title,
  intro,
  children,
  backHref = '#welcome',
  backLabel = 'Welcome',
}: {
  eyebrow?: string
  title: string
  intro?: string
  children: ReactNode
  backHref?: string
  backLabel?: string
}) {
  return (
    <div className="profile-page">
      <a className="button-link topics-back" href={backHref}>
        <Icon name="chevron" size={16} /> {backLabel}
      </a>
      <header className="page-heading">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {intro && <p>{intro}</p>}
      </header>
      <section className="profile-card">{children}</section>
    </div>
  )
}
