import { useState, useEffect } from 'react'
import { getServices, getMembershipPlans, createMembershipPlan, createService } from '../api/axios'
import Loader from '../components/common/Loader'
import Modal from '../components/common/Modal'
import EmptyState from '../components/common/EmptyState'
import { Settings, Plus, CheckCircle, Clock, IndianRupee } from 'lucide-react'
import { formatCurrency } from '../utils/helpers'

// ── Shared styles ──
const inputCls = `w-full rounded-lg px-4 py-3 text-sm focus:outline-none transition-colors`
const inputStyle = {
  background: 'var(--bg3)',
  border: '1px solid var(--border)',
  color: 'var(--text)',
}
const labelCls = 'block text-xs font-medium mb-1.5 uppercase tracking-wide'

/* ── Add Membership Plan form ── */
const PlanForm = ({ onSave, loading }) => {
  const [form, setForm] = useState({ name: '', duration: 30, price: '', features: '' })
  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }))
  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      ...form,
      price: Number(form.price),
      duration: Number(form.duration),
      features: form.features.split(',').map((s) => s.trim()).filter(Boolean),
    })
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelCls} style={{ color: 'var(--text3)' }}>Plan Name *</label>
        <input
          value={form.name} onChange={set('name')} required
          className={inputCls} style={inputStyle}
          placeholder="Monthly Basic"
        />
      </div>

      <div>
        <label className={labelCls} style={{ color: 'var(--text3)' }}>Duration (days) *</label>
        <input
          type="number" value={form.duration} onChange={set('duration')} required
          className={inputCls} style={inputStyle}
        />
      </div>
      <div>
        <label className={labelCls} style={{ color: 'var(--text3)' }}>Price (₹) *</label>
        <input
          type="number" value={form.price} onChange={set('price')} required
          className={inputCls} style={inputStyle} placeholder="999"
        />
      </div>

      <div>
        <label className={labelCls} style={{ color: 'var(--text3)' }}>Features (comma-separated)</label>
        <input
          value={form.features} onChange={set('features')}
          className={inputCls} style={inputStyle}
          placeholder="Gym access, Locker room, 2 PT sessions"
        />
      </div>

      <button
        type="submit" disabled={loading}
        className="w-full disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors text-sm"
        style={{ background: 'var(--accent)' }}
      >
        {loading ? 'Saving...' : 'Add Plan'}
      </button>
    </form>
  )
}

/* ── Add Service form ── */
const ServiceForm = ({ onSave, loading }) => {
  const [form, setForm] = useState({ name: '', description: '', pricePerMonth: '', category: 'fitness' })
  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }))
  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ ...form, pricePerMonth: Number(form.pricePerMonth) })
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelCls} style={{ color: 'var(--text3)' }}>Service Name *</label>
        <input
          value={form.name} onChange={set('name')} required
          className={inputCls} style={inputStyle} placeholder="Personal Training"
        />
      </div>

      <div>
        <label className={labelCls} style={{ color: 'var(--text3)' }}>Category</label>
        <select
          value={form.category} onChange={set('category')}
          className={inputCls} style={inputStyle}
        >
          <option value="fitness">Fitness</option>
          <option value="wellness">Wellness</option>
          <option value="nutrition">Nutrition</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div>
        <label className={labelCls} style={{ color: 'var(--text3)' }}>Price/Month (₹) *</label>
        <input
          type="number" value={form.pricePerMonth} onChange={set('pricePerMonth')} required
          className={inputCls} style={inputStyle} placeholder="2000"
        />
      </div>

      <div>
        <label className={labelCls} style={{ color: 'var(--text3)' }}>Description</label>
        <textarea
          value={form.description} onChange={set('description')} rows={3}
          className={inputCls} style={inputStyle} placeholder="What's included..."
        />
      </div>

      <button
        type="submit" disabled={loading}
        className="w-full disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors text-sm"
        style={{ background: 'var(--accent)' }}
      >
        {loading ? 'Saving...' : 'Add Service'}
      </button>
    </form>
  )
}

const Services = () => {
  const [plans, setPlans] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState('plans')

  const load = async () => {
    setLoading(true)
    const [p, s] = await Promise.all([getMembershipPlans(), getServices()])
    setPlans(p.data)
    setServices(s.data)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const handleAddPlan = async (data) => {
    setSaving(true)
    try { await createMembershipPlan(data); setModal(null); load() }
    finally { setSaving(false) }
  }
  const handleAddService = async (data) => {
    setSaving(true)
    try { await createService(data); setModal(null); load() }
    finally { setSaving(false) }
  }

  const durationLabel = (days) => {
    if (days <= 31) return 'Monthly'
    if (days <= 100) return 'Quarterly'
    return 'Yearly'
  }

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Header — ✅ FIX: wrap on mobile */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Services & Plans</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text3)' }}>
            Manage membership plans and additional services
          </p>
        </div>
        {/* ✅ FIX: full-width buttons on mobile */}
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setModal('plan')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border"
            style={{
              background: 'var(--bg3)',
              borderColor: 'var(--border)',
              color: 'var(--text)',
            }}
          >
            <Plus size={15} /> Add Plan
          </button>
          <button
            onClick={() => setModal('service')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors text-white"
            style={{ background: 'var(--accent)' }}
          >
            <Plus size={15} /> Add Service
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-1 rounded-lg p-1 w-fit border"
        style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}
      >
        {['plans', 'services'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-1.5 rounded-md text-xs font-medium capitalize transition-colors"
            style={
              tab === t
                ? { background: 'var(--accent)', color: '#fff' }
                : { color: 'var(--text2)' }
            }
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? <Loader /> : (
        <>
          {/* ── Membership Plans ── */}
          {tab === 'plans' && (
            plans.length === 0 ? (
              <div className="rounded-xl border" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
                <EmptyState
                  icon={IndianRupee}
                  title="No membership plans yet"
                  subtitle="Add your first plan using the button above"
                  action={
                    <button onClick={() => setModal('plan')} className="text-sm" style={{ color: 'var(--accent)' }}>
                      + Add Plan
                    </button>
                  }
                />
              </div>
            ) : (
              // ✅ FIX: 1 col mobile, 2 col tablet, 3 col desktop
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {plans.map((p) => (
                  <div
                    key={p._id}
                    className="rounded-xl p-5 transition-colors border"
                    style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{p.name}</h3>
                      <span
                        className="text-xs px-2 py-1 rounded-full border"
                        style={{
                          color: 'var(--accent)',
                          background: 'color-mix(in srgb, var(--accent) 10%, transparent)',
                          borderColor: 'color-mix(in srgb, var(--accent) 25%, transparent)',
                        }}
                      >
                        {durationLabel(p.duration)}
                      </span>
                    </div>
                    <p className="text-2xl font-bold mb-1" style={{ color: 'var(--text)' }}>
                      {formatCurrency(p.price)}
                    </p>
                    <p className="text-xs mb-4 flex items-center gap-1" style={{ color: 'var(--text3)' }}>
                      <Clock size={11} /> {p.duration} days
                    </p>
                    {p.features?.length > 0 && (
                      <ul className="space-y-1.5">
                        {p.features.map((f, i) => (
                          <li key={i} className="flex items-center gap-2 text-xs" style={{ color: 'var(--text2)' }}>
                            <CheckCircle size={12} className="flex-shrink-0" style={{ color: '#4ade80' }} /> {f}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )
          )}

          {/* ── Additional Services ── */}
          {tab === 'services' && (
            services.length === 0 ? (
              <div className="rounded-xl border" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
                <EmptyState
                  icon={Settings}
                  title="No additional services yet"
                  subtitle="Add personal training, yoga, swimming and more"
                  action={
                    <button onClick={() => setModal('service')} className="text-sm" style={{ color: 'var(--accent)' }}>
                      + Add Service
                    </button>
                  }
                />
              </div>
            ) : (
              // ✅ FIX: 1 col mobile, 2 col tablet, 3 col desktop
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {services.map((s) => (
                  <div
                    key={s._id}
                    className="rounded-xl p-5 transition-colors border"
                    style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{s.name}</h3>
                      <span
                        className="text-xs px-2 py-1 rounded-full border capitalize"
                        style={{
                          color: '#60a5fa',
                          background: 'rgba(96,165,250,0.10)',
                          borderColor: 'rgba(96,165,250,0.25)',
                        }}
                      >
                        {s.category}
                      </span>
                    </div>
                    {s.description && (
                      <p className="text-xs mb-3 leading-relaxed" style={{ color: 'var(--text2)' }}>
                        {s.description}
                      </p>
                    )}
                    <p className="text-lg font-bold" style={{ color: 'var(--text)' }}>
                      {formatCurrency(s.pricePerMonth)}
                      <span className="text-xs font-normal" style={{ color: 'var(--text3)' }}>/month</span>
                    </p>
                  </div>
                ))}
              </div>
            )
          )}
        </>
      )}

      {/* Modals */}
      <Modal isOpen={modal === 'plan'} onClose={() => setModal(null)} title="Add Membership Plan">
        <PlanForm onSave={handleAddPlan} loading={saving} />
      </Modal>
      <Modal isOpen={modal === 'service'} onClose={() => setModal(null)} title="Add Service">
        <ServiceForm onSave={handleAddService} loading={saving} />
      </Modal>
    </div>
  )
}

export default Services