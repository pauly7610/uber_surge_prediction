/**
 * Application configuration
 * Centralizes access to environment variables with proper typing and defaults
 */

import { 
  getEnvVariable, 
  getBooleanEnvVariable, 
  getNumericEnvVariable 
} from './envValidation';

// GraphQL API Endpoints
export const GRAPHQL_HTTP_URI = getEnvVariable('REACT_APP_GRAPHQL_HTTP_URI', 'http://localhost:4000/graphql');
export const GRAPHQL_WS_URI = getEnvVariable('REACT_APP_GRAPHQL_WS_URI', 'ws://localhost:4000/graphql');

// Feature Flags
export const ENABLE_NOTIFICATIONS = getBooleanEnvVariable('REACT_APP_ENABLE_NOTIFICATIONS', true);
export const ENABLE_PRICE_LOCK = getBooleanEnvVariable('REACT_APP_ENABLE_PRICE_LOCK', true);
export const ENABLE_HEATMAP = getBooleanEnvVariable('REACT_APP_ENABLE_HEATMAP', true);

// Map Configuration
export const MAP_TILE_URL = getEnvVariable(
  'REACT_APP_MAP_TILE_URL', 
  'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}'
);
export const MAPBOX_ACCESS_TOKEN = getEnvVariable('REACT_APP_MAPBOX_ACCESS_TOKEN', '');

// Parse map center coordinates
export const DEFAULT_MAP_CENTER = (() => {
  const centerStr = getEnvVariable('REACT_APP_DEFAULT_MAP_CENTER', '40.7128,-74.0060');
  const [lat, lng] = centerStr.split(',').map(Number);
  return { lat, lng };
})();

export const DEFAULT_MAP_ZOOM = getNumericEnvVariable('REACT_APP_DEFAULT_MAP_ZOOM', 12);

// Application Settings
export const DEFAULT_SURGE_ROUTE_ID = getEnvVariable('REACT_APP_DEFAULT_SURGE_ROUTE_ID', 'default-route-id');
export const PRICE_LOCK_DURATION = getNumericEnvVariable('REACT_APP_PRICE_LOCK_DURATION', 300); // 5 minutes in seconds
export const APP_VERSION = getEnvVariable('REACT_APP_VERSION', '1.0.0');

// Analytics
export const GOOGLE_ANALYTICS_ID = getEnvVariable('REACT_APP_GOOGLE_ANALYTICS_ID', '');

// Development Settings
export const DEBUG_MODE = getBooleanEnvVariable('REACT_APP_DEBUG_MODE', false);

// Export all config as a single object
export default {
  graphql: {
    httpUri: GRAPHQL_HTTP_URI,
    wsUri: GRAPHQL_WS_URI,
  },
  features: {
    notifications: ENABLE_NOTIFICATIONS,
    priceLock: ENABLE_PRICE_LOCK,
    heatmap: ENABLE_HEATMAP,
  },
  map: {
    tileUrl: MAP_TILE_URL,
    accessToken: MAPBOX_ACCESS_TOKEN,
    defaultCenter: DEFAULT_MAP_CENTER,
    defaultZoom: DEFAULT_MAP_ZOOM,
  },
  app: {
    defaultSurgeRouteId: DEFAULT_SURGE_ROUTE_ID,
    priceLockDuration: PRICE_LOCK_DURATION,
    version: APP_VERSION,
  },
  analytics: {
    googleAnalyticsId: GOOGLE_ANALYTICS_ID,
  },
  debug: DEBUG_MODE,
}; 