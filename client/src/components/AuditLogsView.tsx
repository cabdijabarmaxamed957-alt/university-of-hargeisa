import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Download, 
  Filter, 
  Clock, 
  User, 
  Building2, 
  AlertTriangle,
  CheckCircle2,
  Info
} from 'lucide-react';
import { AuditLog } from '../types';

interface AuditLogsViewProps {
  auditLogs: AuditLog[];
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ auditLogs }) => {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');

  const filteredLogs = auditLogs.filter(log => {
    const matchSearch = log.action.toLowerCase().includes(search.toLowerCase()) ||
                        log.office.toLowerCase().includes(search.toLowerCase()) ||
                        log.actor.toLowerCase().includes(search.toLowerCase());
    const matchSeverity = severityFilter === 'all' || log.severity === severityFilter;
    return matchSearch && matchSeverity;
  });

  const getSeverityIcon = (sev: string) => {
    switch (sev) {
      case 'high': return <AlertTriangle size={15} color="#ef4444" />;
      case 'warning': return <AlertTriangle size={15} color="#f59e0b" />;
      case 'success': return <CheckCircle2 size={15} color="#10b981" />;
      default: return <Info size={15} color="#3b82f6" />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <ShieldCheck size={22} color="#38bdf8" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              Immutable Operational Audit Log & Compliance Ledger
            </h2>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0 }}>
            سجل التدقيق الشامل لكافة الأنشطة والمهام وتفويضات الشاشات الصادرة في الجامعة
          </p>
        </div>

        <button
          onClick={() => alert('Exporting signed audit ledger for institutional compliance (PDF/CSV)...')}
          className="btn-secondary"
          style={{ padding: '8px 16px', gap: '8px' }}
        >
          <Download size={15} />
          <span>Export Audit Report</span>
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            placeholder="Search audit actions, offices, or operators..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', paddingLeft: '36px' }}
          />
        </div>

        <select
          value={severityFilter}
          onChange={e => setSeverityFilter(e.target.value)}
          style={{ fontSize: '0.82rem' }}
        >
          <option value="all">All Severities (كافة مستويات الأهمية)</option>
          <option value="high">High / Critical</option>
          <option value="warning">Warning / Sensitive</option>
          <option value="info">Info / Normal</option>
          <option value="success">Success / Verified</option>
        </select>
      </div>

      {/* Log Feed */}
      <div className="glass-panel" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredLogs.map(log => (
            <div
              key={log.id}
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {getSeverityIcon(log.severity)}
                </div>

                <div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#f8fafc' }}>
                    {log.action}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'flex', gap: '8px', marginTop: '2px' }}>
                    <span>Target Office: <strong style={{ color: '#e2e8f0' }}>{log.office}</strong></span>
                    <span>•</span>
                    <span>Actor: <strong style={{ color: '#cbd5e1' }}>{log.actor}</strong></span>
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>
                  {log.timestamp}
                </span>
                <div style={{ fontSize: '0.68rem', color: '#475569' }}>
                  ID: {log.id}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
