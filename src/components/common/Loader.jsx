const Loader = ({ text = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-3">
    <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    <p className="text-gray-400 text-sm">{text}</p>
  </div>
)

export default Loader
