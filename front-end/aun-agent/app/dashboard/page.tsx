"use client";

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import ChatBot from "@/components/ChatBot";
import { Search, ChevronLeft } from "lucide-react";

const services = [
  {
    category: "خدمات الأحوال المدنية",
    items: [
      { title: "إصدار بطاقة أحوال لفرد من العائلة", icon: "👤" },
      { title: "تجديد بطاقة الأحوال", icon: "🔄" },
      { title: "الاستعلام عن طلبات بطاقة الأحوال", icon: "🔍" },
    ],
  },
  {
    category: "خدمات المرور",
    items: [
      { title: "تجديد رخصة القيادة", icon: "🚗" },
      { title: "الاستعلام عن المخالفات المرورية", icon: "⚠️" },
      { title: "دفع المخالفات المرورية", icon: "💳" },
    ],
  },
  {
    category: "خدمات الجوازات",
    items: [
      { title: "تجديد جواز السفر", icon: "🛂" },
      { title: "الاستعلام عن صلاحية الجواز", icon: "📋" },
      { title: "طلب جواز سفر جديد", icon: "📘" },
    ],
  },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row gap-6 p-6 max-w-7xl mx-auto">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1">
          {/* Search Bar */}
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

          {/* Services Grid */}
          <div className="space-y-12">
            {services.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-right">
                  {section.category}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {section.items.map((service, serviceIdx) => (
                    <div
                      key={serviceIdx}
                      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">{service.icon}</div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-800 group-hover:text-green-600 transition-colors">
                            {service.title}
                          </h3>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "استعلامات", count: "12" },
              { label: "خدمات", count: "45" },
              { label: "مواعيد", count: "3" },
              { label: "إشعارات", count: "8" },
            ].map((action, idx) => (
              <button
                key={idx}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow text-center"
              >
                <div className="text-3xl font-bold text-green-600">
                  {action.count}
                </div>
                <div className="text-sm text-gray-600 mt-2">{action.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ChatBot */}
      <ChatBot />
    </div>
  );
}


