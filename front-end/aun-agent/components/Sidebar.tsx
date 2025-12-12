"use client";

import { Zap, Eye, HelpCircle, DollarSign } from "lucide-react";

const sidebarItems = [
  {
    icon: Zap,
    label: "الخدمات الإلكترونية",
    active: true,
    color: "green",
  },
  {
    icon: Eye,
    label: "التقاويض",
    active: false,
    color: "gray",
  },
  {
    icon: HelpCircle,
    label: "استبيانات أبشر",
    active: false,
    color: "gray",
  },
  {
    icon: DollarSign,
    label: "المدفوعات الحكومية",
    active: false,
    color: "gray",
  },
];

export default function Sidebar() {
  return (
    <div className="w-full lg:w-64 space-y-3">
      {sidebarItems.map((item, index) => (
        <button
          key={index}
          className={`w-full flex items-center justify-between gap-3 px-4 py-4 rounded-lg border-r-4 transition-all ${
            item.active
              ? "bg-green-50 border-r-green-600"
              : "bg-gray-50 border-r-gray-300 hover:bg-gray-100"
          }`}
        >
          <item.icon
            className={`w-5 h-5 ${
              item.active ? "text-green-600" : "text-gray-400"
            }`}
          />
          <span
            className={`font-medium text-sm ${
              item.active ? "text-green-900" : "text-gray-700"
            }`}
          >
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
}


