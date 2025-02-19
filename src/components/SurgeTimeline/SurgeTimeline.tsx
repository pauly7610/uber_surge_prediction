import React, { useState, useEffect } from 'react';
import { useSubscription, useQuery } from '@apollo/client';
import { AreaChart, XAxis, YAxis, Tooltip, Area } from 'recharts';
import { Card } from 'baseui/card';
import { DateRangePicker } from 'react-date-range';
import { SURGE_UPDATE_SUBSCRIPTION } from '../../graphql/subscriptions';
import { GET_HISTORICAL_SURGE_DATA } from '../../graphql/queries';
import CustomTooltip from './CustomTooltip';
import PriceLockButton from '../PriceLock/PriceLockButton';
import { HeadingMedium } from 'baseui/typography';

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
  const { data, loading } = useSubscription(SURGE_UPDATE_SUBSCRIPTION, {
    variables: { routeId }
  });

  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }
  ]);

  const { data: historicalData, refetch } = useQuery(GET_HISTORICAL_SURGE_DATA, {
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
      });
    }
  }, [dateRange, refetch, routeId]);

  const handleSelect = (ranges: any) => {
    setDateRange([ranges.selection]);
  };

  return (
    <Card overrides={TIMELINE_CARD_STYLES}>
      <HeadingMedium>Surge Forecast</HeadingMedium>
      <DateRangePicker
        ranges={dateRange}
        onChange={handleSelect}
      />
      <AreaChart
        data={historicalData?.historicalSurgeData || initialData}
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
      <PriceLockButton />
    </Card>
  );
};

export default SurgeTimeline; 