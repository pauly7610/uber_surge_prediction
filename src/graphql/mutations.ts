import { gql } from '@apollo/client';

export const LOCK_SURGE_PRICE = gql`
  mutation LockSurgePrice {
    lockSurgePrice {
      success
      message
    }
  }
`; 