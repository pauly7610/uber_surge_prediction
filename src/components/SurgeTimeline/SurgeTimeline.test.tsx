import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import SurgeTimeline from './SurgeTimeline';
import { GET_HISTORICAL_SURGE_DATA } from '../../graphql/queries';

// Mock the DateRangePicker component since it's complex to test
jest.mock('react-date-range', () => ({
  DateRangePicker: () => <div data-testid="date-range-picker">Date Range Picker</div>
}));

const mockHistoricalData = {
  historicalSurgeData: [
    { timestamp: '2023-10-01T00:00:00Z', multiplier: 1.2 },
    { timestamp: '2023-10-01T01:00:00Z', multiplier: 1.5 },
    { timestamp: '2023-10-01T02:00:00Z', multiplier: 1.8 }
  ]
};

const mocks = [
  {
    request: {
      query: GET_HISTORICAL_SURGE_DATA,
      variables: {
        routeId: 'test-route',
        startDate: expect.any(String),
        endDate: expect.any(String)
      }
    },
    result: {
      data: mockHistoricalData
    }
  }
];

describe('SurgeTimeline', () => {
  const initialData = [
    { timestamp: '2023-10-01T00:00:00Z', multiplier: 1.2 },
    { timestamp: '2023-10-01T01:00:00Z', multiplier: 1.5 }
  ];

  it('renders the component with initial data', () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <SurgeTimeline routeId="test-route" initialData={initialData} />
      </MockedProvider>
    );
    
    expect(screen.getByText('Surge Forecast')).toBeInTheDocument();
    expect(screen.getByTestId('date-range-picker')).toBeInTheDocument();
  });

  it('shows loading state when fetching data', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <SurgeTimeline routeId="test-route" initialData={initialData} />
      </MockedProvider>
    );
    
    // Initially it should show the loading spinner
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    
    // Wait for the data to load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });
}); 