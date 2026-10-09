import React, { useState } from 'react';
import { 
  Monitor, 
  CheckCircle2, 
  Play, 
  Check, 
  FileText, 
  Send, 
  Radio, 
  ShieldAlert, 
  Building2, 
  Clock, 
  Download, 
  Volume2,
  AlertCircle,
  Paperclip
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Office, Task, DirectMessage, Announcement } from '../types';

interface DesktopAgentSimulatorProps {
  offices: Office[];
  selectedOfficeId: string;
  onSelectOffice: (id: string) => void;
  tasks: Task[];
  announcements: Announcement[];
  messages: DirectMessage[];
  onUpdateTaskStatus: (taskId: string, status: Task['status'], note?: string) => void;
  onSendMessage: (officeId: string, content: string) => void;
  isScreenActive: boolean;
  userRole?: 'director' | 'office_manager' | 'it_admin';
}

export const DesktopAgentSimulator: React.FC<DesktopAgentSimulatorProps> = ({
  offices,
  selectedOfficeId,
  onSelectOffice,
  tasks,
  announcements,
  messages,
  onUpdateTaskStatus,
  onSendMessage,
  isScreenActive,
  userRole
}) => {
  const [chatInput, setChatInput] = useState('');
  const [activeTab, setActiveTab] = useState<'tasks' | 'messages' | 'announcements'>('tasks');

  const currentOffice = offices.find(o => o.id === selectedOfficeId) || offices[0];
  const officeTasks = tasks.filter(t => t.officeId === currentOffice?.id);
  const officeMessages = messages.filter(m => m.officeId === currentOffice?.id);

  const handleAction = (task: Task) => {
    if (task.status === 'received' || task.status === 'new') {
      onUpdateTaskStatus(task.id, 'accepted', `Accepted by ${currentOffice.manager}`);
    } else if (task.status === 'accepted') {
      onUpdateTaskStatus(task.id, 'in_progress', `Work begun by ${currentOffice.manager}`);
    } else if (task.status === 'in_progress') {
      // Trigger confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.7 }
        });
      } catch (e) {
        // fallback
      }
      onUpdateTaskStatus(task.id, 'completed', `Completed and ready for review by ${currentOffice.manager}`);
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !currentOffice) return;
    onSendMessage(currentOffice.id, chatInput.trim());
    setChatInput('');
  };

  if (!currentOffice) return null;

  return (
    <div style={{
      background: '#0a1329',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: '650px'
    }}>
      {/* Desktop App Window Titlebar */}
      <div style={{
        background: '#060d1f',
        padding: '10px 18px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        userSelect: 'none'
      }}>
        {/* Left: Window Dots & App Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Monitor size={16} color="#38bdf8" />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc' }}>
              University Office Agent — {currentOffice.name}
            </span>
            <span style={{
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              fontSize: '0.65rem',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: '6px',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              AGENT v2.4.1 CONNECTED
            </span>
          </div>
        </div>

        {/* Office Switcher — Locked when logged in as an Office Manager */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {userRole === 'office_manager' ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '6px',
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              fontSize: '0.75rem',
              color: '#93c5fd'
            }}>
              <span>🔒 Assigned Workstation: <strong>{currentOffice.name}</strong></span>
            </div>
          ) : (
            <>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Simulate Office:
              </label>
              <select
                value={selectedOfficeId}
                onChange={(e) => onSelectOffice(e.target.value)}
                style={{
                  padding: '4px 10px',
                  fontSize: '0.78rem',
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '6px',
                  color: '#38bdf8',
                  fontWeight: 600
                }}
              >
                {offices.map(o => (
                  <option key={o.id} value={o.id}>
                    {o.name} ({o.manager})
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
      </div>

      {/* Transparent Screen View Alert Banner (Mandatory when Director starts live view) */}
      {isScreenActive && (
        <div style={{
          background: 'linear-gradient(90deg, #991b1b, #b91c1c)',
          color: '#ffffff',
          padding: '10px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '2px solid #ef4444',
          animation: 'pulse-border 2s infinite'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Radio size={18} className="animate-spin" />
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>
                University Administration — Screen View Active
              </div>
              <div style={{ fontSize: '0.72rem', opacity: 0.9 }}>
                إدارة الجامعة تتابع شاشة هذا الجهاز الآن للتحقق الإداري الرسمي من سير العمل.
              </div>
            </div>
          </div>
          <span style={{
            background: 'rgba(0, 0, 0, 0.35)',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '0.72rem',
            fontFamily: 'monospace'
          }}>
            Encrypted Session
          </span>
        </div>
      )}

      {/* Office Manager Header Bar */}
      <div style={{
        background: 'rgba(15, 28, 58, 0.6)',
        padding: '14px 20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #0284c7, #0369a1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1rem',
            color: '#ffffff'
          }}>
            {currentOffice.manager.charAt(0)}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                {currentOffice.manager}
              </h2>
              <span className="badge badge-online">
                Online
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
              {currentOffice.name} • {currentOffice.location}
            </p>
          </div>
        </div>

        {/* Tab buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('tasks')}
            className={activeTab === 'tasks' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
          >
            Tasks ({officeTasks.length})
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={activeTab === 'messages' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
          >
            Direct Messages ({officeMessages.length})
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={activeTab === 'announcements' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
          >
            Announcements ({announcements.length})
          </button>
        </div>
      </div>

      {/* Main Agent Content Area */}
      <div style={{ flex: 1, padding: '18px', overflowY: 'auto' }}>
        {activeTab === 'tasks' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e2e8f0' }}>
                Operational Tasks Assigned to {currentOffice.name}
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Instant real-time sync with University Control Center
              </span>
            </div>

            {officeTasks.length === 0 ? (
              <div style={{
                padding: '40px 20px',
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '12px',
                border: '1px dashed rgba(255, 255, 255, 0.1)'
              }}>
                <CheckCircle2 size={36} color="#34d399" style={{ margin: '0 auto 10px' }} />
                <h4 style={{ fontSize: '0.9rem', color: '#f1f5f9', fontWeight: 600 }}>All Caught Up!</h4>
                <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>No pending tasks for {currentOffice.name} at this time.</p>
              </div>
            ) : (
              officeTasks.map(task => (
                <div
                  key={task.id}
                  style={{
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    transition: 'all 0.2s',
                    borderLeft: task.priority === 'urgent' ? '4px solid #ef4444' : task.priority === 'important' ? '4px solid #f59e0b' : '4px solid #3b82f6'
                  }}
                >
                  {/* Task Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>
                          #{task.id}
                        </span>
                        <span className={`badge badge-${task.priority}`}>
                          {task.priority}
                        </span>
                        <span className={`badge badge-${task.status}`}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 2px' }}>
                        {task.title}
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
                        {task.description}
                      </p>
                    </div>

                    {/* Action Button based on lifecycle */}
                    <div>
                      {task.status === 'received' && (
                        <button
                          onClick={() => handleAction(task)}
                          className="btn-primary"
                          style={{ fontSize: '0.8rem', padding: '7px 16px' }}
                        >
                          <Check size={14} />
                          <span>Accept Task (قبول المهمة)</span>
                        </button>
                      )}

                      {task.status === 'accepted' && (
                        <button
                          onClick={() => handleAction(task)}
                          className="btn-primary"
                          style={{
                            background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                            fontSize: '0.8rem',
                            padding: '7px 16px'
                          }}
                        >
                          <Play size={14} />
                          <span>Start Task (بدء العمل)</span>
                        </button>
                      )}

                      {task.status === 'in_progress' && (
                        <button
                          onClick={() => handleAction(task)}
                          className="btn-success"
                          style={{ fontSize: '0.8rem', padding: '7px 16px' }}
                        >
                          <CheckCircle2 size={14} />
                          <span>Complete (تأكيد الإنجاز)</span>
                        </button>
                      )}

                      {task.status === 'completed' && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: '#34d399',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          background: 'rgba(16, 185, 129, 0.1)',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: '1px solid rgba(16, 185, 129, 0.25)'
                        }}>
                          <CheckCircle2 size={16} />
                          <span>Waiting for Verification</span>
                        </div>
                      )}

                      {task.status === 'verified' && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: '#60a5fa',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          background: 'rgba(59, 130, 246, 0.1)',
                          padding: '6px 12px',
                          borderRadius: '8px'
                        }}>
                          <CheckCircle2 size={16} />
                          <span>Verified by Administration</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Attachment if present */}
                  {task.attachment && (
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      border: '1px solid rgba(255, 255, 255, 0.06)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={16} color="#38bdf8" />
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0' }}>
                          {task.attachment.name}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          ({task.attachment.size})
                        </span>
                      </div>
                      <button
                        className="btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '0.72rem', gap: '4px' }}
                        onClick={() => alert(`Simulating opening attachment: ${task.attachment?.name}`)}
                      >
                        <Download size={12} />
                        <span>Open Attachment</span>
                      </button>
                    </div>
                  )}

                  {/* Timeline mini track */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '0.72rem',
                    color: '#64748b',
                    paddingTop: '6px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} />
                      Created: {new Date(task.createdAt).toLocaleTimeString()}
                    </span>
                    <span>•</span>
                    <span>Last Update: {task.timeline[task.timeline.length - 1]?.note}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Direct Messages Tab */}
        {activeTab === 'messages' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '14px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
              {officeMessages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#64748b', fontSize: '0.82rem' }}>
                  No messages yet between University Administration and {currentOffice.name}.
                </div>
              ) : (
                officeMessages.map(msg => (
                  <div
                    key={msg.id}
                    style={{
                      alignSelf: msg.sender === 'office' ? 'flex-end' : 'flex-start',
                      maxWidth: '75%',
                      background: msg.sender === 'office' ? 'linear-gradient(135deg, #1d4ed8, #2563eb)' : '#1e293b',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '0.84rem',
                      lineHeight: 1.4
                    }}
                  >
                    <div style={{ fontSize: '0.7rem', opacity: 0.8, marginBottom: '2px', fontWeight: 600 }}>
                      {msg.senderName}
                    </div>
                    <div>{msg.content}</div>
                    <div style={{ fontSize: '0.65rem', opacity: 0.6, textAlign: 'right', marginTop: '4px' }}>
                      {new Date(msg.timestamp || msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChat} style={{ display: 'flex', gap: '10px', paddingTop: '10px' }}>
              <input
                type="text"
                placeholder={`Type a response to University Administration as ${currentOffice.manager}...`}
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn-primary" style={{ padding: '8px 18px' }}>
                <Send size={15} />
                <span>Send</span>
              </button>
            </form>
          </div>
        )}

        {/* Announcements Tab */}
        {activeTab === 'announcements' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e2e8f0' }}>
              University-Wide Official Broadcasts
            </h3>
            {announcements.map(ann => (
              <div
                key={ann.id}
                style={{
                  background: 'rgba(30, 41, 59, 0.7)',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="badge badge-urgent">ANNOUNCEMENT</span>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                      {ann.title}
                    </h4>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {new Date(ann.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <p style={{ fontSize: '0.84rem', color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
                  {ann.content}
                </p>
                <div style={{ fontSize: '0.72rem', color: '#60a5fa', fontWeight: 600, marginTop: '4px' }}>
                  Broadcast by: {ann.sentBy} • Delivered to all office terminals
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Agent Footer Hardware & Status */}
      <div style={{
        background: '#060d1f',
        padding: '8px 18px',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.72rem',
        color: '#64748b'
      }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <span>Device: <strong>{currentOffice.computers[0]?.name || 'Workstation-01'}</strong></span>
          <span>OS: <strong>{currentOffice.computers[0]?.os || 'Windows 11 Pro'}</strong></span>
          <span>IP: <strong>{currentOffice.computers[0]?.ip || '10.20.4.12'}</strong></span>
        </div>
        <div>
          <span>TLS 1.3 • Heartbeat: 1s • Service: Running</span>
        </div>
      </div>
    </div>
  );
};
