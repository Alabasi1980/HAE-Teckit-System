
import React, { useState, useEffect, useMemo } from 'react';
import { Asset, AssetStatus, AssetCategory, WorkItem, WorkItemType, Priority, Status, User } from '../../../shared/types';
import { useData } from '../../../context/DataContext';
import { useEnjazCore } from '../../../shared/hooks/useEnjazCore';
import { PermissionGate } from '../../../shared/rbac/PermissionGate';
import { PERMISSIONS } from '../../../shared/rbac/permissions';
import AssetCard from './AssetCard';
import AssetStats from './AssetStats';
import { Search, Plus, Sparkles, X, Loader2, AlertTriangle, CheckCircle2, ArrowRightLeft, FileWarning } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const AssetsView: React.FC = () => {
  const data = useData();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // RBAC Context
  const { currentUser } = useEnjazCore();

  // Selection & Modal States
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assetHistory, setAssetHistory] = useState<WorkItem[]>([]);
  const [detailTab, setDetailTab] = useState<'details' | 'history'>('details');
  
  // Action States
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [targetUserId, setTargetUserId] = useState('');
  const [maintenanceNote, setMaintenanceNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // AI State
  const [aiInsight, setAiInsight] = useState<{asset: Asset, content: string} | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [assetsData, usersData] = await Promise.all([
      data.assets.getAll(),
      data.users.getAll()
    ]);
    setAssets(assetsData);
    setUsers(usersData);
    setLoading(false);
  };

  const loadAssetHistory = async (assetId: string) => {
    const allItems = await data.workItems.getAll();
    const history = allItems.filter(item => item.assetId === assetId).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setAssetHistory(history);
  };

  const handleAssetClick = (asset: Asset) => {
    setSelectedAsset(asset);
    setDetailTab('details');
    loadAssetHistory(asset.id);
  };

  const handleAiHealthCheck = async (asset: Asset) => {
    setIsAiLoading(true);
    setAiInsight({ asset, content: '' });

    // AI logic handled here or via service
    // For separation, ideally use data.ai.analyzeAsset() if it existed, but direct call for now or use stub logic
    // Using a stub behavior for now since direct key access is discouraged in UI
    setTimeout(() => {
       setAiInsight({ asset, content: "AI Analysis is currently running in stub mode. Connect to backend for live Gemini insights." });
       setIsAiLoading(false);
    }, 1000);
  };

  const handleTransferCustody = async () => {
    if (!selectedAsset || !targetUserId) return;
    setIsProcessing(true);
    try {
      const targetUser = users.find(u => u.id === targetUserId);
      await data.assets.update(selectedAsset.id, {
        assignedToUserId: targetUserId,
        assignedToUserName: targetUser?.name,
        status: AssetStatus.IN_USE,
        location: 'With Employee' 
      });
      await data.workItems.create({
        type: WorkItemType.CUSTODY,
        title: `Custody Transfer: ${selectedAsset.name}`,
        description: `Asset transferred from ${selectedAsset.assignedToUserName || 'Storage'} to ${targetUser?.name}`,
        priority: Priority.LOW,
        status: Status.DONE,
        assetId: selectedAsset.id,
        employeeId: targetUserId,
        projectId: 'General'
      });
      alert("Custody transferred successfully.");
      setShowTransferModal(false);
      setTargetUserId('');
      loadData();
      setSelectedAsset(null);
    } catch (error) {
      console.error(error);
      alert("Failed to transfer custody.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReportMaintenance = async () => {
    if (!selectedAsset || !maintenanceNote) return;
    setIsProcessing(true);
    try {
      await data.assets.update(selectedAsset.id, {
        status: AssetStatus.MAINTENANCE
      });
      await data.workItems.create({
        type: WorkItemType.INCIDENT,
        title: `Maintenance: ${selectedAsset.name}`,
        description: maintenanceNote,
        priority: Priority.HIGH,
        status: Status.OPEN,
        assetId: selectedAsset.id,
        tags: ['Maintenance', selectedAsset.category],
        projectId: 'General'
      });
      alert("Maintenance ticket created.");
      setShowMaintenanceModal(false);
      setMaintenanceNote('');
      loadData();
      setSelectedAsset(null);
    } catch (error) {
      console.error(error);
      alert("Failed to report issue.");
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredAssets = useMemo(() => {
    return assets.filter(a => {
      const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            a.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'All' || a.category === filterCategory;
      const matchesStatus = filterStatus === 'All' || a.status === filterStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [assets, searchTerm, filterCategory, filterStatus]);

  // Render ... (Logic mostly same, just ensuring no direct repo imports)
  return (
    <div className="flex flex-col h-full space-y-8 animate-fade-in pb-10 overflow-hidden">
      {!loading && <AssetStats assets={assets} />}

      <div className="bg-white p-4 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-center">
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="البحث باسم المعدة أو الرقم التسلسلي..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
           <select 
             className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black text-slate-600 outline-none"
             value={filterCategory}
             onChange={(e) => setFilterCategory(e.target.value)}
           >
             <option value="All">جميع الفئات</option>
             {Object.values(AssetCategory).map(c => <option key={c} value={c}>{c}</option>)}
           </select>

           <select 
             className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black text-slate-600 outline-none"
             value={filterStatus}
             onChange={(e) => setFilterStatus(e.target.value)}
           >
             <option value="All">جميع الحالات</option>
             {Object.values(AssetStatus).map(s => <option key={s} value={s}>{s}</option>)}
           </select>

           <div className="h-10 w-px bg-slate-100 hidden lg:block"></div>

           <PermissionGate user={currentUser} permission={PERMISSIONS.ASSET_CREATE}>
             <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-black hover:scale-105 transition-transform shadow-lg shadow-slate-900/20">
               <Plus size={18} /> إضافة أصل جديد
             </button>
           </PermissionGate>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pr-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
             <Loader2 className="animate-spin text-blue-600" size={48} />
             <p className="font-black text-slate-400">جاري تحميل سجل الأصول...</p>
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="text-center py-40 bg-white rounded-[3rem] border border-dashed border-slate-200">
             <AlertTriangle size={64} className="mx-auto text-slate-200 mb-4" />
             <p className="text-slate-400 font-black">لم يتم العثور على أصول تطابق البحث.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredAssets.map(asset => (
              <AssetCard 
                key={asset.id} 
                asset={asset} 
                onClick={() => handleAssetClick(asset)} 
                onAnalyze={handleAiHealthCheck}
              />
            ))}
          </div>
        )}
      </div>

      {aiInsight && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md" onClick={() => setAiInsight(null)}>
           <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl flex flex-col animate-scale-in relative overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 -mr-32 -mt-32 rounded-full blur-3xl"></div>
              
              <div className="p-8 border-b border-slate-100 flex justify-between items-center relative z-10">
                 <div className="flex items-center gap-4">
                   <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-200">
                      <Sparkles size={24} />
                   </div>
                   <div>
                     <h3 className="text-xl font-black text-slate-900">تحليل الحالة الذكي</h3>
                     <p className="text-xs font-bold text-slate-400">{aiInsight.asset.name}</p>
                   </div>
                 </div>
                 <button onClick={() => setAiInsight(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X size={24}/></button>
              </div>

              <div className="p-8 overflow-y-auto max-h-[60vh] relative z-10">
                 {isAiLoading ? (
                   <div className="flex flex-col items-center justify-center py-20 gap-4 text-right" dir="rtl">
                      <Loader2 className="animate-spin text-indigo-600" size={48} />
                      <p className="text-sm font-black text-slate-600 animate-pulse">يقوم Gemini بتحليل السجل الفني وتاريخ الصيانة...</p>
                   </div>
                 ) : (
                   <div className="prose prose-indigo max-w-none text-right" dir="rtl">
                      <ReactMarkdown>{aiInsight.content}</ReactMarkdown>
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setSelectedAsset(null)}>
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                 <h3 className="font-bold text-slate-800 flex items-center gap-2">
                   {/* Icon */} {selectedAsset.name}
                 </h3>
                 <button onClick={() => setSelectedAsset(null)} className="p-1 hover:bg-slate-200 rounded-full"><X size={20} /></button>
              </div>

              <div className="flex border-b border-slate-100">
                 <button onClick={() => setDetailTab('details')} className={`flex-1 py-3 text-sm font-medium ${detailTab === 'details' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}>Overview</button>
                 <button onClick={() => setDetailTab('history')} className={`flex-1 py-3 text-sm font-medium ${detailTab === 'history' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}>History</button>
              </div>
              
              <div className="p-6 h-[400px] overflow-y-auto">
                 {detailTab === 'details' ? (
                   <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <p className="text-xs text-slate-400 uppercase font-bold">Serial Number</p>
                            <p className="font-mono font-medium text-slate-800">{selectedAsset.serialNumber}</p>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <p className="text-xs text-slate-400 uppercase font-bold">Current Value</p>
                            <p className="font-mono font-medium text-slate-800">${selectedAsset.value.toLocaleString()}</p>
                          </div>
                      </div>

                      <div>
                          <h4 className="text-sm font-bold text-slate-800 mb-2 border-b border-slate-100 pb-1">Custody & Location</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-slate-500 text-xs">Assigned To</p>
                                <p className="font-medium mt-1">{selectedAsset.assignedToUserName || 'Unassigned'}</p>
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs">Current Location</p>
                                <p className="font-medium mt-1">{selectedAsset.location}</p>
                            </div>
                          </div>
                      </div>

                      <div className="flex gap-2 pt-4">
                          <PermissionGate user={currentUser} permission={PERMISSIONS.ASSET_TRANSFER}>
                            <button 
                              onClick={() => setShowTransferModal(true)}
                              className="flex-1 py-3 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 flex items-center justify-center gap-2"
                            >
                              <ArrowRightLeft size={16} /> Transfer Custody
                            </button>
                          </PermissionGate>
                          
                          <button 
                             onClick={() => setShowMaintenanceModal(true)}
                             className="flex-1 py-3 bg-orange-50 text-orange-700 border border-orange-200 rounded-lg text-sm font-bold hover:bg-orange-100 flex items-center justify-center gap-2"
                          >
                            <FileWarning size={16} /> Report Issue
                          </button>
                      </div>
                   </div>
                 ) : (
                   <div className="space-y-4">
                     {assetHistory.map(item => (
                         <div key={item.id} className="flex gap-4 border-b border-slate-50 pb-2">
                            <div className="text-xs text-slate-400 w-24 shrink-0">{new Date(item.createdAt).toLocaleDateString()}</div>
                            <div>
                               <p className="font-bold text-slate-700 text-sm">{item.title}</p>
                               <p className="text-xs text-slate-500">{item.description}</p>
                            </div>
                         </div>
                     ))}
                     {assetHistory.length === 0 && <p className="text-center text-slate-400 text-sm">No history yet.</p>}
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* Maintenance Modal */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 animate-scale-in">
             <h3 className="font-bold text-lg mb-4 text-orange-700 flex items-center gap-2">
               <AlertTriangle size={20} /> Report Issue
             </h3>
             
             <div className="mb-4">
               <label className="block text-xs font-bold text-slate-700 mb-1">Issue Description</label>
               <textarea 
                 className="w-full p-2 border border-slate-200 rounded-lg h-24 text-sm"
                 placeholder="Describe the breakdown or damage..."
                 value={maintenanceNote}
                 onChange={(e) => setMaintenanceNote(e.target.value)}
               />
             </div>

             <div className="flex justify-end gap-2">
               <button onClick={() => setShowMaintenanceModal(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg text-sm">Cancel</button>
               <button 
                 onClick={handleReportMaintenance}
                 disabled={!maintenanceNote || isProcessing}
                 className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-bold hover:bg-orange-700 disabled:opacity-50"
               >
                 {isProcessing ? 'Reporting...' : 'Submit Report'}
               </button>
             </div>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 animate-scale-in">
             <h3 className="font-bold text-lg mb-4">Transfer Custody</h3>
             <p className="text-sm text-slate-500 mb-4">Select the employee to take responsibility for <strong>{selectedAsset?.name}</strong>.</p>
             
             <div className="mb-4">
               <label className="block text-xs font-bold text-slate-700 mb-1">New Custodian</label>
               <select 
                 className="w-full p-2 border border-slate-200 rounded-lg"
                 value={targetUserId}
                 onChange={(e) => setTargetUserId(e.target.value)}
               >
                 <option value="">Select Employee...</option>
                 {users.map(u => (
                   <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                 ))}
               </select>
             </div>

             <div className="flex justify-end gap-2">
               <button onClick={() => setShowTransferModal(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg text-sm">Cancel</button>
               <button 
                 onClick={handleTransferCustody}
                 disabled={!targetUserId || isProcessing}
                 className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50"
               >
                 {isProcessing ? 'Processing...' : 'Confirm Transfer'}
               </button>
             </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AssetsView;
