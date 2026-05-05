// src/context/ThemeContext.jsx
//
// HOW IT WORKS:
// 1. Reads saved theme from localStorage on first load
// 2. Falls back to system preference (prefers-color-scheme)
// 3. Applies theme by toggling 'dark' class on <html> element
// 4. Tailwind uses this class to switch between dark/light styles
// 5. Saves preference to localStorage for next visit

import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // 1. Check localStorage first (user's saved preference)
    const saved = localStorage.getItem('gymTheme')
    if (saved === 'dark' || saved === 'light') return saved

    // 2. Fall back to system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }

    // 3. Default to dark (your app was built dark-first)
    return 'dark'
  })

  // Apply theme class to <html> element whenever theme changes
  useEffect(() => {
    const root = document.documentElement   // <html> element

    if (theme === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.remove('dark')
      root.classList.add('light')
    }

    // Save preference for next visit
    localStorage.setItem('gymTheme', theme)
  }, [theme])

  const toggleTheme = () =>
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')

  const setDark  = () => setTheme('dark')
  const setLight = () => setTheme('light')

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setDark, setLight, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  )
}

// Custom hook — use anywhere in the app
export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}