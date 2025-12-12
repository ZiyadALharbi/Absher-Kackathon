"use client";

import { Users, Home, Bell, Book, BarChart3, ChevronLeft } from "lucide-react";
import Image from "next/image";

const navItems = [
  { icon: Users, label: "لوحة المعلومات", href: "/dashboard" },
  { icon: Home, label: "تعديل معلومات المستخدم", href: "/profile" },
  { icon: Bell, label: "الاشعارات", href: "/notifications" },
  { icon: Book, label: "دليل الخدمات", href: "/services" },
  { icon: BarChart3, label: "English", href: "/en" },
  { icon: ChevronLeft, label: "تسجيل الخروج", href: "/logout" },
];

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Left: Empty spacer */}
        <div className="w-20"></div>

        {/* Center Navigation */}
        <nav className="flex-1 flex items-center justify-center gap-4">
          {navItems.map((item, index) => (
            <button
              key={index}
              className="flex flex-col items-center gap-1 px-4 py-2 border-r border-gray-200 last:border-r-0 cursor-pointer hover:bg-gray-50 rounded transition-colors"
            >
              <item.icon className="w-6 h-6 text-teal-500" />
              <span className="text-xs text-gray-700 text-center font-medium">
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        {/* Logo على اليمين */}
        <div className="flex-shrink-0">
          <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center overflow-hidden shadow-lg">
            <div className="w-full h-full p-3 bg-white flex items-center justify-center">
              <Image
                src="/portal/individuals/assets/images/absher_logo.svg"
                alt="شعار أبشر"
                width={80}
                height={80}
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}


