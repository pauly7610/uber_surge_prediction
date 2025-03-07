# Uber Surge Prediction Application Documentation

## Overview

The Uber Surge Prediction application is a React-based web application that provides predictive surge pricing information and driver demand visualization. It helps users make informed decisions about ride timing and pricing based on real-time and forecasted data.

## System Architecture

### Client-Side Architecture

The application follows a modern React architecture with the following key components:

- **React 18**: Core UI library
- **TypeScript**: Type-safe JavaScript
- **Apollo Client**: GraphQL client for data fetching
- **Base Web UI**: Component library from Uber
- **Recharts**: Data visualization library
- **Custom SVG Rendering**: For map visualizations

### Server-Side Architecture

The application uses a mock API server for development and serverless functions for production:

- **JSON Server**: Local development mock API
- **Vercel Serverless Functions**: Production API endpoints
- **GraphQL**: API query language

## Installation and Setup

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation Steps

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/uber-surge-prediction.git
   cd uber-surge-prediction
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Create environment files:

   - `.env.development` for development
   - `.env.production` for production
   - `.env.example` as a template

4. Start the development server:
   ```
   npm run dev
   ```

## Port Configuration

The application uses the following ports by default:

- **React Application**: Port 8000 (configured in package.json)
- **Mock API Server**: Port 5000 (configured in mock-api/server.js)

To change these ports:

1. For the React application:

   - Edit the `start-windows` script in `package.json`:
     ```json
     "start-windows": "cross-env PORT=8000 react-scripts start"
     ```

2. For the Mock API server:

   - Edit the port variable in `mock-api/server.js`:
     ```javascript
     const port = process.env.PORT || 5000;
     ```

3. Update the proxy in `package.json`:

   ```json
   "proxy": "http://localhost:5000"
   ```

4. Update GraphQL endpoints in `.env.development`:
   ```
   REACT_APP_GRAPHQL_HTTP_URI=http://localhost:5000/graphql
   REACT_APP_GRAPHQL_WS_URI=ws://localhost:5000/graphql/subscriptions
   ```

## Key Features

### Driver Heatmap with San Francisco Map

The application includes a sophisticated heatmap visualization that displays driver demand across San Francisco:

#### Map Implementation

The San Francisco map is implemented as a custom SVG in `src/components/Driver/DriverHeatmap.tsx`:

- **SanFranciscoMap Component**: Renders the base map with landmarks, streets, and neighborhoods
- **Geographic Elements**:
  - Peninsula shape
  - Pacific Ocean and San Francisco Bay
  - Street grid with major arterial roads
  - Neighborhood boundaries
  - Parks and landmarks
  - Golden Gate and Bay Bridges

#### Heatmap Implementation

The heatmap overlay is implemented in the same file:

- **Heatmap Component**: Renders data points on top of the map
- **Data Generation**: Creates realistic demand patterns based on:
  - Neighborhood hotspots (Financial District, SoMa, Mission, etc.)
  - Major roads and bridges
  - Time-based variation
- **Visual Elements**:
  - Color gradient from blue (low) to red (high)
  - Dynamic sizing based on demand intensity
  - Pulse animations for high-demand areas

#### Usage

The heatmap can be accessed from the Driver tab in the application. Users can select different timeframes to see how demand patterns change.

### Surge Timeline

The surge timeline provides predictive pricing information:

- **Price Forecasting**: Shows predicted surge prices over time
- **Interactive Timeline**: Users can select different time points
- **Price Locking**: Ability to lock in current prices for a limited time

### Notification System

Stay informed about surge pricing changes:

- **Custom Alerts**: Set alerts for specific price thresholds
- **Push Notifications**: Receive notifications when conditions are met
- **Notification History**: View past notifications and their details

## GraphQL API

### Endpoints

- **Queries**: `/graphql`
- **Mutations**: `/graphql/mutations`
- **Subscriptions**: `/graphql/subscriptions/*`

### Key Queries

- `GET_SURGE_DATA`: Fetches surge pricing data
- `GET_DRIVER_HEATMAP_DATA`: Fetches driver demand data
- `GET_NOTIFICATIONS`: Fetches notification data

### Key Mutations

- `LOCK_PRICE`: Locks in a price for a specific time period
- `CREATE_NOTIFICATION`: Creates a new notification alert
- `UPDATE_DRIVER_STATUS`: Updates a driver's status

### Key Subscriptions

- `SURGE_UPDATES`: Real-time updates for surge pricing
- `NOTIFICATION_UPDATES`: Real-time updates for notifications

## Environment Variables

The application uses the following environment variables:

### GraphQL API Endpoints

- `REACT_APP_GRAPHQL_HTTP_URI`: HTTP endpoint for GraphQL API
- `REACT_APP_GRAPHQL_WS_URI`: WebSocket endpoint for GraphQL subscriptions

### Feature Flags

- `REACT_APP_ENABLE_NOTIFICATIONS`: Enable notification system (true/false)
- `REACT_APP_ENABLE_PRICE_LOCK`: Enable price locking feature (true/false)
- `REACT_APP_ENABLE_HEATMAP`: Enable driver heatmap visualization (true/false)

### Map Configuration

- `REACT_APP_MAP_TILE_URL`: Map tile URL template
- `REACT_APP_MAPBOX_ACCESS_TOKEN`: Mapbox access token
- `REACT_APP_DEFAULT_MAP_CENTER`: Default map center coordinates (lat,lng)
- `REACT_APP_DEFAULT_MAP_ZOOM`: Default map zoom level

## Deployment

### Vercel Deployment

The application is configured for easy deployment to Vercel:

1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect the configuration
3. The mock API will be available through serverless functions

### Environment Setup for Deployment

Create the following environment variables in your Vercel project:

- `REACT_APP_GRAPHQL_HTTP_URI`: `/api/graphql`
- `REACT_APP_GRAPHQL_WS_URI`: Set to a WebSocket endpoint or use polling fallback

## Troubleshooting

### Common Issues

1. **WebSocket Connection Errors**:

   - Check that the WebSocket server is running
   - Verify the WebSocket URI is correct
   - Ensure no firewall is blocking WebSocket connections

2. **GraphQL Query Errors**:

   - Check the query syntax
   - Verify the schema matches the query
   - Check network connectivity to the GraphQL endpoint

3. **Port Conflicts**:
   - If ports 8000 or 5000 are already in use, update the configuration as described in the Port Configuration section

### Debugging

The application includes several debugging tools:

1. **Apollo Client DevTools**: Install the browser extension for debugging GraphQL
2. **React DevTools**: Install the browser extension for debugging React components
3. **Debug Mode**: Enable debug mode by setting `REACT_APP_DEBUG_MODE=true`

## Performance Optimization

The application includes several performance optimizations:

1. **Code Splitting**: Lazy loading of components
2. **Memoization**: Using React.memo and useMemo for expensive calculations
3. **GraphQL Caching**: Apollo Client caching for repeated queries
4. **SVG Optimization**: Efficient SVG rendering for the map

## Accessibility

The application follows accessibility best practices:

1. **Keyboard Navigation**: All features are accessible via keyboard
2. **Screen Reader Support**: ARIA labels and roles
3. **Color Contrast**: Sufficient contrast for all text elements
4. **Focus Management**: Clear focus indicators

## Future Enhancements

Planned improvements for the application:

1. **Additional Cities**: Support for other major cities beyond San Francisco
2. **Machine Learning Integration**: More sophisticated prediction algorithms
3. **User Preferences**: Customizable dashboard and alerts
4. **Offline Support**: Enhanced offline capabilities
5. **3D Visualization**: Three-dimensional map views

## Contributing

Please see the CONTRIBUTING.md file for guidelines on contributing to this project.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
