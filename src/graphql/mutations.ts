import { gql } from '@apollo/client';

export const LOCK_SURGE_PRICE = gql`
  mutation LockSurgePrice {
    lockSurgePrice {
      success
      message
    }
  }
`;

export const UPDATE_NOTIFICATION_PREFERENCES = gql`
  mutation UpdateNotificationPreferences($preferences: NotificationPreferencesInput!) {
    updateNotificationPreferences(preferences: $preferences) {
      success
      message
    }
  }
`; 