import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_SURGE_DATA } from '../graphql/queries';

interface SurgeData {
  multiplier: number;
  timestamp?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  estimatedDuration?: number;
}

export const useSurgeData = () => {
  const [surgeData, setSurgeData] = useState<SurgeData | null>(null);
  const { data, loading, error } = useQuery(GET_SURGE_DATA);

  useEffect(() => {
    if (data && !error) {
      setSurgeData(data.surgeData);
    }
  }, [data, error]);

  return { surgeData, loading, error };
}; 