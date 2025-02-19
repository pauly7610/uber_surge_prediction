import React from 'react';
import SurgeTimeline from '../components/SurgeTimeline/SurgeTimeline';

const Dashboard: React.FC = () => {
  const routeId = 'some-route-id'; // Replace with actual route ID
  const initialData = [
    { timestamp: '2023-10-01T00:00:00Z', multiplier: 1.2 },
    { timestamp: '2023-10-01T01:00:00Z', multiplier: 1.5 },
    // Add more initial data as needed
  ];

  return (
    <div>
      <h1>Dashboard</h1>
      <SurgeTimeline routeId={routeId} initialData={initialData} />
    </div>
  );
};

export default Dashboard; 