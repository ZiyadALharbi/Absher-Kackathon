export default function ServiceCard({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Icon Circle */}
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
        <span className="text-4xl">{icon}</span>
      </div>

      {/* Label Button */}
      <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded text-sm transition-colors">
        {label}
      </button>
    </div>
  )
}
