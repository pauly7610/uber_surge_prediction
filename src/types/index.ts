export interface SurgeData {
  multiplier: number;
}

export interface SurgePrediction {
  timestamp: string;
  multiplier: number;
}

export interface NotificationPreferences {
  notificationTypes: {
    preSurgeWarning: boolean;
    priceLockReminder: boolean;
    surgeActivation: boolean;
  };
  notificationChannels: {
    pushNotification: boolean;
    sms: boolean;
    email: boolean;
  };
  notificationTiming: string;
} 