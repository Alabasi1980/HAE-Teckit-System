import React from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isUpward: boolean;
  };
  colorClass: string;
  bgClass: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, colorClass, bgClass }) => (
  <div className={`p-5 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all group`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-3xl font-extrabold text-slate-900">{value}</h3>
        {trend && (
          <p className={`text-[10px] mt-2 font-bold flex items-center gap-1 ${trend.isUpward ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isUpward ? '↑' : '↓'} {trend.value} <span className="text-slate-400 font-normal">vs last month</span>
          </p>
        )}
      </div>
      <div className={`p-3 rounded-xl ${bgClass} ${colorClass} group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
    </div>
  </div>
);

export default StatCard;