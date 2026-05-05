// src/pages/Login.jsx
import { useState }            from 'react'
import { useNavigate }         from 'react-router-dom'
import { useAuth }             from '../context/AuthContext'
import { Zap, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { ThemeModeSelector }   from '../components/common/ThemeToggle'

const Login = () => {
  const [form, setForm]            = useState({ email: '', password: '' })
  const [showPassword, setShowPwd] = useState(false)
  const [error, setError]          = useState('')
  const [loading, setLoading]      = useState(false)
  const { login }                  = useAuth()
  const navigate                   = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(form.email, form.password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  const set = (field) => (e) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--bg)' }}
    >
      {/* Subtle glow */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        aria-hidden
      >
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: 'var(--accent)' }}
        />
      </div>

      <div className="relative w-full max-w-md">

        {/* Theme selector — top right */}
        <div className="flex justify-end mb-4">
          <ThemeModeSelector />
        </div>

        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
            style={{ background: 'var(--accent)' }}
          >
            <Zap size={30} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
            GymPro Admin
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>
            Sign in to manage your gym
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background:  'var(--bg2)',
            border:      '1px solid var(--border)',
            boxShadow:   'var(--shadow-lg)',
          }}
        >
          {/* Error */}
          {error && (
            <div
              className="mb-5 flex items-center gap-2 p-3 rounded-lg text-sm"
              style={{
                background:  'var(--red-bg)',
                border:      '1px solid rgba(239,68,68,0.2)',
                color:       'var(--red)',
              }}
            >
              <AlertCircle size={15} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                className="block text-xs font-medium mb-2 uppercase tracking-wide"
                style={{ color: 'var(--text2)' }}
              >
                Email Address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={set('email')}
                required
                autoFocus
                className="input-theme"
                placeholder="admin@gym.com"
              />
            </div>

            {/* Password */}
            <div>
              <label
                className="block text-xs font-medium mb-2 uppercase tracking-wide"
                style={{ color: 'var(--text2)' }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  required
                  className="input-theme pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--text3)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-semibold py-3 rounded-xl transition-all text-sm"
              style={{
                background: loading ? 'var(--accent-bg)' : 'var(--accent)',
                opacity:    loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Demo hint */}
          <p className="text-center text-xs mt-5" style={{ color: 'var(--text3)' }}>
            Demo: <span style={{ color: 'var(--text2)' }}>admin@gym.com</span>{' '}
            / <span style={{ color: 'var(--text2)' }}>admin123</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login