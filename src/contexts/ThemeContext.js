import React, { createContext, useContext, useState } from 'react';
import { lightColors, darkColors } from '../utils/theme';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);
  const colors = isDark ? darkColors : lightColors;
  const toggleTheme = () => setIsDark(prev => !prev);
  return (
    <ThemeContext.Provider value={{ colors, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
