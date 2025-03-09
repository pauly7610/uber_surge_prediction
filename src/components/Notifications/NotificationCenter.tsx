import React, { useState } from 'react';
import { useStyletron } from 'baseui';
import { Button } from 'baseui/button';
import { StatefulPopover } from 'baseui/popover';
import { ListItem, ListItemLabel } from 'baseui/list';
import { Tag } from 'baseui/tag';

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
}

// Custom Bell icon component
const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" />
  </svg>
);

const NotificationCenter: React.FC = () => {
  const [, theme] = useStyletron();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Surge Alert',
      message: 'High surge expected in Downtown area in the next hour.',
      timestamp: '10 min ago',
      read: false,
      type: 'warning'
    },
    {
      id: '2',
      title: 'Price Lock Available',
      message: 'Lock in your price now for your upcoming trip.',
      timestamp: '30 min ago',
      read: false,
      type: 'info'
    },
    {
      id: '3',
      title: 'Prediction Updated',
      message: 'Surge prediction for your route has been updated.',
      timestamp: '1 hour ago',
      read: true,
      type: 'info'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const getTagKind = (type: Notification['type']) => {
    switch (type) {
      case 'warning': return 'warning';
      case 'success': return 'positive';
      case 'error': return 'negative';
      default: return 'accent';
    }
  };

  return (
    <StatefulPopover
      content={({ close }) => (
        <div style={{ 
          padding: '16px', 
          maxWidth: '320px', 
          maxHeight: '400px',
          overflowY: 'auto',
          backgroundColor: theme.colors.backgroundPrimary,
          boxShadow: theme.lighting.shadow600
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h3 style={{ margin: 0 }}>Notifications</h3>
            {unreadCount > 0 && (
              <Button 
                size="mini" 
                kind="tertiary" 
                onClick={markAllAsRead}
              >
                Mark all as read
              </Button>
            )}
          </div>
          
          {notifications.length === 0 ? (
            <div style={{ 
              padding: '16px', 
              textAlign: 'center',
              color: theme.colors.contentSecondary
            }}>
              No notifications
            </div>
          ) : (
            <div>
              {notifications.map(notification => (
                <ListItem
                  key={notification.id}
                  endEnhancer={
                    <Tag 
                      kind={getTagKind(notification.type)}
                      closeable={false}
                    >
                      {notification.type}
                    </Tag>
                  }
                  overrides={{
                    Root: {
                      style: {
                        backgroundColor: notification.read ? 'transparent' : theme.colors.backgroundSecondary,
                        marginBottom: '8px',
                        borderRadius: '4px',
                        ':hover': {
                          backgroundColor: theme.colors.backgroundTertiary
                        }
                      },
                      props: {
                        onClick: () => markAsRead(notification.id)
                      }
                    }
                  }}
                >
                  <ListItemLabel 
                    description={notification.message}
                    sublist
                  >
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      width: '100%'
                    }}>
                      <span style={{ 
                        fontWeight: notification.read ? 'normal' : 'bold' 
                      }}>
                        {notification.title}
                      </span>
                      <small style={{ 
                        color: theme.colors.contentTertiary,
                        fontSize: '12px'
                      }}>
                        {notification.timestamp}
                      </small>
                    </div>
                  </ListItemLabel>
                </ListItem>
              ))}
            </div>
          )}
        </div>
      )}
      placement="bottomRight"
    >
      <div style={{ position: 'relative' }}>
        <Button
          kind="tertiary"
          shape="round"
          size="compact"
          overrides={{
            BaseButton: {
              style: {
                backgroundColor: 'transparent'
              }
            }
          }}
        >
          <BellIcon />
        </Button>
        {unreadCount > 0 && (
          <div style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            backgroundColor: theme.colors.negative,
            color: 'white',
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            {unreadCount}
          </div>
        )}
      </div>
    </StatefulPopover>
  );
};

export default NotificationCenter; 