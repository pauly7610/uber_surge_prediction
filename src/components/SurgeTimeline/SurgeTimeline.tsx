import React, { useState, useEffect } from 'react';
import { useSubscription, useQuery, ApolloError } from '@apollo/client';
import { AreaChart, XAxis, YAxis, Tooltip, Area, ResponsiveContainer } from 'recharts';
import CardWrapper from '../common/CardWrapper';
import { DateRangePicker } from 'react-date-range';
import { SURGE_UPDATE_SUBSCRIPTION } from '../../graphql/subscriptions';
import { GET_HISTORICAL_SURGE_DATA, GET_SURGE_DATA } from '../../graphql/queries';
import CustomTooltip from './CustomTooltip';
import { HeadingMedium } from 'baseui/typography';
import { StyledSpinnerNext as Spinner } from 'baseui/spinner';
import { Notification } from 'baseui/notification';
import { useStyletron } from 'baseui';
import { enUS } from 'date-fns/locale';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

// Define the SurgePrediction type
interface SurgePrediction {
  timestamp: string;
  multiplier: number;
}

// Define styles for the timeline card using CSS variables
const timelineCardStyles = {
  backgroundColor: 'var(--uber-white)',
  color: 'var(--dark-gray)',
  width: '100%',
  maxWidth: '100%',
  margin: '0 auto',
  padding: '24px',
  borderRadius: '8px',
};

// Define styles for the chart container
const chartContainerStyles = {
  position: 'relative' as const,
  minHeight: '300px',
  marginTop: '20px',
  backgroundColor: 'rgba(39, 110, 241, 0.05)',
  borderRadius: '8px',
  padding: '16px',
  border: '1px solid rgba(39, 110, 241, 0.1)',
};

// Define styles for the date picker container
const datePickerContainerStyles = {
  width: '100%',
  maxWidth: '100%',
  overflowX: 'auto' as const,
  backgroundColor: 'var(--uber-white)',
  padding: '16px',
  borderRadius: '8px',
  border: '1px solid var(--light-gray)',
  marginBottom: '20px',
};

// Define styles for the price lock notification
const priceLockNotificationStyles = {
  backgroundColor: 'rgba(39, 110, 241, 0.1)',
  color: 'var(--uber-blue)',
  padding: '12px 16px',
  borderRadius: '8px',
  marginBottom: '16px',
  display: 'flex' as const,
  alignItems: 'center' as const,
  fontSize: 'var(--font-size-body)',
};

interface SurgeTimelineProps {
  routeId: string;
  initialData: SurgePrediction[];
  hideDatePicker?: boolean;
}

const SurgeTimeline: React.FC<SurgeTimelineProps> = ({ routeId, initialData, hideDatePicker = false }) => {
  const [css] = useStyletron();
  
  // Get current surge data
  const { data: currentSurgeData, loading: currentSurgeLoading } = 
    useQuery(GET_SURGE_DATA, {
      fetchPolicy: 'network-only',
      notifyOnNetworkStatusChange: true
    });
  
  // Subscribe to surge updates
  const { data: subscriptionData, loading: subscriptionLoading, error: subscriptionError } = 
    useSubscription(SURGE_UPDATE_SUBSCRIPTION, {
      variables: { routeId },
      onError: (error: ApolloError) => console.error("Subscription error:", error)
    });

  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }
  ]);

  const { data: historicalData, loading: historyLoading, error: historyError, refetch } = 
    useQuery(GET_HISTORICAL_SURGE_DATA, {
      variables: {
        routeId,
        startDate: dateRange[0].startDate.toISOString(),
        endDate: dateRange[0].endDate.toISOString()
      },
      fetchPolicy: 'network-only',
      notifyOnNetworkStatusChange: true,
      onError: (error: ApolloError) => console.error("Historical data query error:", error)
    });

  useEffect(() => {
    if (dateRange[0].startDate && dateRange[0].endDate) {
      try {
        refetch({
          routeId,
          startDate: dateRange[0].startDate.toISOString(),
          endDate: dateRange[0].endDate.toISOString()
        }).catch((err: Error) => {
          console.error('Error fetching historical data:', err);
          // Don't throw the error further to prevent error cascades
        });
      } catch (error) {
        console.error('Error in refetch operation:', error);
        // Safely handle the error without crashing the component
      }
    }
  }, [dateRange, refetch, routeId]);

  type DateRangeSelectionType = {
    [key: string]: {
      startDate: Date;
      endDate: Date;
      key: string;
    }
  };

  const handleSelect = (ranges: DateRangeSelectionType) => {
    setDateRange([ranges.selection]);
  };

  // Use loading state but prioritize showing initial data
  const isLoading = false; // Always show data immediately
  const error = subscriptionError || historyError;
  
  // Always use initialData for immediate display, then merge with API data if available
  const historicalSurgeData = historicalData?.historicalSurgeData || [];
  const currentSurge = currentSurgeData?.surgeData || [];
  const liveUpdates = subscriptionData?.surgeUpdates || [];
  
  // Combine all data sources, but prioritize initialData for immediate display
  const chartData = initialData.length > 0 
    ? initialData 
    : [...historicalSurgeData, ...currentSurge, ...liveUpdates];

  // Format dates for display
  const formattedChartData = chartData.map(item => ({
    ...item,
    formattedTime: new Date(item.timestamp).toLocaleTimeString(),
    timestamp: new Date(item.timestamp).toLocaleString()
  }));

  return (
    <CardWrapper 
      title="Surge Forecast"
      subtitle="View predicted surge pricing over time"
    >
      {/* Price Lock Notification */}
      <div className={css(priceLockNotificationStyles)}>
        <div className={css({
          marginRight: '12px',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: 'var(--uber-blue)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--uber-white)',
          fontWeight: 'bold',
        })}>
          i
        </div>
        Price Lock Available: Lock in standard rates for your evening commute before prices increase.
      </div>

      {error && (
        <Notification kind="negative" closeable>
          Error loading surge data: {error.message}
        </Notification>
      )}
      
      {!hideDatePicker && (
        <div className={css(datePickerContainerStyles)}>
          <DateRangePicker
            ranges={dateRange}
            onChange={handleSelect}
            locale={enUS}
            months={2}
            direction="horizontal"
            showSelectionPreview={true}
            moveRangeOnFirstSelection={false}
            staticRanges={[
              {
                label: 'This Month',
                range: () => ({
                  startDate: new Date(new Date().setDate(1)),
                  endDate: new Date(),
                  key: 'selection',
                }),
                isSelected() { return false; }
              },
              {
                label: 'Last Month',
                range: () => {
                  const today = new Date();
                  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                  const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
                  return {
                    startDate: lastMonth,
                    endDate: lastDayOfLastMonth,
                    key: 'selection',
                  };
                },
                isSelected() { return false; }
              },
              {
                label: '1 day up to today',
                range: () => ({
                  startDate: new Date(new Date().setDate(new Date().getDate() - 1)),
                  endDate: new Date(),
                  key: 'selection',
                }),
                isSelected() { return false; }
              },
              {
                label: '1 day starting today',
                range: () => ({
                  startDate: new Date(),
                  endDate: new Date(new Date().setDate(new Date().getDate() + 1)),
                  key: 'selection',
                }),
                isSelected() { return false; }
              }
            ]}
          />
        </div>
      )}
      
      <div className={css(chartContainerStyles)}>
        {isLoading ? (
          <div className={css({
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '300px',
          })}>
            <Spinner size="large" />
            <span className={css({ marginLeft: '12px' })}>Loading surge data...</span>
          </div>
        ) : formattedChartData && formattedChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={formattedChartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <XAxis 
                dataKey="formattedTime" 
                tick={{ fill: 'var(--dark-gray)' }}
                axisLine={{ stroke: 'var(--light-gray)' }}
                tickLine={{ stroke: 'var(--light-gray)' }}
              />
              <YAxis 
                domain={[1, 'auto']} 
                tick={{ fill: 'var(--dark-gray)' }}
                axisLine={{ stroke: 'var(--light-gray)' }}
                tickLine={{ stroke: 'var(--light-gray)' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="multiplier"
                stroke="var(--uber-blue)"
                fill="var(--uber-blue)"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className={css({
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '300px',
            color: 'var(--medium-gray)'
          })}>
            No surge data available for the selected time period
          </div>
        )}
      </div>
    </CardWrapper>
  );
};

export default SurgeTimeline; 