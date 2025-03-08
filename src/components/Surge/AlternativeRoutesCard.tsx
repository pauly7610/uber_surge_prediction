import React from 'react';
import { useStyletron } from 'baseui';
import CardWrapper from '../common/CardWrapper';

// Define the RouteItem interface
interface RouteItem {
  route: string;
  time: number;
  diff: string;
  price: string;
  savings: string;
  isBest: boolean;
}

interface AlternativeRoutesCardProps {
  routes: RouteItem[];
  onSelectRoute?: (route: RouteItem) => void;
  selectedRouteId?: string;
}

const AlternativeRoutesCard: React.FC<AlternativeRoutesCardProps> = ({ 
  routes, 
  onSelectRoute,
  selectedRouteId
}) => {
  const [css] = useStyletron();

  // Define theme colors for consistent styling
  const theme = {
    primary: '#276EF1',
    secondary: '#000000',
    success: '#05A357',
    warning: '#FFC043',
    error: '#E11900',
    textPrimary: '#000000',
    textSecondary: '#545454',
    border: '#EEEEEE',
    cardBackground: '#FFFFFF',
  };

  const handleRouteClick = (route: RouteItem) => {
    if (onSelectRoute) {
      onSelectRoute(route);
    }
  };

  return (
    <CardWrapper title="Alternative Routes" subtitle="Save money with these route options">
      <div className={css({
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      })}>
        {routes.map((route, index) => (
          <div 
            key={`${route.route}-${index}`}
            className={css({
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px',
              borderRadius: '8px',
              border: `1px solid ${selectedRouteId === route.route ? theme.primary : theme.border}`,
              backgroundColor: selectedRouteId === route.route ? 'rgba(39, 110, 241, 0.05)' : 'white',
              cursor: 'pointer',
              ':hover': {
                backgroundColor: 'rgba(39, 110, 241, 0.05)',
                borderColor: theme.primary
              },
              transition: 'all 0.2s ease'
            })}
            onClick={() => handleRouteClick(route)}
          >
            <div className={css({
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            })}>
              <div className={css({
                fontSize: '16px',
                fontWeight: '500',
                color: theme.textPrimary,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              })}>
                {route.route}
                {route.isBest && (
                  <div className={css({
                    fontSize: '12px',
                    fontWeight: '500',
                    color: theme.success,
                    backgroundColor: 'rgba(5, 163, 87, 0.1)',
                    padding: '2px 8px',
                    borderRadius: '12px'
                  })}>
                    Best Value
                  </div>
                )}
              </div>
              <div className={css({
                fontSize: '14px',
                color: theme.textSecondary
              })}>
                {route.time} min {route.diff}
              </div>
            </div>
            <div className={css({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: '4px'
            })}>
              <div className={css({
                fontSize: '16px',
                fontWeight: '500',
                color: theme.textPrimary
              })}>
                {route.price}
              </div>
              {route.savings && (
                <div className={css({
                  fontSize: '14px',
                  color: theme.success
                })}>
                  Save {route.savings}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </CardWrapper>
  );
};

export default AlternativeRoutesCard; 