
import React, { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';
import { WorkItem, Status, Priority, Project, User, WorkItemType } from '../../../shared/types';
import { useData } from '../../../context/DataContext';
import { 
  AlertTriangle, Clock, TrendingUp, DollarSign, BrainCircuit, 
  Activity, Users, Target, Sparkles, AlertOctagon, 
  ChevronLeft, Zap, Loader2, ListTodo, CheckCircle2,
  CalendarDays, ShieldAlert
} from 'lucide-react';
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
  const currentUser = JSON.parse(localStorage.getItem('enjaz_session_user') || '{}');
  
  const stats = useMemo(() => {
    const myTasks = items.filter(i => i.assigneeId === currentUser.id && i.status !== Status.DONE);
    
    // Urgency Engine: Critical Blockers
    const siteBlockers = items.filter(i => 
      i.priority === Priority.CRITICAL && 
      (i.type === WorkItemType.ISSUE || i.type === WorkItemType.INCIDENT) &&
      i.status !== Status.DONE
    );

    const totalBudget = projects.reduce((acc, p) => acc + p.budget, 0);
    const spentBudget = projects.reduce((acc, p) => acc + p.spent, 0);

    return {
      total: items.length,
      myTasks,
      siteBlockers,
      critical: items.filter(i => i.priority === Priority.CRITICAL).length,
      overdue: items.filter(i => i.status !== Status.DONE && i.dueDate < today).length,
      totalBudget,
      spentBudget,
      projectsCount: projects.length,
      teamCount: users.length
    };
  }, [items, projects, today, currentUser.id]);

  return (
    <div className="space-y-8 animate-fade-in pb-20 px-2 lg:px-4" dir="rtl">
      
      {/* Urgency Engine Bar */}
      {stats.siteBlockers.length > 0 && (
        <div className="bg-rose-900 p-6 rounded-[3rem] text-white shadow-2xl border-b-8 border-rose-950 animate-pulse">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                 <div className="p-4 bg-rose-600 rounded-3xl"><ShieldAlert size={32}/></div>
                 <div>
                    <h3 className="text-2xl font-black">تحذير: توقف كلي عن العمل (Blockers)</h3>
                    <p className="text-rose-200 font-bold">تم رصد {stats.siteBlockers.length} معوقات حرجة تتطلب قراراً فورياً من الإدارة.</p>
                 </div>
              </div>
              <button className="px-8 py-4 bg-white text-rose-900 rounded-2xl font-black text-sm hover:bg-rose-50 transition-all">معالجة العوارض</button>
           </div>
        </div>
      )}

      {/* Main Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="إجمالي المشاريع" value={stats.projectsCount} icon={<Target/>} colorClass="text-blue-600" bgClass="bg-blue-50" trend={{value: '3%', isUpward: true}} />
        <StatCard title="الميزانية المستهلكة" value={`${Math.round((stats.spentBudget / stats.totalBudget) * 100)}%`} icon={<DollarSign/>} colorClass="text-emerald-600" bgClass="bg-emerald-50" />
        <StatCard title="المهام الحرجة" value={stats.critical} icon={<AlertTriangle/>} colorClass="text-rose-600" bgClass="bg-rose-50" trend={{value: '12%', isUpward: false}} />
        <StatCard title="القوى العاملة" value={stats.teamCount} icon={<Users/>} colorClass="text-indigo-600" bgClass="bg-indigo-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm relative group">
            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3 mb-8">
               <Activity className="text-blue-600" /> ملخص الإنجاز الميداني
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[
                  { name: 'أحد', val: 12 }, { name: 'اثنين', val: 25 }, { name: 'ثلاثاء', val: 18 }, { name: 'أربعاء', val: 32 }, { name: 'خميس', val: 45 },
                ]}>
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: '900'}} />
                  <YAxis hide />
                  <Tooltip />
                  <Area type="monotone" dataKey="val" stroke="#2563eb" strokeWidth={5} fill="url(#chartGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
           <div className="bg-indigo-600 p-8 rounded-[3rem] text-white shadow-xl flex items-center justify-between group">
              <div>
                 <p className="text-xs font-black uppercase opacity-60">رصيد نقاطك</p>
                 <h4 className="text-4xl font-black mt-1">{currentUser.points || 0} XP</h4>
                 <p className="text-[10px] mt-2 text-indigo-200">أنت في المركز الثاني هذا الشهر!</p>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center border-4 border-white/10">
                 <Sparkles size={32} />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
