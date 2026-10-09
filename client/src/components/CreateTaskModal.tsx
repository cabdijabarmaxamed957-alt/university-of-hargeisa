import React, { useState } from 'react';
import { 
  PlusCircle, 
  X, 
  Building2, 
  AlertTriangle, 
  Paperclip, 
  FileText,
  Send,
  CheckCircle2
} from 'lucide-react';
import { Office, TaskPriority } from '../types';

interface CreateTaskModalProps {
  offices: Office[];
  initialOfficeId?: string;
  onClose: () => void;
  onCreateTask: (taskData: any) => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  offices,
  initialOfficeId,
  onClose,
  onCreateTask
}) => {
  const [selectedOfficeId, setSelectedOfficeId] = useState<string>(initialOfficeId || offices[0]?.id || 'printing');
  const [title, setTitle] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('normal');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedAttachment, setUploadedAttachment] = useState<any | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const selectedOffice = offices.find(o => o.id === selectedOfficeId) || offices[0];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setIsUploading(true);

    try {
      const token = localStorage.getItem('univ_auth_token') || sessionStorage.getItem('univ_auth_token');
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('http://localhost:4000/api/upload', {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setUploadedAttachment(data);
      } else {
        alert('File upload failed.');
      }
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedOfficeId) return;

    onCreateTask({
      title: title.trim(),
      titleAr: titleAr.trim() || title.trim(),
      description: description.trim(),
      officeId: selectedOfficeId,
      priority,
      attachment: uploadedAttachment || (selectedFile ? {
        name: selectedFile.name,
        size: `${(selectedFile.size / 1024).toFixed(1)} KB`
      } : null)
    });

    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ padding: '24px', maxWidth: '580px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(37, 99, 235, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(37, 99, 235, 0.4)'
            }}>
              <PlusCircle size={20} color="#3b82f6" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                Dispatch Operational Task (إرسال تكليف إداري)
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                توجيه المهمة تلقائياً إلى مدير المكتب المسؤول مع إشعار فوري وتتبع مرحلي
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Target Office Selection */}
          <div>
            <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
              Target University Office (المكتب المستهدف)
            </label>
            <select
              value={selectedOfficeId}
              onChange={e => setSelectedOfficeId(e.target.value)}
              style={{ width: '100%', fontSize: '0.88rem', fontWeight: 600, color: '#38bdf8' }}
            >
              {offices.map(o => (
                <option key={o.id} value={o.id}>
                  {o.name} ({o.nameAr}) — Manager: {o.manager}
                </option>
              ))}
            </select>
            {selectedOffice && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '8px 12px',
                borderRadius: '6px',
                marginTop: '6px',
                fontSize: '0.75rem',
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span>Responsible Person: <strong style={{ color: '#f8fafc' }}>{selectedOffice.manager}</strong></span>
                <span className={`badge ${selectedOffice.status === 'online' ? 'badge-online' : 'badge-offline'}`}>
                  {selectedOffice.status}
                </span>
              </div>
            )}
          </div>

          {/* Task Title */}
          <div>
            <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
              Task Subject (موضوع التكليف)
            </label>
            <input
              type="text"
              placeholder="e.g. Print 10 copies of the attached honor certificates..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{ width: '100%' }}
              required
            />
          </div>

          {/* Task Description */}
          <div>
            <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
              Detailed Instructions (تفاصيل ومحددات العمل)
            </label>
            <textarea
              rows={3}
              placeholder="Specify requirements, paper types, deadlines, or procedural instructions..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={{ width: '100%', resize: 'vertical' }}
              required
            />
          </div>

          {/* Priority & Attachment */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {/* Priority */}
            <div>
              <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                Priority Level (درجة الأهمية)
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as TaskPriority)}
                style={{ width: '100%' }}
              >
                <option value="normal">Normal (عادي)</option>
                <option value="important">Important (هام)</option>
                <option value="urgent">Urgent (عاجل جداً - إشعار صوتي)</option>
              </select>
            </div>

            {/* Attachments */}
            <div>
              <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                Attach Document (إرفاق مستند حقيقي)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label className="btn-secondary" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  padding: '8px 12px',
                  fontSize: '0.78rem',
                  width: '100%',
                  justifyContent: 'center'
                }}>
                  <Paperclip size={14} />
                  <span>{isUploading ? 'جاري الرفع...' : (uploadedAttachment ? uploadedAttachment.name : selectedFile ? selectedFile.name : 'Select File (اختر ملف)')}</span>
                  <input
                    type="file"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.csv,.zip"
                  />
                </label>
              </div>
              {uploadedAttachment && (
                <div style={{ fontSize: '0.72rem', color: '#34d399', marginTop: '4px', fontWeight: 600 }}>
                  ✓ تم الرفع بنجاح ({uploadedAttachment.size})
                </div>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '14px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ padding: '9px 20px' }}>
              <Send size={15} />
              <span>Dispatch Immediately (إرسال الآن)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
