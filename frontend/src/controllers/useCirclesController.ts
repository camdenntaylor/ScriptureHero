import { useState } from 'react';
import { usePagedResource } from './useCommunityController';
import { listSpaces, searchCommunity } from '../services/communityApi';

export const circleTopics = ['All', 'Gratitude', 'Prayer', 'Meditation', 'Questions', 'Service'] as const;

export function useCirclesController(accountId: string | null) {
  const [term, setTerm] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [topic, setTopic] = useState<string>('All');
  const circles = usePagedResource(JSON.stringify(['circles', accountId, submitted]), async (cursor, signal) => {
    if (!submitted) return listSpaces(false, cursor, signal);
    return (await searchCommunity(submitted, 'spaces', cursor, signal)).spaces;
  });
  const mine = usePagedResource(accountId ? `my-circles:${accountId}` : null,
    (cursor, signal) => listSpaces(true, cursor, signal));
  function chooseTopic(value: string) {
    setTopic(value);
    setTerm(value === 'All' ? '' : value);
    setSubmitted(value === 'All' ? '' : value);
  }
  return {
    circles, mine, term, setTerm, topic, chooseTopic,
    search: () => { setTopic('All'); setSubmitted(term.trim()); circles.refresh(); },
  };
}
