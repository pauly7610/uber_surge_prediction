import { gql } from '@apollo/client';

export const SURGE_UPDATE_SUBSCRIPTION = gql`
  subscription SurgeUpdate($routeId: String!) {
    surgeUpdates(routeId: $routeId) {
      timestamp
      multiplier
    }
  }
`;

export const NOTIFICATION_SUBSCRIPTION = gql`
  subscription NotificationSubscription {
    notification {
      id
      type
      message
      timestamp
      read
      expiresAt
      actionUrl
    }
  }
`; 