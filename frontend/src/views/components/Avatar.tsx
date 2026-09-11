import type { Person } from '../../models/prototype'

export function Avatar({ person, large = false }: { person: Person; large?: boolean }) {
  return <span className={`avatar avatar-${person.color}${large ? ' avatar-large' : ''}`} aria-hidden="true">{person.initials}</span>
}
