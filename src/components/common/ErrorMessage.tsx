import React from 'react';
import { Notification } from 'baseui/notification';
import { ApolloError } from '@apollo/client';

interface ErrorMessageProps {
  error: ApolloError | Error | string | null | undefined;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ error }) => {
  if (!error) return null;
  
  const errorMessage = typeof error === 'string' 
    ? error 
    : error instanceof Error 
      ? error.message 
      : 'An unknown error occurred';
  
  return (
    <Notification kind="negative" closeable>
      {errorMessage}
    </Notification>
  );
};

export default ErrorMessage; 