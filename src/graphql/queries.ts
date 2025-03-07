import { gql } from '@apollo/client';

export const GET_SURGE_DATA = gql`
  query GetSurgeData {
    surgeData {
      multiplier
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

export const GET_DRIVER_HEATMAP_DATA = gql`
  query GetDriverHeatmapData($timeframe: String!) {
    driverHeatmapData(timeframe: $timeframe) {
      x
      y
      value
    }
  }
`;

export const GET_DRIVER_POSITIONING_INCENTIVES = gql`
  query GetDriverPositioningIncentives {
    driverPositioningIncentives {
      id
      area
      incentiveAmount
      deadline
      estimatedDemand
      distance
      estimatedTimeToArrive
    }
  }
`; 