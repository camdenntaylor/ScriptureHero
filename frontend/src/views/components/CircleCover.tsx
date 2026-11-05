import type { Space } from '../../services/communityApi';

const covers = ['olive', 'mountains', 'quiet', 'garden', 'path', 'ocean'] as const;
export function CircleCover({ circle, small = false }: { circle: Pick<Space, 'id' | 'name'>; small?: boolean }) {
  const name = circle.name.toLowerCase();
  const cover = /gratitude|kindness/.test(name) ? 'olive'
    : /faith|question/.test(name) ? 'mountains'
    : /quiet|rest/.test(name) ? 'quiet'
    : /prayer|encouragement/.test(name) ? 'garden'
    : /purpose|service/.test(name) ? 'path'
    : /morning|global/.test(name) ? 'ocean'
    : covers[Array.from(circle.id).reduce((sum, char) => sum + char.charCodeAt(0), 0) % covers.length];
  return <div className={`circle-cover circle-cover-${cover}${small ? ' circle-cover-small' : ''}`} aria-hidden="true" />;
}
