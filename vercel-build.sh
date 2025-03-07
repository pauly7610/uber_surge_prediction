#!/bin/bash

# Exit on error
set -e

# Print commands for debugging
set -x

# Install dependencies with legacy peer deps
npm install --legacy-peer-deps

# Create a .env.production file with mock values if needed
if [ ! -f ".env.production" ]; then
  echo "Creating .env.production with mock values for build..."
  cat > .env.production << EOL
# GraphQL API Endpoints (using Vercel API routes in production)
# These will be resolved at runtime to absolute URLs
REACT_APP_GRAPHQL_HTTP_URI=api/graphql
REACT_APP_GRAPHQL_WS_URI=api/graphql/subscriptions

# Feature Flags
REACT_APP_ENABLE_NOTIFICATIONS=true
REACT_APP_ENABLE_PRICE_LOCK=true
REACT_APP_ENABLE_HEATMAP=true

# Map Configuration
REACT_APP_MAP_TILE_URL=https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}
REACT_APP_MAPBOX_ACCESS_TOKEN=pk.mock.mapbox.token.for.build.purposes.only
REACT_APP_DEFAULT_MAP_CENTER=40.7128,-74.0060
REACT_APP_DEFAULT_MAP_ZOOM=12

# Application Settings
REACT_APP_DEFAULT_SURGE_ROUTE_ID=mock-route-id
REACT_APP_PRICE_LOCK_DURATION=300
REACT_APP_VERSION=1.0.0

# Analytics
REACT_APP_GOOGLE_ANALYTICS_ID=UA-000000000-0

# Development Settings
REACT_APP_DEBUG_MODE=false
EOL
fi

# Build the application
npm run build

# Copy mock data to build directory
echo "Copying mock data to build directory..."
cp db.json build/

# Create a simple API endpoint for health checks
mkdir -p build/api
cat > build/api/health.js << 'EOL'
module.exports = (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown'
  });
};
EOL

# Output success message
echo "Build completed successfully!" 