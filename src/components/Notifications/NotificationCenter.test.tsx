import React from 'react';
import { render, screen } from '@testing-library/react';
import NotificationCenter from './NotificationCenter';

// Mock the useNotifications hook
jest.mock('../../context/NotificationContext', () => ({
  NotificationProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useNotifications: () => ({
    notifications: [
      {
        id: '1',
        type: 'PRE_SURGE_WARNING',
        message: 'Surge expected in 30 minutes',
        timestamp: new Date().toISOString(),
        read: false
      }
    ],
    markAsRead: jest.fn(),
    clearAll: jest.fn(),
    hasUnread: true
  })
}));

describe('NotificationCenter', () => {
  it('renders notification button with unread indicator', () => {
    render(<NotificationCenter />);
    
    // Find the notification button
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    
    // Check if unread indicator is present
    const unreadIndicator = document.querySelector('div[class*="position: absolute"]');
    expect(unreadIndicator).toBeInTheDocument();
  });
}); 