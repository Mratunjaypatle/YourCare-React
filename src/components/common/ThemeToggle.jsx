// src/components/common/ThemeToggle.jsx
// Animated sun/moon toggle button for the navbar

import { useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

// ── Compact icon button (used in Navbar) ─────────────────────
export const ThemeToggleButton = () => {
  const { theme, toggleTheme, isDark } = useTheme()
  const [spinning, setSpinning] = useState(false)

  const handleClick = () => {
    setSpinning(true)
    toggleTheme()
    setTimeout(() => setSpinning(false), 400)
  }

  return (
    <button
      onClick={handleClick}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`
        relative w-9 h-9 rounded-xl flex items-center justify-center
        transition-all duration-200 border
        ${isDark
          ? 'bg-gray-800 border-gray-700 text-yellow-400 hover:bg-gray-700 hover:border-gray-600'
          : 'bg-orange-50 border-orange-200 text-orange-500 hover:bg-orange-100'
        }
      `}
    >
      <span className={spinning ? 'spin-once' : ''}>
        {isDark
          ? <Sun  size={16} className="text-yellow-400" />
          : <Moon size={16} className="text-indigo-500" />
        }
      </span>
    </button>
  )
}

// ── Switch style toggle (used in Settings or Sidebar) ────────
export const ThemeToggleSwitch = () => {
  const { isDark, toggleTheme } = useTheme()

  return (
    <div className="flex items-center gap-3">
      <Sun size={14} className={isDark ? 'text-gray-500' : 'text-yellow-500'} />

      {/* Toggle track */}
      <button
        onClick={toggleTheme}
        className={`
          relative w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none
          ${isDark ? 'bg-gray-700' : 'bg-orange-200'}
        `}
      >
        {/* Toggle knob */}
        <span className={`
          absolute top-0.5 left-0.5 w-5 h-5 rounded-full shadow-md
          transition-all duration-300 flex items-center justify-center
          ${isDark
            ? 'translate-x-0 bg-gray-400'
            : 'translate-x-5 bg-orange-500'
          }
        `}>
          {isDark
            ? <Moon size={10} className="text-gray-800" />
            : <Sun  size={10} className="text-white" />
          }
        </span>
      </button>

      <Moon size={14} className={isDark ? 'text-indigo-400' : 'text-gray-400'} />
    </div>
  )
}

// ── Full mode selector with 3 options ────────────────────────
export const ThemeModeSelector = () => {
  const { theme, setDark, setLight } = useTheme()

  const options = [
    { id: 'light', icon: <Sun  size={15} />, label: 'Light' },
    { id: 'dark',  icon: <Moon size={15} />, label: 'Dark'  },
  ]

  return (
    <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--bg3)', border: '1px solid var(--border)' }}>
      {options.map(opt => (
        <button
          key={opt.id}
          onClick={opt.id === 'dark' ? setDark : setLight}
          className={`
            flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium
            transition-all duration-200
            ${theme === opt.id
              ? 'bg-[var(--accent)] text-white shadow-sm'
              : 'text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--bg4)]'
            }
          `}
        >
          {opt.icon}
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// Default export = compact button
export default ThemeToggleButton