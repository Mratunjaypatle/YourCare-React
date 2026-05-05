// Format a date string to DD/MM/YYYY
export const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

// Format a number as Indian Rupees
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '₹0'
  return `₹${Number(amount).toLocaleString('en-IN')}`
}

// Calculate BMI
export const calcBMI = (weight, height) => {
  if (!weight || !height) return null
  return (weight / Math.pow(height / 100, 2)).toFixed(1)
}

// Calculate days until expiry
export const daysUntilExpiry = (expiryDate) => {
  if (!expiryDate) return null
  const diff = new Date(expiryDate) - new Date()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// Status color classes
export const statusColor = (status) => {
  switch (status) {
    case 'active':  return 'bg-green-500/10 text-green-400 border border-green-500/20'
    case 'expired': return 'bg-red-500/10 text-red-400 border border-red-500/20'
    case 'pending': return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
    default:        return 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
  }
}

// Level color classes for workout plans
export const levelColor = (level) => {
  switch (level) {
    case 'beginner':     return 'bg-green-500/10 text-green-400'
    case 'intermediate': return 'bg-yellow-500/10 text-yellow-400'
    case 'advanced':     return 'bg-red-500/10 text-red-400'
    default:             return 'bg-gray-500/10 text-gray-400'
  }
}

// Truncate long text
export const truncate = (str, n = 40) =>
  str && str.length > n ? str.slice(0, n) + '…' : str
