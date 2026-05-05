import { createContext, useContext, useState, useEffect } from 'react'
import { loginAdmin as loginAPI } from '../api/axios'

// Create the context
const AuthContext = createContext(null)

// ── Provider: wraps the whole app ────────────────────────────
export const AuthProvider = ({ children }) => {
  const [admin, setAdmin]   = useState(null)
  const [loading, setLoading] = useState(true)

  // On first load: check if admin was previously logged in
  useEffect(() => {
    const savedAdmin = localStorage.getItem('gymAdmin')
    if (savedAdmin) {
      try {
        setAdmin(JSON.parse(savedAdmin))
      } catch {
        localStorage.removeItem('gymAdmin')
      }
    }
    setLoading(false)
  }, [])

  // Call backend login, save token + admin to localStorage
  const login = async (email, password) => {
    const { data } = await loginAPI({ email, password })
    localStorage.setItem('gymAdminToken', data.token)
    localStorage.setItem('gymAdmin', JSON.stringify(data))
    setAdmin(data)
    return data
  }

  // Clear everything
  const logout = () => {
    localStorage.removeItem('gymAdminToken')
    localStorage.removeItem('gymAdmin')
    setAdmin(null)
  }

  return (
    <AuthContext.Provider value={{ admin, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

// ── Hook: use anywhere inside the app ────────────────────────
export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
