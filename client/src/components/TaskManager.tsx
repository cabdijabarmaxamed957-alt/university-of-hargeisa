import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  PlusCircle, 
  Eye, 
  Filter, 
  FileText, 
  Check, 
  ChevronDown, 
  User, 
  Building2,
  Paperclip
} from 'lucide-react';
import { Task, Office, TaskStatus, TaskPriority } from '../types';

interface TaskManagerProps {
  tasks: Task[];
  offices: Office[];
  onOpenCreateTask: (officeId?: string) => void;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus, note?: string) => void;
  onStartScreenView: (officeId: string, taskId?: string) => void;
}

export const TaskManager: React.FC<TaskManagerProps> = ({
  tasks,
  offices,
  onOpenCreateTask,
  onUpdateTaskStatus,
  onStartScreenView
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [officeFilter, setOfficeFilter] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(tasks[0] || null);

  const filteredTasks = tasks.filter(t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (officeFilter !== 'all' && t.officeId !== officeFilter) return false;
    return true;
  });

  const getStepStatus = (currentStatus: TaskStatus, stepIndex: number) => {
    const order: TaskStatus[] = ['new', 'received', 'accepted', 'in_progress', 'completed', 'verified'];
    const currentIndex = order.indexOf(currentStatus);
    if (currentIndex > stepIndex) return 'completed';
    if (currentIndex === stepIndex) return 'current';
    return 'pending';
  };

  const steps = [
    { key: 'new', label: '1. New Request', labelAr: 'إنشاء التكليف' },
    { key: 'received', label: '2. Received', labelAr: 'تم الاستلام' },
    { key: 'accepted', label: '3. Accepted', labelAr: 'قبول العمل' },
    { key: 'in_progress', label: '4. In Progress', labelAr: 'قيد التنفيذ' },
    { key: 'completed', label: '5. Completed', labelAr: 'تأكيد الإنجاز' },
    { key: 'verified', label: '6. Verified', labelAr: 'التحقق الإداري' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header & Filters */}
      <div className="glass-panel" style={{ padding: '18px 24px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 4px' }}>
            Task Operations & Lifecycle Management
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
            إدارة وتتبع دورة حياة المهام الإدارية والتشغيلية عبر كافة مكاتب الجامعة لحظياً
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onOpenCreateTask()}
          className="btn-primary"
          style={{ padding: '9px 18px' }}
        >
          <PlusCircle size={16} />
          <span>Dispatch New Task (إرسال تكليف)</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#94a3b8' }}>
          <Filter size={14} />
          <span>Filters:</span>
        </div>

        {/* Office filter */}
        <select
          value={officeFilter}
          onChange={e => setOfficeFilter(e.target.value)}
          style={{ fontSize: '0.8rem', padding: '6px 12px' }}
        >
          <option value="all">All Offices (كافة المكاتب)</option>
          {offices.map(o => (
            <option key={o.id} value={o.id}>{o.name}</option>
          ))}
        </select>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ fontSize: '0.8rem', padding: '6px 12px' }}
        >
          <option value="all">All Statuses (كافة الحالات)</option>
          <option value="new">New</option>
          <option value="received">Received</option>
          <option value="accepted">Accepted</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="verified">Verified</option>
        </select>

        {/* Priority filter */}
        <select
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value)}
          style={{ fontSize: '0.8rem', padding: '6px 12px' }}
        >
          <option value="all">All Priorities (كل الأولويات)</option>
          <option value="urgent">Urgent (عاجل جداً)</option>
          <option value="important">Important (هام)</option>
          <option value="normal">Normal (عادي)</option>
        </select>

        <span style={{ fontSize: '0.78rem', color: '#64748b', marginLeft: 'auto' }}>
          Showing {filteredTasks.length} tasks
        </span>
      </div>

      {/* Dual Panel: Task List (Left 50%) & Selected Task Lifecycle Detail (Right 50%) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '20px' }}>
        {/* Left: Task Cards List */}
        <div style={{ gridColumn: 'span 5', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredTasks.length === 0 ? (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
              No tasks match the selected filters.
            </div>
          ) : (
            filteredTasks.map(task => {
              const isSelected = selectedTask?.id === task.id;
              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="glass-card-interactive"
                  style={{
                    padding: '16px',
                    borderColor: isSelected ? 'rgba(59, 130, 246, 0.7)' : 'rgba(255, 255, 255, 0.08)',
                    background: isSelected ? 'rgba(30, 58, 138, 0.25)' : 'var(--bg-card)',
                    borderLeft: task.priority === 'urgent' ? '4px solid #ef4444' : task.priority === 'important' ? '4px solid #f59e0b' : '4px solid #3b82f6'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>
                        #{task.id}
                      </span>
                      <span className={`badge badge-${task.priority}`}>
                        {task.priority}
                      </span>
                    </div>
                    <span className={`badge badge-${task.status}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 4px' }}>
                    {task.title}
                  </h4>

                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Building2 size={13} color="#60a5fa" />
                    <span>Target: <strong style={{ color: '#e2e8f0' }}>{task.officeName}</strong> ({task.manager})</span>
                  </div>

                  {task.attachment && (
                    <div style={{ fontSize: '0.72rem', color: '#38bdf8', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FileText size={12} />
                      <span>{task.attachment.name}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right: Selected Task Comprehensive Lifecycle Stepper & Actions */}
        <div style={{ gridColumn: 'span 7' }}>
          {selectedTask ? (
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Task Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#60a5fa' }}>
                      TASK #{selectedTask.id}
                    </span>
                    <span className={`badge badge-${selectedTask.priority}`}>
                      {selectedTask.priority}
                    </span>
                    <span className={`badge badge-${selectedTask.status}`}>
                      {selectedTask.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', margin: '0 0 6px' }}>
                    {selectedTask.title}
                  </h3>
                  <p style={{ fontSize: '0.86rem', color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
                    {selectedTask.description}
                  </p>
                </div>

                {/* Live Screen button for this task */}
                <button
                  onClick={() => onStartScreenView(selectedTask.officeId, selectedTask.id)}
                  className="btn-secondary"
                  style={{ padding: '8px 14px', fontSize: '0.8rem', gap: '6px', whiteSpace: 'nowrap' }}
                >
                  <Eye size={15} color="#38bdf8" />
                  <span>View Office Screen</span>
                </button>
              </div>

              {/* Target Office Card */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '12px 16px',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Assigned Responsible Office</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                    {selectedTask.officeName}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                    Responsible Manager: <strong>{selectedTask.manager}</strong>
                  </div>
                </div>

                {selectedTask.attachment && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Attached File</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FileText size={14} />
                      <span>{selectedTask.attachment.name}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 6-Stage Task Lifecycle Visual Stepper (Matches Section 6 & Infographic 3) */}
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc', marginBottom: '16px' }}>
                  Operational State Machine (دورة حياة المهمة)
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
                  {steps.map((step, idx) => {
                    const stepState = getStepStatus(selectedTask.status, idx);
                    const isCompleted = stepState === 'completed';
                    const isCurrent = stepState === 'current';

                    return (
                      <div
                        key={step.key}
                        style={{
                          background: isCurrent ? 'rgba(37, 99, 235, 0.25)' : isCompleted ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                          border: isCurrent ? '2px solid #3b82f6' : isCompleted ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '10px',
                          padding: '10px 8px',
                          textAlign: 'center',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: isCurrent ? '#2563eb' : isCompleted ? '#10b981' : 'rgba(255, 255, 255, 0.1)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.72rem',
                          fontWeight: 700
                        }}>
                          {isCompleted ? <Check size={14} /> : idx + 1}
                        </div>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: isCurrent ? '#93c5fd' : isCompleted ? '#34d399' : '#64748b' }}>
                          {step.label}
                        </span>
                        <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                          {step.labelAr}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Task Timeline Feed */}
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc', marginBottom: '12px' }}>
                  Execution Timeline & Audit History
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedTask.timeline.map((entry, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '10px 14px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.8rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className={`badge badge-${entry.status}`}>
                          {entry.status}
                        </span>
                        <span style={{ color: '#e2e8f0' }}>{entry.note}</span>
                        <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>— By {entry.by}</span>
                      </div>
                      <span style={{ color: '#64748b', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                        {entry.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Director Verification Action */}
              {selectedTask.status === 'completed' && (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  padding: '14px 18px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#34d399' }}>
                      Task Completed by Office Manager ({selectedTask.manager})
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                      The office has confirmed completion. You can now verify and close the task record.
                    </div>
                  </div>
                  <button
                    onClick={() => onUpdateTaskStatus(selectedTask.id, 'verified', 'Verified and approved by University Director')}
                    className="btn-success"
                    style={{ padding: '8px 18px' }}
                  >
                    <CheckCircle2 size={16} />
                    <span>Verify Task (اعتماد الإنجاز)</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
              Select a task from the list to view its complete operational lifecycle.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
