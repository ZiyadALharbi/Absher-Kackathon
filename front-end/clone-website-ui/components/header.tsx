import { ChevronLeft, BarChart3, Bell, Book, Users, UserCog } from "lucide-react"
import Image from "next/image"
import dynamic from 'next/dynamic'

const WalletCard = dynamic(() => import('./WalletCard'), { ssr: false })

export default function Header() {
  const navItems = [
    { icon: ChevronLeft, label: "تسجيل الخروج", href: "#" },
    { icon: BarChart3, label: "English", href: "#" },
    { icon: Book, label: "دليل الخدمات", href: "#" },
    { icon: Bell, label: "الاشعارات", href: "#" },
    { icon: UserCog, label: "تعديل معلومات المستخدم", href: "#" },
    { icon: Users, label: "لوحة المعلومات", href: "#" },
  ]

  return (
    <header className="bg-white border-b border-[#E4E4E7]">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
        {/* Left: Absher Logo */}
        <div className="shrink-0">
          <Image
            src="/absher-logo.svg"
            alt="أبشر"
            width={120}
            height={60}
            className="h-12 w-auto"
            priority
          />
        </div>
        
        {/* Wallet Card */}
        <div className="shrink-0">
          <WalletCard />
        </div>

        {/* Center Navigation */}
        <nav className="flex-1 flex items-center justify-center gap-2 mx-8">
          {navItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className="flex flex-col items-center gap-2 px-5 py-3 hover:bg-gradient-to-br hover:from-[#F0F9F5] hover:to-white rounded-xl transition-all duration-500 border-r-2 border-[#E4E4E7] last:border-r-0 group hover:scale-110 hover:shadow-lg hover:shadow-[#00663D]/10"
            >
              <item.icon className="w-6 h-6 text-[#00663D] transition-all duration-300 group-hover:scale-125 group-hover:-rotate-12" strokeWidth={2} />
              <span className="text-sm text-[#4A4A4A] group-hover:text-[#00663D] text-center font-bold whitespace-nowrap transition-colors duration-300">{item.label}</span>
            </a>
          ))}
        </nav>

        {/* Right: MOI + 2030 Vision Logos */}
        <div className="flex items-center gap-4 shrink-0">
          <Image
            src="/moi-2030-logos.png"
            alt="وزارة الداخلية - رؤية 2030"
            width={200}
            height={60}
            className="h-12 w-auto"
            priority
          />
        </div>
      </div>
    </header>
  )
}
