import React from 'react';
import { useStyletron } from 'baseui';
import { Button } from 'baseui/button';
import { ChevronLeft, ChevronRight } from 'baseui/icon';
import { format, addDays, subDays } from 'date-fns';
import CardWrapper from '../common/CardWrapper';

interface DateSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const DateSelector: React.FC<DateSelectorProps> = ({ selectedDate, onDateChange }) => {
  const [css] = useStyletron();
  
  const goToPreviousDay = () => {
    onDateChange(subDays(selectedDate, 1));
  };
  
  const goToNextDay = () => {
    onDateChange(addDays(selectedDate, 1));
  };
  
  const goToToday = () => {
    onDateChange(new Date());
  };
  
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };
  
  return (
    <CardWrapper title="Select Date">
      <div className={css({
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        width: '100%'
      })}>
        <div className={css({
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        })}>
          <Button
            onClick={goToPreviousDay}
            kind="tertiary"
            size="compact"
            shape="square"
          >
            <ChevronLeft size={24} />
          </Button>
          
          <div className={css({
            fontSize: '18px',
            fontWeight: 'bold',
            textAlign: 'center'
          })}>
            {format(selectedDate, 'MMMM d, yyyy')}
          </div>
          
          <Button
            onClick={goToNextDay}
            kind="tertiary"
            size="compact"
            shape="square"
          >
            <ChevronRight size={24} />
          </Button>
        </div>
        
        {!isToday(selectedDate) && (
          <Button
            onClick={goToToday}
            kind="secondary"
            size="compact"
            overrides={{
              BaseButton: {
                style: {
                  width: '100%'
                }
              }
            }}
          >
            Today
          </Button>
        )}
        
        <div className={css({
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '8px'
        })}>
          {[-2, -1, 0, 1, 2].map(offset => {
            const date = addDays(selectedDate, offset);
            const isSelected = offset === 0;
            const isTodayDate = isToday(date);
            
            return (
              <div
                key={offset}
                onClick={() => onDateChange(date)}
                className={css({
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  backgroundColor: isSelected ? 'rgba(0, 0, 0, 0.1)' : 'transparent',
                  border: isTodayDate ? '1px solid rgba(0, 0, 0, 0.2)' : '1px solid transparent'
                })}
              >
                <div className={css({
                  fontSize: '14px',
                  color: '#666666'
                })}>
                  {format(date, 'EEE')}
                </div>
                <div className={css({
                  fontSize: '18px',
                  fontWeight: isSelected ? 'bold' : 'normal'
                })}>
                  {format(date, 'd')}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </CardWrapper>
  );
};

export default DateSelector; 