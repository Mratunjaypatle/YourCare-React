// src/pages/Members.jsx
// Search is now driven by SearchContext (from Navbar)
// Local status filter is still independent

import { useState, useEffect, useCallback } from 'react'
import { useNavigate }                       from 'react-router-dom'
import API                                   from '../api/axios'
import { getMembers, deleteMember }          from '../api/axios'
import { useSearch }                         from '../context/SearchContext'   // ← reads global search
import Modal                                 from '../components/common/Modal'
import MemberForm                            from '../components/members/MemberForm'
import Loader                                from '../components/common/Loader'
import {
  Plus, Trash2, Edit, Eye,
  Users, ChevronLeft, ChevronRight,
  SearchX, Filter,
} from 'lucide-react'
import { formatDate, statusColor } from '../utils/helpers'

const STATUSES = ['all', 'active', 'expired', 'pending']

/* ── Avatar ─────────────────────────────────────────────────── */
const Avatar = ({ member }) => {
  if (member.profilePhoto) {
    return (
      <img src={member.profilePhoto} alt={member.name}
        className="w-9 h-9 rounded-full object-cover flex-shrink-0 border-2"
        style={{ borderColor: 'var(--border)' }} />
    )
  }
  return (
    <div className="w-9 h-9 rounded-full flex items-center justify-center
                   font-bold flex-shrink-0 text-sm"
      style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
      {member.name[0].toUpperCase()}
    </div>
  )
}

/* ── No results state ───────────────────────────────────────── */
const NoResults = ({ query, onClear }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-3 px-4 text-center">
    <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
      style={{ background: 'var(--bg3)' }}>
      <SearchX size={24} style={{ color: 'var(--text3)' }} />
    </div>
    <p className="font-medium" style={{ color: 'var(--text)' }}>
      No results for "{query}"
    </p>
    <p className="text-sm" style={{ color: 'var(--text3)' }}>
      Try a different name, phone number or email
    </p>
    <button
      onClick={onClear}
      className="text-sm px-4 py-2 rounded-lg transition-colors font-medium"
      style={{ background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}
    >
      Clear search
    </button>
  </div>
)

const Members = () => {
  const navigate                          = useNavigate()
  const { searchQuery, clearSearch }      = useSearch()   // ← global search from Navbar
  const [members,       setMembers]       = useState([])
  const [total,         setTotal]         = useState(0)
  const [loading,       setLoading]       = useState(true)
  const [statusFilter,  setStatusFilter]  = useState('all')
  const [page,          setPage]          = useState(1)
  const [modalOpen,     setModalOpen]     = useState(false)
  const [editingMember, setEditingMember] = useState(null)
  const [saving,        setSaving]        = useState(false)
  const LIMIT = 10

  // Fetch whenever searchQuery (from navbar) or statusFilter changes
  const fetchMembers = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await getMembers({
        search: searchQuery,   // ← uses global search query
        status: statusFilter,
        page,
        limit: LIMIT,
      })
      setMembers(data.members || [])
      setTotal(data.total    || 0)
    } catch { setMembers([]) }
    finally  { setLoading(false) }
  }, [searchQuery, statusFilter, page])

  useEffect(() => { fetchMembers() }, [fetchMembers])
  useEffect(() => { setPage(1) }, [searchQuery, statusFilter])

  const openAdd    = ()  => { setEditingMember(null); setModalOpen(true) }
  const openEdit   = (m) => { setEditingMember(m);    setModalOpen(true) }
  const closeModal = ()  => { setModalOpen(false);    setEditingMember(null) }

  const handleSave = async (formData) => {
    setSaving(true)
    try {
      if (editingMember) {
        await API.put(`/members/${editingMember._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      } else {
        await API.post('/members', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      }
      closeModal()
      fetchMembers()
    } catch (err) { throw err }
    finally       { setSaving(false) }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This also removes their payments and photo.`)) return
    try { await deleteMember(id); fetchMembers() }
    catch (err) { alert(err?.response?.data?.message || 'Delete failed') }
  }

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div className="space-y-4 animate-fade-in">

      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold truncate" style={{ color: 'var(--text)' }}>
            Members
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>
            {searchQuery
              ? `${total} result${total !== 1 ? 's' : ''} for "${searchQuery}"`
              : `${total} registered members`
            }
          </p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium
                     text-white flex-shrink-0 transition-colors"
          style={{ background: 'var(--accent)' }}>
          <Plus size={16} />
          <span className="hidden sm:inline">Add Member</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* ── Active search banner ────────────────────────── */}
      {searchQuery && (
        <div
          className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg text-sm"
          style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-border)' }}
        >
          <span style={{ color: 'var(--text)' }}>
            🔍 Searching: <strong>"{searchQuery}"</strong>
          </span>
          <button
            onClick={clearSearch}
            className="text-xs font-medium px-2.5 py-1 rounded-lg transition-colors"
            style={{ color: 'var(--accent)', background: 'var(--bg2)' }}
          >
            Clear
          </button>
        </div>
      )}

      {/* ── Status filter tabs ──────────────────────────── */}
      <div className="flex items-center gap-2">
        <Filter size={13} style={{ color: 'var(--text3)' }} className="flex-shrink-0" />
        <div className="flex gap-1 overflow-x-auto pb-0.5">
          {STATUSES.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all flex-shrink-0"
              style={{
                background: statusFilter === s ? 'var(--accent)'    : 'var(--bg2)',
                color:      statusFilter === s ? '#fff'             : 'var(--text2)',
                border:     `1px solid ${statusFilter === s ? 'var(--accent)' : 'var(--border)'}`,
              }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table / Cards ───────────────────────────────── */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}
      >
        {loading ? (
          <Loader />
        ) : members.length === 0 && searchQuery ? (
          // No results state with clear button
          <NoResults query={searchQuery} onClear={clearSearch} />
        ) : members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Users size={28} style={{ color: 'var(--text3)' }} />
            <p className="font-medium" style={{ color: 'var(--text)' }}>No members found</p>
            <button onClick={openAdd} className="text-sm" style={{ color: 'var(--accent)' }}>
              + Add your first member
            </button>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full min-w-[560px]">
                <thead>
                  <tr style={{ background: 'var(--bg3)', borderBottom: `1px solid var(--border)` }}>
                    {['Member', 'Phone', 'Plan', 'Status', 'Expiry', ''].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide"
                        style={{ color: 'var(--text3)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {members.map(m => (
                    <tr key={m._id} style={{ borderBottom: `1px solid var(--border)` }}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar member={m} />
                          <div className="min-w-0">
                            {/* Highlight matching text */}
                            <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>
                              {m.name}
                            </p>
                            <p className="text-xs capitalize" style={{ color: 'var(--text3)' }}>
                              {m.gender} · {m.age}y
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--text2)' }}>
                        {m.phone}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--text2)' }}>
                        {m.membershipPlan?.name || <span style={{ color: 'var(--text3)' }}>None</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full capitalize font-medium ${statusColor(m.membershipStatus)}`}>
                          {m.membershipStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--text3)' }}>
                        {m.membershipExpiry ? formatDate(m.membershipExpiry) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          {[
                            { icon: Eye,    fn: () => navigate(`/members/${m._id}`), hColor: 'var(--blue)'  },
                            { icon: Edit,   fn: () => openEdit(m),                  hColor: 'var(--accent)' },
                            { icon: Trash2, fn: () => handleDelete(m._id, m.name), hColor: 'var(--red)'   },
                          ].map(({ icon: I, fn, hColor }, idx) => (
                            <button key={idx} onClick={fn}
                              className="p-1.5 rounded-lg transition-colors"
                              style={{ color: 'var(--text3)' }}
                              onMouseEnter={e => e.currentTarget.style.color = hColor}
                              onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}>
                              <I size={15} />
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="sm:hidden">
              {members.map(m => (
                <div key={m._id}
                  className="flex items-center gap-3 p-4 border-b last:border-0"
                  style={{ borderColor: 'var(--border)' }}>
                  <Avatar member={m} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>
                        {m.name}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium flex-shrink-0 ${statusColor(m.membershipStatus)}`}>
                        {m.membershipStatus}
                      </span>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>
                      {m.phone} · {m.age}y · {m.gender}
                    </p>
                    {m.membershipPlan && (
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text2)' }}>
                        {m.membershipPlan.name}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    <button onClick={() => navigate(`/members/${m._id}`)}
                      className="p-1.5 rounded-lg" style={{ color: 'var(--blue)' }}>
                      <Eye size={15} />
                    </button>
                    <button onClick={() => openEdit(m)}
                      className="p-1.5 rounded-lg" style={{ color: 'var(--accent)' }}>
                      <Edit size={15} />
                    </button>
                    <button onClick={() => handleDelete(m._id, m.name)}
                      className="p-1.5 rounded-lg" style={{ color: 'var(--red)' }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Pagination ──────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs" style={{ color: 'var(--text3)' }}>
            {(page-1)*LIMIT+1}–{Math.min(page*LIMIT, total)} of {total}
          </p>
          <div className="flex items-center gap-1">
            <button disabled={page===1} onClick={()=>setPage(p=>p-1)}
              className="p-2 rounded-lg disabled:opacity-30 transition-colors"
              style={{ color: 'var(--text2)' }}>
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i+1).map(p => (
              <button key={p} onClick={()=>setPage(p)}
                className="w-8 h-8 rounded-lg text-sm transition-colors"
                style={{
                  background: page===p ? 'var(--accent)' : 'transparent',
                  color:      page===p ? '#fff'          : 'var(--text2)',
                }}>
                {p}
              </button>
            ))}
            <button disabled={page===totalPages} onClick={()=>setPage(p=>p+1)}
              className="p-2 rounded-lg disabled:opacity-30 transition-colors"
              style={{ color: 'var(--text2)' }}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── Add / Edit Modal ─────────────────────────────── */}
      <Modal isOpen={modalOpen} onClose={closeModal}
        title={editingMember ? `Edit — ${editingMember.name}` : 'Add New Member'}
        size="lg">
        <MemberForm
          initialData={editingMember || {}}
          onSubmit={handleSave}
          loading={saving}
        />
      </Modal>
    </div>
  )
}

export default Members