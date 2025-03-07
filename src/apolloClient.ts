import { ApolloClient, InMemoryCache, split, HttpLink, ApolloLink } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { WebSocketLink } from '@apollo/client/link/ws';
import config from './utils/config';

// HTTP link for queries and mutations
const httpLink = new HttpLink({
  uri: config.graphql.httpUri,
});

// Create a custom link for mutations
const mutationLink = new ApolloLink((operation, forward) => {
  // Check if this is a mutation
  const definition = getMainDefinition(operation.query);
  if (definition.kind === 'OperationDefinition' && definition.operation === 'mutation') {
    // Change the URI for mutations
    operation.setContext({
      uri: config.isVercel ? '/api/graphql/mutations' : `${config.graphql.httpUri}/mutations`,
    });
  }
  return forward(operation);
});

// Combine HTTP link with mutation link
const httpMutationLink = ApolloLink.from([mutationLink, httpLink]);

// WebSocket link for subscriptions
// Note: In development with our mock API, this won't actually be used
// but we keep it for when a real GraphQL server is available
let wsLink;

// In Vercel environment, we'll use HTTP polling instead of WebSockets
if (config.isVercel) {
  // Create a polling link that simulates subscriptions
  wsLink = new HttpLink({
    uri: '/api/graphql/subscriptions/notifications',
  });
} else {
  try {
    wsLink = new WebSocketLink({
      uri: config.graphql.wsUri,
      options: {
        reconnect: true,
        connectionParams: {
          // Add authentication if needed
        },
      },
    });
  } catch (error) {
    console.warn('WebSocket connection failed, falling back to HTTP for subscriptions');
    // Create a fallback for subscriptions that uses HTTP
    wsLink = new HttpLink({
      uri: `${config.graphql.httpUri}/subscriptions/notifications`,
    });
  }
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
  httpMutationLink,
);

// Create the Apollo Client with error handling
const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
  connectToDevTools: process.env.NODE_ENV === 'development',
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

export default client; 