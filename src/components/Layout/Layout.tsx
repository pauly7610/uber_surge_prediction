import React, { useState, useEffect } from 'react';
import { useStyletron } from 'baseui';
import { AppNavBar, NavItemT } from 'baseui/app-nav-bar';
import { useNavigate, useLocation } from 'react-router-dom';
import NotificationCenter from '../Notifications/NotificationCenter';
import ThemeToggle from '../common/ThemeToggle';

interface LayoutProps {
  children: React.ReactNode;
}

// Accessible icon components using SVG
const HomeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
  </svg>
);

const CarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
  </svg>
);

const ProfileIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
  </svg>
);

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [css] = useStyletron();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const [mainItems, setMainItems] = React.useState<NavItemT[]>([
    { icon: HomeIcon, label: 'Dashboard', info: { path: '/' }, active: location.pathname === '/' },
    { icon: CarIcon, label: 'Driver View', info: { path: '/driver' }, active: location.pathname === '/driver' },
    { icon: SettingsIcon, label: 'Settings', info: { path: '/settings' }, active: location.pathname === '/settings' },
  ]);
  
  React.useEffect(() => {
    // Update active state based on current path
    const updatedMainItems = mainItems.map(item => ({
      ...item,
      active: item.info.path === location.pathname
    }));
    
    // Compare if the active state actually changed to prevent infinite loops
    const activeStateChanged = updatedMainItems.some(
      (item, index) => item.active !== mainItems[index].active
    );
    
    if (activeStateChanged) {
      setMainItems(updatedMainItems);
    }
  }, [location.pathname]); // Remove mainItems from dependencies
  
  return (
    <div className={css({
      backgroundColor: '#121212',
      minHeight: '100vh'
    })}>
      <div className={css({
        backgroundColor: '#1E1E1E',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
      })}>
        <AppNavBar
          title={isMobile ? "Surge" : "Uber Surge Prediction"}
          mainItems={mainItems}
          onMainItemSelect={item => {
            navigate(item.info.path);
          }}
          username="User"
          userItems={[
            { icon: ProfileIcon, label: 'Profile' },
            { icon: LogoutIcon, label: 'Logout' },
          ]}
          onUserItemSelect={() => {}}
        />
      </div>
      
      <div className={css({ 
        position: 'absolute', 
        top: '16px', 
        right: isMobile ? '16px' : '80px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: 100
      })}>
        <ThemeToggle />
        <NotificationCenter />
      </div>
      
      <div className={css({ 
        maxWidth: '1200px',
        margin: '0 auto'
      })}>
        {children}
      </div>
    </div>
  );
};

export default Layout; 