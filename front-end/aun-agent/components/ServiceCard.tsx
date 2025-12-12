"use client";

import { LucideIcon } from "lucide-react";

interface ServiceCardProps {
  title: string;
  description?: string;
  icon: string | LucideIcon;
  onClick?: () => void;
}

export default function ServiceCard({
  title,
  description,
  icon,
  onClick,
}: ServiceCardProps) {
  const IconComponent = typeof icon === "string" ? null : icon;

  return (
    <button
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-green-500 transition-all cursor-pointer group text-right w-full"
    >
      <div className="flex items-start gap-4">
        {typeof icon === "string" ? (
          <div className="text-4xl">{icon}</div>
        ) : IconComponent ? (
          <IconComponent className="w-10 h-10 text-green-600 group-hover:scale-110 transition-transform" />
        ) : null}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 group-hover:text-green-600 transition-colors mb-1">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
        </div>
      </div>
    </button>
  );
}


