import { LandingPage } from './LandingPage'
import { Logo } from './components/Logo'
import { Icon } from './components/Icon'
import { HomePage } from './HomePage'
import { HeroesPage } from './HeroesPage'
import { PrototypeModal } from './components/PrototypeModal'
import { usePrototypeController } from '../controllers/usePrototypeController'

export function App() {
  const app = usePrototypeController()
  const welcome = app.screen === 'welcome'
  const navigation = [{ screen: 'welcome', label: 'Welcome', icon: 'globe' }, { screen: 'home', label: 'Home', icon: 'home' }, { screen: 'heroes', label: 'Scripture Heroes', icon: 'heart' }] as const
  return (
    <div className={`app-shell ${welcome ? 'landing-shell' : 'community-shell'}`}>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className="site-header">
        <a className="brand" href="#welcome" aria-label="Scripture Hero welcome">
          <Logo />
          <span>Scripture Hero</span>
        </a>
        {welcome ? <><nav className="landing-nav" aria-label="Main navigation"><a href="#home">The community</a><a href="#heroes">Scripture Heroes</a></nav><a className="button button-outline" href="#home">Come on in <span aria-hidden="true">↗</span></a></> : <div className="demo-profile"><div><strong>Avery</strong><span>Demo account</span></div><span className="avatar avatar-gold" aria-hidden="true">AV</span></div>}
      </header>

      {welcome ? <LandingPage /> : <div className="workspace"><aside className="workspace-sidebar"><p className="sidebar-label">YOUR LITTLE CORNER</p><nav className="side-nav" aria-label="Main navigation">{navigation.map(item => <a href={`#${item.screen}`} key={item.screen} aria-current={app.screen === item.screen ? 'page' : undefined}><Icon name={item.icon} />{item.label}</a>)}</nav></aside><main id="main-content" className="workspace-main" tabIndex={-1}>{app.screen === 'home' ? <HomePage app={app} /> : <HeroesPage app={app} />}</main></div>}
      {!welcome && <nav className="mobile-nav" aria-label="Mobile navigation">{navigation.map(item => <a href={`#${item.screen}`} key={item.screen} aria-current={app.screen === item.screen ? 'page' : undefined}><Icon name={item.icon} size={21} /><span>{item.screen === 'heroes' ? 'Scripture Heroes' : item.label}</span></a>)}</nav>}
      {app.dialog && <PrototypeModal key={app.dialog.type} app={app} />}
      <div className="toast-region" aria-live="polite" aria-atomic="true">{app.notice && <div className="toast"><Icon name="check" size={18} /><span>{app.notice}</span><button className="icon-button" onClick={() => app.setNotice('')} aria-label="Dismiss notification"><Icon name="close" size={17} /></button></div>}</div>
    </div>
  )
}
