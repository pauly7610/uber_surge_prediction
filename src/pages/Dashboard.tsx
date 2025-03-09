import React, { useState, useEffect } from 'react';
import { useStyletron } from 'baseui';
import { Grid, Cell } from 'baseui/layout-grid';
import { HeadingLarge } from 'baseui/typography';
import { format } from 'date-fns';

// Import components
import DateSelector from '../components/Surge/DateSelector';
import SurgeTimeline from '../components/SurgeTimeline/SurgeTimeline';
import CurrentStatusCard from '../components/Surge/CurrentStatusCard';
import AlternativeRoutesCard from '../components/Surge/AlternativeRoutesCard';
import TimeSlotsCard from '../components/Surge/TimeSlotsCard';
import PriceLockStatusBar from '../components/Surge/PriceLockStatusBar';

// Define interfaces for data types
interface TimelineDataItem {
  hour: number;
  time: string;
  formattedTime: string;
  surge: number;
  confidence: number;
}

interface RouteItem {
  route: string;
  time: number;
  diff: string;
  price: string;
  savings: string;
  isBest: boolean;
  surge?: number;
}

interface TimeSlot {
  hour: number;
  minute: number;
  time: string;
  surge: number;
}

interface PriceLockInfo {
  lockedPrice: number;
  projectedPeak: number;
  savingsPercent: number;
}

// Mock data generators
const generateMockTimelineData = (date: Date): TimelineDataItem[] => {
  const data: TimelineDataItem[] = [];
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  
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

const generateMockRoutes = (date: Date): RouteItem[] => {
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  
  return [
    {
      route: 'Main St → Downtown',
      time: 15 + (isWeekend ? 2 : 5),
      diff: isWeekend ? '+2' : '+5',
      price: `$${(12 + (isWeekend ? 1 : 3)).toFixed(2)}`,
      savings: `$${(isWeekend ? 0.5 : 2).toFixed(2)}`,
      isBest: true,
      surge: 1.2
    },
    {
      route: 'Highway 101',
      time: 12,
      diff: '+0',
      price: `$${(15 + (isWeekend ? 1 : 4)).toFixed(2)}`,
      savings: '',
      isBest: false,
      surge: 1.5
    },
    {
      route: 'Coastal Route',
      time: 22,
      diff: '+10',
      price: `$${(10 + (isWeekend ? 0.5 : 2)).toFixed(2)}`,
      savings: `$${(isWeekend ? 1.5 : 5).toFixed(2)}`,
      isBest: false,
      surge: 1.0
    }
  ];
};

const generateTimeSlots = (date: Date): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const now = new Date();
  
  // Check if the selected date is today, in the future, or in the past
  const isToday = date.getDate() === now.getDate() && 
                  date.getMonth() === now.getMonth() && 
                  date.getFullYear() === now.getFullYear();
  
  const isFutureDate = (date.getFullYear() > now.getFullYear()) ||
                       (date.getFullYear() === now.getFullYear() && date.getMonth() > now.getMonth()) ||
                       (date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() > now.getDate());
                       
  const isPastDate = !isToday && !isFutureDate;
  
  // For past dates, return an empty array (no slots available)
  if (isPastDate) {
    return [];
  }
  
  // For future dates, show all slots from 6 AM to 10 PM
  // For today, start from the current hour (or 6 AM if it's earlier than 6 AM)
  const startHour = isToday ? Math.max(now.getHours(), 6) : 6;
  
  // For today, show slots for the next 4 hours
  // For future dates, show slots for the entire day (6 AM to 10 PM)
  const endHour = isToday ? startHour + 4 : 22;
  
  // Generate time slots in 30-minute increments
  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute of [0, 30]) {
      // For today, skip time slots that have already passed
      if (isToday && 
          hour === now.getHours() && 
          minute <= now.getMinutes()) {
        continue;
      }
      
      // Generate a surge value based on time of day and whether it's a weekend
      let surge = 1.0;
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      
      // Base multiplier is higher on weekends
      const baseMultiplier = isWeekend ? 1.2 : 1.0;
      
      // Morning rush (7-9 AM) - higher on weekdays
      if (hour >= 7 && hour <= 9 && !isWeekend) {
        surge = 1.3 + Math.random() * 0.4;
      }
      // Evening rush (4-7 PM) - high on all days
      else if (hour >= 16 && hour <= 19) {
        surge = 1.5 + Math.random() * 0.7;
      }
      // Late night (10 PM - 2 AM) - higher on weekends
      else if ((hour >= 22 || hour <= 2) && isWeekend) {
        surge = 1.4 + Math.random() * 0.5;
      }
      // Late night (10 PM - 2 AM) - lower on weekdays
      else if (hour >= 22 || hour <= 2) {
        surge = 1.2 + Math.random() * 0.3;
      }
      
      // Apply the base multiplier
      surge *= baseMultiplier;
      
      // Add some randomness
      surge += (Math.random() - 0.5) * 0.2;
      
      // Ensure minimum surge of 1.0 and round to 1 decimal place
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

const calculatePriceLockSavings = (timelineData: TimelineDataItem[]): PriceLockInfo => {
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

const convertToSurgePredictions = (data: TimelineDataItem[], selectedDate: Date): { timestamp: string; multiplier: number }[] => {
  return data.map(item => {
    const date = new Date(selectedDate);
    date.setHours(item.hour, 0, 0, 0);
    return {
      timestamp: date.toISOString(),
      multiplier: item.surge
    };
  });
};

const Dashboard: React.FC = () => {
  const [css] = useStyletron();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [timelineData, setTimelineData] = useState<TimelineDataItem[]>([]);
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [priceLockInfo, setPriceLockInfo] = useState<PriceLockInfo | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<RouteItem | null>(null);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Update data when selected date changes
  useEffect(() => {
    const newTimelineData = generateMockTimelineData(selectedDate);
    const newRoutes = generateMockRoutes(selectedDate);
    const newTimeSlots = generateTimeSlots(selectedDate);
    
    setTimelineData(newTimelineData);
    setRoutes(newRoutes);
    setTimeSlots(newTimeSlots);
    setSelectedTimeSlot(null);
    setSelectedRoute(newRoutes.find(route => route.isBest) || null);
    setPriceLockInfo(null);
  }, [selectedDate]);
  
  // Update price lock info when time slot or route changes
  useEffect(() => {
    if (selectedTimeSlot) {
      // Calculate price lock info based on selected time slot
      const relevantTimelineData = timelineData.filter(item => 
        item.hour >= selectedTimeSlot.hour
      );
      
      const newPriceLockInfo = calculatePriceLockSavings(relevantTimelineData);
      
      // Adjust price based on selected route (or best route if none selected)
      const route = selectedRoute || routes.find(r => r.isBest) || routes[0];
      if (route) {
        // Extract the numeric price from the route price string
        const priceString = route.price.replace('$', '');
        const basePrice = parseFloat(priceString);
        
        // Calculate adjusted prices
        const adjustedLockedPrice = basePrice * (1 + selectedTimeSlot.surge * 0.1);
        const adjustedPeakPrice = basePrice * (1 + newPriceLockInfo.projectedPeak * 0.1);
        
        setPriceLockInfo({
          lockedPrice: adjustedLockedPrice,
          projectedPeak: adjustedPeakPrice,
          savingsPercent: newPriceLockInfo.savingsPercent
        });
      } else {
        // Fallback if no route is available
        setPriceLockInfo({
          lockedPrice: 15.0 * selectedTimeSlot.surge,
          projectedPeak: 15.0 * newPriceLockInfo.projectedPeak,
          savingsPercent: newPriceLockInfo.savingsPercent
        });
      }
    } else {
      // Hide price lock when no time slot is selected
      setPriceLockInfo(null);
    }
  }, [selectedTimeSlot, selectedRoute, timelineData, routes]);
  
  // Handle route selection
  const handleRouteSelect = (route: RouteItem) => {
    setSelectedRoute(route);
  };
  
  // Handle time slot selection
  const handleTimeSlotSelect = (timeSlot: TimeSlot | null) => {
    setSelectedTimeSlot(timeSlot);
    
    if (!timeSlot && !selectedRoute) {
      const bestRoute = routes.find(route => route.isBest);
      if (bestRoute) {
        setSelectedRoute(bestRoute);
      }
    }
  };
  
  // Format current time for display
  const formattedCurrentTime = format(currentTime, 'h:mm a');
  
  // Get the current hour's surge for CurrentStatusCard
  const currentHour = currentTime.getHours();
  const currentSurgeData = timelineData.find(item => item.hour === currentHour);
  const currentSurge = currentSurgeData?.surge || 1.0;
  
  // Convert timeline data to the format expected by SurgeTimeline
  const surgePredictions = convertToSurgePredictions(timelineData, selectedDate);
  
  // Define theme colors
  const theme = {
    primary: '#276EF1',
    secondary: '#000000',
    success: '#05A357',
    warning: '#FFC043',
    error: '#E11900',
    textPrimary: '#000000',
    textSecondary: '#545454',
    textTertiary: '#767676',
    border: '#EEEEEE',
    cardBackground: '#FFFFFF',
    shadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    background: '#F7F8FA'
  };

  return (
    <div className={css({
      padding: '24px',
      backgroundColor: theme.background,
      minHeight: '100vh'
    })}>
      <div className={css({
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      })}>
        <HeadingLarge
          overrides={{
            Block: {
              style: {
                color: theme.secondary,
                margin: 0
              }
            }
          }}
        >
          Surge Predictor
        </HeadingLarge>
        
        <div className={css({
          backgroundColor: 'white',
          padding: '8px 16px',
          borderRadius: '24px',
          boxShadow: theme.shadow,
          display: 'flex',
          alignItems: 'center',
          fontWeight: '500'
        })}>
          <div className={css({
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: theme.success,
            marginRight: '10px'
          })}></div>
          Live: {formattedCurrentTime}
        </div>
      </div>
      
      <Grid>
        {/* Left column - Calendar and Status */}
        <Cell span={[4, 8, 4]}>
          <div className={css({ marginBottom: '24px' })}>
            <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />
          </div>
          
          <div className={css({ marginBottom: '24px' })}>
            <CurrentStatusCard 
              selectedDate={selectedDate} 
              currentSurge={currentSurge} 
            />
          </div>
        </Cell>
        
        {/* Right column - Surge Timeline */}
        <Cell span={[4, 8, 8]}>
          <div className={css({
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden'
          })}>
            <div className={css({
              padding: '16px 16px 0 16px'
            })}>
              {/* Removing the duplicate title and subtitle */}
            </div>
            <div className={css({ padding: '16px' })}>
              <SurgeTimeline 
                routeId="default-route" 
                initialData={surgePredictions} 
                hideDatePicker={true}
              />
            </div>
              </div>
              
          <div className={css({ marginTop: '24px' })}>
            <AlternativeRoutesCard 
              routes={routes} 
              onSelectRoute={handleRouteSelect}
              selectedRouteId={selectedRoute?.route}
            />
              </div>
        </Cell>
        
        {/* Bottom row */}
        <Cell span={[4, 8, 12]}>
          <div className={css({ marginTop: '24px' })}>
            <TimeSlotsCard 
              timeSlots={timeSlots} 
              selectedTimeSlot={selectedTimeSlot} 
              onSelectTimeSlot={handleTimeSlotSelect}
            />
            </div>
        </Cell>
      </Grid>
      
      {/* Price Lock Status Bar - Always visible */}
      <PriceLockStatusBar 
        lockedPrice={priceLockInfo ? priceLockInfo.lockedPrice : 25.0} 
        projectedPeak={priceLockInfo ? priceLockInfo.projectedPeak : 35.0} 
        savingsPercent={priceLockInfo ? priceLockInfo.savingsPercent : 28}
      />
      
      {/* Add padding at the bottom to account for the fixed status bar */}
      <div className={css({ height: '80px' })}></div>
    </div>
  );
};

export default Dashboard; 