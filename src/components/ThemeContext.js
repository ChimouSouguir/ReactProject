import React, { createContext, useState } from 'react';

const themes = {
  light: {
    background: '#ffffff',
    color: '#000000',
    button: '#007bff',
    buttonText: '#ffffff'
  },
  dark: {
    background: '#343a40',
    color: '#ffffff',
    button: '#6c757d',
    buttonText: '#ffffff'
  },
};


const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');

  const toggleTheme = (newTheme) => {
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
