import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const themes = {
  light: {
    name: 'Light',
    background: '#ffffff',
    text: '#333333',
    cardBg: '#f8f9fa',
    cardBorder: '#ddd',
    primary: '#007bff',
    success: '#28a745',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#17a2b8',
    secondary: '#6c757d',
    inputBg: '#ffffff',
    inputBorder: '#ddd',
    shadow: 'rgba(0,0,0,0.1)'
  },
  dark: {
    name: 'Dark',
    background: '#1a1a1a',
    text: '#e0e0e0',
    cardBg: '#2d2d2d',
    cardBorder: '#444',
    primary: '#4a9eff',
    success: '#4caf50',
    danger: '#f44336',
    warning: '#ffb74d',
    info: '#29b6f6',
    secondary: '#9e9e9e',
    inputBg: '#2d2d2d',
    inputBorder: '#444',
    shadow: 'rgba(0,0,0,0.5)'
  },
  blue: {
    name: 'Ocean Blue',
    background: '#e3f2fd',
    text: '#0d47a1',
    cardBg: '#bbdefb',
    cardBorder: '#90caf9',
    primary: '#1976d2',
    success: '#00897b',
    danger: '#d32f2f',
    warning: '#f57c00',
    info: '#0288d1',
    secondary: '#546e7a',
    inputBg: '#ffffff',
    inputBorder: '#90caf9',
    shadow: 'rgba(25,118,210,0.2)'
  },
  purple: {
    name: 'Purple Dream',
    background: '#f3e5f5',
    text: '#4a148c',
    cardBg: '#e1bee7',
    cardBorder: '#ce93d8',
    primary: '#7b1fa2',
    success: '#388e3c',
    danger: '#d32f2f',
    warning: '#f57c00',
    info: '#0288d1',
    secondary: '#616161',
    inputBg: '#ffffff',
    inputBorder: '#ce93d8',
    shadow: 'rgba(123,31,162,0.2)'
  },
  green: {
    name: 'Nature Green',
    background: '#e8f5e9',
    text: '#1b5e20',
    cardBg: '#c8e6c9',
    cardBorder: '#a5d6a7',
    primary: '#388e3c',
    success: '#2e7d32',
    danger: '#d32f2f',
    warning: '#f57c00',
    info: '#0288d1',
    secondary: '#616161',
    inputBg: '#ffffff',
    inputBorder: '#a5d6a7',
    shadow: 'rgba(56,142,60,0.2)'
  }
};

export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('appTheme') || 'light';
    setCurrentTheme(savedTheme);
    applyTheme(themes[savedTheme]);
  }, []);

  const applyTheme = (theme) => {
    document.body.style.backgroundColor = theme.background;
    document.body.style.color = theme.text;
    document.body.style.transition = 'background-color 0.3s, color 0.3s';
  };

  const changeTheme = (themeName) => {
    setCurrentTheme(themeName);
    localStorage.setItem('appTheme', themeName);
    applyTheme(themes[themeName]);
  };

  return (
    <ThemeContext.Provider value={{ theme: themes[currentTheme], currentTheme, changeTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
