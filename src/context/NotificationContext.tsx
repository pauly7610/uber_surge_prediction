import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSubscription } from '@apollo/client';
import { NOTIFICATION_SUBSCRIPTION } from '../graphql/subscriptions';

export interface Notification {
  id: string;
  type: 'PRE_SURGE_WARNING' | 'PRICE_LOCK_REMINDER' | 'SURGE_ACTIVATION';
  message: string;
  timestamp: string;
  read: boolean;
  expiresAt?: string;
  actionUrl?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  markAsRead: (id: string) => void;
  clearAll: () => void;
  hasUnread: boolean;
  error: Error | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState<Error | null>(null);
  
  const { data, error: subscriptionError } = useSubscription(NOTIFICATION_SUBSCRIPTION, {
    onError: (err) => {
      console.error('Notification subscription error:', err);
      setError(err);
    }
  });
  
  // Update error state if subscription error occurs
  useEffect(() => {
    if (subscriptionError) {
      setError(subscriptionError);
    }
  }, [subscriptionError]);
  
  // Handle new notifications with useCallback to prevent unnecessary re-renders
  const addNotification = useCallback((newNotification: Notification) => {
    setNotifications(prev => {
      // Check if notification already exists to prevent duplicates
      const exists = prev.some(n => n.id === newNotification.id);
      if (exists) return prev;
      
      // Sort by timestamp to ensure correct order
      return [newNotification, ...prev].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    });
  }, []);
  
  // Process incoming notifications
  useEffect(() => {
    if (data?.notification) {
      addNotification(data.notification);
    }
  }, [data, addNotification]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notif => notif.id === id ? { ...notif, read: true } : notif)
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const hasUnread = notifications.some(n => !n.read);

  return (
    <NotificationContext.Provider value={{ notifications, markAsRead, clearAll, hasUnread, error }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}; 