import React, { useState, useEffect } from 'react';
import { useStyletron } from 'baseui';
import CardWrapper from '../common/CardWrapper';
import { Check } from 'baseui/icon';
import { format, isSameDay } from 'date-fns';

interface TimeSlot {
  hour: number;
  minute: number;
  time: string;
  surge: number;
}

interface TimeSlotsCardProps {
  timeSlots: TimeSlot[];
  selectedTimeSlot: TimeSlot | null;
  onSelectTimeSlot: (timeSlot: TimeSlot) => void;
}

const TimeSlotsCard: React.FC<TimeSlotsCardProps> = ({ 
  timeSlots, 
  selectedTimeSlot, 
  onSelectTimeSlot 
}) => {
  const [css] = useStyletron();
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [filteredTimeSlots, setFilteredTimeSlots] = useState<TimeSlot[]>(timeSlots);
  
  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, []);
  
  // Filter time slots whenever current time changes or timeSlots prop changes
  useEffect(() => {
    // Filter out past time slots for today
    const filtered = timeSlots.filter(slot => {
      // If it's not today, show all slots
      if (!isSameDay(currentTime, new Date())) {
        return true;
      }
      
      // For today, filter out past times
      const slotTime = new Date();
      slotTime.setHours(slot.hour, slot.minute, 0, 0);
      return slotTime > currentTime;
    });
    
    setFilteredTimeSlots(filtered);
    
    // If the selected time slot is now in the past, deselect it
    if (selectedTimeSlot) {
      const selectedSlotTime = new Date();
      selectedSlotTime.setHours(selectedTimeSlot.hour, selectedTimeSlot.minute, 0, 0);
      
      if (selectedSlotTime <= currentTime && isSameDay(currentTime, new Date())) {
        // Notify parent that selection is cleared
        onSelectTimeSlot(filtered[0] || null);
      }
    }
  }, [currentTime, timeSlots, selectedTimeSlot, onSelectTimeSlot]);
  
  // Define theme colors for consistent styling
  const theme = {
    primary: '#276EF1',
    secondary: '#000000',
    success: '#05A357',
    warning: '#FFC043',
    error: '#E11900',
    textPrimary: '#000000',
    textSecondary: '#545454',
    border: '#EEEEEE',
  };
  
  // Handle time slot selection
  const handleTimeSlotClick = (timeSlot: TimeSlot) => {
    console.log('Time slot selected:', timeSlot); // Add logging for debugging
    onSelectTimeSlot(timeSlot);
  };
  
  // Helper function to determine if a time slot is selected
  const isTimeSlotSelected = (timeSlot: TimeSlot) => {
    if (!selectedTimeSlot) return false;
    return timeSlot.hour === selectedTimeSlot.hour && 
           timeSlot.minute === selectedTimeSlot.minute;
  };
  
  // Helper function to get color based on surge value
  const getSurgeColor = (surge: number) => {
    if (surge >= 2.0) return '#E11900'; // High surge - red
    if (surge >= 1.5) return '#F57C00'; // Medium-high surge - orange
    if (surge >= 1.2) return '#F59E0B'; // Medium surge - amber
    return '#05A357'; // Low surge - green
  };
  
  // Show a message if no time slots are available
  if (filteredTimeSlots.length === 0) {
    return (
      <CardWrapper title="Departure Times" subtitle="Select your preferred time">
        <div className={css({
          padding: '24px',
          textAlign: 'center',
          color: theme.textSecondary
        })}>
          <p>No more departure times available for today.</p>
          <p>Please check back later or select a future date.</p>
        </div>
      </CardWrapper>
    );
  }
  
  return (
    <CardWrapper title="Departure Times" subtitle="Select your preferred time">
      <div className={css({
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px',
        marginBottom: '16px'
      })}>
        {filteredTimeSlots.map((slot, i) => {
          return (
            <div 
              key={`${slot.hour}-${slot.minute}`}
              className={css({
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                cursor: 'pointer',
                backgroundColor: isTimeSlotSelected(slot) 
                  ? '#F3F4F6' 
                  : 'white',
                borderColor: isTimeSlotSelected(slot) 
                  ? '#9CA3AF' 
                  : '#E5E7EB',
                transition: 'all 0.2s ease',
                ':hover': {
                  borderColor: '#9CA3AF',
                  backgroundColor: '#F9FAFB'
                }
              })}
              onClick={() => handleTimeSlotClick(slot)}
            >
              <div className={css({
                fontSize: '14px',
                fontWeight: isTimeSlotSelected(slot) ? 'bold' : 'normal'
              })}>
                {slot.time}
              </div>
              <div className={css({
                fontSize: '12px',
                color: getSurgeColor(slot.surge),
                marginTop: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              })}>
                {slot.surge.toFixed(1)}x
                {isTimeSlotSelected(slot) && (
                  <Check size={12} />
                )}
              </div>
              {slot.surge >= 1.5 && (
                <div className={css({
                  fontSize: '10px',
                  color: getSurgeColor(slot.surge),
                  marginTop: '4px',
                })}>
                  High demand
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {selectedTimeSlot && (
        <div className={css({
          marginTop: '16px',
          padding: '12px',
          backgroundColor: '#F9FAFB',
          borderRadius: '8px'
        })}>
          <div className={css({
            fontWeight: 'bold',
            marginBottom: '4px'
          })}>
            Selected Time: {selectedTimeSlot.time}
          </div>
          <div>
            Surge Multiplier: {selectedTimeSlot.surge.toFixed(1)}x
          </div>
          <div className={css({
            marginTop: '8px'
          })}>
            {selectedTimeSlot.surge > 1.5 ? (
              <span>High demand expected at this time. Consider booking now to lock in the current price.</span>
            ) : selectedTimeSlot.surge > 1.2 ? (
              <span>Moderate demand expected. Prices are reasonable but may increase.</span>
            ) : (
              <span>Low demand expected. This is a good time to book with minimal surge pricing.</span>
            )}
          </div>
          <div className={css({
            marginTop: '8px',
            fontSize: '12px',
            color: '#6B7280'
          })}>
            Price lock expires at {format(
              new Date(
                new Date().setHours(
                  selectedTimeSlot.hour, 
                  selectedTimeSlot.minute + 25
                )
              ), 
              'h:mm a'
            )}
          </div>
        </div>
      )}
    </CardWrapper>
  );
};

export default TimeSlotsCard; 