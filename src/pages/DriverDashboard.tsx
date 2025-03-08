import React, { useState, useEffect } from 'react';
import { Grid, Cell } from 'baseui/layout-grid';
import { HeadingLarge } from 'baseui/typography';
import DriverHeatmap from '../components/Driver/DriverHeatmap';
import SurgeTimeline from '../components/SurgeTimeline/SurgeTimeline';
import CardWrapper from '../components/common/CardWrapper';
import { useStyletron } from 'baseui';
import { Tag } from 'baseui/tag';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { Button } from 'baseui/button';
import { ChevronLeft, ChevronRight } from 'baseui/icon';

const DriverDashboard: React.FC = () => {
  const [css] = useStyletron();
  const routeId = 'driver-route-id';
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentData, setCurrentData] = useState<any>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [heatmapDate, setHeatmapDate] = useState<Date>(new Date());
  
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
    setCurrentData(getDataForDate(selectedDate));
    
    // Generate timeline data
    const newTimelineData = generateDataForDate(selectedDate);
    
    // Get previous day data
    const previousDay = new Date(selectedDate);
    previousDay.setDate(previousDay.getDate() - 1);
    const previousDayData = generateDataForDate(previousDay).slice(10, 15); // Just evening data
    
    // Get next day data
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDayData = generateDataForDate(nextDay).slice(0, 5); // Just morning data
    
    // Combine all data
    setTimelineData([...previousDayData, ...newTimelineData, ...nextDayData]);
    
    // Update heatmap date
    setHeatmapDate(selectedDate);
  }, [selectedDate, generateDataForDate, getDataForDate]);
  
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
  
  // Get day class based on state
  const getDayClass = (day: Date) => {
    const baseStyles = {
      width: '36px',
      height: '36px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      cursor: 'pointer',
      margin: '2px',
      fontSize: '14px',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.1)'
      }
    };
    
    // Selected day
    if (isSameDay(day, selectedDate)) {
      return css({
        ...baseStyles,
        backgroundColor: '#276EF1',
        color: 'white',
        fontWeight: 'bold'
      } as any);
    }
    
    // Today
    if (isToday(day)) {
      return css({
        ...baseStyles,
        border: '1px solid #276EF1',
        fontWeight: 'bold'
      } as any);
    }
    
    // Days with data - all days have data in our case
    return css({
      ...baseStyles,
      color: isSameMonth(day, currentMonth) ? 'white' : 'rgba(255, 255, 255, 0.3)',
      cursor: 'pointer'
    } as any);
  };

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
              <div className={css({
                backgroundColor: '#121212',
                color: 'white',
                padding: '16px',
                borderRadius: '8px'
              })}>
                {/* Calendar header */}
                <div className={css({
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px'
                })}>
                  <Button 
                    kind="tertiary" 
                    size="mini" 
                    onClick={prevMonth}
                    overrides={{
                      BaseButton: {
                        style: {
                          backgroundColor: 'transparent',
                          color: 'white'
                        }
                      }
                    }}
                  >
                    <ChevronLeft size={24} />
                  </Button>
                  
                  <div className={css({
                    fontWeight: 'bold',
                    fontSize: '16px'
                  })}>
                    {format(currentMonth, 'MMMM yyyy')}
                  </div>
                  
                  <Button 
                    kind="tertiary" 
                    size="mini" 
                    onClick={nextMonth}
                    overrides={{
                      BaseButton: {
                        style: {
                          backgroundColor: 'transparent',
                          color: 'white'
                        }
                      }
                    }}
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
                      color: 'rgba(255, 255, 255, 0.7)'
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
                      className={getDayClass(day)}
                      onClick={() => setSelectedDate(day)}
                    >
                      {format(day, 'd')}
                    </div>
                  ))}
                </div>
              </div>
            </CardWrapper>
          </div>
          
          <div className={css({ marginBottom: '24px' })}>
            <CardWrapper title="Driver Insights">
              <div className={css({
                backgroundColor: 'var(--uber-white)',
                color: 'var(--dark-gray)',
                borderRadius: '8px',
                padding: '16px'
              })}>
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
              </div>
            </CardWrapper>
          </div>
        </Cell>
        
        <Cell span={12}>
          <SurgeTimeline routeId={routeId} initialData={timelineData} hideDatePicker={true} />
        </Cell>
      </Grid>
    </div>
  );
};

export default DriverDashboard; 