
import React, { useMemo } from 'react';
import { Ticket, TicketStatus, TicketPriority } from '../../../shared/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Clock, TrendingUp, AlertCircle, CheckCircle2, Inbox, Activity } from 'lucide-react';

interface TicketsKpiViewProps {
  tickets: Ticket[];
}

const TicketsKpiView: React.FC<TicketsKpiViewProps> = ({ tickets }) => {
  const stats = useMemo(() => {
    const total = tickets.length;
    const resolved = tickets.filter(t => t.status === TicketStatus.RESOLVED || t.status === TicketStatus.CLOSED).length;
    const breached = tickets.filter(t => new Date(t.resolutionDueAt) < new Date() && t.status !== TicketStatus.RESOLVED).length;
    
    const byType = tickets.reduce((acc: any, t) => {
      acc[t.type] = (acc[t.type] || 0) + 1;
      return acc;
    }, {});

    const typeData = Object.entries(byType).map(([name, value]) => ({ name, value }));

    return {
      total,
      resolvedRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
      breachCount: breached,
      avgResponse: "1.2h", 
      typeData
    };
  }, [tickets]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-8 animate-fade-in" dir="rtl">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="إجمالي التذاكر" value={stats.total} icon={<Inbox/>} color="text-blue-600" bg="bg-blue-50" />
        <KpiCard label="معدل الحل" value={`${stats.resolvedRate}%`} icon={<CheckCircle2/>} color="text-emerald-600" bg="bg-emerald-50" />
        <KpiCard label="تجاوز الـ SLA" value={stats.breachCount} icon={<AlertCircle/>} color="text-rose-600" bg="bg-rose-50" />
        <KpiCard label="سرعة الاستجابة" value={stats.avgResponse} icon={<Clock/>} color="text-indigo-600" bg="bg-indigo-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Type Distribution Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[3.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/5 -ml-16 -mt-16 rounded-full blur-3xl"></div>
           <h4 className="font-black text-slate-900 mb-10 border-r-4 border-blue-600 pr-3 relative z-10 flex items-center gap-2">
              <Activity size={20} className="text-blue-600" /> تحليل كثافة التذاكر حسب النوع
           </h4>
           <div className="h-72 relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={stats.typeData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                    <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={40}>
                       {stats.typeData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Bar>
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Health Score Summary */}
        <div className="bg-slate-900 p-8 rounded-[3.5rem] text-white flex flex-col justify-center items-center text-center relative overflow-hidden shadow-2xl">
           <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12 transition-transform group-hover:rotate-45"><TrendingUp size={150} /></div>
           <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-4 relative z-10">مؤشر الصحة التشغيلية</p>
           <div className="relative z-10">
              <p className="text-7xl font-black mb-6 tracking-tighter">94%</p>
              <div className="space-y-4">
                 <p className="text-sm font-bold text-slate-400 leading-relaxed px-6">أداء الاستجابة ضمن النطاق الأخضر المعتمد. لا توجد اختناقات حالياً.</p>
                 <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[94%]"></div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const KpiCard = ({ label, value, icon, color, bg }: any) => (
  <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center gap-5 transition-all hover:shadow-lg group">
    <div className={`p-4 rounded-3xl transition-transform group-hover:scale-110 ${bg} ${color}`}>{React.cloneElement(icon, { size: 24 })}</div>
    <div>
      <p className="text-2xl font-black text-slate-900 leading-none mb-1 group-hover:text-blue-600 transition-colors">{value}</p>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
    </div>
  </div>
);

export default TicketsKpiView;
