import React, { useState, useEffect } from 'react';
import { Grid, Cell } from 'baseui/layout-grid';
import { HeadingLarge } from 'baseui/typography';
import SurgeTimeline from '../components/SurgeTimeline/SurgeTimeline';
import CardWrapper from '../components/common/CardWrapper';
import { useStyletron } from 'baseui';
import { Check } from 'baseui/icon';
import { Tag } from 'baseui/tag';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addDays, differenceInDays } from 'date-fns';
import { Button } from 'baseui/button';
import { ChevronLeft, ChevronRight } from 'baseui/icon';
import { mediaQueries } from '../utils/responsive';

const Dashboard: React.FC = () => {
  const [css] = useStyletron();
  const routeId = 'some-route-id';
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentData, setCurrentData] = useState<any>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [timelineData, setTimelineData] = useState<any[]>([]);
  
  // Helper function for notification card styling
  const getNotificationCardStyle = (color: string) => {
    const isWarning = color === '#FFC107';
    return css({
      backgroundColor: isWarning ? 'rgba(255, 248, 225, 1)' : 'rgba(232, 240, 254, 1)',
      padding: '16px', 
      borderRadius: '8px',
      marginBottom: isWarning ? '16px' : '0px',
      borderLeftWidth: '4px',
      borderLeftStyle: 'solid',
      borderLeftColor: color,
      borderRightWidth: '0px',
      borderTopWidth: '0px',
      borderBottomWidth: '0px',
      borderRightStyle: 'solid',
      borderTopStyle: 'solid',
      borderBottomStyle: 'solid',
      borderRightColor: 'transparent',
      borderTopColor: 'transparent',
      borderBottomColor: 'transparent'
    });
  };
  
  // Base data patterns for different days
  const patterns = {
    weekday: {
      morning: [1.2, 1.5, 1.8, 1.6, 1.4],
      afternoon: [1.3, 1.4, 1.6, 1.9, 2.1],
      evening: [1.7, 2.0, 2.3, 2.1, 1.8]
    },
    weekend: {
      morning: [1.1, 1.2, 1.3, 1.4, 1.3],
      afternoon: [1.5, 1.7, 1.9, 2.0, 1.8],
      evening: [2.1, 2.4, 2.6, 2.3, 2.0]
    },
    holiday: {
      morning: [1.3, 1.5, 1.7, 1.6, 1.5],
      afternoon: [1.8, 2.0, 2.2, 2.1, 1.9],
      evening: [2.3, 2.5, 2.8, 2.6, 2.2]
    },
    rainy: {
      morning: [1.5, 1.8, 2.0, 1.9, 1.7],
      afternoon: [2.0, 2.2, 2.4, 2.3, 2.1],
      evening: [2.5, 2.8, 3.0, 2.8, 2.5]
    }
  };
  
  // Weather conditions for different dates
  const weatherConditions = [
    "Sunny", "Partly Cloudy", "Cloudy", "Rainy", "Foggy"
  ];
  
  // Areas for different dates
  const areas = [
    "Downtown", "Financial District", "Marina", "Mission", "SoMa", 
    "North Beach", "Haight-Ashbury", "Richmond", "Sunset", "Castro"
  ];
  
  // Events for different dates
  const events = [
    ["Rush Hour"], 
    ["Morning Commute"], 
    ["Lunch Rush"], 
    ["Concert", "Rush Hour"], 
    ["Sports Game"], 
    ["Festival"], 
    ["Weekend"], 
    ["Street Fair", "Weekend"], 
    ["Conference"], 
    ["Holiday"]
  ];
  
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
    
    // Select area and weather based on date
    const areaIndex = dateNum % areas.length;
    const area = areas[areaIndex];
    const weatherIndex = dateNum % weatherConditions.length;
    const weather = weatherConditions[weatherIndex];
    
    // Select events based on date
    const eventIndex = dateNum % events.length;
    const eventList = events[eventIndex];
    
    // Generate data for the selected date
    const result = [];
    
    // Morning data (8 AM - 12 PM)
    for (let i = 0; i < 5; i++) {
      const hour = 8 + i;
      const timestamp = new Date(date);
      timestamp.setHours(hour, 0, 0, 0);
      
      // Add some randomness to the multiplier
      const randomFactor = 0.9 + (dateNum % 20) / 100;
      const multiplier = patternType.morning[i] * randomFactor;
      
      result.push({
        id: `${date.toISOString().split('T')[0]}-morning-${i}`,
        timestamp: timestamp.toISOString(),
        multiplier: parseFloat(multiplier.toFixed(1)),
        area,
        weather,
        events: eventList
      });
    }
    
    // Afternoon data (1 PM - 5 PM)
    for (let i = 0; i < 5; i++) {
      const hour = 13 + i;
      const timestamp = new Date(date);
      timestamp.setHours(hour, 0, 0, 0);
      
      // Add some randomness to the multiplier
      const randomFactor = 0.9 + (dateNum % 20) / 100;
      const multiplier = patternType.afternoon[i] * randomFactor;
      
      result.push({
        id: `${date.toISOString().split('T')[0]}-afternoon-${i}`,
        timestamp: timestamp.toISOString(),
        multiplier: parseFloat(multiplier.toFixed(1)),
        area,
        weather,
        events: eventList
      });
    }
    
    // Evening data (6 PM - 10 PM)
    for (let i = 0; i < 5; i++) {
      const hour = 18 + i;
      const timestamp = new Date(date);
      timestamp.setHours(hour, 0, 0, 0);
      
      // Add some randomness to the multiplier
      const randomFactor = 0.9 + (dateNum % 20) / 100;
      const multiplier = patternType.evening[i] * randomFactor;
      
      result.push({
        id: `${date.toISOString().split('T')[0]}-evening-${i}`,
        timestamp: timestamp.toISOString(),
        multiplier: parseFloat(multiplier.toFixed(1)),
        area,
        weather,
        events: eventList
      });
    }
    
    return result;
  };
  
  // Function to get data for the selected date
  const getDataForDate = (date: Date) => {
    // Format date to compare just the day, month, and year
    const formattedSelectedDate = format(date, 'yyyy-MM-dd');
    
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
      if (timeIndex < 0) timeIndex = 0;
    }
    
    // Get the appropriate time segment
    let segment;
    if (currentHour >= 8 && currentHour < 13) {
      segment = dateData.slice(0, 5); // Morning
    } else if (currentHour >= 13 && currentHour < 18) {
      segment = dateData.slice(5, 10); // Afternoon
    } else {
      segment = dateData.slice(10, 15); // Evening
    }
    
    // Return the current time's data or the first item if not found
    return segment[Math.min(timeIndex, segment.length - 1)];
  };
  
  // Update current data and timeline data when selected date changes
  useEffect(() => {
    // Set current data for the status card
    setCurrentData(getDataForDate(selectedDate));
    
    // Generate timeline data for the selected date
    const newTimelineData = generateDataForDate(selectedDate);
    
    // Add some historical data (previous day)
    const previousDay = new Date(selectedDate);
    previousDay.setDate(previousDay.getDate() - 1);
    const previousDayData = generateDataForDate(previousDay).slice(-5); // Just evening data
    
    // Add some future data (next day)
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDayData = generateDataForDate(nextDay).slice(0, 5); // Just morning data
    
    // Combine all data
    setTimelineData([...previousDayData, ...newTimelineData, ...nextDayData]);
  }, [selectedDate]);
  
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
      <HeadingLarge>Surge Prediction Dashboard</HeadingLarge>
      
      <Grid>
        <Cell span={[4, 8, 8]}>
          <SurgeTimeline routeId={routeId} initialData={timelineData} hideDatePicker={true} />
        </Cell>
        
        <Cell span={[4, 8, 4]}>
          <div className={css({ marginBottom: '24px' })}>
            <CardWrapper title="Current Status">
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
                        {format(new Date(currentData.timestamp), 'MMM d, yyyy h:mm a')}
                      </div>
                    </div>
                    
                    <div className={css({
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '16px'
                    })}>
                      <div>
                        <div className={css({
                          fontSize: 'var(--font-size-caption)',
                          color: 'var(--medium-gray)',
                          marginBottom: '4px'
                        })}>
                          Multiplier
                        </div>
                        <div className={css({
                          fontSize: 'var(--font-size-heading-medium)',
                          fontWeight: 'bold',
                          color: currentData.multiplier > 1.5 ? 'var(--high-demand)' : 'var(--dark-gray)'
                        })}>
                          {currentData.multiplier.toFixed(1)}x
                        </div>
                      </div>
                      
                      <div>
                        <div className={css({
                          fontSize: 'var(--font-size-caption)',
                          color: 'var(--medium-gray)',
                          marginBottom: '4px',
                          textAlign: 'right'
                        })}>
                          Area
                        </div>
                        <div className={css({
                          fontSize: 'var(--font-size-body)',
                          fontWeight: 'bold',
                          textAlign: 'right'
                        })}>
                          {currentData.area}
                        </div>
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
                        Weather
                      </div>
                      <div className={css({
                        fontSize: 'var(--font-size-body)'
                      })}>
                        {currentData.weather}
                      </div>
                    </div>
                    
                    <div className={css({
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px'
                    })}>
                      {currentData.events && currentData.events.map((event: string, index: number) => (
                        <Tag key={index} closeable={false} kind={event.includes('Rush') ? 'warning' : 'neutral'}>
                          {event}
                        </Tag>
                      ))}
                      {currentData.multiplier > 1.5 && (
                        <Tag closeable={false} kind="negative">
                          High Demand
                        </Tag>
                      )}
                      {selectedDate <= new Date() && (
                        <Tag closeable={false} kind="positive">
                          Price Lock Available
                        </Tag>
                      )}
                    </div>
                  </>
                )}
              </div>
            </CardWrapper>
          </div>
          
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
          
          <CardWrapper title="Recent Notifications">
            <div className={getNotificationCardStyle('#FFC107')}>
              <div className={css({ 
                fontWeight: 'bold', 
                marginBottom: '8px',
                color: '#F57C00'
              })}>
                Pre-Surge Warning
              </div>
              <div className={css({ color: 'rgba(0, 0, 0, 0.7)' })}>
                Expecting {(currentData?.multiplier + 0.3).toFixed(1)}x surge around {new Date().getHours() < 12 ? '5 PM' : '8 PM'} today. Book now to avoid higher prices.
              </div>
            </div>
            
            <div className={getNotificationCardStyle('#4285F4')}>
              <div className={css({ 
                fontWeight: 'bold', 
                marginBottom: '8px',
                color: '#1976D2'
              })}>
                Price Lock Available
              </div>
              <div className={css({ color: 'rgba(0, 0, 0, 0.7)' })}>
                Lock in standard rates for your {new Date().getHours() < 12 ? 'evening' : 'morning'} commute before prices increase.
              </div>
            </div>
          </CardWrapper>
        </Cell>
      </Grid>
    </div>
  );
};

export default Dashboard; 