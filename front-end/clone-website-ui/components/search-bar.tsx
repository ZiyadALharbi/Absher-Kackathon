import { ChevronLeft } from "lucide-react"

export default function SearchBar() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between gap-4">
        <div className="text-green-600 font-bold text-lg">بحث</div>
        <input
          type="text"
          placeholder="اكتب هنا للبحث"
          className="flex-1 outline-none text-sm text-gray-600 placeholder:text-gray-400 text-right"
        />
        <ChevronLeft className="w-5 h-5 text-gray-400" />
      </div>
    </div>
  )
}
