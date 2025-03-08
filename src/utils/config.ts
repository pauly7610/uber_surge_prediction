/**
 * Application configuration
 * Centralizes access to environment variables with proper typing and defaults
 */

import { 
  getEnvVariable, 
  getBooleanEnvVariable, 
  getNumericEnvVariable 
} from './envValidation';

// Check if we're in a build environment (Vercel)
const isBuildEnv = process.env.NODE_ENV === 'production' && process.env.VERCEL;
const isVercel = !!process.env.VERCEL;

// Helper to get the base URL for API endpoints
const getBaseUrl = () => {
  // In the browser, use the current origin
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // In SSR or during build, use a placeholder that will be replaced at runtime
  return '';
};

// Resolve a relative URL to an absolute URL
const resolveUrl = (relativeUrl: string): string => {
  // If it's already an absolute URL, return it as is
  if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://') || relativeUrl.startsWith('ws://') || relativeUrl.startsWith('wss://')) {
    return relativeUrl;
  }
  
  // For local development, use the provided URL as is
  if (!isVercel && process.env.NODE_ENV === 'development') {
    return relativeUrl;
  }
  
  // For production, resolve to an absolute URL
  const baseUrl = getBaseUrl();
  
  // Ensure the URL starts with a slash
  const normalizedUrl = relativeUrl.startsWith('/') ? relativeUrl : `/${relativeUrl}`;
  
  return `${baseUrl}${normalizedUrl}`;
};

// GraphQL API Endpoints
const rawHttpUri = getEnvVariable(
  'REACT_APP_GRAPHQL_HTTP_URI', 
  isVercel 
    ? 'api/graphql' // Use Vercel API route in production
    : 'http://localhost:5000/graphql'
);

const rawWsUri = getEnvVariable(
  'REACT_APP_GRAPHQL_WS_URI', 
  isVercel
    ? 'api/graphql/subscriptions' // Use Vercel API route in production
    : 'ws://localhost:5000/graphql/subscriptions'
);

// Helper to extract port from proxy setting in package.json
const getProxyPort = () => {
  try {
    // In browser environment, we can use the proxy from package.json
    if (typeof window !== 'undefined') {
      // If we're already using the API directly, no need to modify
      if (rawHttpUri.includes('://localhost:')) {
        return null;
      }
      
      // Check if we're being proxied through the React dev server
      const currentPort = window.location.port;
      if (currentPort) {
        // We're in development with a proxy
        return null; // Let the proxy handle it
      }
    }
    return null;
  } catch (e) {
    console.warn('Error detecting proxy port:', e);
    return null;
  }
};

// Apply proxy port if needed
const applyProxyPort = (url: string) => {
  const proxyPort = getProxyPort();
  if (proxyPort && url.includes('://localhost:')) {
    return url.replace(/localhost:\d+/, `localhost:${proxyPort}`);
  }
  return url;
};

export const GRAPHQL_HTTP_URI = resolveUrl(applyProxyPort(rawHttpUri));
export const GRAPHQL_WS_URI = resolveUrl(applyProxyPort(rawWsUri));

// Feature Flags
export const ENABLE_NOTIFICATIONS = getBooleanEnvVariable('REACT_APP_ENABLE_NOTIFICATIONS', true);
export const ENABLE_PRICE_LOCK = getBooleanEnvVariable('REACT_APP_ENABLE_PRICE_LOCK', true);
export const ENABLE_HEATMAP = getBooleanEnvVariable('REACT_APP_ENABLE_HEATMAP', true);

// Map Configuration
export const MAP_TILE_URL = getEnvVariable(
  'REACT_APP_MAP_TILE_URL', 
  'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}'
);
export const MAPBOX_ACCESS_TOKEN = getEnvVariable(
  'REACT_APP_MAPBOX_ACCESS_TOKEN', 
  isBuildEnv ? 'pk.mock.mapbox.token.for.build.purposes.only' : ''
);

// Parse map center coordinates
export const DEFAULT_MAP_CENTER = (() => {
  const centerStr = getEnvVariable('REACT_APP_DEFAULT_MAP_CENTER', '40.7128,-74.0060');
  const [lat, lng] = centerStr.split(',').map(Number);
  return { lat, lng };
})();

export const DEFAULT_MAP_ZOOM = getNumericEnvVariable('REACT_APP_DEFAULT_MAP_ZOOM', 12);

// Application Settings
export const DEFAULT_SURGE_ROUTE_ID = getEnvVariable(
  'REACT_APP_DEFAULT_SURGE_ROUTE_ID', 
  isBuildEnv ? 'mock-route-id' : 'default-route-id'
);
export const PRICE_LOCK_DURATION = getNumericEnvVariable('REACT_APP_PRICE_LOCK_DURATION', 300); // 5 minutes in seconds
export const APP_VERSION = getEnvVariable('REACT_APP_VERSION', '1.0.0');

// Analytics
export const GOOGLE_ANALYTICS_ID = getEnvVariable(
  'REACT_APP_GOOGLE_ANALYTICS_ID', 
  isBuildEnv ? 'UA-000000000-0' : ''
);

// Development Settings
export const DEBUG_MODE = getBooleanEnvVariable('REACT_APP_DEBUG_MODE', false);

// Export all config as a single object
const config = {
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
  isBuildEnv,
  isVercel,
};

export default config; 