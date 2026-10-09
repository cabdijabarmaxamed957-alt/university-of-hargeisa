import React, { useState } from 'react';
import { 
  Megaphone, 
  Send, 
  CheckCircle2, 
  Clock, 
  Building2, 
  Users, 
  AlertCircle 
} from 'lucide-react';
import { Announcement, Office } from '../types';

interface AnnouncementsViewProps {
  announcements: Announcement[];
  offices: Office[];
  onBroadcastAnnouncement: (title: string, content: string, targetOffices?: string[]) => void;
}

export const AnnouncementsView: React.FC<AnnouncementsViewProps> = ({
  announcements,
  offices,
  onBroadcastAnnouncement
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetType, setTargetType] = useState<'all' | 'specific'>('all');
  const [selectedOffices, setSelectedOffices] = useState<string[]>([]);
  const [isComposing, setIsComposing] = useState(false);

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const targets = targetType === 'all' ? undefined : selectedOffices;
    onBroadcastAnnouncement(title.trim(), content.trim(), targets);
    setTitle('');
    setContent('');
    setTargetType('all');
    setSelectedOffices([]);
    setIsComposing(false);
  };

  const toggleOfficeSelection = (officeId: string) => {
    setSelectedOffices(prev => 
      prev.includes(officeId) 
        ? prev.filter(id => id !== officeId)
        : [...prev, officeId]
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Megaphone size={20} color="#38bdf8" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              University-Wide Broadcasts (التعميم الجامعي الموحد)
            </h2>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0 }}>
            إرسال إعلانات وتوجيهات لكافة مكاتب وإدارات الجامعة أو لمكاتب محددة مع تأكيد الاستلام اللحظي
          </p>
        </div>

        <button
          onClick={() => setIsComposing(true)}
          className="btn-primary"
          style={{ padding: '9px 18px' }}
        >
          <Send size={16} />
          <span>New Broadcast (إرسال تعميم جديد)</span>
        </button>
      </div>

      {/* Composer Modal */}
      {isComposing && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: '24px', maxWidth: '580px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
              Broadcast Official Announcement (إصدار تعميم إداري)
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '18px' }}>
              حدد نطاق الاستهداف ومحتوى التعميم ليتم إرساله فورا عبر قنوات الشبكة المشفرة.
            </p>

            <form onSubmit={handleBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Target Selection */}
              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                  Target Audience (نطاق الاستهداف)
                </label>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#f8fafc', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="targetType"
                      checked={targetType === 'all'}
                      onChange={() => setTargetType('all')}
                    />
                    <span>All Offices (كافة مكاتب الجامعة)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#f8fafc', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="targetType"
                      checked={targetType === 'specific'}
                      onChange={() => setTargetType('specific')}
                    />
                    <span>Target Specific Offices (تحديد مكاتب معينة)</span>
                  </label>
                </div>

                {targetType === 'specific' && (
                  <div style={{
                    maxHeight: '130px',
                    overflowY: 'auto',
                    backgroundColor: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    {offices.map(o => (
                      <label key={o.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#cbd5e1', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={selectedOffices.includes(o.id)}
                          onChange={() => toggleOfficeSelection(o.id)}
                        />
                        <span>{o.name} ({o.nameAr})</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                  Announcement Subject (عنوان التعميم)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Urgent Administrative Meeting at 10:00 AM..."
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                  Official Announcement Body (نص التعميم)
                </label>
                <textarea
                  rows={4}
                  placeholder="Enter details of meeting, institutional decisions, or emergency guidelines..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  style={{ width: '100%', resize: 'vertical' }}
                  required
                />
              </div>

              <div style={{
                background: 'rgba(37, 99, 235, 0.1)',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                fontSize: '0.78rem',
                color: '#93c5fd'
              }}>
                Target: <strong>{targetType === 'all' ? `All ${offices.length} University Offices` : `${selectedOffices.length} Selected Offices`}</strong> • Priority: Instant Broadcast Notification
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsComposing(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Send size={15} />
                  <span>Broadcast Now</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Announcements List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {announcements.map(ann => (
          <div key={ann.id} className="glass-panel" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <span className="badge badge-urgent">
                    OFFICIAL BROADCAST
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    #{ann.id}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {new Date(ann.createdAt).toLocaleString()}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 6px' }}>
                  {ann.title}
                </h3>
              </div>

              <div style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '6px 14px',
                borderRadius: '8px',
                textAlign: 'right'
              }}>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Delivered Offices</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#34d399' }}>
                  {ann.deliveredCount} / {ann.totalOffices}
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '18px' }}>
              {ann.content}
            </p>

            {/* Delivery receipts breakdown */}
            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '14px' }}>
              <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '10px' }}>
                Delivery Confirmation By Office (تأكيد الاستلام بالمكاتب):
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '8px' }}>
                {ann.deliveries?.map((del, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.76rem',
                      border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    <span style={{ color: '#e2e8f0', fontWeight: 600 }}>
                      {del.officeName || del.officeId}
                    </span>
                    <span style={{
                      color: del.status === 'read' || del.status === 'received' ? '#34d399' : '#f87171',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <CheckCircle2 size={12} />
                      {del.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
