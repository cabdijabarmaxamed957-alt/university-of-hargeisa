import React, { useState } from 'react';
import { 
  Users, 
  CheckSquare, 
  Activity, 
  Sliders, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  AlertCircle,
  ShieldCheck,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { AuthUser } from '../types';

interface LoginPageProps {
  onLogin: (user: AuthUser, token: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('director@university.edu');
  const [password, setPassword] = useState('UniversityDirector@2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [selectedDemoRole, setSelectedDemoRole] = useState<'director' | 'printing' | 'library' | 'finance' | 'it'>('director');

  const handleDemoSelect = (role: 'director' | 'printing' | 'library' | 'finance' | 'it') => {
    setSelectedDemoRole(role);
    setErrorMessage('');
    if (role === 'director') {
      setUsername('director@university.edu');
      setPassword('UniversityDirector@2026!');
    } else if (role === 'printing') {
      setUsername('ahmed@university.edu');
      setPassword('AhmedPrinting@2026!');
    } else if (role === 'library') {
      setUsername('hassan@university.edu');
      setPassword('HassanLibrary@2026!');
    } else if (role === 'finance') {
      setUsername('omar@university.edu');
      setPassword('OmarFinance@2026!');
    } else if (role === 'it') {
      setUsername('noc@university.edu');
      setPassword('NOCAdmin@2026!');
    }
  };

  const getMockUserForRole = (email: string): { user: AuthUser; token: string } => {
    const cleanEmail = email.toLowerCase().trim();
    if (cleanEmail.includes('director')) {
      return {
        user: {
          id: 'usr_director_01',
          email: 'director@university.edu',
          name: 'Dr. Ismael Hersi (University Director)',
          fullName: 'Dr. Ismael Hersi',
          role: 'director',
          officeId: null,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          title: 'President & Executive Director'
        },
        token: 'mock_jwt_director_' + Date.now()
      };
    } else if (cleanEmail.includes('ahmed') || cleanEmail.includes('printing')) {
      return {
        user: {
          id: 'usr_printing_01',
          email: 'ahmed@university.edu',
          name: 'Ahmed Warsame (Printing Office)',
          fullName: 'Ahmed Warsame',
          role: 'office_manager',
          officeId: 'printing',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
          title: 'Printing & Publications Manager'
        },
        token: 'mock_jwt_printing_' + Date.now()
      };
    } else if (cleanEmail.includes('hassan') || cleanEmail.includes('library')) {
      return {
        user: {
          id: 'usr_library_01',
          email: 'hassan@university.edu',
          name: 'Hassan Jama (Medical Library)',
          fullName: 'Hassan Jama',
          role: 'office_manager',
          officeId: 'library',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
          title: 'Chief Academic Librarian'
        },
        token: 'mock_jwt_library_' + Date.now()
      };
    } else if (cleanEmail.includes('omar') || cleanEmail.includes('finance')) {
      return {
        user: {
          id: 'usr_finance_01',
          email: 'omar@university.edu',
          name: 'Omar Duale (Finance Office)',
          fullName: 'Omar Duale',
          role: 'office_manager',
          officeId: 'finance',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
          title: 'Director of Financial Operations'
        },
        token: 'mock_jwt_finance_' + Date.now()
      };
    } else {
      return {
        user: {
          id: 'usr_it_01',
          email: 'noc@university.edu',
          name: 'Eng. Khalid (IT Network Admin)',
          fullName: 'Eng. Khalid',
          role: 'it_admin',
          officeId: null,
          avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
          title: 'Chief Network & Systems Officer'
        },
        token: 'mock_jwt_it_' + Date.now()
      };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password) {
      setErrorMessage('Please enter your email/username and password');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username.trim(), password })
      });

      if (res.ok) {
        const data = await res.json();
        if (rememberMe) {
          localStorage.setItem('univ_auth_token', data.token);
          localStorage.setItem('univ_auth_user', JSON.stringify(data.user));
        } else {
          sessionStorage.setItem('univ_auth_token', data.token);
          sessionStorage.setItem('univ_auth_user', JSON.stringify(data.user));
        }
        onLogin(data.user, data.token);
        return;
      }
      
      const data = await res.json().catch(() => null);
      if (data && data.error) {
        setErrorMessage(data.error);
        setIsLoading(false);
        return;
      }
    } catch {
      // Offline / standalone Vercel preview fallback
      console.info('Backend server unreachable; initiating static preview demo session.');
    }

    // Seamless offline fallback for Vercel preview
    const mockAuth = getMockUserForRole(username);
    if (rememberMe) {
      localStorage.setItem('univ_auth_token', mockAuth.token);
      localStorage.setItem('univ_auth_user', JSON.stringify(mockAuth.user));
    } else {
      sessionStorage.setItem('univ_auth_token', mockAuth.token);
      sessionStorage.setItem('univ_auth_user', JSON.stringify(mockAuth.user));
    }

    setTimeout(() => {
      setIsLoading(false);
      onLogin(mockAuth.user, mockAuth.token);
    }, 400);
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      position: 'relative',
      overflowX: 'hidden',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      backgroundColor: '#051329'
    }}>
      {/* ── BACKGROUND LAYER: Campus Building with Blue Gradient ── */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(to right, #041226 0%, #061833 35%, rgba(6, 26, 56, 0.88) 55%, rgba(7, 30, 66, 0.45) 85%, rgba(7, 30, 66, 0.25) 100%),
          url('https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=2000&q=85')
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center right',
        backgroundRepeat: 'no-repeat',
        zIndex: 1
      }} />

      {/* Subtle geometric light glow effect */}
      <div style={{
        position: 'absolute',
        top: '-20%',
        left: '-10%',
        width: '650px',
        height: '650px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(37, 99, 235, 0.22) 0%, rgba(5, 19, 41, 0) 70%)',
        zIndex: 2,
        pointerEvents: 'none'
      }} />

      {/* ── MAIN CONTENT CONTAINER (2-Column Hero & Login Layout) ── */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '1440px',
        margin: '0 auto',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '40px 60px',
        gap: '40px'
      }}>
        {/* ── LEFT HERO BRANDING SECTION ── */}
        <div style={{
          flex: '1.2',
          maxWidth: '680px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '560px',
          color: '#FFFFFF'
        }}>
          {/* Top Logo & Title */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '45px' }}>
              {/* Blue Crest Emblem */}
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1E40AF 0%, #0F172A 100%)',
                border: '2px solid #3B82F6',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4), 0 0 15px rgba(59, 130, 246, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" fill="rgba(30, 64, 175, 0.4)" />
                  <path d="M12 6.5v11" stroke="#FFFFFF" strokeWidth="1.5" />
                  <path d="M8 9.5c0-1.5 1.5-2.5 4-2.5s4 1 4 2.5v7.5c-2-1-3.5-1-4-1s-2 0-4 1V9.5z" stroke="#FFFFFF" strokeWidth="1.5" fill="rgba(255, 255, 255, 0.15)" />
                  <circle cx="12" cy="5" r="1" fill="#93C5FD" />
                </svg>
              </div>

              <div>
                <h2 style={{
                  fontSize: '1.65rem',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  margin: 0,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.15
                }}>
                  University
                </h2>
                <p style={{
                  fontSize: '0.86rem',
                  color: '#94A3B8',
                  margin: '3px 0 0 0',
                  fontWeight: 400,
                  letterSpacing: '-0.01em'
                }}>
                  Office Communication & Operations Management System
                </p>
              </div>
            </div>

            {/* Central Headline */}
            <h1 style={{
              fontSize: '2.55rem',
              fontWeight: 800,
              lineHeight: 1.25,
              color: '#FFFFFF',
              marginBottom: '42px',
              letterSpacing: '-0.03em',
              maxWidth: '640px'
            }}>
              A Centralized Digital Platform for Managing, Communicating With, and Monitoring University Offices
            </h1>

            {/* 4 Feature Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '16px',
              maxWidth: '620px'
            }}>
              {/* Feature 1 */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '8px'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '14px',
                  backgroundColor: 'rgba(15, 36, 70, 0.75)',
                  border: '1px solid rgba(59, 130, 246, 0.35)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#38BDF8',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)'
                }}>
                  <Users size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFFFFF' }}>Connect</div>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>All Offices</div>
                </div>
              </div>

              {/* Feature 2 */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '8px'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '14px',
                  backgroundColor: 'rgba(15, 36, 70, 0.75)',
                  border: '1px solid rgba(59, 130, 246, 0.35)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#38BDF8',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)'
                }}>
                  <CheckSquare size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFFFFF' }}>Track</div>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Tasks</div>
                </div>
              </div>

              {/* Feature 3 */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '8px'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '14px',
                  backgroundColor: 'rgba(15, 36, 70, 0.75)',
                  border: '1px solid rgba(59, 130, 246, 0.35)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#38BDF8',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)'
                }}>
                  <Activity size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFFFFF' }}>Real-Time</div>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Updates</div>
                </div>
              </div>

              {/* Feature 4 */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '8px'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '14px',
                  backgroundColor: 'rgba(15, 36, 70, 0.75)',
                  border: '1px solid rgba(59, 130, 246, 0.35)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#38BDF8',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)'
                }}>
                  <Sliders size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFFFFF' }}>Full</div>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Control</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Left Slogan Footer */}
          <div style={{
            marginTop: '50px',
            fontSize: '0.84rem',
            color: '#60A5FA',
            fontWeight: 500,
            letterSpacing: '0.01em'
          }}>
            Smarter Communication &nbsp;•&nbsp; Better Operations &nbsp;•&nbsp; A Stronger University
          </div>
        </div>

        {/* ── RIGHT LOGIN CARD SECTION (No logo inside card) ── */}
        <div style={{
          flex: '0.85',
          maxWidth: '430px',
          width: '100%'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            padding: '40px 36px',
            boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
            color: '#0F172A',
            position: 'relative'
          }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: '#0F172A',
                margin: '0 0 6px 0',
                letterSpacing: '-0.025em'
              }}>
                Welcome Back
              </h3>
              <p style={{
                fontSize: '0.875rem',
                color: '#64748B',
                margin: 0
              }}>
                Sign in to your university account
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '8px',
                color: '#DC2626',
                fontSize: '0.82rem',
                marginBottom: '18px'
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Email / Username Field */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '6px'
                }}>
                  Email or Username
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your email or username"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      backgroundColor: '#F8FAFC',
                      color: '#0F172A',
                      fontSize: '0.9rem',
                      outline: 'none',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#2563EB';
                      e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#CBD5E1';
                      e.target.style.boxShadow = 'none';
                    }}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '6px'
                }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    style={{
                      width: '100%',
                      padding: '12px 42px 12px 14px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      backgroundColor: '#F8FAFC',
                      color: '#0F172A',
                      fontSize: '0.9rem',
                      outline: 'none',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#2563EB';
                      e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#CBD5E1';
                      e.target.style.boxShadow = 'none';
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      color: '#94A3B8',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Options Row (Remember me & Forgot password) */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.82rem'
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{
                      width: '15px',
                      height: '15px',
                      borderRadius: '4px',
                      accentColor: '#2563EB',
                      cursor: 'pointer'
                    }}
                  />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: '#2563EB',
                    fontSize: '0.82rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                >
                  Forgot password?
                </button>
              </div>

              {/* Primary Action Button */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  marginTop: '6px',
                  padding: '13px 20px',
                  backgroundColor: '#1D6AE5',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(29, 106, 229, 0.35)',
                  transition: 'background-color 0.2s, transform 0.1s, box-shadow 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = '#1856BA';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#1D6AE5';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {isLoading ? (
                  <>
                    <span style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid #FFFFFF',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                      display: 'inline-block'
                    }} />
                    <span>Signing in...</span>
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Quick Demo Selector Chips */}
            <div style={{
              marginTop: '22px',
              paddingTop: '18px',
              borderTop: '1px solid #F1F5F9'
            }}>
              <div style={{
                fontSize: '0.72rem',
                color: '#64748B',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '8px',
                textAlign: 'center'
              }}>
                Quick Demo Accounts (1-Click Fill)
              </div>

              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
                justifyContent: 'center'
              }}>
                <button
                  type="button"
                  onClick={() => handleDemoSelect('director')}
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    padding: '4px 9px',
                    borderRadius: '6px',
                    border: selectedDemoRole === 'director' ? '1px solid #2563EB' : '1px solid #E2E8F0',
                    backgroundColor: selectedDemoRole === 'director' ? '#EFF6FF' : '#F8FAFC',
                    color: selectedDemoRole === 'director' ? '#1D4ED8' : '#475569',
                    cursor: 'pointer'
                  }}
                >
                  🏛️ Director
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoSelect('printing')}
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    padding: '4px 9px',
                    borderRadius: '6px',
                    border: selectedDemoRole === 'printing' ? '1px solid #2563EB' : '1px solid #E2E8F0',
                    backgroundColor: selectedDemoRole === 'printing' ? '#EFF6FF' : '#F8FAFC',
                    color: selectedDemoRole === 'printing' ? '#1D4ED8' : '#475569',
                    cursor: 'pointer'
                  }}
                >
                  🖨️ Printing Office
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoSelect('library')}
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    padding: '4px 9px',
                    borderRadius: '6px',
                    border: selectedDemoRole === 'library' ? '1px solid #2563EB' : '1px solid #E2E8F0',
                    backgroundColor: selectedDemoRole === 'library' ? '#EFF6FF' : '#F8FAFC',
                    color: selectedDemoRole === 'library' ? '#1D4ED8' : '#475569',
                    cursor: 'pointer'
                  }}
                >
                  📚 Library
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoSelect('finance')}
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    padding: '4px 9px',
                    borderRadius: '6px',
                    border: selectedDemoRole === 'finance' ? '1px solid #2563EB' : '1px solid #E2E8F0',
                    backgroundColor: selectedDemoRole === 'finance' ? '#EFF6FF' : '#F8FAFC',
                    color: selectedDemoRole === 'finance' ? '#1D4ED8' : '#475569',
                    cursor: 'pointer'
                  }}
                >
                  💰 Finance
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoSelect('it')}
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    padding: '4px 9px',
                    borderRadius: '6px',
                    border: selectedDemoRole === 'it' ? '1px solid #2563EB' : '1px solid #E2E8F0',
                    backgroundColor: selectedDemoRole === 'it' ? '#EFF6FF' : '#F8FAFC',
                    color: selectedDemoRole === 'it' ? '#1D4ED8' : '#475569',
                    cursor: 'pointer'
                  }}
                >
                  💻 IT Admin
                </button>
              </div>
            </div>

            {/* Sub Footer inside Card */}
            <div style={{
              marginTop: '18px',
              textAlign: 'center',
              fontSize: '0.76rem',
              color: '#94A3B8'
            }}>
              Secure &nbsp;•&nbsp; Reliable &nbsp;•&nbsp; University-Only
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '28px',
            maxWidth: '420px',
            width: '100%',
            color: '#0F172A',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: 700 }}>
              Password Reset Assistance
            </h4>
            <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.5, margin: '0 0 20px 0' }}>
              University account credentials are centrally managed. To reset your password, please contact the University IT Operations Helpdesk or use the preset demo accounts.
            </p>
            <div style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '0.82rem',
              color: '#334155',
              marginBottom: '20px'
            }}>
              <strong>IT Helpdesk:</strong> it-support@university.edu<br />
              <strong>Internal Extension:</strong> 4040
            </div>
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Keyframe animation for spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
