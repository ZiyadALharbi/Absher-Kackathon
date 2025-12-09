"use client"
import ServiceCard from "./service-card"
import ServiceCarousel from "./service-carousel"

export default function MainContent() {
  const mainServices = [
    { icon: "📅", label: "مواعيد" },
    { icon: "👥", label: "العمالة" },
    { icon: "👨‍👩‍👧‍👦", label: "أفراد الأسرة" },
    { icon: "🚗", label: "المركبات" },
    { icon: "💻", label: "خدماتي" },
  ]

  return (
    <div className="space-y-12">
      {/* Main Services Grid */}
      <div className="grid grid-cols-5 gap-6">
        {mainServices.map((service, index) => (
          <ServiceCard key={index} icon={service.icon} label={service.label} />
        ))}
      </div>

      {/* Services Carousel */}
      <ServiceCarousel />
    </div>
  )
}
