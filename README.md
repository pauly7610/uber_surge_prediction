# Uber Surge Prediction App

A React application for predicting and visualizing Uber surge pricing, allowing users to make informed decisions about ride timing and pricing.

## Features

- Real-time surge pricing visualization
- Predictive surge timeline
- Price locking functionality
- Driver heatmap visualization
- Notification system for surge alerts
- Dark/light theme support

## Tech Stack

- React 18
- TypeScript
- Apollo Client for GraphQL
- Base Web UI framework
- Recharts for data visualization
- PWA support with service workers

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/uber-surge-prediction.git
   cd uber-surge-prediction
   ```

2. Install dependencies:

   ```
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file in the root directory with the required environment variables (see Environment Variables section below).

4. Start the development server:
   ```
   npm run dev
   # or
   yarn dev
   ```
   This will start both the React app and the mock API server.

## Mock API

The application includes a mock API that simulates the GraphQL backend:

### Local Development

- When running locally, the mock API is served from a JSON Server instance
- Start it with `npm run mock-api` or use `npm run dev` to start both the app and API

### Vercel Deployment

- When deployed to Vercel, the mock API is served from a serverless function
- The API is automatically available at `/api/graphql` endpoints
- No additional setup is required for the Vercel deployment

### Available Endpoints

- GraphQL Queries: `/api/graphql`
- GraphQL Mutations: `/api/graphql/mutations`
- GraphQL Subscriptions: `/api/graphql/subscriptions/*`

For more details on the mock API, see the [mock-api/README.md](mock-api/README.md) file.

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

### Application Settings

- `REACT_APP_DEFAULT_SURGE_ROUTE_ID`: Default route ID for surge data
- `REACT_APP_PRICE_LOCK_DURATION`: Duration of price lock in seconds
- `REACT_APP_VERSION`: Application version

### Analytics

- `REACT_APP_GOOGLE_ANALYTICS_ID`: Google Analytics ID

### Development Settings

- `REACT_APP_DEBUG_MODE`: Enable debug mode (true/false)

## Available Scripts

- `npm start`: Runs just the React app in development mode
- `npm run mock-api`: Runs just the mock API server
- `npm run dev`: Runs both the React app and mock API server concurrently
- `npm test`: Launches the test runner
- `npm run build`: Builds the app for production
- `npm run eject`: Ejects from Create React App

## Deployment

### Vercel Deployment

The application is configured for easy deployment to Vercel:

1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect the configuration
3. The mock API will be available through serverless functions
4. No additional configuration is needed

Current deployment: [https://uber-surge-prediction.vercel.app/](https://uber-surge-prediction.vercel.app/)

## Project Structure

```
src/
├── api/              # Serverless API functions for Vercel
├── components/       # UI components
│   ├── common/       # Shared components
│   ├── Driver/       # Driver-related components
│   ├── Layout/       # Layout components
│   ├── Notifications/# Notification components
│   ├── PriceLock/    # Price lock components
│   └── SurgeTimeline/# Surge timeline components
├── context/          # React context providers
├── graphql/          # GraphQL queries, mutations, and subscriptions
├── hooks/            # Custom React hooks
├── mock-api/         # Mock API server for development
├── pages/            # Page components
├── tests/            # Test files
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
├── App.tsx           # Main App component
├── apolloClient.ts   # Apollo Client configuration
├── index.tsx         # Entry point
└── serviceWorker.ts  # Service worker for PWA support
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Based on the PRD for Intelligent Surge Prediction System
- Uses Base Web UI components from Uber
