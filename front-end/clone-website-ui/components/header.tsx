import { ChevronLeft, BarChart3, Bell, Book, Users, Home } from "lucide-react"

export default function Header() {
  const navItems = [
    { icon: ChevronLeft, label: "تسجيل الخروج", href: "#" },
    { icon: BarChart3, label: "English", href: "#" },
    { icon: Book, label: "دليل الخدمات", href: "#" },
    { icon: Bell, label: "الاشعارات", href: "#" },
    { icon: Home, label: "تعديل معلومات المستخدم", href: "#" },
    { icon: Users, label: "لوحة المعلومات", href: "#" },
  ]

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Left Logo */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-bold">🌿</span>
          </div>
        </div>

        {/* Center Navigation */}
        <nav className="flex-1 flex items-center justify-center gap-4 mx-8">
          {navItems.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-1 px-4 py-2 border-r border-gray-200 last:border-r-0"
            >
              <item.icon className="w-6 h-6 text-teal-500" />
              <span className="text-xs text-gray-700 text-center font-medium">{item.label}</span>
            </div>
          ))}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-xs text-gray-500">VISION</div>
            <div className="text-2xl font-bold text-gray-800">2030</div>
            <div className="text-xs text-gray-600">المملكة العربية السعودية</div>
          </div>
          <div className="w-8 h-8 bg-green-600 rounded-full"></div>
        </div>
      </div>
    </header>
  )
}
