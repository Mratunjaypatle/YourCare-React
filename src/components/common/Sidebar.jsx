// src/components/common/Sidebar.jsx
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, Dumbbell, Apple,
  CreditCard, Settings, LogOut, Zap, X,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { ThemeModeSelector } from './ThemeToggle'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/members', icon: Users, label: 'Members' },
  { to: '/workouts', icon: Dumbbell, label: 'Workouts' },
  { to: '/diet', icon: Apple, label: 'Diet Plans' },
  { to: '/services', icon: Settings, label: 'Services' },
  { to: '/payments', icon: CreditCard, label: 'Payments' },
]

const Sidebar = ({ isOpen, isMobile, onClose }) => {
  const { logout, admin } = useAuth()

  // On mobile: absolute overlay; On desktop: fixed push
  const positionStyle = isMobile
    ? {
      position: 'fixed',
      top: 0,
      left: 0,
      height: '100vh',
      width: '256px',
      zIndex: 50,
      transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
      transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
    }
    : {
      position: 'fixed',
      top: 0,
      left: 0,
      height: '100vh',
      width: isOpen ? '256px' : '64px',
      zIndex: 50,
      transition: 'width 0.25s ease',
    }

  const showLabels = isOpen // show labels when sidebar is open (both mobile & desktop)

  return (
    <aside
      style={{
        ...positionStyle,
        background: 'var(--bg2)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      {/* ── Logo row ──────────────────────────────────── */}
      <div
        className="flex items-center gap-3 min-h-[64px] px-4"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: '#04dd74' }}
        >
          <Zap size={20} className="text-white" />
        </div>

        {showLabels && (
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate" style={{ color: 'var(--text)' }}>
              GymPro
            </p>
            <p className="text-xs truncate" style={{ color: 'var(--text3)' }}>
              Management System
            </p>
          </div>
        )}

        {/* Close button on mobile */}
        {isMobile && isOpen && (
          <button
            onClick={onClose}
            className="ml-auto p-1.5 rounded-lg flex-shrink-0"
            style={{ color: 'var(--text2)' }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* ── Nav ───────────────────────────────────────── */}
      <nav className="flex-1 p-2 space-y-0.5">
        {showLabels && (
          <p
            className="text-xs uppercase tracking-widest px-3 pb-2 pt-2 font-medium"
            style={{ color: 'var(--text3)' }}
          >
            Main Menu
          </p>
        )}

        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={isMobile ? onClose : undefined}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                       transition-all duration-150 whitespace-nowrap border"
            style={({ isActive }) => ({
              background: isActive ? 'var(--accent-bg)' : 'transparent',
              color: isActive ? 'var(--accent)' : 'var(--text2)',
              borderColor: isActive ? 'var(--accent-border)' : 'transparent'
            })}
          >
            <Icon size={18} className="flex-shrink-0" />
            {showLabels && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* ── Theme selector ────────────────────────────── */}
      {showLabels && (
        <div
          className="px-3 pb-3 pt-2"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <p
            className="text-xs mb-2 uppercase tracking-widest"
            style={{ color: 'var(--text3)' }}
          >
            Appearance
          </p>
          <ThemeModeSelector />
        </div>
      )}

      {/* ── Admin + logout ────────────────────────────── */}
      <div className="p-2" style={{ borderTop: '1px solid var(--border)' }}>
        {showLabels && admin && (
          <div
            className="mb-2 px-3 py-2 rounded-lg"
            style={{ background: 'var(--bg3)' }}
          >
            <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>
              {admin.name}
            </p>
            <p className="text-xs truncate" style={{ color: 'var(--text3)' }}>
              {admin.email}
            </p>
          </div>
        )}

        <button
          onClick={() => { logout(); onClose?.() }}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm
                     transition-all border border-transparent whitespace-nowrap"
          style={{ color: 'var(--text2)' }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--red-bg)'
            e.currentTarget.style.color = 'var(--red)'
            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'var(--text2)'
            e.currentTarget.style.borderColor = 'transparent'
          }}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {showLabels && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}

export default Sidebar