# Mock API for Uber Surge Prediction App

This directory contains a mock API server that simulates the GraphQL backend for the Uber Surge Prediction application.

## Overview

The mock API uses [JSON Server](https://github.com/typicode/json-server) to provide a RESTful API with GraphQL-like endpoints. It simulates:

- GraphQL queries for surge data, historical data, driver heatmap, etc.
- GraphQL mutations for price locking and notification preferences
- Simple simulation of GraphQL subscriptions (not real-time, but provides data)

## Getting Started

1. Install dependencies:

   ```
   npm install
   ```

2. Start the mock API server:

   ```
   npm run mock-api
   ```

3. Start the full development environment (React app + mock API):
   ```
   npm run dev
   ```

## API Endpoints

### GraphQL Queries

- `POST http://localhost:4000/graphql`
  - Available queries:
    - `GetSurgeData`: Current surge pricing information
    - `GetHistoricalSurgeData`: Historical surge data with optional date filtering
    - `GetPredictedSurgeData`: Predicted future surge data with confidence levels
    - `GetDriverHeatmapData`: Heatmap data for driver distribution
    - `GetDriverPositioningIncentives`: Available incentives for drivers
    - `GetUserPreferences`: User preferences including notification settings
    - `GetPriceLocks`: Active price locks for the user
    - `GetSurgeEvents`: Historical surge events with metadata

### GraphQL Mutations

- `POST http://localhost:4000/graphql/mutations`
  - Available mutations:
    - `LockSurgePrice`: Lock in current price for a route
    - `UpdateNotificationPreferences`: Update user notification preferences
    - `MarkNotificationAsRead`: Mark a specific notification as read
    - `ClearAllNotifications`: Mark all notifications as read

### GraphQL Subscriptions (Simulated)

- `GET http://localhost:4000/graphql/subscriptions/notifications`: Get notifications
- `GET http://localhost:4000/graphql/subscriptions/surge-updates`: Get surge updates
- `GET http://localhost:4000/graphql/subscriptions/driver-positions`: Get driver position updates

## Available Data

The mock API provides the following data:

### Surge Data

- Current surge multiplier and related information
- Price range, demand level, available drivers, wait time

### Historical & Predicted Surge Data

- 24-hour historical surge data with hourly multipliers
- Future surge predictions with confidence levels

### Driver Data

- Heatmap coordinates with latitude/longitude
- Driver positioning incentives with detailed metadata
- Simulated driver positions with status

### User Data

- Notification preferences (types, channels, timing)
- Display preferences (theme, default views)
- Route preferences with origin/destination

### Price Locks

- Active price locks with savings calculations
- Route information and expiration times

### Surge Events

- Historical surge events with metadata
- Affected areas, causes, and impact levels

## Customizing Data

You can modify the data in `db.json` to simulate different scenarios:

- Change surge multipliers to test different pricing conditions
- Modify notification data to test different alert types
- Update driver incentives to test positioning features
- Adjust user preferences to test personalization features

## Interactive Features

The mock API includes some interactive features:

- Creating new price locks via the `LockSurgePrice` mutation
- Updating notification preferences via the `UpdateNotificationPreferences` mutation
- Marking notifications as read via the `MarkNotificationAsRead` mutation
- Simulated real-time data via the subscription endpoints

## Limitations

This is a simplified mock API and has the following limitations:

- No real-time WebSocket support (subscriptions are simulated)
- Limited query parsing (only checks if query string contains certain keywords)
- No authentication or authorization
- No validation of input data
- No persistent storage (data resets when server restarts)

For a production application, you would need a real GraphQL server with proper schema validation, authentication, and WebSocket support.
