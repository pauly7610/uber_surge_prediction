/**
 * Utility functions to generate mock data for the surge prediction components
 */

import { format } from 'date-fns';

/**
 * Generate mock timeline data for surge prediction
 * @param date The date to generate data for
 * @returns Array of data points with time and surge values
 */
export const generateMockTimelineData = (date: Date) => {
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  const data = [];
  
  for (let hour = 0; hour < 24; hour++) {
    // Base surge multiplier
    let surge = 1.0;
    
    // Morning rush hour (7-9 AM)
    if (hour >= 7 && hour <= 9 && !isWeekend) {
      surge = 1.5 + Math.random() * 0.5;
    }
    // Evening rush hour (4-7 PM)
    else if (hour >= 16 && hour <= 19 && !isWeekend) {
      surge = 1.7 + Math.random() * 0.8;
    }
    // Weekend evening surge (6-10 PM)
    else if (hour >= 18 && hour <= 22 && isWeekend) {
      surge = 1.4 + Math.random() * 0.6;
    }
    // Late night (11 PM - 2 AM)
    else if (hour >= 23 || hour <= 2) {
      surge = 1.2 + Math.random() * 0.4;
    }
    // Add some randomness
    surge += (Math.random() - 0.5) * 0.2;
    surge = Math.max(1.0, Math.round(surge * 10) / 10);
    
    // Format the time
    const timeDate = new Date(date);
    timeDate.setHours(hour, 0, 0, 0);
    const time = `${hour}:00`;
    const formattedTime = format(timeDate, 'h a');
    
    data.push({
      hour,
      time,
      formattedTime,
      surge,
      confidence: 0.7 + Math.random() * 0.3
    });
  }
  
  return data;
};

/**
 * Generate mock route options
 * @param date The date to generate data for
 * @returns Array of route options with time and price information
 */
export const generateMockRoutes = (date: Date) => {
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  
  return [
    {
      route: 'Main St → Downtown',
      time: 15 + (isWeekend ? 2 : 5),
      diff: isWeekend ? '+2' : '+5',
      price: `$${(12 + (isWeekend ? 1 : 3)).toFixed(2)}`,
      savings: `$${(isWeekend ? 0.5 : 2).toFixed(2)}`,
      isBest: true
    },
    {
      route: 'Highway 101',
      time: 12,
      diff: '+0',
      price: `$${(15 + (isWeekend ? 1 : 4)).toFixed(2)}`,
      savings: '',
      isBest: false
    },
    {
      route: 'Coastal Route',
      time: 22,
      diff: '+10',
      price: `$${(10 + (isWeekend ? 0.5 : 2)).toFixed(2)}`,
      savings: `$${(isWeekend ? 1.5 : 5).toFixed(2)}`,
      isBest: false
    }
  ];
};

/**
 * Generate mock time slots
 * @param date The date to generate data for
 * @returns Array of time slots with surge values
 */
export const generateTimeSlots = (date: Date) => {
  const slots = [];
  const now = new Date();
  const startHour = date.getDate() === now.getDate() ? Math.max(now.getHours(), 6) : 6;
  
  // Generate time slots for the next 4 hours, in 30-minute increments
  for (let hour = startHour; hour < startHour + 4; hour++) {
    for (let minute of [0, 30]) {
      // Skip past times
      if (date.getDate() === now.getDate() && 
          hour === now.getHours() && 
          minute <= now.getMinutes()) {
        continue;
      }
      
      // Generate a surge value based on time of day
      let surge = 1.0;
      
      // Morning rush (7-9 AM)
      if (hour >= 7 && hour <= 9) {
        surge = 1.3 + Math.random() * 0.4;
      }
      // Evening rush (4-7 PM)
      else if (hour >= 16 && hour <= 19) {
        surge = 1.5 + Math.random() * 0.7;
      }
      // Late night (10 PM - 2 AM)
      else if (hour >= 22 || hour <= 2) {
        surge = 1.2 + Math.random() * 0.3;
      }
      
      // Add some randomness
      surge += (Math.random() - 0.5) * 0.2;
      surge = Math.max(1.0, Math.round(surge * 10) / 10);
      
      // Format the time
      const timeString = `${hour % 12 || 12}:${minute === 0 ? '00' : minute} ${hour >= 12 ? 'PM' : 'AM'}`;
      
      slots.push({
        hour,
        minute,
        time: timeString,
        surge
      });
    }
  }
  
  return slots;
};

/**
 * Calculate price lock savings
 * @param timelineData The timeline data to calculate from
 * @returns Object with locked price, projected peak, and savings percentage
 */
export const calculatePriceLockSavings = (timelineData: any[]) => {
  // Find the peak surge in the timeline data
  const peakSurge = Math.max(...timelineData.map(item => item.surge));
  
  // Calculate a locked price (slightly above current, but below peak)
  const currentSurge = timelineData[0]?.surge || 1.0;
  const lockedPrice = currentSurge * 1.1;
  
  // Calculate savings percentage
  const savingsPercent = Math.round((peakSurge - lockedPrice) / peakSurge * 100);
  
  return {
    lockedPrice,
    projectedPeak: peakSurge,
    savingsPercent: Math.max(0, savingsPercent)
  };
}; 