import { StaticPage } from './components/StaticPage'

export function TermsPage() {
  return (
    <StaticPage eyebrow="LEGAL" title="Terms of service.">
      <p className="muted">
        This is a placeholder page for a class project prototype, shown here to demonstrate what a real Terms
        of Service page would look like. It is not a binding legal document.
      </p>
      <h2>Using this prototype</h2>
      <p>
        Scripture Hero is a low-fidelity prototype built for a user experience class assignment. It is not a
        real product, and no account you create here should use a real password you use elsewhere.
      </p>
      <h2>Respectful sharing</h2>
      <p>
        The real product this prototype represents is intended as a place for uplifting, genuine spiritual
        sharing — not debate, criticism, or harassment.
      </p>
    </StaticPage>
  )
}
