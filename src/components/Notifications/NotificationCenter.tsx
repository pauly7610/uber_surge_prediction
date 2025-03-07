import React, { useState } from 'react';
import { Button } from 'baseui/button';
import { Popover } from 'baseui/popover';
import { Notification as BaseNotification } from 'baseui/notification';
import { useStyletron } from 'baseui';
import { Overflow } from 'baseui/icon';
import { useNotifications, Notification } from '../../context/NotificationContext';
import { LabelSmall, ParagraphSmall } from 'baseui/typography';

const NotificationItem: React.FC<{
  notification: Notification;
  onRead: (id: string) => void;
}> = ({ notification, onRead }) => {
  const [css] = useStyletron();
  
  const getKind = (type: string) => {
    switch (type) {
      case 'PRE_SURGE_WARNING':
        return 'warning';
      case 'PRICE_LOCK_REMINDER':
        return 'info';
      case 'SURGE_ACTIVATION':
        return 'negative';
      default:
        return 'info';
    }
  };

  return (
    <BaseNotification
      kind={getKind(notification.type) as any}
      closeable
      onClose={() => onRead(notification.id)}
      overrides={{
        Body: {
          style: {
            width: '100%',
            marginBottom: '8px',
            opacity: notification.read ? 0.7 : 1,
          },
        },
      }}
    >
      <div>
        <LabelSmall>
          {new Date(notification.timestamp).toLocaleString()}
        </LabelSmall>
        <ParagraphSmall>{notification.message}</ParagraphSmall>
        {notification.actionUrl && (
          <Button
            size="mini"
            kind="secondary"
            onClick={() => {
              window.location.href = notification.actionUrl!;
              onRead(notification.id);
            }}
          >
            Take Action
          </Button>
        )}
      </div>
    </BaseNotification>
  );
};

const NotificationCenter: React.FC = () => {
  const { notifications, markAsRead, clearAll, hasUnread } = useNotifications();
  const [css] = useStyletron();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover
      isOpen={isOpen}
      onClickOutside={() => setIsOpen(false)}
      content={() => (
        <div className={css({
          padding: '16px',
          maxHeight: '400px',
          overflowY: 'auto',
          width: '320px',
        })}>
          <div className={css({
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '16px',
          })}>
            <LabelSmall>Notifications</LabelSmall>
            <Button size="mini" kind="tertiary" onClick={clearAll}>
              Clear All
            </Button>
          </div>
          
          {notifications.length === 0 ? (
            <ParagraphSmall>No notifications</ParagraphSmall>
          ) : (
            notifications.map(notification => (
              <NotificationItem 
                key={notification.id} 
                notification={notification} 
                onRead={markAsRead} 
              />
            ))
          )}
        </div>
      )}
      placement="bottomRight"
      accessibilityType="menu"
    >
      <Button
        kind="tertiary"
        shape="round"
        size="compact"
        onClick={() => setIsOpen(!isOpen)}
        overrides={{
          BaseButton: {
            style: {
              position: 'relative',
            },
          },
        }}
      >
        <Overflow size={24} />
        {hasUnread && (
          <div className={css({
            position: 'absolute',
            top: '0',
            right: '0',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: 'red',
          })} />
        )}
      </Button>
    </Popover>
  );
};

export default NotificationCenter; 