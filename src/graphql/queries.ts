import { gql } from '@apollo/client';

export const GET_SURGE_DATA = gql`
  query GetSurgeData {
    surgeData {
      multiplier
      // Add other relevant fields
    }
  }
`;

export const GET_HISTORICAL_SURGE_DATA = gql`
  query GetHistoricalSurgeData($routeId: String!, $startDate: String!, $endDate: String!) {
    historicalSurgeData(routeId: $routeId, startDate: $startDate, endDate: $endDate) {
      timestamp
      multiplier
    }
  }
`; 