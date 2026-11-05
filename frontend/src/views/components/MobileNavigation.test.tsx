import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { MobileNavigation } from './MobileNavigation';
import { screenHash } from '../../models/prototype';

const destinations = [
  { screen: 'home', label: 'Home', icon: 'home' },
  { screen: 'explore', label: 'Explore', icon: 'search' },
  { screen: 'spaces', label: 'Circles', icon: 'crowd' },
  { screen: 'heroes', label: 'Scripture Heroes', icon: 'heart' },
  { screen: 'messages', label: 'Messages', icon: 'message' },
  { screen: 'profile', label: 'Profile', icon: 'person' },
] as const;

describe('mobile destination access', () => {
  it('keeps every supplied destination reachable once, including the disclosure destinations', () => {
    const html = renderToStaticMarkup(<MobileNavigation navigation={[...destinations]} active={screen => screen === 'messages'} />);
    for (const destination of destinations) {
      expect(html.match(new RegExp(`href="${screenHash(destination.screen)}"`, 'g'))).toHaveLength(1);
    }
    expect(html).toContain('<summary aria-current="page">');
    expect(html).toContain('href="#messages" aria-current="page"');
    expect(html).not.toContain('href="#home" aria-current="page"');
  });

  it('does not introduce account destinations into visitor navigation', () => {
    const html = renderToStaticMarkup(<MobileNavigation navigation={destinations.filter(item => !['messages', 'profile'].includes(item.screen))} active={screen => screen === 'home'} />);
    expect(html).not.toContain('href="#messages"');
    expect(html).not.toContain('href="#profile"');
    expect(html).toContain('href="#heroes"');
    expect(html).toContain('href="#home" aria-current="page"');
    expect(html).not.toContain('<summary aria-current="page">');
  });
});
