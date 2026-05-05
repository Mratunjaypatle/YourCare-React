// src/components/common/Layout.jsx
import { useState, useEffect } from 'react'
import { Outlet }              from 'react-router-dom'
import Sidebar                  from './Sidebar'
import Navbar                   from './Navbar'

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile]       = useState(false)

  // Detect screen size on mount and resize
  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      // Desktop: sidebar open by default; Mobile: closed by default
      setSidebarOpen(!mobile)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const closeSidebar = () => {
    if (isMobile) setSidebarOpen(false)
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>

      {/* ── Mobile backdrop ─────────────────────────────── */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={closeSidebar}
        />
      )}

      {/* ── Sidebar ──────────────────────────────────────── */}
      <Sidebar
        isOpen={sidebarOpen}
        isMobile={isMobile}
        onClose={closeSidebar}
      />

      {/* ── Main area ─────────────────────────────────────── */}
      <div
        className="flex flex-col overflow-hidden flex-1 transition-all duration-300"
        style={{
          // On desktop push content; on mobile always full width
          marginLeft: !isMobile && sidebarOpen ? '256px'
                    : !isMobile               ? '64px'
                    : '0',
        }}
      >
        <Navbar onMenuClick={() => setSidebarOpen(prev => !prev)} />

        <main
          className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6"
          style={{ background: 'var(--bg)' }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout