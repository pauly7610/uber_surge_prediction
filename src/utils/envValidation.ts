/**
 * Environment variables validation utility
 * Ensures all required environment variables are present
 */

// List of required environment variables
const REQUIRED_ENV_VARS = [
  'REACT_APP_GRAPHQL_HTTP_URI',
  'REACT_APP_GRAPHQL_WS_URI',
  'REACT_APP_MAPBOX_ACCESS_TOKEN',
  'REACT_APP_DEFAULT_MAP_CENTER',
  'REACT_APP_DEFAULT_MAP_ZOOM',
  'REACT_APP_DEFAULT_SURGE_ROUTE_ID'
];

/**
 * Validates that all required environment variables are defined
 * @returns {boolean} True if all required variables are defined, false otherwise
 */
export const validateEnvVariables = (): boolean => {
  const missingVars: string[] = [];
  const isDevelopment = process.env.NODE_ENV === 'development';

  REQUIRED_ENV_VARS.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    if (isDevelopment) {
      console.warn('⚠️ Missing environment variables in development mode:', missingVars);
      console.info('ℹ️ Using default values for development. This is expected in local development.');
    } else {
      console.error('🚨 Missing required environment variables in production:', missingVars);
      console.error('This may cause the application to behave incorrectly.');
    }
    return false;
  }

  return true;
};

/**
 * Gets an environment variable with a fallback value
 * @param {string} name - The name of the environment variable
 * @param {string} fallback - The fallback value if the variable is not defined
 * @returns {string} The environment variable value or the fallback
 */
export const getEnvVariable = (name: string, fallback: string): string => {
  return process.env[name] || fallback;
};

/**
 * Gets a boolean environment variable
 * @param {string} name - The name of the environment variable
 * @param {boolean} fallback - The fallback value if the variable is not defined
 * @returns {boolean} The environment variable as a boolean
 */
export const getBooleanEnvVariable = (name: string, fallback: boolean): boolean => {
  const value = process.env[name];
  if (value === undefined) return fallback;
  return value.toLowerCase() === 'true';
};

/**
 * Gets a numeric environment variable
 * @param {string} name - The name of the environment variable
 * @param {number} fallback - The fallback value if the variable is not defined or not a number
 * @returns {number} The environment variable as a number
 */
export const getNumericEnvVariable = (name: string, fallback: number): number => {
  const value = process.env[name];
  if (value === undefined) return fallback;
  
  const parsed = parseFloat(value);
  return isNaN(parsed) ? fallback : parsed;
}; 