import React, { useState, useEffect } from 'react';
import { useStyletron } from 'baseui';
import { AppNavBar, NavItemT } from 'baseui/app-nav-bar';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from 'baseui/button';
import { Menu } from 'baseui/icon';
import { Drawer, ANCHOR } from 'baseui/drawer';
import { mediaQueries } from '../../utils/responsive';

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
  const [mainItems, setMainItems] = useState<NavItemT[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  
  // Check if we're in a mobile view
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    
    return () => {
      window.removeEventListener('resize', checkMobileView);
    };
  }, []);

  // Set up navigation items
  useEffect(() => {
    const items: NavItemT[] = [
      {
        icon: undefined,
        label: 'Dashboard',
        info: { path: '/' },
        active: location.pathname === '/'
      },
      {
        icon: undefined,
        label: 'Driver Dashboard',
        info: { path: '/driver' },
        active: location.pathname === '/driver'
      },
      {
        icon: undefined,
        label: 'Settings',
        info: { path: '/settings' },
        active: location.pathname === '/settings'
      }
    ];
    
    setMainItems(items);
  }, [location.pathname]);

  // Handle navigation
  const handleNavigation = (item: NavItemT) => {
    if (item.info && typeof item.info === 'object' && 'path' in item.info) {
      const path = item.info.path as string;
      navigate(path);
      
      // Close mobile menu if open
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
      
      // Update active state
      const updatedItems = mainItems.map(mainItem => {
        return {
          ...mainItem,
          active: mainItem.info && typeof mainItem.info === 'object' && 'path' in mainItem.info && 
                  mainItem.info.path === path
        };
      });
      
      setMainItems(updatedItems);
    }
  };

  return (
    <div className={css({
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      width: '100%'
    })}>
      {/* Desktop Navigation */}
      {!isMobileView && (
        <AppNavBar
          title="Surge Prediction"
          mainItems={mainItems}
          onMainItemSelect={item => {
            handleNavigation(item);
          }}
          username=""
          userItems={[]}
          onUserItemSelect={() => {}}
        />
      )}
      
      {/* Mobile Navigation */}
      {isMobileView && (
        <>
          <div className={css({
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 16px',
            backgroundColor: '#000000',
            color: '#FFFFFF'
          })}>
            <div className={css({
              fontSize: '18px',
              fontWeight: 'bold'
            })}>
              Surge Prediction
            </div>
            <Button
              onClick={() => setIsMobileMenuOpen(true)}
              kind="tertiary"
              size="compact"
              shape="square"
              overrides={{
                BaseButton: {
                  style: {
                    color: '#FFFFFF'
                  }
                }
              }}
            >
              <Menu size={24} />
            </Button>
          </div>
          
          <Drawer
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
            anchor={ANCHOR.left}
            overrides={{
              DrawerContainer: {
                style: {
                  width: '250px'
                }
              }
            }}
          >
            <div className={css({
              padding: '16px'
            })}>
              <div className={css({
                fontSize: '20px',
                fontWeight: 'bold',
                marginBottom: '24px'
              })}>
                Surge Prediction
              </div>
              
              <div className={css({
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              })}>
                {mainItems.map((item, index) => (
                  <div
                    key={index}
                    className={css({
                      padding: '12px 16px',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      backgroundColor: item.active ? '#EEEEEE' : 'transparent',
                      ':hover': {
                        backgroundColor: '#F5F5F5'
                      }
                    })}
                    onClick={() => handleNavigation(item)}
                  >
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          </Drawer>
        </>
      )}
      
      <main className={css({
        flex: 1,
        padding: '16px',
        [mediaQueries.md]: {
          padding: '24px'
        }
      })}>
        {children}
      </main>
      
      <footer className={css({
        padding: '16px',
        textAlign: 'center',
        borderTop: '1px solid #EEEEEE',
        fontSize: '14px',
        color: '#666666'
      })}>
        &copy; {new Date().getFullYear()} Surge Prediction App
      </footer>
    </div>
  );
};

export default Layout; 