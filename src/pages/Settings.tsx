import React, { useState, ChangeEvent } from 'react';
import { Grid, Cell } from 'baseui/layout-grid';
import { HeadingLarge, HeadingMedium, ParagraphSmall } from 'baseui/typography';
import { Card } from 'baseui/card';
import { Checkbox } from 'baseui/checkbox';
import { Select, Value } from 'baseui/select';
import { Button } from 'baseui/button';
import { useStyletron } from 'baseui';
import { Notification } from 'baseui/notification';
import { useMutation } from '@apollo/client';
import { UPDATE_NOTIFICATION_PREFERENCES } from '../graphql/mutations';

const Settings: React.FC = () => {
  const [css] = useStyletron();
  const [updatePreferences, { loading, error, data }] = useMutation(UPDATE_NOTIFICATION_PREFERENCES);
  
  const [notificationTypes, setNotificationTypes] = useState({
    preSurgeWarning: true,
    priceLockReminder: true,
    surgeActivation: true
  });
  
  const [notificationChannels, setNotificationChannels] = useState({
    pushNotification: true,
    sms: false,
    email: false
  });
  
  const [notificationTiming, setNotificationTiming] = useState<Value>([
    { id: '4', label: '4 hours before predicted surge' }
  ]);
  
  const timingOptions = [
    { id: '1', label: '1 hour before predicted surge' },
    { id: '2', label: '2 hours before predicted surge' },
    { id: '4', label: '4 hours before predicted surge' },
    { id: '8', label: '8 hours before predicted surge' }
  ];
  
  const handleSavePreferences = () => {
    updatePreferences({
      variables: {
        preferences: {
          notificationTypes,
          notificationChannels,
          notificationTiming: (notificationTiming[0] as {id: string}).id
        }
      }
    });
  };
  
  const handleCheckboxChange = (
    setter: React.Dispatch<React.SetStateAction<any>>,
    state: any,
    key: string
  ) => (e: ChangeEvent<HTMLInputElement>) => {
    setter({
      ...state,
      [key]: e.target.checked
    });
  };
  
  return (
    <div>
      <HeadingLarge>Settings</HeadingLarge>
      
      {data?.updateNotificationPreferences?.success && (
        <Notification kind="positive" closeable>
          Settings saved successfully!
        </Notification>
      )}
      
      {error && (
        <Notification kind="negative" closeable>
          Error saving settings: {error.message}
        </Notification>
      )}
      
      <Grid>
        <Cell span={8}>
          <Card>
            <HeadingMedium>Notification Preferences</HeadingMedium>
            
            <div className={css({ marginBottom: '24px' })}>
              <HeadingMedium $style={{ fontSize: '16px' }}>Notification Types</HeadingMedium>
              <ParagraphSmall>Select which types of notifications you want to receive</ParagraphSmall>
              
              <div className={css({ marginTop: '16px' })}>
                <Checkbox
                  checked={notificationTypes.preSurgeWarning}
                  onChange={handleCheckboxChange(
                    setNotificationTypes,
                    notificationTypes,
                    'preSurgeWarning'
                  )}
                  labelPlacement="right"
                >
                  Pre-Surge Warnings (4hr before predicted surge)
                </Checkbox>
                
                <Checkbox
                  checked={notificationTypes.priceLockReminder}
                  onChange={handleCheckboxChange(
                    setNotificationTypes,
                    notificationTypes,
                    'priceLockReminder'
                  )}
                  labelPlacement="right"
                >
                  Price Lock Reminders (1hr before offer expiration)
                </Checkbox>
                
                <Checkbox
                  checked={notificationTypes.surgeActivation}
                  onChange={handleCheckboxChange(
                    setNotificationTypes,
                    notificationTypes,
                    'surgeActivation'
                  )}
                  labelPlacement="right"
                >
                  Surge Activation Alerts (real-time)
                </Checkbox>
              </div>
            </div>
            
            <div className={css({ marginBottom: '24px' })}>
              <HeadingMedium $style={{ fontSize: '16px' }}>Notification Channels</HeadingMedium>
              <ParagraphSmall>Select how you want to receive notifications</ParagraphSmall>
              
              <div className={css({ marginTop: '16px' })}>
                <Checkbox
                  checked={notificationChannels.pushNotification}
                  onChange={handleCheckboxChange(
                    setNotificationChannels,
                    notificationChannels,
                    'pushNotification'
                  )}
                  labelPlacement="right"
                >
                  Push Notifications (in-app)
                </Checkbox>
                
                <Checkbox
                  checked={notificationChannels.sms}
                  onChange={handleCheckboxChange(
                    setNotificationChannels,
                    notificationChannels,
                    'sms'
                  )}
                  labelPlacement="right"
                >
                  SMS Alerts
                </Checkbox>
                
                <Checkbox
                  checked={notificationChannels.email}
                  onChange={handleCheckboxChange(
                    setNotificationChannels,
                    notificationChannels,
                    'email'
                  )}
                  labelPlacement="right"
                >
                  Email Notifications
                </Checkbox>
              </div>
            </div>
            
            <div className={css({ marginBottom: '24px' })}>
              <HeadingMedium $style={{ fontSize: '16px' }}>Notification Timing</HeadingMedium>
              <ParagraphSmall>How far in advance do you want to be notified?</ParagraphSmall>
              
              <div className={css({ marginTop: '16px', width: '300px' })}>
                <Select
                  options={timingOptions}
                  value={notificationTiming}
                  onChange={params => setNotificationTiming(params.value)}
                  clearable={false}
                />
              </div>
            </div>
            
            <Button
              onClick={handleSavePreferences}
              isLoading={loading}
            >
              Save Preferences
            </Button>
          </Card>
        </Cell>
      </Grid>
    </div>
  );
};

export default Settings; 