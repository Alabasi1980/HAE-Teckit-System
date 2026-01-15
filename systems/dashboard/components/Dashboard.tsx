import React, { useMemo, useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, PieChart, Pie 
} from 'recharts';
import { WorkItem, Status, Priority, Project, User } from '../../../shared/types';
import { useData } from '../../../context/DataContext';
import { AlertTriangle, Clock, TrendingUp, DollarSign, BrainCircuit, Activity, Users, Target, Sparkles } from 'lucide-react';
import StatCard from '../../../shared/ui/StatCard';
import ReactMarkdown from 'react-markdown';

interface DashboardProps {
  items: WorkItem[];
  projects: Project[];
  users: User[];
}

const Dashboard: React.FC<DashboardProps> = ({ items, projects, users }) => {
  const data = useData();
  const [aiBrief, setAiBrief] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  
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

  const velocityData = useMemo(() => {
    const days = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
    return days.map(day => ({
      name: day,
      created: Math.floor(Math.random() * 10) + 2,
      resolved: Math.floor(Math.random() * 8) + 1,
    }));
  }, []);

  const budgetData = [
    { name: 'Spent', value: stats.spentBudget, color: '#ef4444' },
    { name: 'Remaining', value: stats.totalBudget - stats.spentBudget, color: '#10b981' }
  ];

  const handleGenerateInsight = async () => {
    setIsAiLoading(true);
    try {
      const result = await data.ai.generateExecutiveBrief({
        totalProjects: stats.projectsCount,
        totalBudget: stats.totalBudget,
        spentBudget: stats.spentBudget,
        criticalIssues: stats.critical,
        delayedTasks: stats.overdue,
        teamSize: stats.teamCount
      });
      setAiBrief(result);
    } catch (e) {
      setAiBrief("تعذر إنشاء التقرير الذكي حالياً.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10" dir="rtl">
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
          {isAiLoading ? <Target className="animate-spin" /> : <BrainCircuit />}
          {isAiLoading ? 'جاري التحليل...' : 'طلب تقرير المستشار الذكي'}
        </button>
      </div>

      {aiBrief && (
        <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-2xl relative overflow-hidden animate-slide-in-up">
           <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 -mr-32 -mt-32 rounded-full blur-3xl"></div>
           <div className="relative z-10">
              <h3 className="text-xl font-black mb-4 flex items-center gap-2 text-indigo-300">
                 <Sparkles size={20} /> ملخص تنفيذي (AI)
              </h3>
              <div className="prose prose-invert prose-sm max-w-none font-bold leading-relaxed">
                 <ReactMarkdown>{aiBrief}</ReactMarkdown>
              </div>
              <button onClick={() => setAiBrief(null)} className="mt-6 text-xs text-slate-500 hover:text-white transition-colors underline">إخفاء التقرير</button>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="إجمالي المشاريع" value={stats.projectsCount} icon={<Target size={22} />} colorClass="text-blue-600" bgClass="bg-blue-50" />
        <StatCard title="نسبة استهلاك الميزانية" value={`${Math.round((stats.spentBudget / stats.totalBudget) * 100)}%`} icon={<DollarSign size={22} />} colorClass="text-emerald-600" bgClass="bg-emerald-50" />
        <StatCard title="بلاغات حرجة" value={stats.critical} icon={<AlertTriangle size={22} />} colorClass="text-rose-600" bgClass="bg-rose-50" />
        <StatCard title="مهام متأخرة" value={stats.overdue} icon={<Clock size={22} />} colorClass="text-orange-600" bgClass="bg-orange-50" trend={{ value: "12% هذا الأسبوع", isUpward: false }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative group">
          <div className="flex justify-between items-center mb-8">
             <h3 className="text-lg font-black text-slate-900 pr-2 border-r-4 border-indigo-600">سرعة الإنجاز الأسبوعية</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={velocityData}>
                <defs>
                  <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip />
                <Area type="monotone" dataKey="created" stroke="#6366f1" strokeWidth={3} fill="url(#colorCreated)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-black text-slate-900 mb-6">الموقف المالي</h3>
          <div className="flex-1 min-h-[200px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={budgetData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {budgetData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
               <p className="text-2xl font-black text-slate-900">{Math.round((stats.spentBudget / stats.totalBudget) * 100)}%</p>
               <p className="text-[10px] font-bold text-slate-400 uppercase">مستخدم</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;