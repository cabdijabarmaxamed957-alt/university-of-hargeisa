import React from 'react';
import { 
  Monitor, 
  ShieldCheck, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  HardDrive, 
  RefreshCw,
  Building2
} from 'lucide-react';
import { Office } from '../types';

interface DeviceManagementProps {
  offices: Office[];
}

export const DeviceManagement: React.FC<DeviceManagementProps> = ({ offices }) => {
  const allDevices = offices.flatMap(office => 
    office.computers.map(comp => ({
      ...comp,
      officeName: office.name,
      officeManager: office.manager,
      officeCategory: office.category
    }))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Monitor size={22} color="#38bdf8" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              University Computer Fleet & Desktop Agent Registry
            </h2>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0 }}>
            إدارة أجهزة المكاتب الجامعية المتصلة، التحقق من إصدار العميل (Agent)، وتأمين الاتصال المشفر
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            padding: '6px 14px',
            borderRadius: '8px',
            fontSize: '0.82rem',
            color: '#34d399',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <ShieldCheck size={16} />
            <span>Policy: Enforced (TLS 1.3)</span>
          </div>
        </div>
      </div>

      {/* Fleet Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Total Registered Computers</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc' }}>{allDevices.length}</div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Online Active Endpoints</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399' }}>
            {allDevices.filter(d => d.status === 'online').length}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Current Agent Release</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8' }}>v2.4.1</div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>OS Compatibility</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#cbd5e1', marginTop: '6px' }}>
            Windows • macOS • Ubuntu
          </div>
        </div>
      </div>

      {/* Table of Devices */}
      <div className="glass-panel" style={{ padding: '20px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8' }}>
              <th style={{ padding: '12px 14px' }}>Device ID</th>
              <th style={{ padding: '12px 14px' }}>Computer Name</th>
              <th style={{ padding: '12px 14px' }}>Office Assignment</th>
              <th style={{ padding: '12px 14px' }}>Operating System</th>
              <th style={{ padding: '12px 14px' }}>IP Address</th>
              <th style={{ padding: '12px 14px' }}>Agent Version</th>
              <th style={{ padding: '12px 14px' }}>Status</th>
              <th style={{ padding: '12px 14px' }}>Security</th>
            </tr>
          </thead>
          <tbody>
            {allDevices.map((dev, i) => (
              <tr 
                key={dev.id} 
                style={{ 
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  background: i % 2 === 0 ? 'rgba(255, 255, 255, 0.01)' : 'transparent'
                }}
              >
                <td style={{ padding: '12px 14px', fontFamily: 'monospace', color: '#38bdf8', fontWeight: 600 }}>
                  {dev.id}
                </td>
                <td style={{ padding: '12px 14px', fontWeight: 700, color: '#ffffff' }}>
                  {dev.name}
                </td>
                <td style={{ padding: '12px 14px', color: '#e2e8f0' }}>
                  <strong>{dev.officeName}</strong>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Manager: {dev.officeManager}</div>
                </td>
                <td style={{ padding: '12px 14px', color: '#cbd5e1' }}>
                  {dev.os}
                </td>
                <td style={{ padding: '12px 14px', fontFamily: 'monospace', color: '#94a3b8' }}>
                  {dev.ip}
                </td>
                <td style={{ padding: '12px 14px', color: '#60a5fa', fontWeight: 600 }}>
                  {dev.agentVersion}
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <span className={`badge ${dev.status === 'online' ? 'badge-online' : 'badge-offline'}`}>
                    {dev.status}
                  </span>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#34d399', fontSize: '0.78rem' }}>
                    <ShieldCheck size={14} />
                    <span>Verified</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
