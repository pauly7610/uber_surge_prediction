import { ApolloClient, InMemoryCache, split, HttpLink, ApolloLink, from } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { WebSocketLink } from '@apollo/client/link/ws';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';
import config from './utils/config';

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
    });
  }
  
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
  
  // Return the same observable to retry the operation
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
const httpLink = new HttpLink({
  uri: config.graphql.httpUri,
});

// Create a custom link for mutations
const mutationLink = new ApolloLink((operation, forward) => {
  // Check if this is a mutation
  const definition = getMainDefinition(operation.query);
  if (definition.kind === 'OperationDefinition' && definition.operation === 'mutation') {
    // Change the URI for mutations
    const baseUri = config.graphql.httpUri;
    const mutationUri = baseUri.endsWith('/') 
      ? `${baseUri}mutations` 
      : `${baseUri}/mutations`;
      
    operation.setContext({
      uri: mutationUri,
    });
  }
  return forward(operation);
});

// Combine HTTP link with mutation link and error handling
const httpMutationLink = from([errorLink, retryLink, mutationLink, httpLink]);

// WebSocket link for subscriptions
// Note: In development with our mock API, this won't actually be used
// but we keep it for when a real GraphQL server is available
let wsLink;

// Create a subscription HTTP polling fallback
const createHttpPollingFallback = () => {
  console.info('Using HTTP polling fallback for subscriptions');
  const baseUri = config.graphql.httpUri;
  const subscriptionUri = baseUri.endsWith('/') 
    ? `${baseUri}subscriptions/notifications` 
    : `${baseUri}/subscriptions/notifications`;
    
  return new HttpLink({
    uri: subscriptionUri,
  });
};

// In Vercel environment, we'll use HTTP polling instead of WebSockets
if (config.isVercel) {
  // Create a polling link that simulates subscriptions
  wsLink = createHttpPollingFallback();
} else {
  try {
    // Only attempt WebSocket connection if we're in a browser environment
    if (typeof window !== 'undefined') {
      // Create a WebSocket client with better error handling
      const wsClient = new SubscriptionClient(
        config.graphql.wsUri,
        {
          reconnect: true,
          connectionParams: {
            // Add authentication if needed
          },
          timeout: 30000,
          reconnectionAttempts: 5,
          inactivityTimeout: 10000,
          lazy: true
        }
      );
      
      // Add event listeners for connection status
      wsClient.onConnected(() => console.log('WebSocket connected'));
      wsClient.onReconnected(() => console.log('WebSocket reconnected'));
      wsClient.onDisconnected(() => console.warn('WebSocket disconnected'));
      wsClient.onError((error) => console.error('WebSocket error:', error));
      
      // Create the WebSocket link with the client
      wsLink = new WebSocketLink(wsClient);
    } else {
      wsLink = createHttpPollingFallback();
    }
  } catch (error) {
    console.warn('WebSocket connection failed, falling back to HTTP for subscriptions:', error);
    wsLink = createHttpPollingFallback();
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
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // Add cache policies for specific queries if needed
        }
      }
    }
  }),
  connectToDevTools: process.env.NODE_ENV === 'development',
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-and-network',
    },
    query: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-first',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

export default client; 