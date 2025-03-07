import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Notification } from 'baseui/notification';
import { Button } from 'baseui/button';
import { HeadingMedium, ParagraphSmall } from 'baseui/typography';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Log error to console
    console.error('Uncaught error:', error, errorInfo);
    
    // Call optional onError callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Here you could also log to an error reporting service like Sentry
    // if (process.env.NODE_ENV === 'production') {
    //   logErrorToService(error, errorInfo);
    // }
  }

  private resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
          <Notification kind="negative" overrides={{ Body: { style: { width: '100%' } } }}>
            <HeadingMedium margin={0}>Something went wrong</HeadingMedium>
            <ParagraphSmall>
              {this.state.error?.message || 'An unexpected error occurred'}
            </ParagraphSmall>
            
            {process.env.NODE_ENV !== 'production' && this.state.errorInfo && (
              <details style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>
                <summary>Error Details</summary>
                <ParagraphSmall>
                  {this.state.error?.stack}
                </ParagraphSmall>
                <ParagraphSmall>
                  {this.state.errorInfo.componentStack}
                </ParagraphSmall>
              </details>
            )}
            
            <div style={{ marginTop: '16px' }}>
              <Button onClick={this.resetError}>
                Try again
              </Button>
              <Button 
                kind="tertiary" 
                onClick={() => window.location.reload()}
                overrides={{
                  BaseButton: {
                    style: {
                      marginLeft: '8px'
                    }
                  }
                }}
              >
                Reload page
              </Button>
            </div>
          </Notification>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 