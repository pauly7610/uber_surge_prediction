import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import PriceLockCard from './PriceLockCard';
import { LOCK_SURGE_PRICE } from '../../graphql/mutations';
import { GET_SURGE_DATA } from '../../graphql/queries';

// Mock the useSurgeData hook
jest.mock('../../hooks/useSurgeData', () => ({
  useSurgeData: () => ({
    surgeData: { multiplier: 1.8 },
    loading: false,
    error: null
  })
}));

const mocks = [
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

describe('PriceLockCard', () => {
  it('renders the component with surge data', () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <PriceLockCard />
      </MockedProvider>
    );
    
    expect(screen.getByText('Lock Current Price')).toBeInTheDocument();
    expect(screen.getByText('Current Multiplier: 1.8x')).toBeInTheDocument();
    expect(screen.getByText('Lock Price for 5 Minutes')).toBeInTheDocument();
  });

  it('locks the price when button is clicked', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <PriceLockCard />
      </MockedProvider>
    );
    
    // Click the lock button
    fireEvent.click(screen.getByText('Lock Price for 5 Minutes'));
    
    // Wait for the success message
    await waitFor(() => {
      expect(screen.getByText(/Price locked at 1.8x for/)).toBeInTheDocument();
    });
  });
}); 