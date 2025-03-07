import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import DriverDashboard from './pages/DriverDashboard';
import Settings from './pages/Settings';
import Layout from './components/Layout/Layout';
import { NotificationProvider } from './context/NotificationContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import { ThemeProvider } from './context/ThemeContext';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <NotificationProvider>
          <Router
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true
            }}
          >
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/driver" element={<DriverDashboard />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </Layout>
          </Router>
        </NotificationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App; 