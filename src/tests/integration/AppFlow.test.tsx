import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router-dom';
import App from '../../App';
import { GET_SURGE_DATA, GET_HISTORICAL_SURGE_DATA } from '../../graphql/queries';
import { LOCK_SURGE_PRICE } from '../../graphql/mutations';

// Mock all the necessary GraphQL operations
const mocks = [
  {
    request: {
      query: GET_SURGE_DATA
    },
    result: {
      data: {
        surgeData: {
          multiplier: 1.8
        }
      }
    }
  },
  {
    request: {
      query: GET_HISTORICAL_SURGE_DATA,
      variables: {
        routeId: 'some-route-id',
        startDate: expect.any(String),
        endDate: expect.any(String)
      }
    },
    result: {
      data: {
        historicalSurgeData: [
          { timestamp: '2023-10-01T00:00:00Z', multiplier: 1.2 },
          { timestamp: '2023-10-01T01:00:00Z', multiplier: 1.5 },
          { timestamp: '2023-10-01T02:00:00Z', multiplier: 1.8 }
        ]
      }
    }
  },
  {
    request: {
      query: LOCK_SURGE_PRICE,
      variables: { multiplier: 1.8 }
    },
    result: {
      data: {
        lockSurgePrice: {
          success: true,
          message: 'Price locked successfully'
        }
      }
    }
  }
];

// Mock the router
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/' })
}));

describe('App Integration Flow', () => {
  it('navigates through the app and interacts with components', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      </MockedProvider>
    );
    
    // Wait for the dashboard to load
    await waitFor(() => {
      expect(screen.getByText('Surge Prediction Dashboard')).toBeInTheDocument();
    });
    
    // Check if the surge timeline is displayed
    expect(screen.getByText('Surge Forecast')).toBeInTheDocument();
    
    // Check if the price lock card is displayed
    expect(screen.getByText('Lock Current Price')).toBeInTheDocument();
    
    // Lock the price
    fireEvent.click(screen.getByText('Lock Price for 5 Minutes'));
    
    // Verify the price is locked
    await waitFor(() => {
      expect(screen.getByText(/Price locked at 1.8x for/)).toBeInTheDocument();
    });
    
    // Navigate to the driver dashboard
    fireEvent.click(screen.getByText('Driver View'));
    
    // Verify we're on the driver dashboard
    await waitFor(() => {
      expect(screen.getByText('Driver Dashboard')).toBeInTheDocument();
    });
    
    // Navigate to settings
    fireEvent.click(screen.getByText('Settings'));
    
    // Verify we're on the settings page
    await waitFor(() => {
      expect(screen.getByText('Notification Preferences')).toBeInTheDocument();
    });
  });
}); 