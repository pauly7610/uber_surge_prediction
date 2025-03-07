import React, { useState, useEffect } from 'react';
import { useSubscription, useQuery } from '@apollo/client';
import { AreaChart, XAxis, YAxis, Tooltip, Area } from 'recharts';
import { Card } from 'baseui/card';
import { DateRangePicker } from 'react-date-range';
import { SURGE_UPDATE_SUBSCRIPTION } from '../../graphql/subscriptions';
import { GET_HISTORICAL_SURGE_DATA } from '../../graphql/queries';
import CustomTooltip from './CustomTooltip';
import PriceLockCard from '../PriceLock/PriceLockCard';
import { HeadingMedium } from 'baseui/typography';
import { Spinner } from 'baseui/spinner';
import { Notification } from 'baseui/notification';
import { useStyletron } from 'baseui';

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
      maxWidth: '600px',
      margin: '0 auto',
    },
  },
};

interface SurgeTimelineProps {
  routeId: string;
  initialData: SurgePrediction[];
}

const SurgeTimeline: React.FC<SurgeTimelineProps> = ({ routeId, initialData }) => {
  const [css] = useStyletron();
  const { data: subscriptionData, loading: subscriptionLoading, error: subscriptionError } = 
    useSubscription(SURGE_UPDATE_SUBSCRIPTION, {
      variables: { routeId }
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
      skip: true // Skip initial fetch
    });

  useEffect(() => {
    if (dateRange[0].startDate && dateRange[0].endDate) {
      refetch({
        routeId,
        startDate: dateRange[0].startDate.toISOString(),
        endDate: dateRange[0].endDate.toISOString()
      }).catch(err => {
        console.error('Error fetching historical data:', err);
        // Could add a more user-friendly error handling here
      });
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

  const isLoading = subscriptionLoading || historyLoading;
  const error = subscriptionError || historyError;
  const chartData = historicalData?.historicalSurgeData || initialData;

  return (
    <Card overrides={TIMELINE_CARD_STYLES}>
      <HeadingMedium>Surge Forecast</HeadingMedium>
      
      {error && (
        <Notification kind="negative" closeable>
          Error loading surge data: {error.message}
        </Notification>
      )}
      
      <DateRangePicker
        ranges={dateRange}
        onChange={handleSelect}
      />
      
      <div className={css({ position: 'relative', minHeight: '200px' })}>
        {isLoading ? (
          <div className={css({
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px',
          })}>
            <Spinner size="large" />
            <span className={css({ marginLeft: '12px' })}>Loading surge data...</span>
          </div>
        ) : chartData && chartData.length > 0 ? (
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <XAxis dataKey="timestamp" />
            <YAxis domain={[1, 'auto']} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="multiplier"
              stroke="#276EF1"
              fill="#276EF1"
              fillOpacity={0.1}
            />
          </AreaChart>
        ) : (
          <div className={css({
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px',
          })}>
            No surge data available for the selected time period
          </div>
        )}
      </div>
      
      <PriceLockCard />
    </Card>
  );
};

export default SurgeTimeline; 