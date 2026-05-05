// src/components/members/MemberForm.jsx
import { useState, useEffect, useRef } from 'react'
import { getMembershipPlans } from '../../api/axios'
import { Camera, X, User, AlertCircle } from 'lucide-react'

/* ── Reusable styled input ────────────────────────────────── */
const Inp = ({ label, required, hint, ...rest }) => {
  const [f, setF] = useState(false)
  return (
    <div>
      <label style={{
        display: 'block', fontSize: 11, fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: '0.06em',
        color: 'var(--text3)', marginBottom: 6,
      }}>
        {label}
        {required && <span style={{ color: 'var(--accent)', marginLeft: 2 }}>*</span>}
        {hint && <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, marginLeft: 4 }}>({hint})</span>}
      </label>
      <input
        {...rest}
        onFocus={e => { setF(true); rest.onFocus?.(e) }}
        onBlur={e => { setF(false); rest.onBlur?.(e) }}
        style={{
          width: '100%', boxSizing: 'border-box',
          background: 'var(--bg3)',
          border: `1.5px solid ${f ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: 10, padding: '13px 16px',
          color: 'var(--text)', fontSize: 15,
          outline: 'none', transition: 'border-color 0.15s',
          WebkitAppearance: 'none',
          ...rest.style,
        }}
      />
    </div>
  )
}

/* ── Reusable styled select ───────────────────────────────── */
const Sel = ({ label, required, children, ...rest }) => {
  const [f, setF] = useState(false)
  return (
    <div>
      <label style={{
        display: 'block', fontSize: 11, fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: '0.06em',
        color: 'var(--text3)', marginBottom: 6,
      }}>
        {label}
        {required && <span style={{ color: 'var(--accent)', marginLeft: 2 }}>*</span>}
      </label>
      <select
        {...rest}
        onFocus={() => setF(true)}
        onBlur={() => setF(false)}
        style={{
          width: '100%', boxSizing: 'border-box',
          background: 'var(--bg3)',
          border: `1.5px solid ${f ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: 10, padding: '13px 40px 13px 16px',
          color: 'var(--text)', fontSize: 15,
          outline: 'none', cursor: 'pointer',
          transition: 'border-color 0.15s',
          WebkitAppearance: 'none', appearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239896a8' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 14px center',
          ...rest.style,
        }}
      >
        {children}
      </select>
    </div>
  )
}

/* ── Photo picker ─────────────────────────────────────────── */
const PhotoPicker = ({ onChange, existing }) => {
  const ref = useRef(null)
  const [preview, setPreview] = useState(existing || null)

  const pick = (file) => {
    if (!file) return
    if (!['image/jpeg','image/jpg','image/png','image/webp'].includes(file.type)) {
      alert('Only JPG, PNG or WebP'); return
    }
    if (file.size > 3*1024*1024) { alert('Max 3MB'); return }
    const r = new FileReader()
    r.onloadend = () => setPreview(r.result)
    r.readAsDataURL(file)
    onChange(file)
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, padding:'4px 0 8px' }}>
      <div style={{ position:'relative', cursor:'pointer' }} onClick={() => ref.current?.click()}>
        {preview ? (
          <div style={{ width:90, height:90, borderRadius:'50%', overflow:'hidden', border:'3px solid var(--accent)' }}>
            <img src={preview} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          </div>
        ) : (
          <div style={{
            width:90, height:90, borderRadius:'50%',
            border:'2px dashed var(--border2)', background:'var(--bg3)',
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4,
          }}>
            <User size={22} color="var(--text3)" />
            <span style={{ fontSize:10, color:'var(--text3)' }}>Add Photo</span>
          </div>
        )}
        <div style={{
          position:'absolute', bottom:2, right:2, width:28, height:28,
          borderRadius:'50%', background:'var(--accent)',
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:'0 2px 6px rgba(0,0,0,0.3)',
        }}>
          <Camera size={13} color="white" />
        </div>
      </div>
      {preview && (
        <button type="button" onClick={() => { setPreview(null); onChange(null); if(ref.current) ref.current.value='' }}
          style={{ fontSize:12, color:'var(--text3)', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
          <X size={11} /> Remove photo
        </button>
      )}
      <p style={{ fontSize:11, color:'var(--text3)', margin:0 }}>Optional · JPG/PNG · max 3MB</p>
      <input ref={ref} type="file" accept="image/jpeg,image/jpg,image/png,image/webp"
        style={{ display:'none' }} onChange={e => pick(e.target.files[0])} />
    </div>
  )
}

/* ── Responsive 2-col grid ────────────────────────────────── */
const Grid2 = ({ children }) => (
  <>
    <style>{`.g2{display:grid;gap:14px;grid-template-columns:1fr}@media(min-width:480px){.g2{grid-template-columns:1fr 1fr}}`}</style>
    <div className="g2">{children}</div>
  </>
)
const Grid3 = ({ children }) => (
  <>
    <style>{`.g3{display:grid;gap:14px;grid-template-columns:1fr}@media(min-width:480px){.g3{grid-template-columns:1fr 1fr 1fr}}`}</style>
    <div className="g3">{children}</div>
  </>
)

/* ── Main Form ────────────────────────────────────────────── */
const MemberForm = ({ initialData = {}, onSubmit, loading }) => {
  const [form, setForm] = useState({
    name:'', email:'', age:'', gender:'male',
    phone:'', address:'', goal:'maintenance',
    weight:'', height:'', membershipPlanId:'', notes:'',
    ...initialData,
  })
  const [photoFile, setPhotoFile] = useState(null)
  const [plans,     setPlans]     = useState([])
  const [error,     setError]     = useState('')

  useEffect(() => {
    getMembershipPlans().then(r => setPlans(r.data || [])).catch(() => {})
  }, [])

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('')
    if (!form.name.trim())  { setError('Full name is required');   return }
    if (!form.phone.trim()) { setError('Phone number is required'); return }
    if (!form.age)          { setError('Age is required');          return }
    if (Number(form.age)<5||Number(form.age)>100) { setError('Age must be 5–100'); return }

    const make = (includePhoto) => {
      const fd = new FormData()
      fd.append('name',   form.name.trim())
      fd.append('phone',  form.phone.trim())
      fd.append('age',    String(Number(form.age)))
      fd.append('gender', form.gender)
      fd.append('address',form.address.trim())
      fd.append('goal',   form.goal)
      fd.append('notes',  form.notes.trim())
      if (form.email.trim())        fd.append('email',            form.email.trim().toLowerCase())
      if (Number(form.weight) > 0)  fd.append('weight',           String(Number(form.weight)))
      if (Number(form.height) > 0)  fd.append('height',           String(Number(form.height)))
      if (form.membershipPlanId)    fd.append('membershipPlanId', form.membershipPlanId)
      if (includePhoto && photoFile) fd.append('profilePhoto',    photoFile)
      return fd
    }

    try {
      await onSubmit(make(true))
    } catch (err) {
      const msg = err?.response?.data?.message || ''
      // If Cloudinary fails, retry without photo
      if (photoFile && (msg.includes('cloudinary')||msg.includes('upload')||msg.includes('ENOTFOUND')||msg.includes('network'))) {
        try { await onSubmit(make(false)) }
        catch (e2) { setError(e2?.response?.data?.message || 'Failed to save. Please try again.') }
      } else {
        setError(msg || 'Failed to save. Please try again.')
      }
    }
  }

  const divider = <div style={{ height:1, background:'var(--border)', margin:'2px 0' }} />
  const spin = <span style={{
    display:'inline-block', width:16, height:16,
    border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white',
    borderRadius:'50%', animation:'mfspin 0.7s linear infinite',
  }} />

  return (
    <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <style>{`@keyframes mfspin{to{transform:rotate(360deg)}}`}</style>

      {/* Error */}
      {error && (
        <div style={{
          padding:'11px 14px', borderRadius:10,
          background:'var(--red-bg)', border:'1px solid rgba(239,68,68,0.25)',
          color:'var(--red)', fontSize:13,
          display:'flex', alignItems:'flex-start', gap:8,
        }}>
          <AlertCircle size={15} style={{ flexShrink:0, marginTop:1 }} />
          {error}
        </div>
      )}

      {/* Photo */}
      <PhotoPicker onChange={setPhotoFile} existing={initialData.profilePhoto || null} />
      {divider}

      {/* Name + Phone */}
      <Grid2>
        <Inp label="Full Name" required placeholder="Rahul Sharma"
          value={form.name} onChange={set('name')} />
        <Inp label="Phone" required placeholder="9876543210"
          value={form.phone} onChange={set('phone')} inputMode="numeric" />
      </Grid2>

      {/* Email + Age */}
      <Grid2>
        <Inp label="Email" hint="optional" placeholder="rahul@email.com"
          value={form.email} onChange={set('email')} type="email"
          inputMode="email" autoCapitalize="none" autoCorrect="off" />
        <Inp label="Age" required placeholder="25"
          value={form.age} onChange={set('age')} type="number"
          inputMode="numeric" min="5" max="100" />
      </Grid2>

      {/* Gender + Weight + Height */}
      <Grid3>
        <Sel label="Gender" required value={form.gender} onChange={set('gender')}>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </Sel>
        <Inp label="Weight (kg)" placeholder="70"
          value={form.weight} onChange={set('weight')}
          type="number" inputMode="decimal" min="0" />
        <Inp label="Height (cm)" placeholder="175"
          value={form.height} onChange={set('height')}
          type="number" inputMode="decimal" min="0" />
      </Grid3>

      {/* Goal + Plan */}
      <Grid2>
        <Sel label="Fitness Goal" value={form.goal} onChange={set('goal')}>
          <option value="weight_loss">Weight Loss</option>
          <option value="muscle_gain">Muscle Gain</option>
          <option value="maintenance">Maintenance</option>
          <option value="endurance">Endurance</option>
        </Sel>
        <Sel label="Membership Plan" value={form.membershipPlanId} onChange={set('membershipPlanId')}>
          <option value="">— No Plan —</option>
          {plans.map(p => (
            <option key={p._id} value={p._id}>{p.name} — ₹{p.price} ({p.duration}d)</option>
          ))}
        </Sel>
      </Grid2>

      {/* Address */}
      <Inp label="Address" placeholder="123 MG Road, Indore"
        value={form.address} onChange={set('address')} autoCapitalize="words" />

      {/* Notes */}
      <div>
        <label style={{ display:'block', fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text3)', marginBottom:6 }}>
          Notes
        </label>
        <textarea value={form.notes} onChange={set('notes')} rows={3}
          placeholder="Medical conditions, preferences..."
          style={{
            width:'100%', boxSizing:'border-box',
            background:'var(--bg3)', border:'1.5px solid var(--border)',
            borderRadius:10, padding:'13px 16px',
            color:'var(--text)', fontSize:15,
            outline:'none', resize:'vertical', fontFamily:'inherit', lineHeight:1.5,
          }} />
      </div>

      {/* Submit */}
      <button type="submit" disabled={loading} style={{
        width:'100%', padding:'14px',
        borderRadius:12,
        background: loading ? 'rgba(249,115,22,0.5)' : 'var(--accent)',
        color:'white', fontWeight:600, fontSize:15,
        border:'none', cursor: loading ? 'not-allowed' : 'pointer',
        display:'flex', alignItems:'center', justifyContent:'center', gap:8,
        transition:'background 0.15s',
      }}>
        {loading ? <>{spin} {photoFile ? 'Uploading & saving...' : 'Saving...'}</> : 'Save Member'}
      </button>
    </form>
  )
}

export default MemberForm