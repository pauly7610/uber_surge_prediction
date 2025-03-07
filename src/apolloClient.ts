import { ApolloClient, InMemoryCache, split, HttpLink } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { WebSocketLink } from '@apollo/client/link/ws';
import config from './utils/config';

// HTTP link for queries and mutations
const httpLink = new HttpLink({
  uri: config.graphql.httpUri,
});

// WebSocket link for subscriptions
const wsLink = new WebSocketLink({
  uri: config.graphql.wsUri,
  options: {
    reconnect: true,
    connectionParams: {
      // Add authentication if needed
    },
  },
});

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
  httpLink,
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