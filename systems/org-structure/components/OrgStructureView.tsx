
import React, { useState, useEffect } from 'react';
import { Department, User } from '../../../shared/types';
import { useData } from '../../../context/DataContext';
import { 
  Network, Users, UserCheck, Search, 
  ChevronDown, ChevronLeft, Plus, 
  Building2, ShieldCheck, Mail, Phone,
  Briefcase, MoreVertical
} from 'lucide-react';

const OrgStructureView: React.FC = () => {
  const data = useData();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    // محاكاة جلب بيانات الأقسام - في الواقع ستأتي من الـ Repo
    const deptMock: Department[] = [
      { id: 'D1', name: 'المكتب الفني والهندسة', managerId: 'U001', description: 'مسؤول عن المخططات والتدقيق الفني', color: 'bg-blue-500' },
      { id: 'D2', name: 'المالية والمشتريات', managerId: 'U002', description: 'إدارة التدفقات النقدية والعقود', color: 'bg-emerald-500' },
      { id: 'D3', name: 'العمليات والميدان', managerId: 'U003', description: 'التنفيذ المباشر في مواقع المشاريع', color: 'bg-orange-500' },
      { id: 'D4', name: 'الموارد البشرية', managerId: 'U004', description: 'إدارة الكادر البشري والسياسات', color: 'bg-indigo-500' },
      { id: 'D5', name: 'التدقيق والامتثال', managerId: 'U005', description: 'الرقابة الداخلية والجودة', color: 'bg-rose-500' }
    ];
    const allUsers = await data.users.getAll();
    setDepartments(deptMock);
    setUsers(allUsers);
    setLoading(false);
  };

  const getManager = (managerId: string) => users.find(u => u.id === managerId);

  return (
    <div className="space-y-10 animate-fade-in pb-20" dir="rtl">
      {/* Header */}
      <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 -mr-32 -mt-32 rounded-full blur-3xl"></div>
         <div className="relative z-10 flex items-center gap-6">
            <div className="p-5 bg-slate-900 text-white rounded-[2rem] shadow-xl">
               <Network size={36} />
            </div>
            <div>
               <h2 className="text-3xl font-black text-slate-900 leading-tight">الهيكل التنظيمي للمؤسسة</h2>
               <p className="text-sm font-bold text-slate-500 mt-1">تحديد الأقسام، الصلاحيات، والتبعية الإدارية لضمان تدفق العمليات.</p>
            </div>
         </div>
         <div className="relative z-10">
            <button className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-200 hover:scale-105 transition-all flex items-center gap-2">
               <Plus size={20}/> إضافة قسم جديد
            </button>
         </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-5">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-3xl"><Building2 size={24}/></div>
            <div>
               <p className="text-2xl font-black">{departments.length}</p>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">إجمالي الأقسام</p>
            </div>
         </div>
         <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-5">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-3xl"><Users size={24}/></div>
            <div>
               <p className="text-2xl font-black">{users.length}</p>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">إجمالي الكادر</p>
            </div>
         </div>
         <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-5">
            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-3xl"><ShieldCheck size={24}/></div>
            <div>
               <p className="text-2xl font-black">100%</p>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">تغطية المديرين</p>
            </div>
         </div>
      </div>

      {/* Visual Hierarchy Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
         {departments.map(dept => {
            const manager = getManager(dept.managerId);
            const deptStaff = users.filter(u => u.departmentId === dept.id || u.role.includes(dept.name.split(' ')[0]));
            
            return (
               <div key={dept.id} className="bg-white rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all overflow-hidden group">
                  <div className={`h-3 w-full ${dept.color}`}></div>
                  <div className="p-8">
                     <div className="flex justify-between items-start mb-8">
                        <div>
                           <h4 className="text-xl font-black text-slate-900 leading-tight">{dept.name}</h4>
                           <p className="text-xs font-bold text-slate-400 mt-1">{dept.description}</p>
                        </div>
                        <button className="p-2 text-slate-300 hover:bg-slate-50 rounded-xl transition-all"><MoreVertical size={20}/></button>
                     </div>

                     {/* Department Head */}
                     <div className="p-5 bg-slate-900 rounded-[2rem] text-white shadow-xl mb-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><ShieldCheck size={48}/></div>
                        <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-3">مدير القسم</p>
                        <div className="flex items-center gap-4 relative z-10">
                           <div className="w-14 h-14 rounded-2xl border-2 border-white/20 overflow-hidden shadow-lg">
                              <img src={manager?.avatar || `https://picsum.photos/seed/${dept.id}/100/100`} className="w-full h-full object-cover" />
                           </div>
                           <div>
                              <h5 className="font-black text-lg">{manager?.name || 'قيد التعيين'}</h5>
                              <p className="text-xs font-bold text-blue-100/60 uppercase">{manager?.role || 'HOD'}</p>
                           </div>
                        </div>
                     </div>

                     {/* Staff Snapshot */}
                     <div className="space-y-4">
                        <div className="flex justify-between items-center px-1">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">فريق العمل ({deptStaff.length})</p>
                           <button className="text-[10px] font-black text-blue-600 hover:underline">عرض الكل</button>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                           {deptStaff.slice(0, 3).map(staff => (
                              <div key={staff.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100 group-hover:border-blue-100 transition-all">
                                 <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl overflow-hidden bg-white shadow-sm">
                                       <img src={staff.avatar} className="w-full h-full object-cover" />
                                    </div>
                                    <span className="text-xs font-bold text-slate-700">{staff.name}</span>
                                 </div>
                                 <span className="text-[9px] font-black text-slate-400 uppercase">{staff.role.split(' ')[0]}</span>
                              </div>
                           ))}
                        </div>
                        <button className="w-full py-4 mt-2 bg-slate-50 border-2 border-dashed border-slate-200 text-slate-400 rounded-2xl text-[10px] font-black hover:bg-white hover:border-blue-400 hover:text-blue-600 transition-all flex items-center justify-center gap-2">
                           <Plus size={14}/> إسناد موظف للقسم
                        </button>
                     </div>
                  </div>
               </div>
            );
         })}
      </div>
    </div>
  );
};

export default OrgStructureView;
