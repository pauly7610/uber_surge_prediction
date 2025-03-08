/**
 * Utility functions to generate mock data for the surge prediction components
 */

/**
 * Generate mock timeline data for surge prediction
 * @param date The date to generate data for
 * @returns Array of data points with time and surge values
 */
export const generateMockTimelineData = (date: Date) => {
  // Use the date to seed some randomness
  const dateNum = date.getDate() + date.getMonth() * 31;
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  const isHoliday = dateNum % 10 === 0; // Every 10th day is a "holiday"
  
  // Base multiplier is higher on weekends and holidays
  const baseMultiplier = isWeekend ? 1.3 : isHoliday ? 1.5 : 1.0;
  
  return Array.from({ length: 24 }, (_, i) => {
    // Morning rush (7-9 AM)
    const morningRush = (i >= 7 && i <= 9) ? 0.5 : 0;
    // Evening rush (4-7 PM)
    const eveningRush = (i >= 16 && i <= 19) ? 0.7 : 0;
    // Late night (10 PM - 2 AM)
    const lateNight = (i >= 22 || i <= 2) ? 0.4 : 0;
    
    // Calculate surge based on time of day
    const timeBasedSurge = morningRush + eveningRush + lateNight;
    
    // Add some randomness
    const randomFactor = Math.sin(i / 3 + dateNum) * 0.3;
    
    // Calculate final surge value
    const surge = Math.max(1.0, baseMultiplier + timeBasedSurge + randomFactor);
    
    // Calculate confidence (higher during predictable times)
    const confidence = 70 + (morningRush || eveningRush ? 20 : 0) - Math.abs(randomFactor) * 30;
    
    return {
      hour: i,
      time: `${i}:00`,
      formattedTime: `${i % 12 === 0 ? 12 : i % 12}:00 ${i < 12 ? 'AM' : 'PM'}`,
      surge: parseFloat(surge.toFixed(2)),
      confidence: Math.round(confidence)
    };
  });
};

/**
 * Generate mock route options
 * @param date The date to generate data for
 * @returns Array of route options with time and price information
 */
export const generateMockRoutes = (date: Date) => {
  // Use the date to seed some randomness
  const dateNum = date.getDate() + date.getMonth() * 31;
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  
  // Base time and price
  const baseTime = isWeekend ? 18 : 22;
  const basePrice = isWeekend ? 22.50 : 28.75;
  
  return [
    { 
      route: 'Via Main St', 
      time: baseTime, 
      diff: '+0', 
      price: basePrice.toFixed(2),
      savings: '0.00',
      isBest: true
    },
    { 
      route: 'Via 5th Ave', 
      time: baseTime + 3, 
      diff: '+3', 
      price: (basePrice * 0.85).toFixed(2),
      savings: (basePrice * 0.15).toFixed(2),
      isBest: false
    },
    { 
      route: 'Via Broadway', 
      time: baseTime + 6, 
      diff: '+6', 
      price: (basePrice * 0.75).toFixed(2),
      savings: (basePrice * 0.25).toFixed(2),
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
  const currentHour = date.getHours();
  const startHour = Math.max(currentHour, 6); // Start at 6 AM or current hour, whichever is later
  
  const slots = [];
  for (let hour = startHour; hour < startHour + 4; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      slots.push({
        hour,
        minute,
        time: `${hour % 12 === 0 ? 12 : hour % 12}:${minute === 0 ? '00' : minute} ${hour < 12 ? 'AM' : 'PM'}`,
        surge: 1 + Math.sin((hour + minute/60) / 3) * 0.5
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
  const basePrice = 25.00;
  const projectedPeak = basePrice * (Math.max(...timelineData.map(item => item.surge)) || 1.5);
  const lockedPrice = basePrice * 1.1; // 10% above base
  const savingsPercent = Math.round(((projectedPeak - lockedPrice) / projectedPeak) * 100);
  
  return {
    basePrice,
    projectedPeak,
    lockedPrice,
    savingsPercent
  };
}; 