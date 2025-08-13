import React from "react";

export type StatsCardProps = {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  description?: string;
  color?: string; // Ej: "text-blue-700"
  className?: string;
};

export function StatsCard({ title, value, icon, description, color = "text-blue-700", className = "" }: StatsCardProps) {
  return (
    <div className={`bg-white rounded-xl shadow p-5 flex flex-col gap-2 items-center justify-center border ${className}`}>
      <div className={`flex items-center gap-2 font-semibold text-lg ${color}`}>
        {icon && <span>{icon}</span>}
        {title}
      </div>
      <div className={`text-3xl font-extrabold ${color}`}>{value}</div>
      {description && <div className="text-gray-500 text-sm mt-1">{description}</div>}
    </div>
  );
}
