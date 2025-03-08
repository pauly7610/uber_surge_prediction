import React from 'react';
import { useStyletron } from 'baseui';
import { format, isBefore, isToday } from 'date-fns';
import CardWrapper from '../common/CardWrapper';

// Define types for weather and area generation functions
interface DateType {
  getDate: () => number;
  getMonth: () => number;
  getHours: () => number;
}

// Mock weather data generator
const generateWeather = (date: DateType): string => {
  const options = ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy', 'Stormy', 'Clear'];
  const dateNum = date.getDate() + date.getMonth() * 30;
  return options[dateNum % options.length];
};

// Mock busiest area generator
const generateBusiestArea = (date: DateType): string => {
  const areas = ['Downtown', 'Midtown', 'Airport', 'University', 'Riverside', 'Financial District'];
  const hour = date.getHours();
  const dateNum = date.getDate() + date.getMonth() * 31;
  
  // Different areas are busy at different times
  if (hour >= 7 && hour <= 9) {
    // Morning commute - tends to be Downtown or Financial District
    return areas[dateNum % 2]; // Downtown or Financial District
  } else if (hour >= 11 && hour <= 14) {
    // Lunch time - tends to be Midtown or Riverside
    return areas[2 + (dateNum % 2)]; // Midtown or Riverside
  } else if (hour >= 16 && hour <= 19) {
    // Evening commute - tends to be reverse of morning
    return areas[dateNum % 2 === 0 ? 1 : 0]; // Alternate between Downtown and Financial District
  } else if (hour >= 20 || hour <= 2) {
    // Night life - University or Midtown
    return areas[1 + (dateNum % 2)]; // University or Midtown
  }
  
  // Default - random selection weighted by date
  return areas[dateNum % areas.length];
};

// Define props type for CurrentStatusCard
interface CurrentStatusCardProps {
  selectedDate: Date;
  currentSurge: number;
}

const CurrentStatusCard: React.FC<CurrentStatusCardProps> = ({ selectedDate, currentSurge }) => {
  const [css] = useStyletron();
  
  // Format date and time
  const formattedDate = `${format(selectedDate, 'MMM d, yyyy')} ${format(selectedDate, 'h:mm a')}`;
  
  // Determine if we're showing historical data or predictions
  const isPastDate = isBefore(selectedDate, new Date()) && !isToday(selectedDate);
  const statusType = isPastDate ? 'Historical' : 'Prediction';
  const statusColor = isPastDate ? '#10B981' : '#3B82F6'; // Green for historical, blue for predictions
  
  // Generate dynamic data based on selected date
  const weather = generateWeather(selectedDate);
  const busiestArea = generateBusiestArea(selectedDate);
  
  // Determine if it's rush hour based on time of day
  const hour = selectedDate.getHours();
  const isRushHour = (hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 19);
  
  // Determine demand level based on surge multiplier
  const isHighDemand = currentSurge > 1.5;
  const isLowDemand = currentSurge <= 1.2;
  
  // Determine if price lock is available (only for future dates or today)
  const isPriceLockAvailable = !isPastDate;
  
  return (
    <CardWrapper title="Current Status">
      <div className={css({
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '16px'
      })}>
        <div className={css({
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: statusColor,
        })}></div>
        <div className={css({
          fontSize: '14px',
          color: '#666',
        })}>
          {statusType}
        </div>
        <div className={css({
          marginLeft: 'auto',
          fontSize: '14px',
          color: '#666',
        })}>
          {formattedDate}
        </div>
      </div>
      
      <div className={css({
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '16px'
      })}>
        <div>
          <div className={css({
            fontSize: '14px',
            color: '#666',
            marginBottom: '4px'
          })}>
            Multiplier
          </div>
          <div className={css({
            fontSize: '24px',
            fontWeight: 'bold',
            color: currentSurge > 1.5 ? '#EF4444' : currentSurge > 1.2 ? '#F59E0B' : '#10B981'
          })}>
            {currentSurge.toFixed(1)}x
          </div>
        </div>
        
        <div>
          <div className={css({
            fontSize: '14px',
            color: '#666',
            marginBottom: '4px',
            textAlign: 'right'
          })}>
            Area
          </div>
          <div className={css({
            fontSize: '18px',
            fontWeight: 'bold',
            textAlign: 'right'
          })}>
            {busiestArea}
          </div>
        </div>
      </div>
      
      <div className={css({
        marginBottom: '16px'
      })}>
        <div className={css({
          fontSize: '14px',
          color: '#666',
          marginBottom: '4px'
        })}>
          Weather
        </div>
        <div className={css({
          fontSize: '18px',
        })}>
          {weather}
        </div>
      </div>
      
      <div className={css({
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px'
      })}>
        {isRushHour && (
          <div className={css({
            padding: '6px 12px',
            borderRadius: '16px',
            border: '1px solid #F59E0B',
            color: '#B45309',
            backgroundColor: '#FEF3C7',
            fontSize: '14px',
            fontWeight: '500'
          })}>
            Rush Hour
          </div>
        )}
        
        {isHighDemand && (
          <div className={css({
            padding: '6px 12px',
            borderRadius: '16px',
            border: '1px solid #EF4444',
            color: '#B91C1C',
            backgroundColor: '#FEE2E2',
            fontSize: '14px',
            fontWeight: '500'
          })}>
            High Demand
          </div>
        )}
        
        {isPriceLockAvailable && (
          <div className={css({
            padding: '6px 12px',
            borderRadius: '16px',
            border: '1px solid #10B981',
            color: '#047857',
            backgroundColor: '#D1FAE5',
            fontSize: '14px',
            fontWeight: '500'
          })}>
            Price Lock Available
          </div>
        )}
      </div>
      
      {isLowDemand && (
        <div className={css({
          marginTop: '16px',
          padding: '12px',
          borderRadius: '8px',
          backgroundColor: '#F9FAFB',
          color: '#4B5563',
          fontSize: '14px'
        })}>
          Low demand currently. Good time to book a ride with minimal surge pricing.
        </div>
      )}
    </CardWrapper>
  );
};

export default CurrentStatusCard;