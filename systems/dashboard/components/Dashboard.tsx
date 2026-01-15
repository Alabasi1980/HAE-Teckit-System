
import React, { useMemo, useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, PieChart, Pie, Legend, ComposedChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';
import { WorkItem, Status, Priority, Project, User } from '../../../shared/types';
import { FileText, AlertTriangle, Clock, ShieldCheck, TrendingUp, DollarSign, BrainCircuit, Activity, Users, Target, Sparkles } from 'lucide-react';
import StatCard from '../../../shared/ui/StatCard';
import { generateExecutiveBrief } from '../../../shared/services/geminiService';
import ReactMarkdown from 'react-markdown';

interface DashboardProps {
  items: WorkItem[];
  projects: Project[];
  users: User[];
}

const Dashboard: React.FC<DashboardProps> = ({ items, projects, users }) => {
  const [aiBrief, setAiBrief] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  
  // Calculate Key Metrics
  const stats = useMemo(() => {
    const overdue = items.filter(i => 
      i.status !== Status.DONE && 
      i.status !== Status.APPROVED && 
      i.dueDate < today
    ).length;

    const totalBudget = projects.reduce((acc, p) => acc + p.budget, 0);
    const spentBudget = projects.reduce((acc, p) => acc + p.spent, 0);

    return {
      total: items.length,
      pending: items.filter(i => i.status === Status.PENDING_APPROVAL).length,
      open: items.filter(i => i.status === Status.OPEN || i.status === Status.IN_PROGRESS).length,
      critical: items.filter(i => i.priority === Priority.CRITICAL).length,
      overdue,
      totalBudget,
      spentBudget,
      projectsCount: projects.length,
      teamCount: users.length
    };
  }, [items, projects, users, today]);

  // Generate Mock Trend Data (Velocity)
  const velocityData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days.map(day => ({
      name: day,
      created: Math.floor(Math.random() * 10) + 2,
      resolved: Math.floor(Math.random() * 8) + 1,
    }));
  }, []);

  // Budget Data for Pie Chart
  const budgetData = [
    { name: 'Spent', value: stats.spentBudget, color: '#ef4444' },
    { name: 'Remaining', value: stats.totalBudget - stats.spentBudget, color: '#10b981' }
  ];

  // Team Workload (Mocked based on assignees)
  const teamLoadData = useMemo(() => {
    const counts: Record<string, number> = {};
    items.forEach(i => {
      if (i.assigneeId) {
        counts[i.assigneeId] = (counts[i.assigneeId] || 0) + 1;
      }
    });
    return users.slice(0, 5).map(u => ({
      name: u.name.split(' ')[0],
      tasks: counts[u.id] || 0,
      capacity: 10 // Arbitrary capacity
    }));
  }, [items, users]);

  const handleGenerateInsight = async () => {
    setIsAiLoading(true);
    const result = await generateExecutiveBrief({
      totalProjects: stats.projectsCount,
      totalBudget: stats.totalBudget,
      spentBudget: stats.spentBudget,
      criticalIssues: stats.critical,
      delayedTasks: stats.overdue,
      teamSize: stats.teamCount
    });
    setAiBrief(result);
    setIsAiLoading(false);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10" dir="rtl">
      
      {/* 1. Executive Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Activity className="text-blue-600" /> لوحة القيادة المركزية
          </h1>
          <p className="text-slate-500 font-bold text-sm mt-1 pr-2">تحليل فوري للأداء التشغيلي والمالي للمنظمة.</p>
        </div>
        <button 
          onClick={handleGenerateInsight}
          disabled={isAiLoading}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all font-bold text-sm disabled:opacity-70"
        >
          {isAiLoading ? <BrainCircuit className="animate-spin" /> : <BrainCircuit />}
          {isAiLoading ? 'جاري التحليل...' : 'طلب تقرير المستشار الذكي'}
        </button>
      </div>

      {/* 2. AI Executive Brief Panel */}
      {aiBrief && (
        <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-2xl relative overflow-hidden animate-slide-in-up">
           <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 -mr-32 -mt-32 rounded-full blur-3xl"></div>
           <div className="relative z-10">
              <h3 className="text-xl font-black mb-4 flex items-center gap-2 text-indigo-300">
                 <Sparkles size={20} /> ملخص تنفيذي (AI Generated)
              </h3>
              <div className="prose prose-invert prose-sm max-w-none font-bold leading-relaxed">
                 <ReactMarkdown>{aiBrief}</ReactMarkdown>
              </div>
           </div>
        </div>
      )}

      {/* 3. Primary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="إجمالي المشاريع" value={stats.projectsCount} icon={<Target size={22} />} colorClass="text-blue-600" bgClass="bg-blue-50" />
        <StatCard title="نسبة استهلاك الميزانية" value={`${Math.round((stats.spentBudget / stats.totalBudget) * 100)}%`} icon={<DollarSign size={22} />} colorClass="text-emerald-600" bgClass="bg-emerald-50" />
        <StatCard title="بلاغات حرجة" value={stats.critical} icon={<AlertTriangle size={22} />} colorClass="text-rose-600" bgClass="bg-rose-50" />
        <StatCard title="مهام متأخرة" value={stats.overdue} icon={<Clock size={22} />} colorClass="text-orange-600" bgClass="bg-orange-50" trend={{ value: "12% هذا الأسبوع", isUpward: false }} />
      </div>

      {/* 4. Advanced Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Velocity Chart (Area) */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative group">
          <div className="flex justify-between items-center mb-8">
             <h3 className="text-lg font-black text-slate-900 pr-2 border-r-4 border-indigo-600">سرعة الإنجاز الأسبوعية</h3>
             <div className="flex gap-2">
                <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> مهام جديدة</span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400"><div className="w-2 h-2 rounded-full bg-emerald-400"></div> مكتملة</span>
             </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={velocityData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <CartesianGrid vertical={false} stroke="#f1f5f9" />
                <Area type="monotone" dataKey="created" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCreated)" />
                <Area type="monotone" dataKey="resolved" stroke="#34d399" strokeWidth={3} fillOpacity={1} fill="url(#colorResolved)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Financial Distribution (Donut) */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-black text-slate-900 mb-2">الموقف المالي</h3>
          <p className="text-xs font-bold text-slate-400 mb-6">مقارنة المصروف بالمتبقي من الميزانية</p>
          <div className="flex-1 min-h-[200px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={budgetData} 
                  innerRadius={60} 
                  outerRadius={80} 
                  paddingAngle={5} 
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {budgetData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
               <p className="text-2xl font-black text-slate-900">{Math.round((stats.spentBudget / stats.totalBudget) * 100)}%</p>
               <p className="text-[10px] font-bold text-slate-400 uppercase">مستخدم</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
             <div className="flex justify-between items-center text-xs font-bold">
                <span className="flex items-center gap-2 text-slate-600"><div className="w-2 h-2 rounded-full bg-red-500"></div> مصروف</span>
                <span className="text-slate-900">${(stats.spentBudget/1000000).toFixed(1)}M</span>
             </div>
             <div className="flex justify-between items-center text-xs font-bold">
                <span className="flex items-center gap-2 text-slate-600"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> متبقي</span>
                <span className="text-slate-900">${((stats.totalBudget - stats.spentBudget)/1000000).toFixed(1)}M</span>
             </div>
          </div>
        </div>
      </div>

      {/* 5. Team & Operational Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Team Workload (Composed Bar) */}
         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
               <div className="p-2 bg-slate-100 rounded-xl"><Users size={20} className="text-slate-600" /></div>
               <h3 className="text-lg font-black text-slate-900">ضغط العمل على الفريق</h3>
            </div>
            <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={teamLoadData} layout="vertical" margin={{ left: 20 }}>
                     <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                     <XAxis type="number" hide />
                     <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 'bold'}} width={80} />
                     <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none'}} />
                     <Bar dataKey="tasks" fill="#3b82f6" radius={[0, 10, 10, 0]} barSize={20} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Project Health Radar */}
         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
               <div className="p-2 bg-slate-100 rounded-xl"><TrendingUp size={20} className="text-slate-600" /></div>
               <h3 className="text-lg font-black text-slate-900">تقييم أبعاد الأداء</h3>
            </div>
            <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                    { subject: 'الميزانية', A: 120, fullMark: 150 },
                    { subject: 'الوقت', A: 98, fullMark: 150 },
                    { subject: 'الجودة', A: 86, fullMark: 150 },
                    { subject: 'السلامة', A: 99, fullMark: 150 },
                    { subject: 'الفريق', A: 85, fullMark: 150 },
                    { subject: 'العملاء', A: 65, fullMark: 150 },
                  ]}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                    <Radar name="Project A" dataKey="A" stroke="#8b5cf6" strokeWidth={3} fill="#8b5cf6" fillOpacity={0.3} />
                    <Tooltip />
                  </RadarChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>

    </div>
  );
};

export default Dashboard;
