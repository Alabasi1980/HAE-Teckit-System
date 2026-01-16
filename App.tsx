
import React, { useState, useEffect, useCallback } from 'react';
import { Header, Sidebar } from './systems/app-shell';
import { Dashboard } from './systems/dashboard';
import { WorkItem, Project, Ticket, User, Notification, View, Status } from './shared/types';
import { WorkItemList, WorkItemDetail, ApprovalsView, CreateWorkItemModal, WorkloadBalancerView } from './systems/operations';
import { ProjectsListView, ProjectDetail } from './systems/projects';
import { AssetsView } from './systems/assets';
import { DocumentsView } from './systems/documents';
import { KnowledgeBase } from './systems/knowledge';
import { FieldOps } from './systems/field-ops';
import { ProfileView } from './systems/profile';
import { SettingsView } from './systems/settings';
import { InventoryView } from './systems/inventory';
import { CostControlView } from './systems/finance';
import { HRDashboard, PayrollView } from './systems/hr';
import { ComplianceHubView } from './systems/compliance';
import { OrgStructureView } from './systems/org-structure';
import { TicketsInboxView, TicketDetailView } from './systems/tickets';
import CreateTicketView from './systems/tickets/components/CreateTicketView';
import { LoginView, MfaVerification, authService } from './systems/auth';
import { DataProvider, useData } from './context/DataContext';
import { ToastProvider, useToast } from './shared/ui/ToastProvider';
import { useEnjazCore } from './shared/hooks/useEnjazCore';
import { ErrorBoundary } from './shared/ui/ErrorBoundary';

function AppContent() {
  const data = useData();
  const { showToast } = useToast();
  const {
    workItems, projects, users, currentUser, notifications, isLoading, error,
    loadAllData, handleStatusUpdate, handleSwitchUser, markAllNotifsRead
  } = useEnjazCore();

  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedItem, setSelectedItem] = useState<WorkItem | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mfaUser, setMfaUser] = useState<User | null>(null);

  useEffect(() => {
    const user = authService.getSession();
    if (user) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleCreateWorkItem = async (payload: Partial<WorkItem>) => {
    try {
      const newItem = await data.workItems.create(payload);
      showToast("تم إنشاء المهمة وتعيينها بنجاح.", "success");
      
      if (payload.assigneeId) {
        await data.notifications.create({
          userId: payload.assigneeId,
          title: "مهمة جديدة مسندة إليك",
          message: `تم تكليفك بمهمة: ${payload.title}`,
          type: 'update',
          priority: 'normal',
          category: 'task',
          relatedItemId: newItem.id,
          createdAt: new Date().toISOString(),
          isRead: false
        });
      }
      
      await loadAllData(true);
      setIsCreateModalOpen(false);
    } catch (e) {
      showToast("فشل إنشاء المهمة، يرجى المحاولة لاحقاً.", "error");
    }
  };

  if (!isLoggedIn) {
    if (mfaUser) {
      return <MfaVerification user={mfaUser} onVerified={() => setIsLoggedIn(true)} onCancel={() => setMfaUser(null)} />;
    }
    return <LoginView onLoginSuccess={(u) => { authService.createSession(u); setMfaUser(u); }} />;
  }

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans" dir="rtl">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
      />
      
      <main className="flex-1 flex flex-col min-w-0 relative">
        <Header 
          currentView={currentView} 
          setCurrentView={setCurrentView} 
          setIsSidebarOpen={setIsSidebarOpen} 
          onOpenCreateModal={() => {
            if (currentView === 'tickets') setIsCreateTicketOpen(true);
            else setIsCreateModalOpen(true);
          }}
          notifications={notifications}
          onNotificationClick={(n) => {
            if(n.relatedItemId) {
              const item = workItems.find(i => i.id === n.relatedItemId);
              if(item) setSelectedItem(item);
            }
          }}
          onMarkAllRead={markAllNotifsRead}
          unreadCount={notifications.filter(n => !n.isRead).length}
          projectTitle={selectedProject?.name}
        />

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 no-scrollbar">
          <ErrorBoundary name={currentView}>
            {currentView === 'dashboard' && <Dashboard items={workItems} projects={projects} users={users} />}
            {currentView === 'org-structure' && <OrgStructureView />}
            {currentView === 'workitems' && <WorkItemList items={workItems} onItemClick={setSelectedItem} onOpenCreate={() => setIsCreateModalOpen(true)} />}
            {currentView === 'workload' && <WorkloadBalancerView users={users} items={workItems} onItemClick={setSelectedItem} />}
            {currentView === 'compliance' && <ComplianceHubView />}
            {currentView === 'projects' && (
              <ProjectsListView 
                projects={projects} 
                workItems={workItems} 
                onSelectProject={(p) => { setSelectedProject(p); setCurrentView('project-detail'); }} 
                onCreateProject={() => setIsCreateModalOpen(true)} 
              />
            )}
            {currentView === 'project-detail' && selectedProject && (
              <ProjectDetail 
                project={selectedProject} 
                items={workItems.filter(i => i.projectId === selectedProject.id)} 
                onBack={() => setCurrentView('projects')} 
                onItemClick={setSelectedItem}
                onNavigate={setCurrentView}
                onOpenCreate={() => setIsCreateModalOpen(true)}
              />
            )}
            {currentView === 'tickets' && (
              <TicketsInboxView 
                onTicketClick={setSelectedTicket} 
                onOpenCreate={() => setIsCreateTicketOpen(true)} 
              />
            )}
            {currentView === 'approvals' && <ApprovalsView items={workItems} currentUser={currentUser} onItemClick={setSelectedItem} />}
            {currentView === 'field-ops' && <FieldOps projects={projects} onSubmit={handleCreateWorkItem} />}
            {currentView === 'assets' && <AssetsView />}
            {currentView === 'inventory' && <InventoryView />}
            {currentView === 'finance' && <CostControlView />}
            {currentView === 'hr' && <HRDashboard />}
            {currentView === 'payroll' && <PayrollView />}
            {currentView === 'documents' && <DocumentsView projects={projects} />}
            {currentView === 'knowledge' && <KnowledgeBase />}
            {currentView === 'profile' && currentUser && <ProfileView user={currentUser} onNavigate={setCurrentView} onItemClick={setSelectedItem} />}
            {currentView === 'settings' && <SettingsView />}
          </ErrorBoundary>
        </div>
      </main>

      {selectedItem && (
        <WorkItemDetail 
          item={selectedItem} 
          project={projects.find(p => p.id === selectedItem.projectId)}
          currentUser={currentUser}
          onClose={() => setSelectedItem(null)} 
          onUpdateStatus={handleStatusUpdate} 
          onRefresh={loadAllData} 
        />
      )}

      {selectedTicket && (
        <TicketDetailView 
          ticket={selectedTicket} 
          onClose={() => setSelectedTicket(null)} 
          onRefresh={loadAllData} 
        />
      )}

      {isCreateTicketOpen && (
        <CreateTicketView 
          onClose={() => setIsCreateTicketOpen(false)}
          onSuccess={loadAllData}
        />
      )}

      {isCreateModalOpen && (
        <CreateWorkItemModal 
          isOpen={isCreateModalOpen} 
          onClose={() => setIsCreateModalOpen(false)} 
          projects={projects} 
          users={users} 
          currentUser={currentUser}
          onCreate={handleCreateWorkItem}
          initialContext={
            currentView === 'project-detail' && selectedProject 
              ? { relatedToId: selectedProject.id, relatedToType: 'Project' } 
              : undefined
          }
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </ToastProvider>
  );
}
