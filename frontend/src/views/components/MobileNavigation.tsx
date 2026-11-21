import { screenHash, type Screen } from '../../models/prototype';
import { Icon, type IconName } from './Icon';

type Destination = { screen: Screen; label: string; icon: IconName };

export function MobileNavigation({ navigation, active }: {
  navigation: Destination[];
  active: (screen: Screen) => boolean;
}) {
  return <nav className="mobile-nav" aria-label="Mobile navigation">
    {navigation.map(item => <a href={screenHash(item.screen)} key={item.screen} aria-current={active(item.screen) ? 'page' : undefined}>
      <Icon name={item.icon} size={22} /><span>{item.label}</span>
    </a>)}
  </nav>;
}
