// Serverless function for Vercel to serve our mock GraphQL API
const mockData = require('../mock-api/db.json');

// Helper function to handle CORS
const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
};

// Handle GraphQL queries
const handleQuery = (query, variables) => {
  if (query.includes('GetSurgeData')) {
    return { data: { surgeData: mockData.surgeData } };
  } 
  else if (query.includes('GetHistoricalSurgeData')) {
    const routeId = variables?.routeId || 'default-route-id';
    const startDate = variables?.startDate;
    const endDate = variables?.endDate;
    
    let historicalData = mockData.historicalSurgeData;
    
    // Filter by date if provided
    if (startDate && endDate) {
      historicalData = historicalData.filter(item => {
        const timestamp = new Date(item.timestamp);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return timestamp >= start && timestamp <= end;
      });
    }
    
    return { data: { historicalSurgeData: historicalData } };
  }
  else if (query.includes('GetPredictedSurgeData')) {
    return { data: { predictedSurgeData: mockData.predictedSurgeData } };
  }
  else if (query.includes('GetDriverHeatmapData')) {
    return { data: { driverHeatmapData: mockData.driverHeatmapData } };
  }
  else if (query.includes('GetDriverPositioningIncentives')) {
    return { data: { driverPositioningIncentives: mockData.driverPositioningIncentives } };
  }
  else if (query.includes('GetUserPreferences')) {
    return { data: { userPreferences: mockData.userPreferences } };
  }
  else if (query.includes('GetPriceLocks')) {
    return { data: { priceLocks: mockData.priceLocks } };
  }
  else if (query.includes('GetSurgeEvents')) {
    return { data: { surgeEvents: mockData.surgeEvents } };
  }
  else {
    return { errors: [{ message: 'Unknown query' }] };
  }
};

// Handle GraphQL mutations
const handleMutation = (query, variables) => {
  if (query.includes('LockSurgePrice')) {
    const routeId = variables?.routeId || 'route-1';
    
    // Get the route from user preferences
    const routes = mockData.userPreferences.routePreferences;
    const route = routes.find(r => r.id === routeId) || routes[0];
    
    // Create a mock price lock
    const priceLock = {
      id: `lock-${Date.now()}`,
      routeId: route.id,
      multiplier: 1.2,
      originalPrice: 45.00,
      lockedPrice: 54.00,
      currentPrice: 81.00,
      savings: 27.00,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      status: 'active',
      route: {
        origin: route.origin,
        destination: route.destination
      }
    };
    
    return {
      data: {
        lockSurgePrice: {
          success: true,
          message: 'Price locked successfully',
          priceLock
        }
      }
    };
  }
  else if (query.includes('UpdateNotificationPreferences')) {
    return {
      data: {
        updateNotificationPreferences: {
          success: true,
          message: 'Notification preferences updated',
          preferences: mockData.userPreferences.notificationPreferences
        }
      }
    };
  }
  else if (query.includes('MarkNotificationAsRead')) {
    return {
      data: {
        markNotificationAsRead: {
          success: true,
          message: 'Notification marked as read'
        }
      }
    };
  }
  else if (query.includes('ClearAllNotifications')) {
    return {
      data: {
        clearAllNotifications: {
          success: true,
          message: 'All notifications cleared'
        }
      }
    };
  }
  else {
    return { errors: [{ message: 'Unknown mutation' }] };
  }
};

// Handle subscription simulation
const handleSubscription = (type) => {
  if (type === 'notifications') {
    const notifications = mockData.notifications;
    const unreadNotifications = notifications.filter(n => !n.read);
    
    if (unreadNotifications.length > 0) {
      // Return the most recent unread notification
      const mostRecent = unreadNotifications.sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      )[0];
      
      return { data: { notification: mostRecent } };
    } else {
      // If no unread notifications, return a random one
      const randomIndex = Math.floor(Math.random() * notifications.length);
      return { data: { notification: notifications[randomIndex] } };
    }
  }
  else if (type === 'surge-updates') {
    // Generate a random surge update
    const multiplier = (1 + Math.random()).toFixed(1);
    const timestamp = new Date().toISOString();
    
    return {
      data: {
        surgeUpdates: {
          routeId: 'default-route-id',
          timestamp,
          multiplier: parseFloat(multiplier)
        }
      }
    };
  }
  else if (type === 'driver-positions') {
    const heatmapData = mockData.driverHeatmapData;
    const randomPositions = [];
    
    // Select 5 random positions
    for (let i = 0; i < 5; i++) {
      const randomIndex = Math.floor(Math.random() * heatmapData.length);
      const position = heatmapData[randomIndex];
      
      randomPositions.push({
        id: `driver-${i + 1}`,
        latitude: position.latitude,
        longitude: position.longitude,
        heading: Math.floor(Math.random() * 360),
        status: ['available', 'busy', 'offline'][Math.floor(Math.random() * 3)]
      });
    }
    
    return { data: { driverPositions: randomPositions } };
  }
  else {
    return { errors: [{ message: 'Unknown subscription type' }] };
  }
};

// Main handler function
module.exports = async (req, res) => {
  // Set CORS headers
  setCorsHeaders(res);
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Parse the URL path
  const path = req.url.split('/').filter(Boolean);
  
  try {
    // Handle GraphQL queries
    if (req.method === 'POST' && !path[1]) {
      const { query, variables } = req.body;
      const result = handleQuery(query, variables);
      res.status(result.errors ? 400 : 200).json(result);
      return;
    }
    
    // Handle GraphQL mutations
    if (req.method === 'POST' && path[1] === 'mutations') {
      const { query, variables } = req.body;
      const result = handleMutation(query, variables);
      res.status(result.errors ? 400 : 200).json(result);
      return;
    }
    
    // Handle GraphQL subscriptions
    if (req.method === 'GET' && path[1] === 'subscriptions' && path[2]) {
      const result = handleSubscription(path[2]);
      res.status(result.errors ? 400 : 200).json(result);
      return;
    }
    
    // Handle unknown routes
    res.status(404).json({ errors: [{ message: 'Not found' }] });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ errors: [{ message: 'Internal server error' }] });
  }
}; 