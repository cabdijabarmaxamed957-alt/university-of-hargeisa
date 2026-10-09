import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  CheckSquare, 
  MessageSquare, 
  Megaphone, 
  Monitor, 
  ShieldCheck, 
  BarChart3, 
  Cpu, 
  LogOut, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';
import { ASSETS } from '../assets/brandingAssets';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  unreadMessagesCount: number;
  pendingTasksCount: number;
  activeScreenSessionsCount: number;
  userRole: 'director' | 'office_manager' | 'it_admin';
  onLogout: () => void;
  officeName?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  unreadMessagesCount,
  pendingTasksCount,
  activeScreenSessionsCount,
  userRole,
  onLogout,
  officeName
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [logoSrc, setLogoSrc] = useState<string>(ASSETS.UNIVERSITY_LOGO_CANDIDATES[0]);
  const [logoIndex, setLogoIndex] = useState(0);

  const handleLogoError = () => {
    if (logoIndex + 1 < ASSETS.UNIVERSITY_LOGO_CANDIDATES.length) {
      setLogoIndex(logoIndex + 1);
      setLogoSrc(ASSETS.UNIVERSITY_LOGO_CANDIDATES[logoIndex + 1]);
    }
  };

  const navItems = [
    {
      id: 'dashboard',
      label: 'Control Center',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'offices',
      label: 'Offices Directory',
      icon: Building2,
      badge: '8 Offices'
    },
    {
      id: 'tasks',
      label: 'Task Management',
      icon: CheckSquare,
      badge: pendingTasksCount > 0 ? `${pendingTasksCount} Pending` : null,
      badgeColor: '#EF4444'
    },
    {
      id: 'messages',
      label: 'Messages & Chat',
      icon: MessageSquare,
      badge: unreadMessagesCount > 0 ? `${unreadMessagesCount} New` : null,
      badgeColor: '#3B82F6'
    },
    {
      id: 'announcements',
      label: 'Announcements',
      icon: Megaphone,
      badge: null
    },
    {
      id: 'devices',
      label: 'Device Inventory',
      icon: Monitor,
      badge: activeScreenSessionsCount > 0 ? `${activeScreenSessionsCount} Live` : null,
      badgeColor: '#10B981'
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: BarChart3,
      badge: null
    },
    {
      id: 'audit',
      label: 'Audit & Governance',
      icon: ShieldCheck,
      badge: null
    },
    {
      id: 'it_health',
      label: 'IT System Health',
      icon: Cpu,
      badge: 'Online',
      badgeColor: '#10B981'
    }
  ];

  return (
    <aside style={{
      width: collapsed ? '80px' : '280px',
      backgroundColor: '#0A192F',
      borderRight: '1px solid rgba(255, 255, 255, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      zIndex: 40,
      flexShrink: 0,
      userSelect: 'none',
      color: '#FFFFFF'
    }}>
      {/* ── TOP SECTION: Brand Header ── */}
      <div>
        <div style={{
          padding: collapsed ? '20px 14px' : '22px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #1E3A8A 0%, #0F172A 100%)',
              border: '2px solid #3B82F6',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4), 0 0 10px rgba(59, 130, 246, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" fill="rgba(30, 64, 175, 0.4)" />
                <path d="M12 6.5v11" stroke="#FFFFFF" strokeWidth="1.5" />
                <path d="M8 9.5c0-1.5 1.5-2.5 4-2.5s4 1 4 2.5v7.5c-2-1-3.5-1-4-1s-2 0-4 1V9.5z" stroke="#FFFFFF" strokeWidth="1.5" fill="rgba(255, 255, 255, 0.2)" />
              </svg>
            </div>

            {!collapsed && (
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontSize: '0.96rem',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  letterSpacing: '-0.02em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  University Operations
                </div>
                <div style={{
                  fontSize: '0.72rem',
                  color: '#94A3B8',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  Central Control Hub
                </div>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                color: '#94A3B8',
                padding: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Collapse Sidebar"
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        {collapsed && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <button
              onClick={() => setCollapsed(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                color: '#94A3B8',
                padding: '6px',
                cursor: 'pointer'
              }}
              title="Expand Sidebar"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* ── NAVIGATION MENU ITEMS ── */}
        <nav style={{ padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {!collapsed && (
            <div style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              color: '#64748B',
              letterSpacing: '0.08em',
              padding: '6px 12px',
              textTransform: 'uppercase'
            }}>
              Operational Modules
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                title={collapsed ? item.label : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: collapsed ? 'center' : 'space-between',
                  gap: '12px',
                  width: '100%',
                  padding: collapsed ? '12px' : '10px 14px',
                  borderRadius: '10px',
                  border: isActive ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid transparent',
                  backgroundColor: isActive ? 'rgba(37, 99, 235, 0.18)' : 'transparent',
                  color: isActive ? '#60A5FA' : '#CBD5E1',
                  fontSize: '0.86rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.color = '#FFFFFF';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#CBD5E1';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Icon 
                    size={20} 
                    color={isActive ? '#60A5FA' : '#94A3B8'} 
                    style={{ flexShrink: 0 }} 
                  />
                  {!collapsed && (
                    <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>
                  )}
                </div>

                {!collapsed && item.badge && (
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '20px',
                    backgroundColor: item.badgeColor ? `${item.badgeColor}22` : 'rgba(255, 255, 255, 0.1)',
                    color: item.badgeColor || '#94A3B8',
                    border: item.badgeColor ? `1px solid ${item.badgeColor}55` : '1px solid rgba(255, 255, 255, 0.15)'
                  }}>
                    {item.badge}
                  </span>
                )}

                {/* Left Active Indicator Strip */}
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: '6px',
                    bottom: '6px',
                    width: '3.5px',
                    borderRadius: '4px 0 0 4px',
                    backgroundColor: '#3B82F6'
                  }} />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── BOTTOM SECTION: User Profile & Logout ── */}
      <div style={{
        padding: collapsed ? '16px 10px' : '16px 18px',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        backgroundColor: 'rgba(6, 15, 30, 0.6)'
      }}>
        {!collapsed && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '14px',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            padding: '8px 12px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: userRole === 'director' 
                  ? 'linear-gradient(135deg, #2563EB, #1D4ED8)' 
                  : userRole === 'it_admin' 
                  ? 'linear-gradient(135deg, #7C3AED, #4F46E5)' 
                  : 'linear-gradient(135deg, #059669, #047857)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.8rem',
                color: '#FFFFFF'
              }}>
                {userRole === 'director' ? 'UD' : userRole === 'it_admin' ? 'IT' : 'OM'}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {userRole === 'director' ? 'Dr. Ismael Hersi' : userRole === 'it_admin' ? 'IT Administrator' : officeName || 'Office Manager'}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>
                  {userRole === 'director' ? 'University Director' : userRole === 'it_admin' ? 'Network & System Admin' : 'Authorized Office Manager'}
                </div>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={onLogout}
          title={collapsed ? 'Sign Out' : undefined}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: '10px',
            width: '100%',
            padding: '9px 12px',
            borderRadius: '8px',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            color: '#F87171',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)';
          }}
        >
          <LogOut size={16} />
          {!collapsed && <span>Sign Out of Hub</span>}
        </button>
      </div>
    </aside>
  );
};
