import React from 'react';
import { 
  Building2, 
  Wifi, 
  Clock, 
  MessageSquare, 
  Send, 
  PlusCircle, 
  FileBarChart, 
  Radio, 
  Eye, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { Office, Task, SystemStats, AuditLog, Announcement } from '../types';

interface DashboardOverviewProps {
  stats: SystemStats;
  offices: Office[];
  tasks: Task[];
  auditLogs: AuditLog[];
  announcements: Announcement[];
  onOpenCreateTask: (officeId?: string) => void;
  onOpenAnnouncement: () => void;
  onStartScreenView: (officeId: string, taskId?: string) => void;
  onSelectOffice: (officeId: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  stats,
  offices,
  tasks,
  auditLogs,
  announcements,
  onOpenCreateTask,
  onOpenAnnouncement,
  onStartScreenView,
  onSelectOffice,
  onNavigateTab
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Top Welcome & Institutional Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.45), rgba(15, 23, 42, 0.75))',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '16px',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{
              background: 'linear-gradient(135deg, #2563eb, #38bdf8)',
              color: '#ffffff',
              fontSize: '0.7rem',
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: '6px',
              textTransform: 'uppercase'
            }}>
              Executive Vision
            </span>
            <span style={{ fontSize: '0.8rem', color: '#93c5fd' }}>
              Central University Control Center
            </span>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 6px' }}>
            Operations & Office Communication Management
          </h2>
          <p style={{ fontSize: '0.86rem', color: '#cbd5e1', maxWidth: '780px', margin: 0, lineHeight: 1.5 }}>
            A unified digital platform to monitor all university offices and departments, dispatch tasks, track execution stages in real time, and enable authorized screen sharing for administrative verification.
          </p>
        </div>

        {/* Action Buttons in Banner */}
        <div style={{ display: 'flex', gap: '10px', zIndex: 2 }}>
          <button
            onClick={() => onOpenCreateTask()}
            className="btn-primary"
            style={{ padding: '9px 18px' }}
          >
            <PlusCircle size={16} />
            <span>Dispatch Task (إرسال مهمة)</span>
          </button>
          <button
            onClick={onOpenAnnouncement}
            className="btn-secondary"
            style={{ padding: '9px 18px', background: 'rgba(255, 255, 255, 0.08)' }}
          >
            <Send size={16} />
            <span>All Offices Announcement</span>
          </button>
        </div>

        {/* Ambient glow in background */}
        <div style={{
          position: 'absolute',
          right: '-50px',
          top: '-50px',
          width: '250px',
          height: '250px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.25) 0%, transparent 70%)',
          filter: 'blur(30px)',
          zIndex: 1
        }} />
      </div>

      {/* KPI Cards Row (Matches image 2 layout: 18 Offices, 16 Online, 7 Pending, 5 Unread) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '16px'
      }}>
        {/* Total Offices */}
        <div className="glass-panel" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(37, 99, 235, 0.15)',
            border: '1px solid rgba(37, 99, 235, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Building2 size={26} color="#3b82f6" />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>
              Total Offices
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc' }}>
              {stats.totalOffices}
            </div>
          </div>
        </div>

        {/* Online Offices */}
        <div className="glass-panel" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Wifi size={26} color="#10b981" />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>
              Online Offices
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399' }}>
                {stats.onlineOffices}
              </span>
              <div className="status-dot-pulse" />
            </div>
          </div>
        </div>

        {/* Pending & Active Tasks */}
        <div className="glass-panel" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Clock size={26} color="#f59e0b" />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>
              Active & Pending Tasks
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fbbf24' }}>
                {stats.pendingTasks + stats.activeTasks}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                ({stats.activeTasks} in progress)
              </span>
            </div>
          </div>
        </div>

        {/* Unread / Active Sessions */}
        <div className="glass-panel" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(147, 51, 234, 0.15)',
            border: '1px solid rgba(147, 51, 234, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <MessageSquare size={26} color="#c084fc" />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>
              Unread Messages & Comms
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc' }}>
              {stats.unreadMessages}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Office Status (Left 70%) & Recent Activity + Quick Actions (Right 30%) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gap: '20px'
      }}>
        {/* Left Column: Office Directory Status (8 cols) */}
        <div className="glass-panel" style={{ gridColumn: 'span 8', padding: '22px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '18px'
          }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', margin: '0 0 2px' }}>
                University Office Operational Directory
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>
                Connection status, managers and active tasks for each office
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('offices')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#60a5fa',
                fontSize: '0.8rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}
            >
              <span>View All Directory</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Office rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {offices.map(office => (
              <div
                key={office.id}
                className="glass-card-interactive"
                style={{
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '14px'
                }}
                onClick={() => onSelectOffice(office.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: office.status === 'online' ? 'rgba(37, 99, 235, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    color: office.status === 'online' ? '#60a5fa' : '#f87171'
                  }}>
                    <Building2 size={20} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff' }}>
                        {office.name}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                        ({office.nameAr})
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '2px' }}>
                      Manager: <strong style={{ color: '#f8fafc' }}>{office.manager}</strong> • {office.location}
                    </div>
                  </div>
                </div>

                {/* Right badges & actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Active tasks badge */}
                  {(office.activeTasks ?? 0) > 0 && (
                    <span className="badge badge-in_progress">
                      {office.activeTasks} Active
                    </span>
                  )}

                  {/* Pending tasks badge */}
                  {(office.pendingTasks ?? 0) > 0 && (
                    <span className="badge badge-important">
                      {office.pendingTasks} Pending
                    </span>
                  )}

                  {/* Status badge */}
                  <span className={`badge ${office.status === 'online' ? 'badge-online' : 'badge-offline'}`}>
                    {office.status === 'online' && <span className="status-dot-pulse" style={{ width: '6px', height: '6px' }} />}
                    {office.status}
                  </span>

                  {/* Live screen trigger button */}
                  {office.status === 'online' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartScreenView(office.id);
                      }}
                      className="btn-secondary"
                      style={{ padding: '6px 10px', fontSize: '0.75rem', gap: '6px' }}
                      title="Request Authorized Screen View"
                    >
                      <Eye size={13} color="#38bdf8" />
                      <span>Screen</span>
                    </button>
                  )}

                  {/* Dispatch task for this specific office */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenCreateTask(office.id);
                    }}
                    className="btn-primary"
                    style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                  >
                    <span>+ Task</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Recent Activity Timeline & Quick Actions (4 cols) */}
        <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Quick Actions Panel */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', marginBottom: '14px' }}>
              Quick Operations
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => onOpenCreateTask()}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 14px' }}
              >
                <PlusCircle size={16} />
                <span>Create New Task</span>
              </button>

              <button
                onClick={onOpenAnnouncement}
                className="btn-secondary"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 14px' }}
              >
                <Send size={16} color="#60a5fa" />
                <span>Send University Announcement</span>
              </button>

              <button
                onClick={() => onNavigateTab('reports')}
                className="btn-secondary"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 14px' }}
              >
                <FileBarChart size={16} color="#34d399" />
                <span>View Operational Reports</span>
              </button>
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="glass-panel" style={{ padding: '20px', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                Recent Activity History
              </h4>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Live Audit</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {auditLogs.slice(0, 6).map(log => (
                <div
                  key={log.id}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: log.severity === 'high' ? '#f87171' : '#38bdf8' }}>
                      {log.office}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                      {log.timestamp}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#e2e8f0', lineHeight: 1.3 }}>
                    {log.action}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                    By: {log.actor}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
