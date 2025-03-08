import React, { useState, useEffect } from 'react';
import { Grid, Cell } from 'baseui/layout-grid';
import { HeadingLarge } from 'baseui/typography';
import DriverHeatmap from '../components/Driver/DriverHeatmap';
import DriverSurgeTimeline from '../components/SurgeTimeline/DriverSurgeTimeline';
import CardWrapper from '../components/common/CardWrapper';
import { useStyletron } from 'baseui';
import { Tag } from 'baseui/tag';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { Button } from 'baseui/button';
import { ChevronLeft, ChevronRight } from 'baseui/icon';
import MobileCalendar from '../components/common/MobileCalendar';

const DriverDashboard: React.FC = () => {
  const [css] = useStyletron();
  const routeId = 'driver-route-id';
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentData, setCurrentData] = useState<any>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [heatmapDate, setHeatmapDate] = useState<Date>(new Date());
  const [isOnMobile, setIsOnMobile] = useState(false);
  
  // Base data patterns for different days
  const patterns = {
    weekday: {
      morning: [1.2, 1.5, 1.8, 1.6, 1.4],
      afternoon: [1.3, 1.4, 1.6, 1.9, 2.1],
      evening: [1.7, 2.0, 2.3, 2.1, 1.8]
    },
    weekend: {
      morning: [1.1, 1.2, 1.3, 1.4, 1.3],
      afternoon: [1.5, 1.7, 1.9, 1.8, 1.6],
      evening: [1.8, 2.1, 2.4, 2.2, 1.9]
    },
    holiday: {
      morning: [1.3, 1.6, 1.9, 1.7, 1.5],
      afternoon: [1.7, 1.9, 2.1, 2.0, 1.8],
      evening: [2.2, 2.5, 2.7, 2.5, 2.2]
    },
    rainy: {
      morning: [1.5, 1.8, 2.0, 1.9, 1.7],
      afternoon: [2.0, 2.2, 2.4, 2.3, 2.1],
      evening: [2.5, 2.8, 3.0, 2.8, 2.5]
    }
  };
  
  // Generate data for a specific date
  const generateDataForDate = (date: Date) => {
    // Use the date to seed randomness
    const dateNum = date.getDate() + date.getMonth() * 31;
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const isHoliday = dateNum % 10 === 0; // Every 10th day is a "holiday"
    const isRainy = dateNum % 7 === 0; // Every 7th day is "rainy"
    
    // Select pattern based on date characteristics
    let patternType;
    if (isRainy) patternType = patterns.rainy;
    else if (isHoliday) patternType = patterns.holiday;
    else if (isWeekend) patternType = patterns.weekend;
    else patternType = patterns.weekday;
    
    // Generate data for the selected date
    const result = [];
    
    // Morning data (8 AM - 12 PM)
    for (let i = 0; i < 5; i++) {
      const hour = 8 + i;
      const timestamp = new Date(date);
      timestamp.setHours(hour, 0, 0, 0);
      
      // Add some randomness to the multiplier
      const randomFactor = 0.9 + Math.random() * 0.2;
      const multiplier = patternType.morning[i] * randomFactor;
      
      result.push({
        timestamp: timestamp.toISOString(),
        hour,
        multiplier,
        predicted: true
      });
    }
    
    // Afternoon data (1 PM - 5 PM)
    for (let i = 0; i < 5; i++) {
      const hour = 13 + i;
      const timestamp = new Date(date);
      timestamp.setHours(hour, 0, 0, 0);
      
      // Add some randomness to the multiplier
      const randomFactor = 0.9 + Math.random() * 0.2;
      const multiplier = patternType.afternoon[i] * randomFactor;
      
      result.push({
        timestamp: timestamp.toISOString(),
        hour,
        multiplier,
        predicted: true
      });
    }
    
    // Evening data (6 PM - 10 PM)
    for (let i = 0; i < 5; i++) {
      const hour = 18 + i;
      const timestamp = new Date(date);
      timestamp.setHours(hour, 0, 0, 0);
      
      // Add some randomness to the multiplier
      const randomFactor = 0.9 + Math.random() * 0.2;
      const multiplier = patternType.evening[i] * randomFactor;
      
      result.push({
        timestamp: timestamp.toISOString(),
        hour,
        multiplier,
        predicted: true
      });
    }
    
    return result;
  };
  
  // Function to get data for the selected date
  const getDataForDate = (date: Date) => {
    // Generate data for the selected date
    const dateData = generateDataForDate(date);
    
    // Return the data for the current time of day
    const currentHour = new Date().getHours();
    let timeIndex;
    
    if (currentHour >= 8 && currentHour < 13) {
      // Morning
      timeIndex = currentHour - 8;
    } else if (currentHour >= 13 && currentHour < 18) {
      // Afternoon
      timeIndex = currentHour - 13;
    } else {
      // Evening or night (default to evening)
      timeIndex = Math.min(currentHour - 18, 4);
    }
    
    if (timeIndex < 0) timeIndex = 0;
    
    // Find the appropriate time period
    let period;
    if (currentHour >= 8 && currentHour < 13) {
      period = 'morning';
    } else if (currentHour >= 13 && currentHour < 18) {
      period = 'afternoon';
    } else {
      period = 'evening';
    }
    
    return {
      currentMultiplier: dateData[timeIndex]?.multiplier || 1.0,
      period,
      data: dateData
    };
  };
  
  // Update data when selected date changes
  useEffect(() => {
    // Get data for the selected date
    const data = getDataForDate(selectedDate);
    setCurrentData(data);
    
    // Generate simplified timeline data for the chart
    const simplifiedTimelineData = [];
    
    // Generate data for each hour of the day
    for (let hour = 0; hour < 24; hour++) {
      const timestamp = new Date(selectedDate);
      timestamp.setHours(hour, 0, 0, 0);
      
      // Base multiplier
      let baseMultiplier = 1.0;
      
      // Morning rush (7-9 AM)
      if (hour >= 7 && hour <= 9) {
        baseMultiplier = 1.5 + (Math.random() * 0.5);
      }
      // Lunch time (12-1 PM)
      else if (hour >= 12 && hour <= 13) {
        baseMultiplier = 1.3 + (Math.random() * 0.3);
      }
      // Evening rush (5-7 PM)
      else if (hour >= 17 && hour <= 19) {
        baseMultiplier = 1.8 + (Math.random() * 0.7);
      }
      // Late night (9-10 PM)
      else if (hour >= 21) {
        baseMultiplier = 1.4 + (Math.random() * 0.4);
      }
      // Other times
      else {
        baseMultiplier = 1.0 + (Math.random() * 0.3);
      }
      
      // Add some randomness based on the date
      const dateEffect = (selectedDate.getDate() % 10) / 20; // 0 to 0.45
      const finalMultiplier = baseMultiplier + dateEffect;
      
      simplifiedTimelineData.push({
        timestamp: timestamp.toISOString(),
        multiplier: parseFloat(finalMultiplier.toFixed(2))
      });
    }
    
    setTimelineData(simplifiedTimelineData);
    
    // Update heatmap date
    setHeatmapDate(selectedDate);
  }, [selectedDate, getDataForDate]);
  
  // Calendar navigation functions
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  // Generate calendar days
  const getDaysInMonth = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  };
  
  // Get class for calendar day
  const getDayClass = (day: Date) => {
    const isCurrentMonth = isSameMonth(day, currentMonth);
    const isSelectedDay = isSameDay(day, selectedDate);
    const isTodayDate = isToday(day);
    
    const styles: Record<string, string | number> = {
      opacity: isCurrentMonth ? 1 : 0.3
    };
    
    if (isSelectedDay) {
      styles.backgroundColor = 'var(--primary-color, #276EF1)';
      styles.color = 'white';
    } else if (isTodayDate) {
      styles.border = '1px solid var(--primary-color, #276EF1)';
    }
    
    return styles;
  };

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsOnMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return (
    <div>
      <HeadingLarge>Driver Dashboard</HeadingLarge>
      
      <Grid>
        <Cell span={[4, 8, 8]}>
          <DriverHeatmap selectedDate={heatmapDate} />
        </Cell>
        
        <Cell span={[4, 8, 4]}>
          <div className={css({ marginBottom: '24px' })}>
            <CardWrapper title="Select Date">
              {isOnMobile ? (
                <MobileCalendar 
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                />
              ) : (
                <div>
                  {/* Calendar header */}
                  <div className={css({
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px'
                  })}>
                    <Button
                      onClick={prevMonth}
                      kind="tertiary"
                      size="compact"
                      shape="square"
                    >
                      <ChevronLeft size={24} />
                    </Button>
                    
                    <div className={css({
                      fontSize: '16px',
                      fontWeight: 'bold'
                    })}>
                      {format(currentMonth, 'MMMM yyyy')}
                    </div>
                    
                    <Button
                      onClick={nextMonth}
                      kind="tertiary"
                      size="compact"
                      shape="square"
                    >
                      <ChevronRight size={24} />
                    </Button>
                  </div>
                  
                  {/* Weekday headers */}
                  <div className={css({
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    textAlign: 'center',
                    marginBottom: '8px'
                  })}>
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                      <div key={index} className={css({
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: 'rgba(0, 0, 0, 0.7)'
                      })}>
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  {/* Calendar grid */}
                  <div className={css({
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: '2px',
                    justifyItems: 'center'
                  })}>
                    {getDaysInMonth().map((day, index) => (
                      <div
                        key={index}
                        onClick={() => setSelectedDate(day)}
                        className={css({
                          width: '36px',
                          height: '36px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          borderRadius: '50%',
                          fontSize: '14px',
                          ...getDayClass(day)
                        })}
                      >
                        {format(day, 'd')}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardWrapper>
          </div>
          
          <div className={css({ marginBottom: '24px' })}>
            <CardWrapper title="Driver Insights">
              {currentData && (
                <>
                  <div className={css({
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '16px'
                  })}>
                    <div className={css({
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: selectedDate > new Date() ? 'var(--uber-blue)' : 'var(--success)',
                      marginRight: '8px'
                    })} />
                    <div className={css({
                      fontWeight: 'bold'
                    })}>
                      {selectedDate > new Date() ? 'Predicted' : 'Historical'}
                    </div>
                    <div className={css({
                      marginLeft: 'auto',
                      fontSize: 'var(--font-size-caption)',
                      color: 'var(--medium-gray)'
                    })}>
                      {format(selectedDate, 'MMM d, yyyy')}
                    </div>
                  </div>
                  
                  <div className={css({
                    marginBottom: '16px'
                  })}>
                    <div className={css({
                      fontSize: 'var(--font-size-caption)',
                      color: 'var(--medium-gray)',
                      marginBottom: '4px'
                    })}>
                      Estimated Earnings
                    </div>
                    <div className={css({
                      fontSize: 'var(--font-size-heading-medium)',
                      fontWeight: 'bold',
                      color: 'var(--dark-gray)'
                    })}>
                      ${(120 + (selectedDate.getDate() % 80)).toFixed(2)}
                    </div>
                  </div>
                  
                  <div className={css({
                    marginBottom: '16px'
                  })}>
                    <div className={css({
                      fontSize: 'var(--font-size-caption)',
                      color: 'var(--medium-gray)',
                      marginBottom: '4px'
                    })}>
                      Busiest Areas
                    </div>
                    <div className={css({
                      fontSize: 'var(--font-size-body)',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px'
                    })}>
                      {selectedDate.getDay() === 0 || selectedDate.getDay() === 6 ? (
                        <>
                          <Tag closeable={false} kind="warning">Marina</Tag>
                          <Tag closeable={false} kind="warning">Mission</Tag>
                          <Tag closeable={false} kind="neutral">SoMa</Tag>
                        </>
                      ) : selectedDate.getDate() % 2 === 0 ? (
                        <>
                          <Tag closeable={false} kind="warning">Financial District</Tag>
                          <Tag closeable={false} kind="warning">SoMa</Tag>
                          <Tag closeable={false} kind="neutral">North Beach</Tag>
                        </>
                      ) : (
                        <>
                          <Tag closeable={false} kind="warning">Downtown</Tag>
                          <Tag closeable={false} kind="warning">Haight-Ashbury</Tag>
                          <Tag closeable={false} kind="neutral">Richmond</Tag>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className={css({
                    marginBottom: '16px'
                  })}>
                    <div className={css({
                      fontSize: 'var(--font-size-caption)',
                      color: 'var(--medium-gray)',
                      marginBottom: '4px'
                    })}>
                      Peak Hours
                    </div>
                    <div className={css({
                      fontSize: 'var(--font-size-body)'
                    })}>
                      {selectedDate.getDay() === 0 || selectedDate.getDay() === 6 ? 
                        '11 AM - 2 PM, 7 PM - 10 PM' : 
                        '7 AM - 9 AM, 5 PM - 7 PM'}
                    </div>
                  </div>
                  
                  <div className={css({
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px'
                  })}>
                    {selectedDate.getDate() % 3 === 0 && (
                      <Tag closeable={false} kind="positive">
                        Bonus Available
                      </Tag>
                    )}
                    {selectedDate.getDay() === 5 && (
                      <Tag closeable={false} kind="warning">
                        High Demand Night
                      </Tag>
                    )}
                    {selectedDate.getDate() % 10 === 0 && (
                      <Tag closeable={false} kind="accent">
                        Special Event
                      </Tag>
                    )}
                  </div>
                </>
              )}
            </CardWrapper>
          </div>
        </Cell>
        
        <Cell span={12}>
          <DriverSurgeTimeline routeId={routeId} initialData={timelineData} />
        </Cell>
      </Grid>
    </div>
  );
};

export default DriverDashboard; 