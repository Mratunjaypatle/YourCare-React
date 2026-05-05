// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react'
import { getDashboardStats }   from '../api/axios'
import StatCard                from '../components/common/StatCard'
import Loader                  from '../components/common/Loader'
import {
  Users, UserCheck, TrendingUp, IndianRupee, AlertTriangle,
} from 'lucide-react'
import { formatCurrency, formatDate } from '../utils/helpers'

/* ── Bar chart ─────────────────────────────────────────────── */
const BarChart = ({ data }) => {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const max    = Math.max(...data.map(d => d.revenue), 1)

  return (
    <div className="flex items-end gap-1 h-24 mt-4">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
          <div
            className="w-full rounded-t transition-all"
            style={{
              height:     `${Math.max((d.revenue / max) * 100, 4)}%`,
              background: 'var(--accent)',
              opacity:    0.8,
            }}
          />
          <span className="text-xs" style={{ color: 'var(--text3)', fontSize: '10px' }}>
            {months[(d._id?.month || 1) - 1]}
          </span>
        </div>
      ))}
    </div>
  )
}

/* ── Gender donut ──────────────────────────────────────────── */
const GenderChart = ({ data, total }) => {
  if (!data?.length || !total) return (
    <p className="text-sm py-4 text-center" style={{ color: 'var(--text3)' }}>No data</p>
  )
  const colors = { male: '#f97316', female: '#a855f7', other: '#3b82f6' }
  let offset   = 0
  const r = 36, circ = 2 * Math.PI * r

  return (
    <div className="flex items-center gap-4 mt-3">
      <svg width="88" height="88" viewBox="0 0 88 88" className="flex-shrink-0">
        {data.map((g) => {
          const frac = g.count / total
          const dash = frac * circ
          const rot  = (offset / total) * 360 - 90
          offset += g.count
          return (
            <circle key={g._id}
              cx="44" cy="44" r={r}
              fill="none"
              stroke={colors[g._id] || '#6b7280'}
              strokeWidth="16"
              strokeDasharray={`${dash} ${circ - dash}`}
              transform={`rotate(${rot} 44 44)`}
            />
          )
        })}
        <text x="44" y="48" textAnchor="middle" fontSize="14" fontWeight="700"
          fill="var(--text)">{total}</text>
      </svg>
      <div className="space-y-1.5 min-w-0">
        {data.map(g => (
          <div key={g._id} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: colors[g._id] || '#6b7280' }} />
            <span className="text-xs capitalize truncate" style={{ color: 'var(--text2)' }}>
              {g._id}
            </span>
            <span className="text-xs font-medium ml-auto" style={{ color: 'var(--text)' }}>
              {g.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

const Dashboard = () => {
  const [data,    setData]   = useState(null)
  const [loading, setLoad]   = useState(true)
  const [error,   setError]  = useState(null)

  useEffect(() => {
    getDashboardStats()
      .then(r  => setData(r.data))
      .catch(() => setError('Failed to load. Is the backend running?'))
      .finally(() => setLoad(false))
  }, [])

  if (loading) return <Loader text="Loading dashboard..." />
  if (error)   return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-4">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ background: 'var(--red-bg)' }}>
        <AlertTriangle size={22} style={{ color: 'var(--red)' }} />
      </div>
      <p className="font-medium" style={{ color: 'var(--red)' }}>{error}</p>
      <p className="text-sm" style={{ color: 'var(--text3)' }}>
        Make sure backend is running on port 5000
      </p>
    </div>
  )

  const { stats: s = {}, recentPayments = [], membersByGender = [], monthlyRevenue = [] } = data

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in">

      {/* Page title */}
      <div>
        <h1 className="text-lg sm:text-xl font-bold" style={{ color: 'var(--text)' }}>
          Dashboard
        </h1>
        <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--text2)' }}>
          Welcome back! Here's what's happening at your gym.
        </p>
      </div>

      {/* Expiry alert */}
      {s.expiringThisWeek > 0 && (
        <div
          className="flex items-start gap-3 p-3 sm:p-4 rounded-xl text-sm"
          style={{ background: 'var(--yellow-bg)', border: '1px solid rgba(245,158,11,0.2)' }}
        >
          <AlertTriangle size={16} style={{ color: 'var(--yellow)', flexShrink: 0, marginTop: 1 }} />
          <span style={{ color: 'var(--yellow)' }}>
            <strong>{s.expiringThisWeek} members</strong> expiring this week — send renewal reminders.
          </span>
        </div>
      )}

      {/* ── Stat cards: 2 col on mobile, 4 on desktop ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Members"
          value={s.totalMembers ?? 0}
          icon={Users} color="blue"
          subtitle="All registered"
        />
        <StatCard
          title="Active"
          value={s.activeMembers ?? 0}
          icon={UserCheck} color="green"
          subtitle={`${s.expiredMembers ?? 0} expired`}
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(s.totalRevenue)}
          icon={IndianRupee} color="orange"
          subtitle="All time"
        />
        <StatCard
          title="This Month"
          value={formatCurrency(s.revenueThisMonth)}
          icon={TrendingUp} color="purple"
          subtitle={`${s.newMembersThisMonth ?? 0} new members`}
        />
      </div>

      {/* ── Charts row: stack on mobile, side-by-side on lg ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">

        {/* Revenue chart */}
        <div
          className="lg:col-span-2 rounded-xl p-4 border"
          style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                Revenue Overview
              </h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>
                Last 6 months
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text3)' }}>
              <span className="w-2 h-2 rounded-full inline-block"
                style={{ background: 'var(--accent)' }} />
              Revenue
            </div>
          </div>
          {monthlyRevenue.length > 0
            ? <BarChart data={monthlyRevenue} />
            : <p className="text-sm py-8 text-center" style={{ color: 'var(--text3)' }}>
                No revenue data yet
              </p>
          }
        </div>

        {/* Gender breakdown */}
        <div
          className="rounded-xl p-4 border"
          style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}
        >
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
            Members by Gender
          </h3>
          <GenderChart data={membersByGender} total={s.totalMembers} />
        </div>
      </div>

      {/* ── Recent payments ─────────────────────────── */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}
      >
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
            Recent Payments
          </h3>
          <span className="text-xs" style={{ color: 'var(--text3)' }}>
            {recentPayments.length} transactions
          </span>
        </div>

        {recentPayments.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: 'var(--text3)' }}>
            No payments recorded yet
          </p>
        ) : (
          <div>
            {recentPayments.map(p => (
              <div
                key={p._id}
                className="flex items-center justify-between px-4 py-3 border-b last:border-0"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>
                    {p.member?.name || 'Unknown'}
                  </p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text3)' }}>
                    {formatDate(p.paymentDate)} · {p.paymentFor}
                  </p>
                </div>
                <span className="font-semibold text-sm ml-4 flex-shrink-0"
                  style={{ color: 'var(--green)' }}>
                  {formatCurrency(p.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

export default Dashboard