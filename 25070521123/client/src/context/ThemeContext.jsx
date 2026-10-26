import { createContext, useContext, useEffect, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

export const ACCENTS = [
  {
    id: 'violet',
    label: 'Violet',
    hint: 'Classic Melody',
    swatch: 'linear-gradient(135deg, #7c5cff, #ff5ca8)',
  },
  {
    id: 'ocean',
    label: 'Ocean',
    hint: 'Cool and calm',
    swatch: 'linear-gradient(135deg, #2f7df6, #22d3ee)',
  },
  {
    id: 'sunset',
    label: 'Sunset',
    hint: 'Warm and bold',
    swatch: 'linear-gradient(135deg, #f97316, #ec4899)',
  },
  {
    id: 'forest',
    label: 'Forest',
    hint: 'Fresh and green',
    swatch: 'linear-gradient(135deg, #10b981, #38bdf8)',
  },
];

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [accent, setAccent] = useLocalStorage('melody_accent', 'violet');
  const [view, setView] = useLocalStorage('melody_view', 'grid');

  // Paint the palette on <html> so plain CSS can pick it up.
  useEffect(() => {
    document.documentElement.setAttribute('data-accent', accent);
  }, [accent]);

  const value = useMemo(
    () => ({ accent, setAccent, view, setView }),
    [accent, setAccent, view, setView]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used inside a ThemeProvider');
  }
  return context;
}
