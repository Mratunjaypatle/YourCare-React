// src/pages/DietPlans.jsx
import { useState, useEffect } from 'react'
import { getDietPlans }        from '../api/axios'
import Loader                  from '../components/common/Loader'
import EmptyState              from '../components/common/EmptyState'
import { Apple, Flame, Zap, ChevronDown, ChevronUp } from 'lucide-react'

const TYPES = ['all', 'veg', 'non-veg', 'vegan']
const GOALS = ['all', 'weight_loss', 'muscle_gain', 'maintenance']

// ── Diet type badge style ─────────────────────────────────────
const typeStyle = (type) => {
  switch (type) {
    case 'veg':
      return {
        background: 'var(--green-bg)',
        color:      'var(--green)',
        border:     '1px solid rgba(34,197,94,0.25)',
      }
    case 'non-veg':
      return {
        background: 'var(--red-bg)',
        color:      'var(--red)',
        border:     '1px solid rgba(239,68,68,0.25)',
      }
    case 'vegan':
      return {
        background: 'var(--blue-bg)',
        color:      'var(--blue)',
        border:     '1px solid rgba(59,130,246,0.25)',
      }
    default:
      return {
        background: 'var(--bg3)',
        color:      'var(--text2)',
        border:     '1px solid var(--border)',
      }
  }
}

// ── Meal card ─────────────────────────────────────────────────
const MealCard = ({ meal }) => {
  const totalCals = meal.items?.reduce((s, i) => s + (i.calories || 0), 0) || 0
  const totalProt = meal.items?.reduce((s, i) => s + (i.protein  || 0), 0) || 0

  return (
    <div
      className="rounded-lg p-3 border"
      style={{ background: 'var(--bg3)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium capitalize" style={{ color: 'var(--text)' }}>
          {meal.mealType?.replace('_', ' ')}
        </span>
        <div className="flex gap-3 text-xs" style={{ color: 'var(--text3)' }}>
          {totalCals > 0 && <span>{totalCals} kcal</span>}
          {totalProt > 0 && <span>{totalProt}g protein</span>}
        </div>
      </div>
      {meal.items?.map((item, i) => (
        <p key={i} className="text-xs mt-0.5" style={{ color: 'var(--text2)' }}>
          • {item.name} ({item.quantity})
        </p>
      ))}
    </div>
  )
}

// ── Diet card ─────────────────────────────────────────────────
const DietCard = ({ plan }) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className="rounded-xl p-5 border transition-all"
      style={{
        background:  'var(--bg2)',       // ✅ CSS variable — adapts to light/dark
        borderColor: 'var(--border)',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border2)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      {/* Header row */}
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

        {/* Type badge */}
        <span
          className="text-xs px-2.5 py-1 rounded-full capitalize font-medium flex-shrink-0"
          style={typeStyle(plan.type)}
        >
          {plan.type}
        </span>
      </div>

      {/* Macro chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {plan.dailyCalorieTarget && (
          <div
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg"
            style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text2)' }}
          >
            <Flame size={11} style={{ color: 'var(--accent)' }} />
            {plan.dailyCalorieTarget} kcal/day
          </div>
        )}
        {plan.dailyProteinTarget && (
          <div
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg"
            style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text2)' }}
          >
            <Zap size={11} style={{ color: 'var(--blue)' }} />
            {plan.dailyProteinTarget}g protein
          </div>
        )}
        {plan.goal && (
          <div
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg capitalize"
            style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text2)' }}
          >
            {plan.goal.replace('_', ' ')}
          </div>
        )}
      </div>

      {/* Meals toggle */}
      {plan.meals?.length > 0 && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-xs font-medium transition-colors"
            style={{ color: 'var(--green)' }}
          >
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {expanded ? 'Hide meals' : `View ${plan.meals.length} meals`}
          </button>

          {expanded && (
            <div className="mt-4 space-y-2">
              {plan.meals.map((meal, i) => (
                <MealCard key={i} meal={meal} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ── Main Diet Plans page ──────────────────────────────────────
const DietPlans = () => {
  const [plans,      setPlans]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [typeFilter, setTypeFilter] = useState('all')
  const [goalFilter, setGoalFilter] = useState('all')

  useEffect(() => {
    setLoading(true)
    const params = {}
    if (typeFilter !== 'all') params.type = typeFilter
    if (goalFilter !== 'all') params.goal = goalFilter
    getDietPlans(params)
      .then(res => setPlans(res.data || []))
      .catch(() => setPlans([]))
      .finally(() => setLoading(false))
  }, [typeFilter, goalFilter])

  // ── Filter tab component ──────────────────────────────────
  const FilterTab = ({ options, active, onChange, activeColor = 'var(--accent)' }) => (
    <div
      className="flex gap-1 p-1 rounded-xl w-fit overflow-x-auto"
      style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
    >
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all flex-shrink-0"
          style={{
            background: active === opt ? activeColor : 'transparent',
            color:      active === opt ? '#fff'       : 'var(--text2)',
          }}
        >
          {opt.replace('_', ' ')}
        </button>
      ))}
    </div>
  )

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Header */}
      <div>
        <h1 className="text-lg sm:text-xl font-bold" style={{ color: 'var(--text)' }}>
          Diet Plans
        </h1>
        <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--text2)' }}>
          {plans.length} plans available
        </p>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap gap-2">
        <FilterTab
          options={TYPES}
          active={typeFilter}
          onChange={setTypeFilter}
          activeColor="var(--green)"
        />
        <FilterTab
          options={GOALS}
          active={goalFilter}
          onChange={setGoalFilter}
          activeColor="var(--accent)"
        />
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
            icon={Apple}
            title="No diet plans found"
            subtitle="Run the seed script: node utils/seed.js"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {plans.map(plan => (
            <DietCard key={plan._id} plan={plan} />
          ))}
        </div>
      )}
    </div>
  )
}

export default DietPlans