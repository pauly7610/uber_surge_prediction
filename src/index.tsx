import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
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
  
  // In production, we'll continue with mock values
  if (process.env.NODE_ENV === 'production') {
    console.info('Using mock values for missing environment variables in production');
  }
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
    surgeData {
      id
    }
  }
`;

// Component to handle Apollo connection errors
const ApolloErrorHandler: React.FC<{children: React.ReactNode, client: ApolloClient<any>}> = ({ children, client }) => {
  const [connectionError, setConnectionError] = useState<Error | null>(null);

  useEffect(() => {
    // Skip connection check if we're using mock data
    if (process.env.NODE_ENV === 'production') {
      return;
    }
    
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

// Create a root using the new React 18 API
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');
const root = ReactDOM.createRoot(rootElement);

// Render the app using the new createRoot API
root.render(
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
  </React.StrictMode>
);

// Register service worker based on environment configuration
// Unregister service worker to avoid issues with MIME types and caching
serviceWorker.unregister(); 