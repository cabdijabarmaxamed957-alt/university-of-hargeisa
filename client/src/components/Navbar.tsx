import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Monitor, 
  Columns, 
  Wifi, 
  WifiOff, 
  Clock, 
  ShieldCheck, 
  Bell, 
  Eye,
  LogOut,
  User
} from 'lucide-react';
import { ASSETS } from '../assets/brandingAssets';

interface NavbarProps {
  currentView: 'director' | 'agent' | 'split';
  setCurrentView: (view: 'director' | 'agent' | 'split') => void;
  isConnected: boolean;
  activeScreenSessionsCount: number;
  unreadCount: number;
  onLogout?: () => void;
  userRole?: 'director' | 'office_manager' | 'it_admin';
  officeName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  isConnected,
  activeScreenSessionsCount,
  unreadCount,
  onLogout,
  userRole = 'director',
  officeName
}) => {
  const [time, setTime] = useState<string>('');
  const [logoSrc, setLogoSrc] = useState<string>(ASSETS.UNIVERSITY_LOGO_CANDIDATES[0]);
  const [logoIndex, setLogoIndex] = useState(0);

  const handleLogoError = () => {
    if (logoIndex + 1 < ASSETS.UNIVERSITY_LOGO_CANDIDATES.length) {
      setLogoIndex(logoIndex + 1);
      setLogoSrc(ASSETS.UNIVERSITY_LOGO_CANDIDATES[logoIndex + 1]);
    }
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header style={{
      background: 'rgba(10, 25, 47, 0.95)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '10px 24px',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '20px'
    }}>
      {/* Brand & Official University Emblem */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #0A192F, #1E3A8A)',
          border: '1.5px solid rgba(212, 175, 55, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4), 0 0 10px rgba(212, 175, 55, 0.2)',
          overflow: 'hidden',
          flexShrink: 0
        }}>
          <img 
            src={logoSrc} 
            alt="University Logo" 
            onError={handleLogoError}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff', margin: 0 }}>
              UNIVERSITY OPERATIONS HUB
            </h1>
            <span style={{ 
              background: 'rgba(212, 175, 55, 0.18)', 
              color: '#F3DA8E', 
              fontSize: '0.65rem', 
              padding: '2px 7px', 
              borderRadius: '6px', 
              fontWeight: 700,
              border: '1px solid rgba(212, 175, 55, 0.35)'
            }}>
              OFFICIAL CENTRAL
            </span>
          </div>
          <p style={{ fontSize: '0.74rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
            منظومة الاتصال والعمليات الإدارية المركزية لمكاتب الجامعة
          </p>
        </div>
      </div>

      {/* Mode Switcher Buttons */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: 'rgba(6, 12, 28, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '10px',
        padding: '4px'
      }}>
        <button
          onClick={() => setCurrentView('director')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 16px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            background: currentView === 'director' ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'transparent',
            color: currentView === 'director' ? '#ffffff' : '#94a3b8',
            boxShadow: currentView === 'director' ? '0 2px 10px rgba(37, 99, 235, 0.35)' : 'none'
          }}
        >
          <Building2 size={16} />
          <span>Control Center (إدارة الجامعة)</span>
        </button>

        <button
          onClick={() => setCurrentView('agent')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 16px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            background: currentView === 'agent' ? 'linear-gradient(135deg, #059669, #10b981)' : 'transparent',
            color: currentView === 'agent' ? '#ffffff' : '#94a3b8',
            boxShadow: currentView === 'agent' ? '0 2px 10px rgba(16, 185, 129, 0.35)' : 'none'
          }}
        >
          <Monitor size={16} />
          <span>Office Agent (جهاز المكتب)</span>
        </button>

        <button
          onClick={() => setCurrentView('split')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 16px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            background: currentView === 'split' ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : 'transparent',
            color: currentView === 'split' ? '#ffffff' : '#94a3b8',
            boxShadow: currentView === 'split' ? '0 2px 10px rgba(124, 58, 237, 0.35)' : 'none'
          }}
        >
          <Columns size={16} />
          <span>Split Live View (عرض متزامن)</span>
        </button>
      </div>

      {/* Right Status Meta */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Active Screen View Badge */}
        {activeScreenSessionsCount > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            color: '#f87171',
            padding: '5px 10px',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 700,
            animation: 'pulse-border 2s infinite'
          }}>
            <Eye size={14} className="animate-spin" />
            <span>{activeScreenSessionsCount} Screen Live</span>
          </div>
        )}

        {/* Live Clock */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: '#cbd5e1',
          fontSize: '0.82rem',
          fontWeight: 600,
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '5px 12px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.07)'
        }}>
          <Clock size={14} color="#60a5fa" />
          <span>{time}</span>
        </div>

        {/* WebSocket Connection Status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.78rem',
          fontWeight: 600,
          color: isConnected ? '#34d399' : '#f87171'
        }}>
          {isConnected ? (
            <>
              <div className="status-dot-pulse" />
              <span>Real-time Active</span>
            </>
          ) : (
            <>
              <WifiOff size={14} color="#ef4444" />
              <span>Connecting...</span>
            </>
          )}
        </div>

        {/* User Profile & Logout Action */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          paddingLeft: '14px',
          borderLeft: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: userRole === 'director' 
                ? 'linear-gradient(135deg, #0284c7, #0369a1)'
                : userRole === 'it_admin' 
                ? 'linear-gradient(135deg, #7c3aed, #4f46e5)'
                : 'linear-gradient(135deg, #059669, #047857)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem',
              color: '#ffffff',
              border: '2px solid rgba(255, 255, 255, 0.2)'
            }}>
              {userRole === 'director' ? 'UD' : userRole === 'it_admin' ? 'IT' : 'OM'}
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc' }}>
                {userRole === 'director' ? 'Prof. Al-Husseini' : userRole === 'it_admin' ? 'IT Admin Console' : officeName || 'Office Manager'}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                {userRole === 'director' ? 'University Director' : userRole === 'it_admin' ? 'System Administrator' : 'Authorized Manager'}
              </div>
            </div>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              title="Sign Out (تسجيل الخروج)"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 10px',
                borderRadius: '8px',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                color: '#F87171',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.12)';
              }}
            >
              <LogOut size={14} />
              <span>خروج</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
