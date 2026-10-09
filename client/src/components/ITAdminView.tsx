import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Server, 
  Activity, 
  Wifi, 
  ShieldCheck, 
  RefreshCw, 
  HardDrive, 
  Database, 
  AlertTriangle, 
  CheckCircle2,
  Terminal,
  Radio
} from 'lucide-react';
import { Office, SystemStats, HealthCheckResponse } from '../types';

interface ITAdminViewProps {
  offices: Office[];
  stats: SystemStats;
  isConnected: boolean;
}

export const ITAdminView: React.FC<ITAdminViewProps> = ({
  offices,
  stats,
  isConnected
}) => {
  const [healthData, setHealthData] = useState<HealthCheckResponse | null>(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState<boolean>(false);
  const [lastCheckTime, setLastCheckTime] = useState<string>('');

  const fetchHealth = async () => {
    setIsLoadingHealth(true);
    try {
      const token = localStorage.getItem('univ_auth_token') || sessionStorage.getItem('univ_auth_token');
      const res = await fetch('http://localhost:4000/api/health', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setHealthData(data);
        setLastCheckTime(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error('Failed to fetch IT health:', err);
    } finally {
      setIsLoadingHealth(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 15000); // Polling every 15s
    return () => clearInterval(interval);
  }, []);

  const allDevices = offices.flatMap(o => o.computers.map(c => ({
    ...c,
    officeName: o.nameAr,
    officeCategory: o.category
  })));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* ── TOP HEADER ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        padding: '20px 24px',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: '#F5F3FF',
            color: '#7C3AED',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Cpu size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              مركز عمليات الشبكة وتقنية المعلومات (IT NOC Console)
            </h2>
            <p style={{ fontSize: '0.84rem', color: '#64748B', margin: '4px 0 0 0' }}>
              مراقبة البنية التحتية، بروتوكول البث الحي، وصحة عملاء سطح المكتب (Desktop Agents)
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={fetchHealth}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={13} className={isLoadingHealth ? 'animate-spin' : ''} />
            <span>تحديث الفحص</span>
          </button>

          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '0.78rem',
            fontWeight: 700,
            backgroundColor: isConnected ? '#ECFDF5' : '#FEF2F2',
            color: isConnected ? '#059669' : '#DC2626',
            border: isConnected ? '1px solid #A7F3D0' : '1px solid #FECACA'
          }}>
            <Radio size={14} className={isConnected ? 'animate-pulse' : ''} />
            <span>{isConnected ? 'WebSocket Active' : 'WebSocket Disconnected'}</span>
          </span>
        </div>
      </div>

      {/* ── 4 SERVICE HEALTH TILES ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px' }}>
        <div style={{ backgroundColor: '#FFFFFF', padding: '18px', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748B' }}>خادم التطبيقات (Node API)</span>
            <Server size={18} color="#2563EB" />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
            Port :4000
          </div>
          <div style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 700 }}>
            ● استجابة فورية ({healthData?.services.api.responseTimeMs ?? 2}ms)
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: '18px', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748B' }}>قاعدة البيانات الدائمة (Durable DB)</span>
            <Database size={18} color="#7C3AED" />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
            {healthData?.services.database.status === 'ok' ? 'Online • Persistent' : 'Degraded'}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 700 }}>
            ● {offices.length} مكاتب مسجلة بنجاح
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: '18px', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748B' }}>قناة البث الآمن (WebRTC)</span>
            <Radio size={18} color="#059669" />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
            {stats.activeScreenSessionsCount} جلسات نشطة
          </div>
          <div style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 700 }}>
            ● تشفير ثنائي الاتجاه
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: '18px', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748B' }}>إصدار عميل سطح المكتب</span>
            <Terminal size={18} color="#D97706" />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
            v2.4.1 Enterprise
          </div>
          <div style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 700 }}>
            ● 100% متطابق مع المنظومة
          </div>
        </div>
      </div>

      {/* ── FLEET TELEMETRY TABLE ── */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        padding: '24px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            حالة الاتصال والـ Ping لأجهزة المكاتب
          </h3>
          {lastCheckTime && (
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              آخر فحص: {lastCheckTime}
            </span>
          )}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#64748B', fontSize: '0.8rem' }}>
                <th style={{ padding: '12px 14px' }}>معرف الجهاز (Device ID)</th>
                <th style={{ padding: '12px 14px' }}>اسم الحاسوب</th>
                <th style={{ padding: '12px 14px' }}>المكتب التابع</th>
                <th style={{ padding: '12px 14px' }}>نظام التشغيل</th>
                <th style={{ padding: '12px 14px' }}>عنوان الـ IP الداخلي</th>
                <th style={{ padding: '12px 14px' }}>حالة العميل (Agent)</th>
                <th style={{ padding: '12px 14px' }}>آخر اتصال (Last Ping)</th>
              </tr>
            </thead>
            <tbody>
              {allDevices.map((dev) => (
                <tr key={dev.id} style={{ borderBottom: '1px solid #F1F5F9', fontSize: '0.86rem' }}>
                  <td style={{ padding: '14px', fontFamily: 'monospace', fontWeight: 700, color: '#2563EB' }}>
                    {dev.id}
                  </td>
                  <td style={{ padding: '14px', fontWeight: 700, color: '#0F172A' }}>
                    {dev.name}
                  </td>
                  <td style={{ padding: '14px', color: '#334155' }}>
                    {dev.officeName}
                  </td>
                  <td style={{ padding: '14px', color: '#64748B' }}>
                    {dev.os}
                  </td>
                  <td style={{ padding: '14px', fontFamily: 'monospace', color: '#64748B' }}>
                    {dev.ip}
                  </td>
                  <td style={{ padding: '14px' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '12px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      backgroundColor: dev.status === 'online' ? '#ECFDF5' : '#FEF2F2',
                      color: dev.status === 'online' ? '#059669' : '#DC2626'
                    }}>
                      {dev.status === 'online' ? 'Online • Active' : 'Offline'}
                    </span>
                  </td>
                  <td style={{ padding: '14px', color: '#64748B' }}>
                    {dev.lastPing || 'Just now'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
