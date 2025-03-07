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

// Define the TIMELINE_CARD_STYLES constant
const TIMELINE_CARD_STYLES = {
  Root: {
    style: {
      width: '100%',
      maxWidth: '100%',
      margin: '0 auto',
      backgroundColor: '#1E1E1E',
      color: '#FFFFFF',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
    },
  },
  Contents: {
    style: {
      padding: '24px',
    }
  }
};

interface SurgeTimelineProps {
  routeId: string;
  initialData: SurgePrediction[];
}

const SurgeTimeline: React.FC<SurgeTimelineProps> = ({ routeId, initialData }) => {
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
    <CardWrapper overrides={TIMELINE_CARD_STYLES}>
      <HeadingMedium $style={{ 
        color: '#FFFFFF', 
        marginTop: 0, 
        marginBottom: '24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        paddingBottom: '12px'
      }}>
        Surge Forecast
      </HeadingMedium>
      
      {error && (
        <Notification kind="negative" closeable>
          Error loading surge data: {error.message}
        </Notification>
      )}
      
      <div className={css({ marginBottom: '20px' })}>
        <div className={css({
          width: '100%',
          maxWidth: '100%',
          overflowX: 'auto',
          backgroundColor: '#FFFFFF',
          padding: '16px',
          borderRadius: '8px'
        })}>
          <DateRangePicker
            ranges={dateRange}
            onChange={handleSelect}
            locale={enUS}
            months={2}
            direction="horizontal"
            showSelectionPreview={true}
            moveRangeOnFirstSelection={false}
          />
        </div>
      </div>
      
      <div className={css({ 
        position: 'relative', 
        minHeight: '300px', 
        marginTop: '20px',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '8px',
        padding: '16px'
      })}>
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
                tick={{ fill: '#FFFFFF' }}
                axisLine={{ stroke: 'rgba(255, 255, 255, 0.3)' }}
                tickLine={{ stroke: 'rgba(255, 255, 255, 0.3)' }}
              />
              <YAxis 
                domain={[1, 'auto']} 
                tick={{ fill: '#FFFFFF' }}
                axisLine={{ stroke: 'rgba(255, 255, 255, 0.3)' }}
                tickLine={{ stroke: 'rgba(255, 255, 255, 0.3)' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="multiplier"
                stroke="#4285F4"
                fill="#4285F4"
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
            color: 'rgba(255, 255, 255, 0.7)'
          })}>
            No surge data available for the selected time period
          </div>
        )}
      </div>
    </CardWrapper>
  );
};

export default SurgeTimeline; 