import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { Space } from '../../services/communityApi';
import { SpaceResult } from './CommunityContent';

vi.mock('../../services/supabase', () => ({ supabase: null, avatarUrl: () => null }));

const circle: Space = {
  id: '20000000-0000-4000-8000-000000000001', name: 'A little encouragement',
  description: 'A circle for thoughtful conversation.', visibility: 'public', membership: 'none',
  ownerId: null, createdAt: '2026-11-05T00:00:00Z',
};

describe('circle discovery actions', () => {
  it.each([
    ['public', 'none', 'Join circle', 'Public circle'],
    ['private', 'none', 'Request to join', 'Private circle'],
    ['private', 'invited', 'Review invitation', 'Private circle'],
    ['private', 'requested', 'View request', 'Private circle'],
    ['private', 'active', 'View circle', 'Private circle'],
  ] as const)('shows the %s circle action for %s membership', (visibility, membership, action, audience) => {
    const html = renderToStaticMarkup(<SpaceResult space={{ ...circle, visibility, membership }} />);
    expect(html).toContain(action);
    expect(html).toContain(audience);
    expect(html).toContain(`href="#circle/${circle.id}"`);
    if (membership !== 'active') expect(html).not.toContain('View circle');
    expect(html).not.toContain('Public Space');
    expect(html).not.toContain('Private Space');
  });
});
