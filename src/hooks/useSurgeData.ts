import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_SURGE_DATA } from '../graphql/queries';

interface SurgeData {
  multiplier: number;
  // Add other relevant fields
}

export const useSurgeData = () => {
  const [surgeData, setSurgeData] = useState<SurgeData | null>(null);
  const { data, loading, error } = useQuery(GET_SURGE_DATA);

  useEffect(() => {
    if (data) {
      setSurgeData(data.surgeData);
    }
  }, [data]);

  return { surgeData, loading, error };
}; 