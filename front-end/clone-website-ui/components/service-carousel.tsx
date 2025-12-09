"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function ServiceCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const carouselItems = [
    {
      icon: "✈️",
      label: "إيقاف الخدمات وعودة السفر",
      badge: null,
    },
    {
      icon: "📊",
      label: "مزايا الوحدات الإلكترونية",
      badge: null,
    },
    {
      icon: "🤝",
      label: "مشاركة الشركات",
      badge: null,
    },
    {
      icon: "📋",
      label: "تقارير أيشر",
      badge: "جديد",
    },
    {
      icon: "📋",
      label: "إعداد شهادة حلو سواق",
      badge: "جديد",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-800">خدمات أخرى</h2>
        <div className="flex justify-center gap-8 mt-4">
          <div className="w-32 h-px bg-gray-300"></div>
          <div className="text-xl font-bold text-gray-400">خدمات أخرى</div>
          <div className="w-32 h-px bg-gray-300"></div>
        </div>
      </div>

      {/* Carousel Container */}
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-gray-100 rounded">
          <ChevronLeft className="w-6 h-6 text-green-600" />
        </button>

        {/* Service Items */}
        <div className="flex-1 flex gap-4 overflow-hidden">
          {carouselItems.slice(currentSlide, currentSlide + 4).map((item, index) => (
            <div
              key={index}
              className="flex-1 bg-white border border-gray-300 rounded-lg p-6 flex flex-col items-center gap-4 relative"
            >
              {item.badge && (
                <div className="absolute top-0 right-0 bg-red-600 text-white px-3 py-1 text-xs font-bold transform -translate-y-1/2 translate-x-1/2 rotate-12">
                  {item.badge}
                </div>
              )}
              <span className="text-3xl">{item.icon}</span>
              <p className="text-sm font-semibold text-gray-700 text-center">{item.label}</p>
            </div>
          ))}
        </div>

        <button className="p-2 hover:bg-gray-100 rounded">
          <ChevronRight className="w-6 h-6 text-green-600" />
        </button>
      </div>

      {/* Carousel Dots */}
      <div className="flex justify-center gap-3">
        {[0, 1].map((index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index * 4)}
            className={`w-3 h-3 rounded-full transition-colors ${
              currentSlide === index * 4 ? "bg-green-600" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
