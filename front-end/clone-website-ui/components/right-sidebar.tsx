import { Zap, Eye, HelpCircle, DollarSign } from "lucide-react"

export default function RightSidebar() {
  const sidebarItems = [
    {
      icon: Zap,
      label: "الخدمات الإلكترونية",
      color: "green",
    },
    {
      icon: Eye,
      label: "التقاويس",
      color: "gray",
    },
    {
      icon: HelpCircle,
      label: "استفسارات أيشر",
      color: "gray",
    },
    {
      icon: DollarSign,
      label: "المدفوعات الحكومية",
      color: "gray",
    },
  ]

  return (
    <div className="w-full lg:w-64 space-y-3">
      {sidebarItems.map((item, index) => (
        <button
          key={index}
          className={`w-full flex items-center justify-between gap-3 px-4 py-4 rounded-lg border-r-4 transition-all ${
            item.color === "green" ? "bg-green-50 border-r-green-600" : "bg-gray-50 border-r-gray-300"
          }`}
        >
          <item.icon className={`w-5 h-5 ${item.color === "green" ? "text-green-600" : "text-gray-400"}`} />
          <span className={`font-medium text-sm ${item.color === "green" ? "text-green-900" : "text-gray-700"}`}>
            {item.label}
          </span>
        </button>
      ))}
    </div>
  )
}
