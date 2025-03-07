const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('./db.json');
const middlewares = jsonServer.defaults();
const port = process.env.PORT || 4000;

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares);

// Add custom routes before JSON Server router
server.use(jsonServer.bodyParser);

// GraphQL-like endpoint for queries
server.post('/graphql', (req, res) => {
  const { query, variables } = req.body;
  
  // Simple query parser (this is a very basic implementation)
  if (query.includes('GetSurgeData')) {
    res.jsonp({
      data: {
        surgeData: router.db.get('surgeData').value()
      }
    });
  } 
  else if (query.includes('GetHistoricalSurgeData')) {
    const routeId = variables?.routeId || 'default-route-id';
    const startDate = variables?.startDate;
    const endDate = variables?.endDate;
    
    let historicalData = router.db.get('historicalSurgeData').value();
    
    // Filter by date if provided
    if (startDate && endDate) {
      historicalData = historicalData.filter(item => {
        const timestamp = new Date(item.timestamp);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return timestamp >= start && timestamp <= end;
      });
    }
    
    res.jsonp({
      data: {
        historicalSurgeData: historicalData
      }
    });
  }
  else if (query.includes('GetPredictedSurgeData')) {
    res.jsonp({
      data: {
        predictedSurgeData: router.db.get('predictedSurgeData').value()
      }
    });
  }
  else if (query.includes('GetDriverHeatmapData')) {
    const timeframe = variables?.timeframe || 'current';
    
    res.jsonp({
      data: {
        driverHeatmapData: router.db.get('driverHeatmapData').value()
      }
    });
  }
  else if (query.includes('GetDriverPositioningIncentives')) {
    res.jsonp({
      data: {
        driverPositioningIncentives: router.db.get('driverPositioningIncentives').value()
      }
    });
  }
  else if (query.includes('GetUserPreferences')) {
    res.jsonp({
      data: {
        userPreferences: router.db.get('userPreferences').value()
      }
    });
  }
  else if (query.includes('GetPriceLocks')) {
    res.jsonp({
      data: {
        priceLocks: router.db.get('priceLocks').value()
      }
    });
  }
  else if (query.includes('GetSurgeEvents')) {
    res.jsonp({
      data: {
        surgeEvents: router.db.get('surgeEvents').value()
      }
    });
  }
  else {
    // Default response for unknown queries
    res.status(400).jsonp({
      errors: [{ message: 'Unknown query' }]
    });
  }
});

// GraphQL-like endpoint for mutations
server.post('/graphql/mutations', (req, res) => {
  const { query, variables } = req.body;
  
  if (query.includes('LockSurgePrice')) {
    const routeId = variables?.routeId || 'route-1';
    const multiplier = variables?.multiplier || 1.2;
    
    // Get the route from user preferences
    const routes = router.db.get('userPreferences.routePreferences').value();
    const route = routes.find(r => r.id === routeId) || routes[0];
    
    // Create a new price lock
    const newLock = {
      id: `lock-${Date.now()}`,
      routeId: route.id,
      multiplier: multiplier,
      originalPrice: 45.00,
      lockedPrice: 45.00 * multiplier,
      currentPrice: 45.00 * 1.8, // Assume current surge is 1.8x
      savings: 45.00 * (1.8 - multiplier),
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
      status: 'active',
      route: {
        origin: route.origin,
        destination: route.destination
      }
    };
    
    // Add to price locks
    const priceLocks = router.db.get('priceLocks').value();
    priceLocks.push(newLock);
    router.db.set('priceLocks', priceLocks).write();
    
    res.jsonp({
      data: {
        lockSurgePrice: {
          success: true,
          message: 'Price locked successfully',
          priceLock: newLock
        }
      }
    });
  }
  else if (query.includes('UpdateNotificationPreferences')) {
    const preferences = variables?.preferences;
    
    if (preferences) {
      const userPreferences = router.db.get('userPreferences').value();
      userPreferences.notificationPreferences = {
        ...userPreferences.notificationPreferences,
        ...preferences
      };
      router.db.set('userPreferences', userPreferences).write();
    }
    
    res.jsonp({
      data: {
        updateNotificationPreferences: {
          success: true,
          message: 'Notification preferences updated',
          preferences: router.db.get('userPreferences.notificationPreferences').value()
        }
      }
    });
  }
  else if (query.includes('MarkNotificationAsRead')) {
    const notificationId = variables?.id;
    
    if (notificationId) {
      const notifications = router.db.get('notifications').value();
      const updatedNotifications = notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      );
      router.db.set('notifications', updatedNotifications).write();
    }
    
    res.jsonp({
      data: {
        markNotificationAsRead: {
          success: true,
          message: 'Notification marked as read'
        }
      }
    });
  }
  else if (query.includes('ClearAllNotifications')) {
    const notifications = router.db.get('notifications').value();
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    router.db.set('notifications', updatedNotifications).write();
    
    res.jsonp({
      data: {
        clearAllNotifications: {
          success: true,
          message: 'All notifications cleared'
        }
      }
    });
  }
  else {
    res.status(400).jsonp({
      errors: [{ message: 'Unknown mutation' }]
    });
  }
});

// WebSocket endpoint simulation for subscriptions
// Note: This doesn't actually use WebSockets, it's just a REST endpoint
server.get('/graphql/subscriptions/notifications', (req, res) => {
  const notifications = router.db.get('notifications').value();
  const unreadNotifications = notifications.filter(n => !n.read);
  
  if (unreadNotifications.length > 0) {
    // Return the most recent unread notification
    const mostRecent = unreadNotifications.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    )[0];
    
    res.jsonp({
      data: {
        notification: mostRecent
      }
    });
  } else {
    // If no unread notifications, return a random one
    const randomIndex = Math.floor(Math.random() * notifications.length);
    res.jsonp({
      data: {
        notification: notifications[randomIndex]
      }
    });
  }
});

// Surge updates subscription simulation
server.get('/graphql/subscriptions/surge-updates', (req, res) => {
  const routeId = req.query.routeId || 'default-route-id';
  
  // Generate a random surge update
  const multiplier = (1 + Math.random()).toFixed(1);
  const timestamp = new Date().toISOString();
  
  res.jsonp({
    data: {
      surgeUpdates: {
        routeId,
        timestamp,
        multiplier: parseFloat(multiplier)
      }
    }
  });
});

// Driver position updates subscription simulation
server.get('/graphql/subscriptions/driver-positions', (req, res) => {
  const heatmapData = router.db.get('driverHeatmapData').value();
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
  
  res.jsonp({
    data: {
      driverPositions: randomPositions
    }
  });
});

// Use default router
server.use(router);

// Start server
server.listen(port, () => {
  console.log(`JSON Server is running on port ${port}`);
  console.log(`GraphQL endpoint: http://localhost:${port}/graphql`);
  console.log(`GraphQL mutations: http://localhost:${port}/graphql/mutations`);
  console.log(`GraphQL subscriptions: http://localhost:${port}/graphql/subscriptions/*`);
}); 