import { 
  ApolloClient, 
  InMemoryCache, 
  ApolloLink, 
  HttpLink, 
  from, 
  split 
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';
import { getMainDefinition } from '@apollo/client/utilities';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { WebSocketLink } from '@apollo/client/link/ws';
import { SchemaLink } from '@apollo/client/link/schema';
import { makeExecutableSchema } from '@graphql-tools/schema';

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`);
    });
  }
  if (networkError) {
    console.log(`[Network error]: ${networkError}`);
  }
  
  return forward(operation);
});

// Retry link for failed requests
const retryLink = new RetryLink({
  delay: {
    initial: 300,
    max: 3000,
    jitter: true
  },
  attempts: {
    max: 3,
    retryIf: (error, _operation) => !!error
  }
});

// HTTP link for queries and mutations
const httpUri = process.env.NODE_ENV === 'production' 
  ? '/api/graphql'
  : 'http://localhost:5000/graphql';

// Always use mock data for faster loading
const useMockData = true;

const httpLink = new HttpLink({
  uri: httpUri,
});

// Create a custom link for mutations
const mutationLink = new ApolloLink((operation, forward) => {
  // Check if this is a mutation
  const definition = getMainDefinition(operation.query);
  if (definition.kind === 'OperationDefinition' && definition.operation === 'mutation') {
    // Change the URI for mutations
    const baseUri = httpUri;
    const mutationUri = baseUri.endsWith('/') 
      ? `${baseUri}mutations` 
      : `${baseUri}/mutations`;
      
    operation.setContext({
      uri: mutationUri,
    });
  }
  return forward(operation);
});

// Create a WebSocket link for subscriptions
const wsUri = process.env.NODE_ENV === 'production'
  ? (window.location.protocol === 'https:' ? 'wss://' : 'ws://') + 
    window.location.host + '/api/graphql/subscriptions'
  : 'ws://localhost:5000/graphql/subscriptions';

// Function to create WebSocket link
const createWSLink = () => {
  const client = new SubscriptionClient(wsUri, {
    reconnect: true,
    connectionParams: {
      // Add authentication if needed
    },
    connectionCallback: (error) => {
      if (error) {
        console.log('WebSocket error:', error);
      }
    }
  });
  
  client.onConnected(() => console.log('WebSocket connected'));
  client.onDisconnected(() => console.log('WebSocket disconnected'));
  client.onError((error) => console.log('WebSocket error:', error));
  
  return new WebSocketLink(client);
};

// Function to create HTTP polling fallback for subscriptions
const createHttpPollingFallback = () => {
  return new HttpLink({
    uri: httpUri,
    // Add polling logic here if needed
  });
};

// Mock data for client-side GraphQL in production
const mockData = {
  surgeData: [
    { id: "surge-1", multiplier: 1.5, area: "Downtown", timestamp: "2023-03-07T12:00:00Z", duration: 30, demand: "high" },
    { id: "surge-2", multiplier: 2.0, area: "Airport", timestamp: "2023-03-07T13:00:00Z", duration: 45, demand: "very-high" },
    { id: "surge-3", multiplier: 1.2, area: "Suburbs", timestamp: "2023-03-07T14:00:00Z", duration: 20, demand: "medium" }
  ],
  historicalSurgeData: [
    { id: "hist-1", routeId: "some-route-id", multiplier: 1.3, timestamp: "2023-03-01T12:00:00Z", demand: "medium" },
    { id: "hist-2", routeId: "some-route-id", multiplier: 1.8, timestamp: "2023-03-02T13:00:00Z", demand: "high" },
    { id: "hist-3", routeId: "some-route-id", multiplier: 2.2, timestamp: "2023-03-03T14:00:00Z", demand: "very-high" },
    { id: "hist-4", routeId: "some-route-id", multiplier: 1.5, timestamp: "2023-03-04T15:00:00Z", demand: "medium" },
    { id: "hist-5", routeId: "some-route-id", multiplier: 1.2, timestamp: "2023-03-05T16:00:00Z", demand: "low" }
  ],
  driverHeatmapData: [
    { id: "heat-1", x: 100, y: 100, value: 0.8, latitude: 37.7749, longitude: -122.4194, timestamp: "2023-03-07T12:00:00Z" },
    { id: "heat-2", x: 200, y: 150, value: 0.6, latitude: 37.7833, longitude: -122.4167, timestamp: "2023-03-07T12:00:00Z" },
    { id: "heat-3", x: 300, y: 200, value: 0.9, latitude: 37.7694, longitude: -122.4862, timestamp: "2023-03-07T12:00:00Z" }
  ],
  driverPositioningIncentives: [
    { id: "incentive-1", area: "Downtown", incentiveAmount: 5.00, deadline: "2023-03-07T14:00:00Z", estimatedDemand: "high", distance: 2.5, estimatedTimeToArrive: 10 },
    { id: "incentive-2", area: "Airport", incentiveAmount: 8.00, deadline: "2023-03-07T15:00:00Z", estimatedDemand: "very-high", distance: 5.0, estimatedTimeToArrive: 15 },
    { id: "incentive-3", area: "Suburbs", incentiveAmount: 3.00, deadline: "2023-03-07T13:00:00Z", estimatedDemand: "medium", distance: 1.5, estimatedTimeToArrive: 5 }
  ]
};

// Define GraphQL schema for mock data
const typeDefs = `
  type SurgeData {
    id: ID!
    multiplier: Float!
    area: String!
    timestamp: String!
    duration: Int!
    demand: String!
  }
  
  type HistoricalSurgeData {
    id: ID!
    routeId: String!
    multiplier: Float!
    timestamp: String!
    demand: String!
  }
  
  type HeatmapData {
    id: ID!
    x: Int!
    y: Int!
    value: Float!
    latitude: Float!
    longitude: Float!
    timestamp: String!
  }
  
  type DriverIncentive {
    id: ID!
    area: String!
    incentiveAmount: Float!
    deadline: String!
    estimatedDemand: String!
    distance: Float!
    estimatedTimeToArrive: Int!
  }
  
  type Query {
    surgeData: [SurgeData]!
    historicalSurgeData(routeId: String!, startDate: String!, endDate: String!): [HistoricalSurgeData]!
    driverHeatmapData(timeframe: String!): [HeatmapData]!
    driverPositioningIncentives: [DriverIncentive]!
  }
  
  type Subscription {
    surgeUpdates(routeId: String!): [SurgeData]!
  }
`;

// Define resolvers for mock data
const resolvers = {
  Query: {
    surgeData: () => mockData.surgeData,
    historicalSurgeData: (_: any, { routeId }: { routeId: string }) => {
      return mockData.historicalSurgeData.filter(item => item.routeId === routeId);
    },
    driverHeatmapData: () => mockData.driverHeatmapData,
    driverPositioningIncentives: () => mockData.driverPositioningIncentives
  },
  Subscription: {
    surgeUpdates: (_: any, { routeId }: { routeId: string }) => {
      return mockData.surgeData.filter(item => item.area === 'Downtown');
    }
  }
};

// Create schema for mock data
const schema = makeExecutableSchema({ typeDefs, resolvers });

// Create schema link for production
const schemaLink = new SchemaLink({ schema });

// Determine which link to use based on environment
let link;

if (useMockData || process.env.NODE_ENV === 'production') {
  // Use the schema link with mock data for faster loading
  link = from([errorLink, retryLink, schemaLink]);
} else {
  // In development, use the HTTP/WS links
  // Create a split link for HTTP and WS
  let wsLink;
  
  try {
    wsLink = createWSLink();
  } catch (error) {
    console.log('Error creating WebSocket link, falling back to HTTP polling:', error);
    wsLink = createHttpPollingFallback();
  }
  
  // Split links based on operation type
  const splitLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      );
    },
    wsLink,
    from([mutationLink, httpLink])
  );
  
  link = from([errorLink, retryLink, splitLink]);
}

// Create Apollo Client
const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

export default client; 