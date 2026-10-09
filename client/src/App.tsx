import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  Megaphone, 
  Monitor, 
  ShieldCheck, 
  Columns, 
  Eye, 
  PlusCircle, 
  FileText,
  Volume2
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { OfficeDirectory } from './components/OfficeDirectory';
import { TaskManager } from './components/TaskManager';
import { AnnouncementsView } from './components/AnnouncementsView';
import { DeviceManagement } from './components/DeviceManagement';
import { AuditLogsView } from './components/AuditLogsView';
import { DesktopAgentSimulator } from './components/DesktopAgentSimulator';
import { LiveScreenModal } from './components/LiveScreenModal';
import { CreateTaskModal } from './components/CreateTaskModal';
import { LoginPage } from './components/LoginPage';
import { Sidebar } from './components/Sidebar';
import { MessagesCenter } from './components/MessagesCenter';
import { ReportsAnalyticsView } from './components/ReportsAnalyticsView';
import { ITAdminView } from './components/ITAdminView';
import { 
  Office, 
  Task, 
  SystemStats, 
  Announcement, 
  DirectMessage, 
  AuditLog, 
  ScreenSession, 
  TaskStatus,
  AuthUser,
  UserRole
} from './types';

const API_BASE = 'http://localhost:4000/api';
const WS_URL = 'ws://localhost:4000';

export function App() {
  // Authentication & Role State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('director');
  const [authToken, setAuthToken] = useState<string | null>(() => {
    return localStorage.getItem('univ_auth_token') || sessionStorage.getItem('univ_auth_token') || null;
  });
  const [language, setLanguage] = useState<'ar' | 'en' | 'so'>('ar');

  // Navigation & View Mode
  const [currentView, setCurrentView] = useState<'director' | 'agent' | 'split'>('director');
  const [directorTab, setDirectorTab] = useState<string>('dashboard');

  // Application State
  const [stats, setStats] = useState<SystemStats>({
    totalOffices: 5,
    onlineOffices: 4,
    offlineOffices: 1,
    pendingTasks: 0,
    activeTasks: 0,
    completedTasks: 0,
    unreadMessages: 0,
    activeScreenSessionsCount: 0
  });

  const [offices, setOffices] = useState<Office[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [activeScreenSessions, setActiveScreenSessions] = useState<Record<string, ScreenSession>>({});
  
  // Real-time connection
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Modals
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [createTaskOfficeId, setCreateTaskOfficeId] = useState<string | undefined>(undefined);
  const [activeViewingOffice, setActiveViewingOffice] = useState<Office | null>(null);
  const [activeViewingTask, setActiveViewingTask] = useState<Task | null>(null);

  // Agent Simulator Selected Office
  const [selectedAgentOfficeId, setSelectedAgentOfficeId] = useState<string>('printing');

  const getAuthHeaders = () => {
    const token = authToken || localStorage.getItem('univ_auth_token') || sessionStorage.getItem('univ_auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };

  // Audio synthesizer for urgent tasks
  const playNotificationSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch {
      // AudioContext not allowed without gesture
    }
  };

  // Check existing session on load
  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('univ_auth_token') || sessionStorage.getItem('univ_auth_token');
      if (savedToken) {
        try {
          const res = await fetch(`${API_BASE}/auth/me`, {
            headers: { 'Authorization': `Bearer ${savedToken}` }
          });
          if (res.ok) {
            const user: AuthUser = await res.json();
            setAuthToken(savedToken);
            setCurrentUser(user);
            setUserRole(user.role);
            setIsAuthenticated(true);
            if (user.officeId) {
              setSelectedAgentOfficeId(user.officeId);
            }
            if (user.role === 'office_manager') {
              setCurrentView('agent');
            } else if (user.role === 'it_admin') {
              setCurrentView('director');
              setDirectorTab('it_health');
            }
            return;
          }
        } catch {
          // fallback
        }
      }
      setAuthToken(null);
      setCurrentUser(null);
      setIsAuthenticated(false);
    };

    checkAuth();
  }, []);

  // Fetch initial data from REST API
  const refreshData = async () => {
    const token = authToken || localStorage.getItem('univ_auth_token') || sessionStorage.getItem('univ_auth_token');
    if (!token) return;

    const headers = getAuthHeaders();
    try {
      const [statsRes, officesRes, tasksRes, annRes, auditRes, screensRes] = await Promise.all([
        fetch(`${API_BASE}/stats`, { headers }).then(r => r.ok ? r.json() : null),
        fetch(`${API_BASE}/offices`, { headers }).then(r => r.ok ? r.json() : []),
        fetch(`${API_BASE}/tasks`, { headers }).then(r => r.ok ? r.json() : []),
        fetch(`${API_BASE}/announcements`, { headers }).then(r => r.ok ? r.json() : []),
        fetch(`${API_BASE}/audit-logs`, { headers }).then(r => r.ok ? r.json() : []),
        fetch(`${API_BASE}/screen-sessions`, { headers }).then(r => r.ok ? r.json() : {})
      ]);

      if (statsRes) setStats(statsRes);
      if (Array.isArray(officesRes)) setOffices(officesRes);
      if (Array.isArray(tasksRes)) setTasks(tasksRes);
      if (Array.isArray(annRes)) setAnnouncements(annRes);
      if (Array.isArray(auditRes)) setAuditLogs(auditRes);
      if (screensRes && typeof screensRes === 'object') setActiveScreenSessions(screensRes as Record<string, ScreenSession>);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  };

  // Fetch messages for active office
  const refreshMessages = async (officeId: string) => {
    const token = authToken || localStorage.getItem('univ_auth_token') || sessionStorage.getItem('univ_auth_token');
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/messages/${officeId}`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const msgs = await res.json();
        setMessages(msgs);
      }
    } catch (e) {
      console.error('Failed to fetch messages:', e);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    }
  }, [isAuthenticated, authToken]);

  useEffect(() => {
    if (selectedAgentOfficeId && isAuthenticated) {
      refreshMessages(selectedAgentOfficeId);
    }
  }, [selectedAgentOfficeId, isAuthenticated]);

  // WebSocket Connection Lifecycle
  useEffect(() => {
    let ws: WebSocket;
    let reconnectTimeout: any;

    const connect = () => {
      ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onclose = () => {
        setIsConnected(false);
        reconnectTimeout = setTimeout(connect, 3000);
      };

      ws.onerror = () => {
        setIsConnected(false);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const { type, payload } = data;

          if (type === 'TASK_CREATED') {
            setTasks(prev => [payload, ...prev]);
            playNotificationSound();
            refreshData();
          } else if (type === 'TASK_UPDATED') {
            setTasks(prev => prev.map(t => t.id === payload.id ? payload : t));
            refreshData();
          } else if (type === 'NEW_ANNOUNCEMENT') {
            setAnnouncements(prev => [payload, ...prev]);
            playNotificationSound();
            refreshData();
          } else if (type === 'NEW_MESSAGE') {
            setMessages(prev => [...prev, payload]);
            refreshData();
          } else if (type === 'OFFICE_ADDED') {
            setOffices(prev => [...prev, payload]);
            refreshData();
          } else if (type === 'SCREEN_SESSION_STARTED') {
            setActiveScreenSessions(prev => ({ ...prev, [payload.officeId]: payload }));
            refreshData();
          } else if (type === 'SCREEN_SESSION_ENDED') {
            setActiveScreenSessions(prev => {
              const updated = { ...prev };
              delete updated[payload.officeId];
              return updated;
            });
            if (activeViewingOffice?.id === payload.officeId) {
              setActiveViewingOffice(null);
              setActiveViewingTask(null);
            }
            refreshData();
          }
        } catch (e) {
          console.error('WS Error:', e);
        }
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      if (wsRef.current) wsRef.current.close();
    };
  }, [activeViewingOffice]);

  // Handler: Create Task
  const handleCreateTask = async (taskData: any) => {
    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(taskData)
      });
      if (res.ok) {
        refreshData();
      }
    } catch (e) {
      console.error('Error creating task:', e);
    }
  };

  // Handler: Update Task Status
  const handleUpdateTaskStatus = async (taskId: string, status: TaskStatus, note?: string) => {
    try {
      const res = await fetch(`${API_BASE}/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, note })
      });
      if (res.ok) {
        refreshData();
      }
    } catch (e) {
      console.error('Error updating task:', e);
    }
  };

  // Handler: Broadcast Announcement
  const handleBroadcastAnnouncement = async (title: string, content: string, targetOffices?: string[]) => {
    try {
      const res = await fetch(`${API_BASE}/announcements`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ title, content, targetOffices })
      });
      if (res.ok) {
        refreshData();
      }
    } catch (e) {
      console.error('Error broadcasting announcement:', e);
    }
  };

  // Handler: Send Message
  const handleSendMessage = async (officeId: string, content: string) => {
    try {
      const res = await fetch(`${API_BASE}/messages`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ officeId, content })
      });
      if (res.ok) {
        refreshMessages(officeId);
      }
    } catch (e) {
      console.error('Error sending message:', e);
    }
  };

  // Handler: Register New Office
  const handleAddOffice = async (officeData: any) => {
    try {
      const res = await fetch(`${API_BASE}/offices`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(officeData)
      });
      if (res.ok) {
        refreshData();
      }
    } catch (e) {
      console.error('Error adding office:', e);
    }
  };

  // Handler: Start Screen View
  const handleStartScreenView = async (officeId: string, taskId?: string) => {
    const targetOffice = offices.find(o => o.id === officeId);
    if (!targetOffice) return;

    try {
      const res = await fetch(`${API_BASE}/screen/start`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ officeId, taskId })
      });
      if (res.ok) {
        setActiveViewingOffice(targetOffice);
        if (taskId) {
          const task = tasks.find(t => t.id === taskId);
          setActiveViewingTask(task || null);
        } else {
          setActiveViewingTask(null);
        }
        refreshData();
      }
    } catch (e) {
      console.error('Error starting screen session:', e);
    }
  };

  // Handler: Stop Screen View
  const handleCloseScreenView = async (officeId: string) => {
    try {
      await fetch(`${API_BASE}/screen/stop`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ officeId })
      });
      setActiveViewingOffice(null);
      setActiveViewingTask(null);
      refreshData();
    } catch (e) {
      console.error('Error stopping screen session:', e);
    }
  };

  const handleLogin = (user: AuthUser, token: string) => {
    setAuthToken(token);
    setCurrentUser(user);
    setUserRole(user.role);
    setIsAuthenticated(true);
    if (user.officeId) {
      setSelectedAgentOfficeId(user.officeId);
    }
    if (user.role === 'office_manager') {
      setCurrentView('agent');
    } else if (user.role === 'it_admin') {
      setCurrentView('director');
      setDirectorTab('it_health');
    } else {
      setCurrentView('director');
      setDirectorTab('dashboard');
    }
  };

  const handleLogout = async () => {
    try {
      const token = authToken || localStorage.getItem('univ_auth_token') || sessionStorage.getItem('univ_auth_token');
      if (token) {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: getAuthHeaders()
        });
      }
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('univ_auth_token');
      localStorage.removeItem('univ_auth_user');
      sessionStorage.removeItem('univ_auth_token');
      sessionStorage.removeItem('univ_auth_user');
      setAuthToken(null);
      setCurrentUser(null);
      setIsAuthenticated(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <LoginPage 
        onLogin={handleLogin} 
        language={language} 
        onLanguageChange={setLanguage} 
      />
    );
  }

  const activeOffice = offices.find(o => o.id === selectedAgentOfficeId);

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      backgroundColor: '#080E1E'
    }}>
      {/* ── LEFT INSTITUTIONAL SIDEBAR (for Director & Admin views) ── */}
      {currentView === 'director' && (
        <Sidebar
          activeTab={directorTab}
          onTabChange={setDirectorTab}
          unreadMessagesCount={stats.unreadMessages}
          pendingTasksCount={stats.pendingTasks}
          activeScreenSessionsCount={Object.keys(activeScreenSessions).length}
          userRole={userRole}
          onLogout={handleLogout}
          officeName={activeOffice?.name}
        />
      )}

      {/* ── RIGHT MAIN WORKSPACE ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        minWidth: 0
      }}>
        {/* Top Navbar */}
        <Navbar
          currentView={currentView}
          setCurrentView={setCurrentView}
          isConnected={isConnected}
          activeScreenSessionsCount={Object.keys(activeScreenSessions).length}
          unreadCount={stats.unreadMessages}
          onLogout={handleLogout}
          userRole={userRole}
          officeName={activeOffice?.name}
        />

        {/* Scrollable Main Content */}
        <main style={{
          flex: 1,
          overflowY: 'auto',
          padding: currentView === 'split' ? '20px' : '24px 30px',
          backgroundColor: '#F8FAFC',
          color: '#0F172A'
        }}>
          {/* VIEW 1: DIRECTOR CONTROL CENTER */}
          {currentView === 'director' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              {/* Tab Contents */}
              {directorTab === 'dashboard' && (
                <DashboardOverview
                  stats={stats}
                  offices={offices}
                  tasks={tasks}
                  auditLogs={auditLogs}
                  announcements={announcements}
                  onOpenCreateTask={(officeId) => {
                    setCreateTaskOfficeId(officeId);
                    setIsCreateTaskOpen(true);
                  }}
                  onOpenAnnouncement={() => setDirectorTab('announcements')}
                  onStartScreenView={handleStartScreenView}
                  onSelectOffice={(id) => {
                    setSelectedAgentOfficeId(id);
                    setDirectorTab('offices');
                  }}
                  onNavigateTab={setDirectorTab}
                />
              )}

              {directorTab === 'offices' && (
                <OfficeDirectory
                  offices={offices}
                  onOpenCreateTask={(officeId) => {
                    setCreateTaskOfficeId(officeId);
                    setIsCreateTaskOpen(true);
                  }}
                  onStartScreenView={handleStartScreenView}
                  onSelectOffice={(id) => setSelectedAgentOfficeId(id)}
                  onAddOffice={handleAddOffice}
                />
              )}

              {directorTab === 'tasks' && (
                <TaskManager
                  tasks={tasks}
                  offices={offices}
                  onOpenCreateTask={(officeId) => {
                    setCreateTaskOfficeId(officeId);
                    setIsCreateTaskOpen(true);
                  }}
                  onUpdateTaskStatus={handleUpdateTaskStatus}
                  onStartScreenView={handleStartScreenView}
                />
              )}

              {directorTab === 'messages' && (
                <MessagesCenter
                  offices={offices}
                  selectedOfficeId={selectedAgentOfficeId}
                  onSelectOffice={(id) => {
                    setSelectedAgentOfficeId(id);
                    refreshMessages(id);
                  }}
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  onOpenCreateTask={(officeId) => {
                    setCreateTaskOfficeId(officeId);
                    setIsCreateTaskOpen(true);
                  }}
                  onStartScreenView={handleStartScreenView}
                />
              )}

              {directorTab === 'announcements' && (
                <AnnouncementsView
                  announcements={announcements}
                  offices={offices}
                  onBroadcastAnnouncement={handleBroadcastAnnouncement}
                />
              )}

              {directorTab === 'devices' && (
                <DeviceManagement offices={offices} />
              )}

              {directorTab === 'reports' && (
                <ReportsAnalyticsView
                  offices={offices}
                  tasks={tasks}
                  stats={stats}
                />
              )}

              {directorTab === 'audit' && (
                <AuditLogsView auditLogs={auditLogs} />
              )}

              {directorTab === 'it_health' && (
                <ITAdminView
                  offices={offices}
                  stats={stats}
                  isConnected={isConnected}
                />
              )}
            </div>
          )}

        {/* VIEW 2: OFFICE DESKTOP AGENT (FULL SCREEN) */}
        {currentView === 'agent' && (
          <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
            <DesktopAgentSimulator
              offices={offices}
              selectedOfficeId={selectedAgentOfficeId}
              onSelectOffice={setSelectedAgentOfficeId}
              tasks={tasks}
              announcements={announcements}
              messages={messages}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              onSendMessage={handleSendMessage}
              isScreenActive={Boolean(activeScreenSessions[selectedAgentOfficeId])}
              userRole={userRole}
            />
          </div>
        )}

        {/* VIEW 3: SPLIT SYNCHRONIZED DEMO (DUAL REAL-TIME VIEW) */}
        {currentView === 'split' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Left Column: University Control Center */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{
                background: 'rgba(30, 58, 138, 0.3)',
                padding: '10px 16px',
                borderRadius: '10px',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building2 size={18} color="#60a5fa" />
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff' }}>
                    Central University Control Center (لوحة تحكم الإدارة)
                  </span>
                </div>
                <button
                  onClick={() => {
                    setCreateTaskOfficeId(selectedAgentOfficeId);
                    setIsCreateTaskOpen(true);
                  }}
                  className="btn-primary"
                  style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                >
                  <PlusCircle size={14} />
                  <span>Send Task to {offices.find(o => o.id === selectedAgentOfficeId)?.name}</span>
                </button>
              </div>

              <TaskManager
                tasks={tasks}
                offices={offices}
                onOpenCreateTask={(officeId) => {
                  setCreateTaskOfficeId(officeId || selectedAgentOfficeId);
                  setIsCreateTaskOpen(true);
                }}
                onUpdateTaskStatus={handleUpdateTaskStatus}
                onStartScreenView={handleStartScreenView}
              />
            </div>

            {/* Right Column: Office Desktop Agent */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{
                background: 'rgba(5, 150, 105, 0.25)',
                padding: '10px 16px',
                borderRadius: '10px',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Monitor size={18} color="#34d399" />
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff' }}>
                    Office Desktop Agent View (شاشة مكتب: {offices.find(o => o.id === selectedAgentOfficeId)?.name})
                  </span>
                </div>
                <span className="badge badge-online">Live Socket Linked</span>
              </div>

              <DesktopAgentSimulator
                offices={offices}
                selectedOfficeId={selectedAgentOfficeId}
                onSelectOffice={setSelectedAgentOfficeId}
                tasks={tasks}
                announcements={announcements}
                messages={messages}
                onUpdateTaskStatus={handleUpdateTaskStatus}
                onSendMessage={handleSendMessage}
                isScreenActive={Boolean(activeScreenSessions[selectedAgentOfficeId])}
                userRole={userRole}
              />
            </div>
          </div>
        )}
      </main>
      </div>

      {/* Modals */}
      {isCreateTaskOpen && (
        <CreateTaskModal
          offices={offices}
          initialOfficeId={createTaskOfficeId}
          onClose={() => setIsCreateTaskOpen(false)}
          onCreateTask={handleCreateTask}
        />
      )}

      {activeViewingOffice && (
        <LiveScreenModal
          office={activeViewingOffice}
          associatedTask={activeViewingTask}
          onClose={() => handleCloseScreenView(activeViewingOffice.id)}
        />
      )}
    </div>
  );
}

export default App;
