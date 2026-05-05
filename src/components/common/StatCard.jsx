// src/components/common/StatCard.jsx
const colorMap = {
  orange: { iconBg: 'var(--accent-bg)',  iconColor: 'var(--accent)',  iconBorder: 'var(--accent-border)' },
  green:  { iconBg: 'var(--green-bg)',   iconColor: 'var(--green)',   iconBorder: 'rgba(34,197,94,0.2)'  },
  blue:   { iconBg: 'var(--blue-bg)',    iconColor: 'var(--blue)',    iconBorder: 'rgba(59,130,246,0.2)' },
  red:    { iconBg: 'var(--red-bg)',     iconColor: 'var(--red)',     iconBorder: 'rgba(239,68,68,0.2)'  },
  purple: { iconBg: 'var(--purple-bg)',  iconColor: 'var(--purple)',  iconBorder: 'rgba(168,85,247,0.2)' },
  yellow: { iconBg: 'var(--yellow-bg)',  iconColor: 'var(--yellow)',  iconBorder: 'rgba(245,158,11,0.2)' },
}

const StatCard = ({ title, value, icon: Icon, color = 'orange', subtitle, change }) => {
  const c = colorMap[color] || colorMap.orange

  return (
    <div
      className="rounded-xl p-4 border transition-all"
      style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <p
          className="text-xs font-medium uppercase tracking-wide leading-tight"
          style={{ color: 'var(--text3)' }}
        >
          {title}
        </p>
        <div
          className="w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0"
          style={{ background: c.iconBg, borderColor: c.iconBorder }}
        >
          <Icon size={15} style={{ color: c.iconColor }} />
        </div>
      </div>

      {/* Value — truncate so it never overflows */}
      <p
        className="text-xl sm:text-2xl font-bold truncate"
        style={{ color: 'var(--text)' }}
      >
        {value}
      </p>

      {/* Subtitle */}
      {subtitle && (
        <p className="text-xs mt-1 truncate" style={{ color: 'var(--text3)' }}>
          {subtitle}
        </p>
      )}

      {/* Change */}
      {change !== undefined && (
        <p
          className="text-xs mt-2 font-medium"
          style={{ color: change >= 0 ? 'var(--green)' : 'var(--red)' }}
        >
          {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
        </p>
      )}
    </div>
  )
}

export default StatCard