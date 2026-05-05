// src/pages/MemberDetail.jsx
import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate }       from 'react-router-dom'
import API                              from '../api/axios'
import { getMember, getWorkoutPlans, getDietPlans, getMembershipPlans } from '../api/axios'
import Loader                           from '../components/common/Loader'
import {
  ArrowLeft, Dumbbell, Apple, RefreshCw,
  Scale, Ruler, Target, Phone, Mail,
  MapPin, Camera, Trash2, CheckCircle,
} from 'lucide-react'
import {
  formatDate, formatCurrency, calcBMI,
  statusColor, daysUntilExpiry,
} from '../utils/helpers'

/* ── Reusable section card ──────────────────────────────────── */
const Section = ({ title, icon: Icon, iconColor, children }) => (
  <div
    className="rounded-xl p-4 sm:p-5 border"
    style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}
  >
    <div className="flex items-center gap-2 mb-4 pb-3 border-b"
      style={{ borderColor: 'var(--border)' }}>
      <Icon size={15} style={{ color: iconColor }} />
      <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{title}</h3>
    </div>
    {children}
  </div>
)

/* ── Info row ───────────────────────────────────────────────── */
const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-2 border-b last:border-0"
    style={{ borderColor: 'var(--border)' }}>
    <Icon size={13} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--text3)' }} />
    <span className="text-xs flex-shrink-0 w-16" style={{ color: 'var(--text3)' }}>{label}</span>
    <span className="text-sm break-all" style={{ color: 'var(--text)' }}>
      {value || <span style={{ color: 'var(--text3)' }}>—</span>}
    </span>
  </div>
)

/* ── Profile photo section ──────────────────────────────────── */
const ProfilePhoto = ({ member, onUpdated }) => {
  const inputRef             = useRef(null)
  const [uploading, setUpload] = useState(false)
  const [removing,  setRemove] = useState(false)

  const handleChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!['image/jpeg','image/jpg','image/png','image/webp'].includes(file.type)) {
      alert('Only JPG, PNG, WebP allowed'); return
    }
    if (file.size > 3 * 1024 * 1024) { alert('Max 3MB'); return }

    setUpload(true)
    try {
      const fd = new FormData()
      fd.append('profilePhoto', file)
      const { data } = await API.put(`/members/${member._id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      onUpdated(data)
    } catch (err) { alert(err?.response?.data?.message || 'Upload failed') }
    finally { setUpload(false); if (inputRef.current) inputRef.current.value = '' }
  }

  const handleRemove = async () => {
    if (!window.confirm('Remove profile photo?')) return
    setRemove(true)
    try {
      await API.delete(`/members/${member._id}/photo`)
      onUpdated({ ...member, profilePhoto: null })
    } catch (err) { alert(err?.response?.data?.message || 'Remove failed') }
    finally { setRemove(false) }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative group">
        {member.profilePhoto ? (
          <img src={member.profilePhoto} alt={member.name}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover"
            style={{ border: '4px solid var(--accent-border)' }} />
        ) : (
          <div
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center
                       text-3xl font-bold text-white"
            style={{ background: 'var(--accent)', border: '4px solid var(--accent-border)' }}
          >
            {member.name[0].toUpperCase()}
          </div>
        )}

        {/* Overlay */}
        <div
          onClick={() => inputRef.current?.click()}
          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100
                     transition-opacity cursor-pointer flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.5)' }}
        >
          {uploading
            ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <Camera size={20} className="text-white" />
          }
        </div>

        {/* Camera badge */}
        <button onClick={() => inputRef.current?.click()} disabled={uploading}
          className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center
                     text-white shadow-lg transition-colors disabled:opacity-50"
          style={{ background: 'var(--accent)' }}>
          <Camera size={14} />
        </button>
      </div>

      {member.profilePhoto && (
        <button onClick={handleRemove} disabled={removing}
          className="flex items-center gap-1 text-xs transition-colors"
          style={{ color: removing ? 'var(--text3)' : 'var(--red)' }}>
          <Trash2 size={11} />
          {removing ? 'Removing...' : 'Remove photo'}
        </button>
      )}

      <input ref={inputRef} type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden" onChange={handleChange} />
    </div>
  )
}

/* ── Main page ──────────────────────────────────────────────── */
const MemberDetail = () => {
  const { id }   = useParams()
  const navigate = useNavigate()

  const [member,          setMember]         = useState(null)
  const [workoutPlans,    setWorkoutPlans]    = useState([])
  const [dietPlans,       setDietPlans]       = useState([])
  const [membershipPlans, setMembershipPlans] = useState([])
  const [loading,         setLoading]         = useState(true)
  const [error,           setError]           = useState(null)
  const [toast,           setToast]           = useState('')

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }
  const reload = async () => { const { data } = await getMember(id); setMember(data); return data }

  useEffect(() => {
    Promise.all([getMember(id), getWorkoutPlans(), getDietPlans(), getMembershipPlans()])
      .then(([mR, wR, dR, mpR]) => {
        setMember(mR.data)
        setWorkoutPlans(wR.data)
        setDietPlans(dR.data)
        setMembershipPlans(mpR.data)
      })
      .catch(() => setError('Member not found'))
      .finally(() => setLoading(false))
  }, [id])

  const selectCls = {
    width:       '100%',
    background:  'var(--bg3)',
    border:      '1px solid var(--border)',
    borderRadius: '0.5rem',
    padding:     '0.625rem 1rem',
    fontSize:    '0.875rem',
    color:       'var(--text)',
    outline:     'none',
    cursor:      'pointer',
  }

  if (loading) return <Loader />
  if (error)   return (
    <div className="text-center py-20 px-4">
      <p className="text-sm mb-2" style={{ color: 'var(--red)' }}>{error}</p>
      <button onClick={() => navigate('/members')}
        className="text-sm" style={{ color: 'var(--text2)' }}>← Back</button>
    </div>
  )

  const bmi  = calcBMI(member.weight, member.height)
  const days = daysUntilExpiry(member.membershipExpiry)

  return (
    <div className="space-y-4 animate-fade-in">

      {/* Back */}
      <button onClick={() => navigate('/members')}
        className="flex items-center gap-2 text-sm transition-colors"
        style={{ color: 'var(--text2)' }}>
        <ArrowLeft size={16} /> Back to Members
      </button>

      {/* Toast */}
      {toast && (
        <div className="flex items-center gap-2 p-3 rounded-xl text-sm"
          style={{ background: 'var(--green-bg)', border: '1px solid rgba(34,197,94,0.2)', color: 'var(--green)' }}>
          <CheckCircle size={15} /> {toast}
        </div>
      )}

      {/* ── Profile header ──────────────────────────── */}
      <div
        className="rounded-xl p-4 sm:p-6 border"
        style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}
      >
        {/* Mobile: stacked; Desktop: row */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start">

          {/* Photo */}
          <div className="flex-shrink-0">
            <ProfilePhoto
              member={member}
              onUpdated={updated => setMember(prev => ({ ...prev, ...updated }))}
            />
          </div>

          {/* Name + tags */}
          <div className="flex-1 min-w-0 text-center sm:text-left">
            <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start mb-2">
              <h1 className="text-lg sm:text-xl font-bold" style={{ color: 'var(--text)' }}>
                {member.name}
              </h1>
              <span className={`text-xs px-2.5 py-1 rounded-full capitalize font-medium ${statusColor(member.membershipStatus)}`}>
                {member.membershipStatus}
              </span>
            </div>

            {/* Tags row — wraps on mobile */}
            <div className="flex flex-wrap gap-1.5 mb-3 justify-center sm:justify-start">
              {[
                member.gender,
                `${member.age} years`,
                bmi && `BMI ${bmi}`,
                member.goal?.replace('_', ' '),
              ].filter(Boolean).map((tag, i) => (
                <span key={i}
                  className="text-xs px-2.5 py-1 rounded-full capitalize"
                  style={{ background: 'var(--bg3)', color: 'var(--text2)' }}>
                  {tag}
                </span>
              ))}
            </div>

            {/* Contact */}
            <div className="space-y-1 text-sm" style={{ color: 'var(--text2)' }}>
              <p className="flex items-center gap-2 justify-center sm:justify-start">
                <Phone size={13} style={{ color: 'var(--text3)', flexShrink: 0 }} />
                {member.phone}
              </p>
              {member.email && (
                <p className="flex items-center gap-2 justify-center sm:justify-start">
                  <Mail size={13} style={{ color: 'var(--text3)', flexShrink: 0 }} />
                  <span className="truncate">{member.email}</span>
                </p>
              )}
            </div>
          </div>

          {/* Dates — right side on desktop, below on mobile */}
          <div className="flex flex-row sm:flex-col gap-4 sm:gap-3 text-center sm:text-right flex-shrink-0">
            <div>
              <p className="text-xs" style={{ color: 'var(--text3)' }}>Joined</p>
              <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                {formatDate(member.createdAt)}
              </p>
            </div>
            {member.membershipExpiry && (
              <div>
                <p className="text-xs" style={{ color: 'var(--text3)' }}>Expires</p>
                <p className="text-sm font-medium"
                  style={{ color: days !== null && days <= 7 ? 'var(--red)' : 'var(--text)' }}>
                  {formatDate(member.membershipExpiry)}
                </p>
                {days !== null && days > 0 && (
                  <p className="text-xs" style={{ color: 'var(--text3)' }}>{days}d left</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Content grid ── 1 col mobile, 2 col desktop ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Contact */}
        <Section title="Contact Information" icon={Phone} iconColor="var(--blue)">
          <InfoRow icon={Phone}  label="Phone"   value={member.phone} />
          <InfoRow icon={Mail}   label="Email"   value={member.email} />
          <InfoRow icon={MapPin} label="Address" value={member.address} />
        </Section>

        {/* Body stats */}
        <Section title="Body Stats" icon={Scale} iconColor="var(--purple)">
          <InfoRow icon={Scale}  label="Weight" value={member.weight ? `${member.weight} kg` : null} />
          <InfoRow icon={Ruler}  label="Height" value={member.height ? `${member.height} cm` : null} />
          <InfoRow icon={Target} label="BMI"    value={bmi} />
        </Section>

        {/* Assign workout */}
        <Section title="Workout Plan" icon={Dumbbell} iconColor="var(--accent)">
          {member.assignedWorkout ? (
            <div className="rounded-lg p-3 mb-3" style={{ background: 'var(--bg3)' }}>
              <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                {member.assignedWorkout.name}
              </p>
              <p className="text-xs mt-0.5 capitalize" style={{ color: 'var(--text3)' }}>
                {member.assignedWorkout.level}
              </p>
            </div>
          ) : (
            <p className="text-sm mb-3" style={{ color: 'var(--text3)' }}>No plan assigned</p>
          )}
          <select style={selectCls}
            onChange={e => {
              if (!e.target.value) return
              API.post(`/members/${id}/assign-workout`, { workoutPlanId: e.target.value })
                .then(() => reload().then(() => flash('Workout assigned!')))
            }} defaultValue="">
            <option value="" disabled>Assign workout plan...</option>
            {workoutPlans.map(p => (
              <option key={p._id} value={p._id}>{p.name} ({p.level})</option>
            ))}
          </select>
        </Section>

        {/* Assign diet */}
        <Section title="Diet Plan" icon={Apple} iconColor="var(--green)">
          {member.assignedDiet ? (
            <div className="rounded-lg p-3 mb-3" style={{ background: 'var(--bg3)' }}>
              <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                {member.assignedDiet.name}
              </p>
              <p className="text-xs mt-0.5 capitalize" style={{ color: 'var(--text3)' }}>
                {member.assignedDiet.type} · {member.assignedDiet.dailyCalorieTarget} kcal/day
              </p>
            </div>
          ) : (
            <p className="text-sm mb-3" style={{ color: 'var(--text3)' }}>No plan assigned</p>
          )}
          <select style={selectCls}
            onChange={e => {
              if (!e.target.value) return
              API.post(`/members/${id}/assign-diet`, { dietPlanId: e.target.value })
                .then(() => reload().then(() => flash('Diet plan assigned!')))
            }} defaultValue="">
            <option value="" disabled>Assign diet plan...</option>
            {dietPlans.map(p => (
              <option key={p._id} value={p._id}>{p.name} ({p.type})</option>
            ))}
          </select>
        </Section>

        {/* Renew membership */}
        <Section title="Renew Membership" icon={RefreshCw} iconColor="var(--teal, #14b8a6)">
          <div className="mb-3">
            <p className="text-xs" style={{ color: 'var(--text3)' }}>Current plan</p>
            <p className="text-sm font-semibold mt-0.5" style={{ color: 'var(--text)' }}>
              {member.membershipPlan?.name || 'No plan'}
            </p>
            {member.membershipPlan && (
              <p className="text-xs" style={{ color: 'var(--text3)' }}>
                {formatCurrency(member.membershipPlan.price)} · {member.membershipPlan.duration} days
              </p>
            )}
          </div>
          <select style={selectCls}
            onChange={e => {
              if (!e.target.value) return
              API.post(`/members/${id}/renew`, { membershipPlanId: e.target.value, paymentMethod: 'cash' })
                .then(() => reload().then(() => flash('Membership renewed!')))
            }} defaultValue="">
            <option value="" disabled>Select renewal plan...</option>
            {membershipPlans.map(p => (
              <option key={p._id} value={p._id}>
                {p.name} — {formatCurrency(p.price)} ({p.duration}d)
              </option>
            ))}
          </select>
        </Section>

        {/* Notes */}
        {member.notes && (
          <Section title="Notes" icon={Target} iconColor="var(--yellow)">
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text2)' }}>
              {member.notes}
            </p>
          </Section>
        )}
      </div>
    </div>
  )
}

export default MemberDetail