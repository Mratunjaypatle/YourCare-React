// frontend/src/api/axios.js
//
// SMART API URL DETECTION
// ─────────────────────────────────────────────────────────────
// This detects whether you're on PC (localhost) or mobile (LAN IP)
// and automatically uses the right backend URL.
//
// How it works:
//   PC browser  → window.location.hostname = "localhost"
//                 → API calls go to → http://localhost:5000/api  ✅
//
//   Mobile browser → window.location.hostname = "192.168.1.105"
//                    → API calls go to → http://192.168.1.105:5000/api  ✅
//
// This means you NEVER have to hardcode an IP address!

import axios from 'axios'

// ── Smart base URL ────────────────────────────────────────────
const getBaseURL = () => {
  // If VITE_API_URL is set in .env → use that (manual override)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }

  // Otherwise auto-detect from current hostname
  // On PC:     window.location.hostname = "localhost"
  // On Mobile: window.location.hostname = "192.168.1.105" (your PC's LAN IP)
  const hostname = window.location.hostname

  // Backend always runs on port 5000
  return `http://${hostname}:5000/api`
}

const BASE_URL = getBaseURL()
console.log('🌐 API Base URL:', BASE_URL)

// ── Create axios instance ─────────────────────────────────────
const API = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // 15 second timeout (mobile networks can be slow)
})

// ── REQUEST interceptor: attach JWT token ─────────────────────
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gymAdminToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)


// ── RESPONSE interceptor: handle auth errors ──────────────────
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('gymAdminToken')
      localStorage.removeItem('gymAdmin')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ══════════════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════════════
export const loginAdmin    = (data) => API.post('/auth/login', data)
export const registerAdmin = (data) => API.post('/auth/register', data)
export const getProfile    = ()     => API.get('/auth/profile')

// ══════════════════════════════════════════════════════════════
// MEMBERS
// ══════════════════════════════════════════════════════════════
export const getMembers      = (params)   => API.get('/members', { params })
export const getMember       = (id)       => API.get(`/members/${id}`)
export const createMember    = (data)     => API.post('/members', data)
export const updateMember    = (id, data) => API.put(`/members/${id}`, data)
export const deleteMember    = (id)       => API.delete(`/members/${id}`)
export const renewMembership = (id, data) => API.post(`/members/${id}/renew`, data)

// ══════════════════════════════════════════════════════════════
// WORKOUTS
// ══════════════════════════════════════════════════════════════
export const getWorkoutPlans   = (params)   => API.get('/workouts', { params })
export const getWorkoutPlan    = (id)       => API.get(`/workouts/${id}`)
export const createWorkoutPlan = (data)     => API.post('/workouts', data)
export const updateWorkoutPlan = (id, data) => API.put(`/workouts/${id}`, data)
export const assignWorkout     = (data)     => API.post('/workouts/assign', data)

// ══════════════════════════════════════════════════════════════
// DIET
// ══════════════════════════════════════════════════════════════
export const getDietPlans   = (params)   => API.get('/diet', { params })
export const getDietPlan    = (id)       => API.get(`/diet/${id}`)
export const createDietPlan = (data)     => API.post('/diet', data)
export const updateDietPlan = (id, data) => API.put(`/diet/${id}`, data)
export const assignDiet     = (data)     => API.post('/diet/assign', data)

// ══════════════════════════════════════════════════════════════
// SERVICES & PLANS
// ══════════════════════════════════════════════════════════════
export const getServices          = ()     => API.get('/services')
export const createService        = (data) => API.post('/services', data)
export const updateService        = (id, data) => API.put(`/services/${id}`, data)
export const getMembershipPlans   = ()     => API.get('/services/membership-plans')
export const createMembershipPlan = (data) => API.post('/services/membership-plans', data)

// ══════════════════════════════════════════════════════════════
// PAYMENTS
// ══════════════════════════════════════════════════════════════
export const getPayments = (params) => API.get('/services/payments', { params })

// ══════════════════════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════════════════════
export const getDashboardStats = () => API.get('/dashboard/stats')

export default API
