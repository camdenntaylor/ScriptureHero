import posthog from './posthog'

export const posthogLog = {
  signInCompleted: () => posthog.logger.info('sign_in_completed', { authentication_method: 'password' }),
  profileUpdated: () => posthog.logger.info('profile_updated'),
  messageSent: () => posthog.logger.info('message_sent', { conversation_type: 'named' }),
}
