import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from '@apollo/client';
import client from './apolloClient';
import App from './App';
import { BaseProvider, LightTheme } from 'baseui';

ReactDOM.render(
  <ApolloProvider client={client}>
    <BaseProvider theme={LightTheme}>
      <App />
    </BaseProvider>
  </ApolloProvider>,
  document.getElementById('root')
); 