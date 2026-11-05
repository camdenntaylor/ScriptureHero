import { screenHash, type Screen } from '../../models/prototype';
import { Icon, type IconName } from './Icon';

type Destination = { screen: Screen; label: string; icon: IconName };

export function MobileNavigation({ navigation, active }: {
  navigation: Destination[];
  active: (screen: Screen) => boolean;
}) {
  const primary = navigation.filter(item => ['home', 'explore', 'spaces'].includes(item.screen));
  const more = navigation.filter(item => !primary.includes(item));
  return <nav className="mobile-nav" aria-label="Mobile navigation">
    {primary.map(item => <a href={screenHash(item.screen)} key={item.screen} aria-current={active(item.screen) ? 'page' : undefined}>
      <Icon name={item.icon} size={22} /><span>{item.label}</span>
    </a>)}
    <details className="mobile-more" onKeyDown={event => {
      if (event.key === 'Escape') {
        event.currentTarget.open = false;
        event.currentTarget.querySelector('summary')?.focus();
      }
    }}>
      <summary aria-current={more.some(item => active(item.screen)) ? 'page' : undefined}>
        <Icon name="grid" size={22} /><span>More</span>
      </summary>
      <div className="mobile-more-links">
        {more.map(item => <a href={screenHash(item.screen)} key={item.screen} aria-current={active(item.screen) ? 'page' : undefined} onClick={event => {
          const disclosure = event.currentTarget.closest('details');
          if (disclosure) disclosure.open = false;
        }}><Icon name={item.icon} size={22} /><span>{item.label}</span></a>)}
      </div>
    </details>
  </nav>;
}
