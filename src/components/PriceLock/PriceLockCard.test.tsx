import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import PriceLockCard from './PriceLockCard';
import { LOCK_SURGE_PRICE } from '../../graphql/mutations';

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
  const mockProps = {
    currentPrice: 25.50,
    projectedPeak: 35.75,
    timeRemaining: 30,
    onLockPrice: jest.fn()
  };

  it('renders the component with surge data', () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <PriceLockCard 
          currentPrice={mockProps.currentPrice}
          projectedPeak={mockProps.projectedPeak}
          timeRemaining={mockProps.timeRemaining}
          onLockPrice={mockProps.onLockPrice}
        />
      </MockedProvider>
    );
    
    expect(screen.getByText(/Lock Current Price/i)).toBeInTheDocument();
    expect(screen.getByText(/\$25.50/)).toBeInTheDocument();
    expect(screen.getByText(/\$35.75/)).toBeInTheDocument();
  });

  it('locks the price when button is clicked', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <PriceLockCard 
          currentPrice={mockProps.currentPrice}
          projectedPeak={mockProps.projectedPeak}
          timeRemaining={mockProps.timeRemaining}
          onLockPrice={mockProps.onLockPrice}
        />
      </MockedProvider>
    );
    
    // Click the lock button
    fireEvent.click(screen.getByText(/Lock Price/i));
    
    // Verify onLockPrice was called
    expect(mockProps.onLockPrice).toHaveBeenCalled();
  });
}); 