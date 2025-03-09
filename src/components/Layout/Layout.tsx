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

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [css] = useStyletron();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState<string>('');
  const [isMobileView, setIsMobileView] = useState(false);

  // Update active nav item based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') {
      setActiveNavItem('Home');
    } else if (path === '/driver') {
      setActiveNavItem('Driver');
    } else if (path === '/settings') {
      setActiveNavItem('Settings');
    }
  }, [location.pathname]);

  // Check if mobile view on mount and window resize
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

  // Navigation items
  const navItems: NavItemT[] = [
    {
      icon: undefined,
      label: 'Home',
      active: activeNavItem === 'Home',
    },
    {
      icon: undefined,
      label: 'Driver',
      active: activeNavItem === 'Driver',
    },
    {
      icon: undefined,
      label: 'Settings',
      active: activeNavItem === 'Settings',
    },
  ];

  // Handle navigation item selection
  const handleNavItemSelect = (item: NavItemT) => {
    if (item.label === 'Home') {
      navigate('/');
    } else if (item.label === 'Driver') {
      navigate('/driver');
    } else if (item.label === 'Settings') {
      navigate('/settings');
    }
    
    setIsDrawerOpen(false);
  };

  return (
    <div className={css({
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: 'var(--background-color)',
      color: 'var(--text-color)',
      transition: 'background-color 0.3s, color 0.3s',
    })}>
      {/* Mobile Header */}
      {isMobileView && (
        <header className={css({
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'var(--header-background)',
        })}>
          <div className={css({
            fontSize: '20px',
            fontWeight: 'bold',
          })}>
            Uber Surge Prediction
          </div>
          
          <Button
            onClick={() => setIsDrawerOpen(true)}
            kind="tertiary"
            shape="square"
            size="compact"
            overrides={{
              BaseButton: {
                style: {
                  backgroundColor: 'transparent',
                },
              },
            }}
          >
            <Menu size={24} />
          </Button>
          
          <Drawer
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            anchor={ANCHOR.left}
            overrides={{
              DrawerContainer: {
                style: {
                  width: '250px',
                },
              },
            }}
          >
            <div className={css({
              padding: '16px',
            })}>
              <div className={css({
                fontSize: '20px',
                fontWeight: 'bold',
                marginBottom: '24px',
              })}>
                Uber Surge Prediction
              </div>
              
              <nav>
                <ul className={css({
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                })}>
                  {navItems.map((item) => (
                    <li
                      key={item.label}
                      className={css({
                        padding: '12px 16px',
                        marginBottom: '8px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        backgroundColor: item.active ? 'var(--primary-color-light)' : 'transparent',
                        ':hover': {
                          backgroundColor: item.active ? 'var(--primary-color-light)' : 'var(--hover-color)',
                        },
                      })}
                      onClick={() => handleNavItemSelect(item)}
                    >
                      {item.label}
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </Drawer>
        </header>
      )}
      
      {/* Desktop Navigation */}
      {!isMobileView && (
        <AppNavBar
          title="Uber Surge Prediction"
          mainItems={navItems}
          onMainItemSelect={handleNavItemSelect}
          username=""
          userItems={[]}
          onUserItemSelect={() => {}}
        />
      )}
      
      {/* Main Content */}
      <main className={css({
        flex: 1,
        padding: '24px',
        [mediaQueries.sm]: {
          padding: '32px',
        },
      })}>
        {children}
      </main>
      
      {/* Footer */}
      <footer className={css({
        padding: '16px 24px',
        borderTop: '1px solid var(--border-color)',
        backgroundColor: 'var(--header-background)',
        textAlign: 'center',
        fontSize: '14px',
        color: 'var(--text-secondary)',
      })}>
        <div>© {new Date().getFullYear()} Uber Surge Prediction</div>
        <div className={css({ marginTop: '8px' })}>
          This is a demo application for educational purposes only.
        </div>
      </footer>
    </div>
  );
};

export default Layout; 