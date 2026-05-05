// src/components/common/Navbar.jsx
// Search bar is now FUNCTIONAL — connected to SearchContext
// Typing here filters the Members list in real time (300ms debounce)

import { useState, useRef }  from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Menu, Bell, Search, X }    from 'lucide-react'
import { useAuth }                  from '../../context/AuthContext'
import { useSearch }                from '../../context/SearchContext'
import ThemeToggleButton            from './ThemeToggle'

const Navbar = ({ onMenuClick }) => {
  const { admin }                               = useAuth()
  const { setSearchDebounced, clearSearch, searchQuery } = useSearch()
  const navigate                                = useNavigate()
  const location                                = useLocation()
  const [inputValue,   setInputValue]           = useState('')
  const [searchOpen,   setSearchOpen]           = useState(false)
  const [isFocused,    setIsFocused]            = useState(false)
  const inputRef                                = useRef(null)

  const isOnMembers = location.pathname === '/members' ||
                      location.pathname.startsWith('/members')

  const handleInputChange = (e) => {
    const val = e.target.value
    setInputValue(val)
    setSearchDebounced(val)

    // Auto-navigate to Members page when user types (search is for members)
    if (val.trim() && !isOnMembers) {
      navigate('/members')
    }
  }

  const handleClear = () => {
    setInputValue('')
    clearSearch()
    inputRef.current?.focus()
  }

  const handleMobileSearchOpen = () => {
    setSearchOpen(true)
    // Small delay to let element render before focusing
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const handleMobileSearchClose = () => {
    setSearchOpen(false)
    setInputValue('')
    clearSearch()
  }

  // Search input JSX (shared between desktop + mobile)
  const SearchInput = ({ autoFocus = false, className = '' }) => (
    <div
      className={`flex items-center gap-3 rounded-lg px-4 py-2.5 border transition-all ${className}`}
      style={{
        background:  'var(--bg3)',
        borderColor: isFocused ? 'var(--accent)' : 'var(--border)',
      }}
    >
      <Search size={16} style={{ color: isFocused ? 'var(--accent)' : 'var(--text3)', flexShrink: 0 }} />
      <input
        ref={inputRef}
        type="text"
        autoFocus={autoFocus}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Search members by name, phone..."
        className="bg-transparent text-sm outline-none flex-1 min-w-0"
        style={{ color: 'var(--text)', caretColor: 'var(--accent)' }}
      />
      {/* Clear button — only show when there's text */}
      {inputValue && (
        <button
          onClick={handleClear}
          className="flex-shrink-0 transition-colors"
          style={{ color: 'var(--text3)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
        >
          <X size={16} />
        </button>
      )}
    </div>
  )

  return (
    <header
      className="flex-shrink-0 h-14 px-3 sm:px-5 flex items-center gap-2 border-b"
      style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}
    >
      {/* Hamburger */}
      <button
        onClick={onMenuClick}
        className="p-2 rounded-lg flex-shrink-0 transition-colors"
        style={{ color: 'var(--text2)' }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <Menu size={20} />
      </button>

      {/* ── Mobile: expanded search or normal header ── */}
      {searchOpen ? (
        /* Full-width search on mobile */
        <div className="flex-1 flex items-center gap-2 sm:hidden">
          <SearchInput autoFocus className="flex-1" />
          <button
            onClick={handleMobileSearchClose}
            className="p-2 rounded-lg flex-shrink-0 text-sm font-medium"
            style={{ color: 'var(--text2)' }}
          >
            Cancel
          </button>
        </div>
      ) : (
        <>
          {/* Desktop search bar */}
          <div className="hidden sm:block flex-1 max-w-xs">
            <SearchInput />
          </div>

          {/* Spacer on mobile */}
          <div className="flex-1 sm:hidden" />

          {/* Right actions */}
          <div className="flex items-center gap-3 sm:gap-2">
            {/* Mobile: search icon to expand */}
            <button
              onClick={handleMobileSearchOpen}
              className="sm:hidden p-2 rounded-lg transition-colors"
              style={{
                color:      searchQuery ? 'var(--accent)' : 'var(--text2)',
                background: searchQuery ? 'var(--accent-bg)' : 'transparent',
              }}
              title="Search members"
            >
              <Search size={18} />
              {/* Show dot if search is active */}
              {searchQuery && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
                  style={{ background: 'var(--accent)' }} />
              )}
            </button>

            {/* Theme toggle */}
            <ThemeToggleButton />

            {/* Notifications */}
            <button
              className="relative p-2 rounded-xl border transition-colors"
              style={{ color: 'var(--text2)', borderColor: 'var(--border)', background: 'var(--bg3)' }}
            >
              <Bell size={18} />
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                style={{ background: 'var(--accent)' }}
              />
            </button>

            {/* Admin avatar */}
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center
                           text-sm font-bold text-white flex-shrink-0"
                style={{ background: 'var(--accent)' }}
              >
                {admin?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="hidden lg:block">
                <p className="text-xs font-medium leading-tight" style={{ color: 'var(--text)' }}>
                  {admin?.name || 'Admin'}
                </p>
                <p className="text-xs" style={{ color: 'var(--text3)' }}>Administrator</p>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  )
}

export default Navbar
