import React, { createContext, useContext, useState, useEffect } from 'react';
import { LightTheme, DarkTheme } from 'baseui';

interface ThemeContextType {
  theme: typeof LightTheme | typeof DarkTheme;
  toggleTheme: () => void;
}

// Safe localStorage functions with fallbacks
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('Error accessing localStorage:', error);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn('Error writing to localStorage:', error);
    }
  }
};

const ThemeContext = createContext<ThemeContextType>({
  theme: LightTheme,
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = safeLocalStorage.getItem('theme');
    return savedTheme === 'dark' ? DarkTheme : LightTheme;
  });
  
  useEffect(() => {
    safeLocalStorage.setItem('theme', theme === DarkTheme ? 'dark' : 'light');
  }, [theme]);
  
  const toggleTheme = () => {
    setTheme(current => current === LightTheme ? DarkTheme : LightTheme);
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext; 