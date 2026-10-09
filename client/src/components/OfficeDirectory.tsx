import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  PlusCircle, 
  Monitor, 
  MapPin, 
  User, 
  Eye, 
  Send, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { Office } from '../types';

interface OfficeDirectoryProps {
  offices: Office[];
  onOpenCreateTask: (officeId: string) => void;
  onStartScreenView: (officeId: string) => void;
  onSelectOffice: (officeId: string) => void;
  onAddOffice: (officeData: any) => void;
}

export const OfficeDirectory: React.FC<OfficeDirectoryProps> = ({
  offices,
  onOpenCreateTask,
  onStartScreenView,
  onSelectOffice,
  onAddOffice
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isAddingOffice, setIsAddingOffice] = useState(false);

  // New office form state
  const [newOfficeName, setNewOfficeName] = useState('');
  const [newOfficeNameAr, setNewOfficeNameAr] = useState('');
  const [newManager, setNewManager] = useState('');
  const [newCategory, setNewCategory] = useState('Administrative');
  const [newLocation, setNewLocation] = useState('');

  const filteredOffices = offices.filter(o => {
    const matchSearch = o.name.toLowerCase().includes(search.toLowerCase()) || 
                        o.manager.toLowerCase().includes(search.toLowerCase()) ||
                        o.location.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === 'all' || o.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const categories = Array.from(new Set(offices.map(o => o.category)));

  const handleCreateOffice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOfficeName.trim() || !newManager.trim()) return;

    onAddOffice({
      name: newOfficeName.trim(),
      nameAr: newOfficeNameAr.trim() || newOfficeName.trim(),
      manager: newManager.trim(),
      category: newCategory,
      location: newLocation.trim() || 'Central Campus'
    });

    setNewOfficeName('');
    setNewOfficeNameAr('');
    setNewManager('');
    setNewLocation('');
    setIsAddingOffice(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Directory Header */}
      <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 4px' }}>
            University Office Directory
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0 }}>
            Organizational structure of university offices, departments, managers, and connected devices
          </p>
        </div>

        <button
          onClick={() => setIsAddingOffice(true)}
          className="btn-primary"
          style={{ padding: '9px 18px' }}
        >
          <PlusCircle size={16} />
          <span>Register New Office</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            placeholder="Search offices by name, manager, or building..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', paddingLeft: '36px' }}
          />
        </div>

        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          style={{ fontSize: '0.82rem' }}
        >
          <option value="all">All Categories</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Add Office Modal */}
      {isAddingOffice && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
              Register New University Office
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '18px' }}>
              Add a new office to the central platform, assign a direct manager, and configure the device identity.
            </p>

            <form onSubmit={handleCreateOffice} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                  Office Name (English)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Legal Affairs Office..."
                  value={newOfficeName}
                  onChange={e => setNewOfficeName(e.target.value)}
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                  Office Name (Arabic)
                </label>
                <input
                  type="text"
                  placeholder="مثال: الإدارة القانونية..."
                  value={newOfficeNameAr}
                  onChange={e => setNewOfficeNameAr(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                  Responsible Manager (اسم المدير المسؤول)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Yasser Al-Husseini..."
                  value={newManager}
                  onChange={e => setNewManager(e.target.value)}
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                    Department Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="Administrative">Administrative (إداري)</option>
                    <option value="Academic">Academic (أكاديمي)</option>
                    <option value="Operational">Operational (تشغيلي)</option>
                    <option value="Technical">Technical (تقني)</option>
                    <option value="Student Services">Student Services (خدمات طلابية)</option>
                    <option value="Security">Security (أمني)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                    Campus Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bldg C - Floor 2"
                    value={newLocation}
                    onChange={e => setNewLocation(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddingOffice(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <CheckCircle2 size={16} />
                  <span>Register Office</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Office Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '18px'
      }}>
        {filteredOffices.map(office => (
          <div
            key={office.id}
            className="glass-panel"
            style={{
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '16px',
              transition: 'all 0.2s',
              borderTop: office.status === 'online' ? '3px solid #10b981' : '3px solid #ef4444'
            }}
          >
            <div>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {office.category}
                  </span>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: '2px 0 2px' }}>
                    {office.name}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    {office.nameAr}
                  </div>
                </div>

                <span className={`badge ${office.status === 'online' ? 'badge-online' : 'badge-offline'}`}>
                  {office.status === 'online' && <span className="status-dot-pulse" style={{ width: '6px', height: '6px' }} />}
                  {office.status}
                </span>
              </div>

              {/* Office Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', color: '#cbd5e1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={14} color="#60a5fa" />
                  <span>Responsible: <strong style={{ color: '#f8fafc' }}>{office.manager}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={14} color="#94a3b8" />
                  <span>{office.location}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Monitor size={14} color="#34d399" />
                  <span>{office.devicesCount} Registered Computers ({office.computers[0]?.name})</span>
                </div>
              </div>

              {/* Task Counters */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                marginTop: '14px',
                padding: '10px',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Active Tasks</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#38bdf8' }}>
                    {office.activeTasks}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Pending Tasks</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fbbf24' }}>
                    {office.pendingTasks}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div style={{ display: 'flex', gap: '8px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.07)' }}>
              <button
                onClick={() => onOpenCreateTask(office.id)}
                className="btn-primary"
                style={{ flex: 1, padding: '7px 10px', fontSize: '0.78rem' }}
              >
                <span>+ Dispatch Task</span>
              </button>

              {office.status === 'online' && (
                <button
                  onClick={() => onStartScreenView(office.id)}
                  className="btn-secondary"
                  style={{ padding: '7px 12px', fontSize: '0.78rem', gap: '5px' }}
                  title="Live Screen Viewing"
                >
                  <Eye size={14} color="#38bdf8" />
                  <span>Screen</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
