
import React, { useState } from 'react';
import { Project, User } from '../../../shared/types';
import { 
  Users, HardHat, ShieldCheck, Wallet, 
  Construction, Plus, Search, ChevronRight,
  MoreVertical, Mail, Phone, MapPin, Sparkles
} from 'lucide-react';

interface ProjectTeamStructureProps {
  project: Project;
  users: User[];
}

const ProjectTeamStructure: React.FC<ProjectTeamStructureProps> = ({ project, users }) => {
  // تعريف الأدوار القيادية الأساسية في أي مشروع
  const coreRoles = [
    { key: 'PM', label: 'مدير المشروع', icon: ShieldCheck, color: 'bg-indigo-600', description: 'المسؤول الأول عن التسليم والميزانية' },
    { key: 'SiteEngineer', label: 'مهندس الموقع الرئيسي', icon: HardHat, color: 'bg-blue-600', description: 'إدارة التنفيذ الميداني اليومي' },
    { key: 'Accountant', label: 'محاسب المشروع', icon: Wallet, color: 'bg-emerald-600', description: 'إدارة النثريات والمستخلصات' },
    { key: 'SafetyOfficer', label: 'مسؤول السلامة (HSE)', icon: ShieldCheck, color: 'bg-rose-600', description: 'مراقبة الامتثال لبروتوكولات السلامة' },
    { key: 'Supervisor', label: 'مراقب الموقع', icon: Construction, color: 'bg-orange-600', description: 'الإشراف المباشر على العمالة' }
  ];

  const getAssignedUser = (role: string) => {
    const staffing = project.staffing?.find(s => s.projectRole === role);
    return users.find(u => u.id === staffing?.userId);
  };

  return (
    <div className="space-y-10 animate-fade-in" dir="rtl">
      <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden">
         <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/5 -ml-32 -mt-32 rounded-full blur-3xl"></div>
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
               <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                  <Users className="text-blue-600" size={32} /> الهيكل الوظيفي للمشروع
               </h3>
               <p className="text-sm font-bold text-slate-500 mt-2">توزيع الأدوار والمسؤوليات داخل الموقع لضمان دقة توجيه المهام التلقائية.</p>
            </div>
            <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl flex items-center gap-2">
               <Sparkles size={20} className="text-blue-400"/> اقتراح هيكل عبر AI
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
         {coreRoles.map(role => {
            const assignedUser = getAssignedUser(role.key);
            
            return (
               <div key={role.key} className="bg-white rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all p-8 flex flex-col h-full group">
                  <div className="flex justify-between items-start mb-8">
                     <div className={`p-4 rounded-[1.5rem] text-white shadow-lg ${role.color}`}>
                        <role.icon size={24} />
                     </div>
                     <button className="p-2 text-slate-300 hover:bg-slate-50 rounded-xl transition-all"><MoreVertical size={20}/></button>
                  </div>

                  <div className="flex-1 mb-8">
                     <h4 className="text-lg font-black text-slate-900">{role.label}</h4>
                     <p className="text-xs font-bold text-slate-400 mt-1 leading-relaxed">{role.description}</p>
                  </div>

                  {assignedUser ? (
                     <div className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
                        <div className="flex items-center gap-4">
                           <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-sm border-2 border-white">
                              <img src={assignedUser.avatar} className="w-full h-full object-cover" />
                           </div>
                           <div>
                              <p className="font-black text-slate-900 text-sm">{assignedUser.name}</p>
                              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{assignedUser.role}</p>
                           </div>
                        </div>
                        <div className="flex gap-2 border-t border-slate-200 pt-4">
                           <button className="flex-1 py-2 bg-white rounded-xl text-[9px] font-black text-slate-500 hover:bg-slate-900 hover:text-white transition-all">تغيير</button>
                           <button className="p-2 bg-white rounded-xl text-slate-400 hover:text-blue-600 transition-all"><Mail size={14}/></button>
                           <button className="p-2 bg-white rounded-xl text-slate-400 hover:text-blue-600 transition-all"><Phone size={14}/></button>
                        </div>
                     </div>
                  ) : (
                     <button className="w-full py-6 bg-slate-50 border-2 border-dashed border-slate-200 text-slate-400 rounded-[2rem] text-xs font-black hover:bg-white hover:border-blue-400 hover:text-blue-600 transition-all flex flex-col items-center gap-2">
                        <Plus size={24}/> تعيين مسؤول
                     </button>
                  )}
               </div>
            );
         })}
      </div>
    </div>
  );
};

export default ProjectTeamStructure;
