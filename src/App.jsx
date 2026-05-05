// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth }  from './context/AuthContext'
import { ThemeProvider }           from './context/ThemeContext'
import { SearchProvider }          from './context/SearchContext'   // ← NEW
import Layout                      from './components/common/Layout'
import Login                       from './pages/Login'
import Dashboard                   from './pages/Dashboard'
import Members                     from './pages/Members'
import MemberDetail                from './pages/MemberDetail'
import Workouts                    from './pages/Workouts'
import DietPlans                   from './pages/DietPlans'
import Services                    from './pages/Services'
import Payments                    from './pages/Payments'

const PrivateRoute = ({ children }) => {
  const { admin, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: 'var(--bg)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm" style={{ color: 'var(--text2)' }}>Loading...</p>
        </div>
      </div>
    )
  }
  return admin ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    // Order: ThemeProvider → SearchProvider → AuthProvider
    <ThemeProvider>
      <SearchProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Layout />
                  </PrivateRoute>
                }
              >
                <Route index              element={<Dashboard />} />
                <Route path="members"     element={<Members />} />
                <Route path="members/:id" element={<MemberDetail />} />
                <Route path="workouts"    element={<Workouts />} />
                <Route path="diet"        element={<DietPlans />} />
                <Route path="services"    element={<Services />} />
                <Route path="payments"    element={<Payments />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </SearchProvider>
    </ThemeProvider>
  )
}

export default App