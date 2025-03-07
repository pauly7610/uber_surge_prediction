# Driver Components

This directory contains components related to driver visualization and management in the Uber Surge Prediction application.

## DriverHeatmap

The `DriverHeatmap` component provides a sophisticated visualization of driver demand across San Francisco using a custom SVG map and dynamic heatmap overlay.

### Features

- **Realistic San Francisco Map**: Custom SVG rendering of San Francisco with accurate geography
- **Interactive Timeframe Selection**: Choose between different time periods (Next Hour, Next 3 Hours, Next 6 Hours)
- **Dynamic Hotspots**: Heat points that indicate areas of high demand
- **Color Gradient**: Multi-color gradient from blue (low demand) to red (high demand)
- **Animated Effects**: Pulse animations for high-demand areas
- **Responsive Design**: Adapts to different screen sizes

### Implementation Details

#### Map Rendering

The San Francisco map is implemented as a custom SVG with:

- **Geographic Accuracy**: Proper representation of the peninsula, Pacific Ocean, and San Francisco Bay
- **Street Grid**: Major streets and arterial roads like Market Street, Van Ness, and the Embarcadero
- **Landmarks**: Key locations like the Ferry Building, Coit Tower, Oracle Park, and Salesforce Tower
- **Neighborhoods**: Financial District, SoMa, Mission, Marina, North Beach, and Haight-Ashbury
- **Parks**: Golden Gate Park, Dolores Park, Alamo Square, and the Presidio
- **Bridges**: Golden Gate Bridge and Bay Bridge

#### Heatmap Visualization

The heatmap overlay uses:

- **Dynamic Data Generation**: Creates realistic demand patterns based on San Francisco geography
- **Hotspot Clustering**: Higher demand in downtown, SoMa, and other key areas
- **Time-based Variation**: Different demand patterns based on selected timeframe
- **Road-based Distribution**: Higher likelihood of demand along major roads
- **Size Variation**: Larger circles for higher demand areas
- **Animation**: Pulse effects for high-demand points

#### GraphQL Integration

The component fetches data using:

- **Apollo Client**: Integration with GraphQL backend
- **Loading States**: Spinner during data loading
- **Error Handling**: Graceful error display
- **Mock Data**: Fallback to generated data when needed

### Usage

```jsx
import { DriverHeatmap } from "../components/Driver/DriverHeatmap";

function DashboardPage() {
  return (
    <div>
      <h1>Driver Demand</h1>
      <DriverHeatmap />
    </div>
  );
}
```

### Props

The `DriverHeatmap` component doesn't require any props as it manages its own state internally.

### Internal Components

- **SanFranciscoMap**: Renders the SVG map of San Francisco
- **Heatmap**: Renders the heatmap overlay with data points
- **Select**: Allows users to choose different timeframes

## DriverPositioning

The `DriverPositioning` component provides controls for driver positioning and navigation.

### Features

- **Current Location**: Shows the driver's current location
- **Navigation Controls**: Allows moving to different areas
- **Status Indicators**: Shows online/offline status
- **Direction Controls**: Provides directional movement options

### Usage

```jsx
import { DriverPositioning } from "../components/Driver/DriverPositioning";

function DriverPage() {
  return (
    <div>
      <h1>Driver Controls</h1>
      <DriverPositioning />
    </div>
  );
}
```

## Future Enhancements

Planned improvements for the Driver components:

1. **Real-time Driver Movement**: Animate driver positions in real-time
2. **3D Map View**: Add elevation data for a more immersive experience
3. **Weather Overlay**: Show weather conditions affecting demand
4. **Historical Comparison**: Compare current demand with historical patterns
5. **Predictive Routing**: Suggest optimal routes based on demand forecasts
6. **Additional Cities**: Support for other major cities beyond San Francisco
