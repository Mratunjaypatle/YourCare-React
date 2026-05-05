// src/pages/Payments.jsx
import { useState, useEffect, useCallback } from 'react'
import { getPayments, getMembers, getMembershipPlans, getServices } from '../api/axios'
import API            from '../api/axios'
import Loader         from '../components/common/Loader'
import EmptyState     from '../components/common/EmptyState'
import Modal          from '../components/common/Modal'
import {
  CreditCard, ChevronLeft, ChevronRight,
  TrendingUp, Plus, Filter,
} from 'lucide-react'
import { formatDate, formatCurrency } from '../utils/helpers'

// ── Status badge ──────────────────────────────────────────────
const statusStyle = (status) => {
  switch (status) {
    case 'completed': return { background: 'var(--green-bg)',  color: 'var(--green)',  border: '1px solid rgba(34,197,94,0.2)'  }
    case 'pending':   return { background: 'var(--yellow-bg)', color: 'var(--yellow)', border: '1px solid rgba(245,158,11,0.2)' }
    case 'failed':    return { background: 'var(--red-bg)',    color: 'var(--red)',    border: '1px solid rgba(239,68,68,0.2)'  }
    default:          return { background: 'var(--bg3)',       color: 'var(--text2)',  border: '1px solid var(--border)'        }
  }
}

// ── Method badge ──────────────────────────────────────────────
const methodStyle = (method) => {
  switch (method) {
    case 'cash':          return { background: 'var(--green-bg)',  color: 'var(--green)'  }
    case 'card':          return { background: 'var(--blue-bg)',   color: 'var(--blue)'   }
    case 'upi':           return { background: 'var(--purple-bg)', color: 'var(--purple)' }
    case 'bank_transfer': return { background: 'var(--accent-bg)', color: 'var(--accent)' }
    case 'online':        return { background: 'var(--blue-bg)',   color: 'var(--blue)'   }
    default:              return { background: 'var(--bg3)',       color: 'var(--text2)'  }
  }
}

const inputCls_inline = {
  width:        '100%',
  background:   'var(--bg3)',
  border:       '1px solid var(--border)',
  borderRadius: '0.5rem',
  padding:      '0.625rem 1rem',
  color:        'var(--text)',
  fontSize:     '0.875rem',
  outline:      'none',
}
const labelStyle = {
  display:       'block',
  fontSize:      '0.65rem',
  fontWeight:    500,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color:         'var(--text3)',
  marginBottom:  '0.375rem',
}

// ── Payment Form ──────────────────────────────────────────────
const PaymentForm = ({ onSave, loading }) => {
  const [form,    setForm]    = useState({
    memberId: '', amount: '', paymentMethod: 'cash',
    paymentFor: 'membership', membershipPlanId: '',
    serviceId: '', notes: '', status: 'completed',
  })
  const [members,  setMembers]  = useState([])
  const [plans,    setPlans]    = useState([])
  const [services, setServices] = useState([])
  const [error,    setError]    = useState('')

  useEffect(() => {
    Promise.all([getMembers({ limit: 100 }), getMembershipPlans(), getServices()])
      .then(([mR, pR, sR]) => {
        setMembers(mR.data.members || [])
        setPlans(pR.data || [])
        setServices(sR.data || [])
      }).catch(() => {})
  }, [])

  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }))

  const handlePlanChange = (e) => {
    const planId = e.target.value
    const plan   = plans.find(p => p._id === planId)
    setForm(p => ({ ...p, membershipPlanId: planId, amount: plan ? plan.price : p.amount }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.memberId) { setError('Please select a member'); return }
    if (!form.amount || Number(form.amount) <= 0) { setError('Enter a valid amount'); return }

    const payload = {
      memberId: form.memberId, amount: Number(form.amount),
      paymentMethod: form.paymentMethod, paymentFor: form.paymentFor,
      status: form.status, notes: form.notes,
    }
    if (form.membershipPlanId) payload.membershipPlanId = form.membershipPlanId
    if (form.serviceId)        payload.serviceId        = form.serviceId

    try { await onSave(payload) }
    catch (err) { setError(err?.response?.data?.message || 'Failed to record payment') }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg text-sm flex items-center gap-2"
          style={{ background: 'var(--red-bg)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--red)' }}>
          ⚠ {error}
        </div>
      )}

      <div>
        <label style={labelStyle}>Member *</label>
        <select value={form.memberId} onChange={set('memberId')} style={inputCls_inline} required>
          <option value="">— Select Member —</option>
          {members.map(m => <option key={m._id} value={m._id}>{m.name} ({m.phone})</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label style={labelStyle}>Payment For *</label>
          <select value={form.paymentFor} onChange={set('paymentFor')} style={inputCls_inline}>
            <option value="membership">Membership</option>
            <option value="service">Service</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Method *</label>
          <select value={form.paymentMethod} onChange={set('paymentMethod')} style={inputCls_inline}>
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
            <option value="card">Card</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="online">Online</option>
          </select>
        </div>
      </div>

      {form.paymentFor === 'membership' && (
        <div>
          <label style={labelStyle}>Membership Plan (auto-fills amount)</label>
          <select value={form.membershipPlanId} onChange={handlePlanChange} style={inputCls_inline}>
            <option value="">— Optional —</option>
            {plans.map(p => <option key={p._id} value={p._id}>{p.name} — ₹{p.price} ({p.duration}d)</option>)}
          </select>
        </div>
      )}

      {form.paymentFor === 'service' && (
        <div>
          <label style={labelStyle}>Service</label>
          <select value={form.serviceId} onChange={set('serviceId')} style={inputCls_inline}>
            <option value="">— Optional —</option>
            {services.map(s => <option key={s._id} value={s._id}>{s.name} — ₹{s.pricePerMonth}/mo</option>)}
          </select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label style={labelStyle}>Amount (₹) *</label>
          <input type="number" value={form.amount} onChange={set('amount')}
            min="1" style={inputCls_inline} placeholder="999" required />
        </div>
        <div>
          <label style={labelStyle}>Status</label>
          <select value={form.status} onChange={set('status')} style={inputCls_inline}>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      <div>
        <label style={labelStyle}>Notes (optional)</label>
        <input value={form.notes} onChange={set('notes')} style={inputCls_inline} placeholder="Any notes..." />
      </div>

      <button type="submit" disabled={loading}
        className="w-full text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
        style={{ background: loading ? 'var(--accent-bg)' : 'var(--accent)', opacity: loading ? 0.7 : 1 }}>
        {loading
          ? <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Recording...
            </span>
          : 'Record Payment'
        }
      </button>
    </form>
  )
}

// ── Main Payments page ────────────────────────────────────────
const Payments = () => {
  const [payments,      setPayments]     = useState([])
  const [total,         setTotal]        = useState(0)
  const [loading,       setLoading]      = useState(true)
  const [page,          setPage]         = useState(1)
  const [modalOpen,     setModalOpen]    = useState(false)
  const [saving,        setSaving]       = useState(false)
  const [filterFor,     setFilterFor]    = useState('all')
  const [filterStatus,  setFilterStatus] = useState('all')
  const LIMIT = 15

  const fetchPayments = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: LIMIT }
      if (filterFor    !== 'all') params.paymentFor = filterFor
      if (filterStatus !== 'all') params.status     = filterStatus
      const { data } = await getPayments(params)
      setPayments(data.payments || [])
      setTotal(data.total       || 0)
    } catch { setPayments([]) }
    finally  { setLoading(false) }
  }, [page, filterFor, filterStatus])

  useEffect(() => { fetchPayments() }, [fetchPayments])
  useEffect(() => { setPage(1) }, [filterFor, filterStatus])

  const handleAddPayment = async (payload) => {
    setSaving(true)
    try {
      await API.post('/services/payments', payload)
      setModalOpen(false)
      fetchPayments()
    } finally { setSaving(false) }
  }

  const pageTotal  = payments.reduce((s, p) => s + (p.amount || 0), 0)
  const totalPages = Math.ceil(total / LIMIT)

  const FilterRow = ({ options, active, onChange }) => (
    <div className="flex gap-1 p-1 rounded-xl w-fit overflow-x-auto"
      style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
      {options.map(o => (
        <button key={o} onClick={() => onChange(o)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all flex-shrink-0"
          style={{
            background: active === o ? 'var(--accent)' : 'transparent',
            color:      active === o ? '#fff'          : 'var(--text2)',
          }}>
          {o.replace('_', ' ')}
        </button>
      ))}
    </div>
  )

  return (
    <div className="space-y-4 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold" style={{ color: 'var(--text)' }}>
            Payment History
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>
            {total} transactions
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div
            className="rounded-xl px-4 py-2.5 text-right border hidden sm:block"
            style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}
          >
            <p className="text-xs flex items-center gap-1 justify-end mb-0.5" style={{ color: 'var(--text3)' }}>
              <TrendingUp size={11} /> Page total
            </p>
            <p className="text-lg font-bold" style={{ color: 'var(--green)' }}>
              {formatCurrency(pageTotal)}
            </p>
          </div>
          <button onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium text-white"
            style={{ background: 'var(--accent)' }}>
            <Plus size={16} />
            <span className="hidden sm:inline">Record Payment</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <Filter size={13} style={{ color: 'var(--text3)' }} />
        <FilterRow
          options={['all', 'membership', 'service', 'other']}
          active={filterFor}
          onChange={setFilterFor}
        />
        <FilterRow
          options={['all', 'completed', 'pending', 'failed']}
          active={filterStatus}
          onChange={setFilterStatus}
        />
      </div>

      {/* Table */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}
      >
        {loading ? <Loader /> : payments.length === 0 ? (
          <EmptyState icon={CreditCard} title="No payments recorded yet"
            subtitle="Payments auto-record on membership creation or renewal"
            action={
              <button onClick={() => setModalOpen(true)} className="text-sm"
                style={{ color: 'var(--accent)' }}>
                + Record first payment
              </button>
            } />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr style={{ background: 'var(--bg3)', borderBottom: `1px solid var(--border)` }}>
                    {['Member', 'Amount', 'For', 'Plan / Service', 'Method', 'Date', 'Status'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide"
                        style={{ color: 'var(--text3)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payments.map(p => (
                    <tr key={p._id} style={{ borderBottom: `1px solid var(--border)` }}>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                          {p.member?.name || 'Unknown'}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text3)' }}>
                          {p.member?.phone}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-sm font-bold" style={{ color: 'var(--green)' }}>
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-1 rounded-full capitalize"
                          style={{ background: 'var(--bg3)', color: 'var(--text2)', border: '1px solid var(--border)' }}>
                          {p.paymentFor}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--text2)' }}>
                        {p.membershipPlan?.name || p.service?.name || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-1 rounded-full uppercase font-medium"
                          style={methodStyle(p.paymentMethod)}>
                          {p.paymentMethod?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--text2)' }}>
                        {formatDate(p.paymentDate || p.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2.5 py-1 rounded-full capitalize font-medium"
                          style={statusStyle(p.status)}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden divide-y" style={{ borderColor: 'var(--border)' }}>
              {payments.map(p => (
                <div key={p._id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                        {p.member?.name || 'Unknown'}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text3)' }}>
                        {formatDate(p.paymentDate || p.createdAt)}
                      </p>
                    </div>
                    <p className="text-base font-bold" style={{ color: 'var(--green)' }}>
                      {formatCurrency(p.amount)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-xs px-2 py-0.5 rounded-full capitalize"
                      style={{ background: 'var(--bg3)', color: 'var(--text2)', border: '1px solid var(--border)' }}>
                      {p.paymentFor}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full uppercase font-medium"
                      style={methodStyle(p.paymentMethod)}>
                      {p.paymentMethod}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full capitalize font-medium"
                      style={statusStyle(p.status)}>
                      {p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs" style={{ color: 'var(--text3)' }}>
            {(page-1)*LIMIT+1}–{Math.min(page*LIMIT, total)} of {total}
          </p>
          <div className="flex items-center gap-1">
            <button disabled={page===1} onClick={() => setPage(p=>p-1)}
              className="p-2 rounded-lg disabled:opacity-30" style={{ color: 'var(--text2)' }}>
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(totalPages,5) }, (_,i)=>i+1).map(p => (
              <button key={p} onClick={()=>setPage(p)}
                className="w-8 h-8 rounded-lg text-sm"
                style={{ background: page===p ? 'var(--accent)' : 'transparent', color: page===p ? '#fff' : 'var(--text2)' }}>
                {p}
              </button>
            ))}
            <button disabled={page===totalPages} onClick={() => setPage(p=>p+1)}
              className="p-2 rounded-lg disabled:opacity-30" style={{ color: 'var(--text2)' }}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Record Payment" size="md">
        <PaymentForm onSave={handleAddPayment} loading={saving} />
      </Modal>
    </div>
  )
}

export default Payments