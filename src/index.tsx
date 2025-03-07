import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider, ApolloClient, gql } from '@apollo/client';
import { Client as Styletron } from 'styletron-engine-atomic';
import { Provider as StyletronProvider } from 'styletron-react';
import { BaseProvider } from 'baseui';
import client from './apolloClient';
import App from './App';
import ErrorBoundary from './components/common/ErrorBoundary';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Notification } from 'baseui/notification';
import * as serviceWorker from './serviceWorker';
import { validateEnvVariables } from './utils/envValidation';
import config from './utils/config';

// Validate environment variables
if (!validateEnvVariables()) {
  console.warn('Application may not function correctly due to missing environment variables');
}

// Enable debug mode based on environment variable
if (config.debug) {
  console.log('Debug mode enabled');
  console.log('App version:', config.app.version);
  console.log('Feature flags:', config.features);
}

const engine = new Styletron();

// Simple query to check server connection
const TEST_QUERY = gql`
  query TestConnection {
    __typename
  }
`;

// Component to handle Apollo connection errors
const ApolloErrorHandler: React.FC<{children: React.ReactNode, client: ApolloClient<any>}> = ({ children, client }) => {
  const [connectionError, setConnectionError] = useState<Error | null>(null);

  useEffect(() => {
    // Check if we can connect to the GraphQL server
    const checkConnection = async () => {
      try {
        await client.query({
          query: TEST_QUERY,
          fetchPolicy: 'network-only'
        });
      } catch (error) {
        if (error instanceof Error) {
          setConnectionError(error);
        }
      }
    };

    checkConnection();
  }, [client]);

  if (connectionError) {
    return (
      <div style={{ padding: '20px' }}>
        <Notification kind="negative">
          <h3>GraphQL Connection Error</h3>
          <p>Could not connect to the GraphQL server at {config.graphql.httpUri}</p>
          <p>Error: {connectionError.message}</p>
          <button onClick={() => window.location.reload()}>
            Retry Connection
          </button>
        </Notification>
      </div>
    );
  }

  return <>{children}</>;
};

const ThemedApp = () => {
  const { theme } = useTheme();
  
  return (
    <BaseProvider theme={theme}>
      <App />
    </BaseProvider>
  );
};

// Render the app using ReactDOM.render for compatibility
ReactDOM.render(
  <React.StrictMode>
    <ErrorBoundary>
      <StyletronProvider value={engine}>
        <ApolloProvider client={client}>
          <ApolloErrorHandler client={client}>
            <ThemeProvider>
              <ThemedApp />
            </ThemeProvider>
          </ApolloErrorHandler>
        </ApolloProvider>
      </StyletronProvider>
    </ErrorBoundary>
  </React.StrictMode>,
  document.getElementById('root')
);

// Register service worker based on environment configuration
if (process.env.NODE_ENV === 'production') {
  serviceWorker.register();
} else {
  serviceWorker.unregister();
} 