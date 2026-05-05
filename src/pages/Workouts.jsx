// src/pages/Workouts.jsx
import { useState, useEffect } from 'react'
import { getWorkoutPlans }     from '../api/axios'
import Loader                  from '../components/common/Loader'
import EmptyState              from '../components/common/EmptyState'
import { Dumbbell, Calendar, Target, ChevronDown, ChevronUp } from 'lucide-react'

const LEVELS = ['all', 'beginner', 'intermediate', 'advanced']

// ── Level badge colors (use CSS vars so they adapt to theme) ──
const levelStyle = (level) => {
  switch (level) {
    case 'beginner':
      return {
        background: 'var(--green-bg)',
        color:      'var(--green)',
        border:     '1px solid rgba(34,197,94,0.25)',
      }
    case 'intermediate':
      return {
        background: 'var(--yellow-bg)',
        color:      'var(--yellow)',
        border:     '1px solid rgba(245,158,11,0.25)',
      }
    case 'advanced':
      return {
        background: 'var(--red-bg)',
        color:      'var(--red)',
        border:     '1px solid rgba(239,68,68,0.25)',
      }
    default:
      return {
        background: 'var(--bg3)',
        color:      'var(--text2)',
        border:     '1px solid var(--border)',
      }
  }
}

// ── Exercise row ──────────────────────────────────────────────
const ExerciseRow = ({ ex, index }) => (
  <div
    className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs"
    style={{ background: 'var(--bg3)', border: '1px solid var(--border)' }}
  >
    <span className="w-5 flex-shrink-0 font-medium" style={{ color: 'var(--text3)' }}>
      {index + 1}
    </span>
    <span className="flex-1 font-medium" style={{ color: 'var(--text)' }}>
      {ex.name}
    </span>
    <span className="flex-shrink-0" style={{ color: 'var(--text2)' }}>
      {ex.sets} × {ex.reps}
    </span>
    {ex.muscleGroup && (
      <span
        className="flex-shrink-0 px-2 py-0.5 rounded-full text-xs"
        style={{
          background: 'var(--accent-bg)',
          color:      'var(--accent)',
          border:     '1px solid var(--accent-border)',
        }}
      >
        {ex.muscleGroup}
      </span>
    )}
  </div>
)

// ── Workout card ──────────────────────────────────────────────
const WorkoutCard = ({ plan }) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className="rounded-xl p-5 border transition-all"
      style={{
        background:  'var(--bg2)',       // ✅ uses CSS variable — changes with theme
        borderColor: 'var(--border)',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border2)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3
            className="text-sm font-semibold leading-tight"
            style={{ color: 'var(--text)' }}
          >
            {plan.name}
          </h3>
          {plan.description && (
            <p
              className="text-xs mt-1 leading-relaxed line-clamp-2"
              style={{ color: 'var(--text2)' }}
            >
              {plan.description}
            </p>
          )}
        </div>

        {/* Level badge */}
        <span
          className="text-xs px-2.5 py-1 rounded-full capitalize font-medium flex-shrink-0"
          style={levelStyle(plan.level)}
        >
          {plan.level}
        </span>
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap gap-3 mb-4">
        {plan.daysPerWeek && (
          <span
            className="flex items-center gap-1.5 text-xs"
            style={{ color: 'var(--text2)' }}
          >
            <Calendar size={11} style={{ color: 'var(--text3)' }} />
            {plan.daysPerWeek} days/week
          </span>
        )}
        {plan.goal && (
          <span
            className="flex items-center gap-1.5 text-xs capitalize"
            style={{ color: 'var(--text2)' }}
          >
            <Target size={11} style={{ color: 'var(--text3)' }} />
            {plan.goal.replace('_', ' ')}
          </span>
        )}
        {plan.schedule?.length > 0 && (
          <span
            className="flex items-center gap-1.5 text-xs"
            style={{ color: 'var(--text2)' }}
          >
            <Dumbbell size={11} style={{ color: 'var(--text3)' }} />
            {plan.schedule.length} workout days
          </span>
        )}
      </div>

      {/* Schedule toggle */}
      {plan.schedule?.length > 0 && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-xs font-medium transition-colors"
            style={{ color: 'var(--accent)' }}
          >
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {expanded ? 'Hide schedule' : 'View schedule'}
          </button>

          {expanded && (
            <div className="mt-4 space-y-4">
              {plan.schedule.map((day, i) => (
                <div key={i}>
                  <p
                    className="text-xs font-medium mb-2"
                    style={{ color: 'var(--text2)' }}
                  >
                    {day.day}
                    {day.focus && (
                      <span style={{ color: 'var(--text3)' }}> — {day.focus}</span>
                    )}
                  </p>
                  {day.exercises?.length > 0 && (
                    <div className="space-y-1.5">
                      {day.exercises.map((ex, j) => (
                        <ExerciseRow key={j} ex={ex} index={j} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ── Main Workouts page ────────────────────────────────────────
const Workouts = () => {
  const [plans,   setPlans]   = useState([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('all')

  useEffect(() => {
    setLoading(true)
    getWorkoutPlans(filter !== 'all' ? { level: filter } : {})
      .then(res => setPlans(res.data || []))
      .catch(() => setPlans([]))
      .finally(() => setLoading(false))
  }, [filter])

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Header */}
      <div>
        <h1 className="text-lg sm:text-xl font-bold" style={{ color: 'var(--text)' }}>
          Workout Plans
        </h1>
        <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--text2)' }}>
          {plans.length} plans available
        </p>
      </div>

      {/* Level filter tabs */}
      <div
        className="flex gap-1 p-1 rounded-xl w-fit"
        style={{
          background:  'var(--bg2)',
          border:      '1px solid var(--border)',
        }}
      >
        {LEVELS.map(l => (
          <button
            key={l}
            onClick={() => setFilter(l)}
            className="px-3 sm:px-4 py-1.5 rounded-lg text-xs font-medium capitalize transition-all"
            style={{
              background: filter === l ? 'var(--accent)'   : 'transparent',
              color:      filter === l ? '#fff'            : 'var(--text2)',
            }}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Plans */}
      {loading ? (
        <Loader />
      ) : plans.length === 0 ? (
        <div
          className="rounded-xl border"
          style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}
        >
          <EmptyState
            icon={Dumbbell}
            title="No workout plans yet"
            subtitle="Run the seed script: node utils/seed.js"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {plans.map(plan => (
            <WorkoutCard key={plan._id} plan={plan} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Workouts