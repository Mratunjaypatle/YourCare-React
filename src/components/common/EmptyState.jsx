const EmptyState = ({ icon: Icon, title, subtitle, action }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
    {Icon && (
      <div className="w-14 h-14 bg-gray-800 rounded-2xl flex items-center justify-center mb-2">
        <Icon size={24} className="text-gray-600" />
      </div>
    )}
    <p className="text-gray-300 font-medium">{title}</p>
    {subtitle && <p className="text-gray-500 text-sm max-w-xs">{subtitle}</p>}
    {action && <div className="mt-2">{action}</div>}
  </div>
)

export default EmptyState
