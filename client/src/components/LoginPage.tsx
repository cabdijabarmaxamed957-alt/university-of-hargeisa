import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Monitor, 
  Cpu, 
  Sparkles, 
  HelpCircle,
  X,
  FileText,
  UserCheck,
  ChevronRight,
  Globe
} from 'lucide-react';
import { ASSETS } from '../assets/brandingAssets';
import { AuthUser } from '../types';

interface LoginPageProps {
  onLogin: (user: AuthUser, token: string) => void;
  language?: 'ar' | 'en' | 'so';
  onLanguageChange?: (lang: 'ar' | 'en' | 'so') => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ 
  onLogin, 
  language = 'ar',
  onLanguageChange 
}) => {
  const [lang, setLang] = useState<'ar' | 'en' | 'so'>(language);
  const [username, setUsername] = useState('director@university.edu');
  const [password, setPassword] = useState('UniversityDirector@2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'director' | 'printing' | 'library' | 'finance' | 'it'>('director');

  // Background image state with fallbacks
  const [bgSrc, setBgSrc] = useState<string>(ASSETS.UNIVERSITY_BG_CANDIDATES[0]);
  const [bgIndex, setBgIndex] = useState(0);

  // Logo image state with fallbacks
  const [logoSrc, setLogoSrc] = useState<string>(ASSETS.UNIVERSITY_LOGO_CANDIDATES[0]);
  const [logoIndex, setLogoIndex] = useState(0);

  const handleBgError = () => {
    if (bgIndex + 1 < ASSETS.UNIVERSITY_BG_CANDIDATES.length) {
      setBgIndex(bgIndex + 1);
      setBgSrc(ASSETS.UNIVERSITY_BG_CANDIDATES[bgIndex + 1]);
    }
  };

  const handleLogoError = () => {
    if (logoIndex + 1 < ASSETS.UNIVERSITY_LOGO_CANDIDATES.length) {
      setLogoIndex(logoIndex + 1);
      setLogoSrc(ASSETS.UNIVERSITY_LOGO_CANDIDATES[logoIndex + 1]);
    }
  };

  const handleRoleSelect = (role: 'director' | 'printing' | 'library' | 'finance' | 'it') => {
    setSelectedRole(role);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password) {
      setErrorMessage(
        lang === 'ar' 
          ? 'يرجى إدخال اسم المستخدم وكلمة المرور' 
          : lang === 'so' 
          ? 'Fadlan geli magaca isticmaalaha iyo furaha sirta ah' 
          : 'Please enter username and password'
      );
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username.trim(), password })
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'بيانات الدخول غير صحيحة. يرجى التحقق وإعادة المحاولة.');
        setIsLoading(false);
        return;
      }

      // Secure session persistence
      if (rememberMe) {
        localStorage.setItem('univ_auth_token', data.token);
        localStorage.setItem('univ_auth_user', JSON.stringify(data.user));
      } else {
        sessionStorage.setItem('univ_auth_token', data.token);
        sessionStorage.setItem('univ_auth_user', JSON.stringify(data.user));
      }

      onLogin(data.user, data.token);
    } catch {
      setErrorMessage(
        lang === 'ar'
          ? 'تعذر الاتصال بالخادم المركزي. يرجى التحقق من اتصال الشبكة وتشغيل الخادم.'
          : 'Failed to connect to authentication server. Ensure backend is running.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      backgroundColor: '#0A192F',
      color: '#FFFFFF',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* ── LEFT HERO BRANDED SECTION (University Gate & Mission) ── */}
      <div style={{
        flex: '1.15',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '50px 60px',
        overflow: 'hidden',
        borderRight: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        {/* Background Image with Fallback */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url("${bgSrc}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 1,
          filter: 'brightness(0.78) contrast(1.05)'
        }}>
          {/* Hidden img tag to handle fallback error cycling */}
          <img 
            src={bgSrc} 
            alt="University Gate Background" 
            onError={handleBgError} 
            style={{ display: 'none' }} 
          />
        </div>

        {/* Sophisticated Multi-Layer Institutional Gradient Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(10, 25, 47, 0.94) 0%, rgba(15, 30, 60, 0.85) 45%, rgba(10, 25, 47, 0.96) 100%)',
          zIndex: 2,
          backdropFilter: 'blur(2px)'
        }} />

        {/* Geometric institutional light accents */}
        <div style={{
          position: 'absolute',
          top: '-15%',
          left: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.25) 0%, rgba(10, 25, 47, 0) 70%)',
          zIndex: 2,
          pointerEvents: 'none'
        }} />

        {/* Top Header on Left Side */}
        <div style={{ position: 'relative', zIndex: 3, display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '58px',
            height: '58px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #1E3A8A 0%, #0F172A 100%)',
            border: '2px solid rgba(212, 175, 55, 0.65)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4), 0 0 15px rgba(212, 175, 55, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
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
            <div style={{ 
              fontSize: '1.25rem', 
              fontWeight: 800, 
              color: '#FFFFFF', 
              letterSpacing: '-0.02em',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>جامعة المدينة الدولية</span>
              <span style={{ 
                fontSize: '0.65rem', 
                backgroundColor: 'rgba(212, 175, 55, 0.2)', 
                color: '#F3DA8E', 
                border: '1px solid rgba(212, 175, 55, 0.45)',
                padding: '2px 8px',
                borderRadius: '6px',
                fontWeight: 700
              }}>
                OFFICIAL PORTAL
              </span>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#94A3B8', fontWeight: 500 }}>
              University Office Communication & Operations Management System
            </div>
          </div>
        </div>

        {/* Center Main Message on Left Side */}
        <div style={{ position: 'relative', zIndex: 3, maxWidth: '580px', margin: '60px 0' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '30px',
            backgroundColor: 'rgba(37, 99, 235, 0.22)',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            color: '#93C5FD',
            fontSize: '0.82rem',
            fontWeight: 600,
            marginBottom: '22px'
          }}>
            <ShieldCheck size={16} color="#60A5FA" />
            <span>نظام الإدارة والربط المركزي المشفر • v2.4 Enterprise</span>
          </div>

          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            lineHeight: 1.25,
            color: '#FFFFFF',
            marginBottom: '18px',
            letterSpacing: '-0.025em'
          }}>
            المنظومة المركزية لإدارة <span style={{ color: '#60A5FA' }}>العمليات والاتصال</span> بين مكاتب الجامعة
          </h1>

          <p style={{
            fontSize: '1.02rem',
            lineHeight: 1.65,
            color: '#CBD5E1',
            marginBottom: '36px'
          }}>
            منصة تشغيلية متكاملة تربط مكتب مدير الجامعة مع كافة المكاتب التابعة، وتتيح إدارة المهام، المحادثة الفورية، التوجيهات الرسمية، ومراقبة أجهزة العمليات بشكل مباشر وآمن.
          </p>

          {/* 3 Value Pillars */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div style={{
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '16px',
              backdropFilter: 'blur(8px)'
            }}>
              <div style={{ color: '#38BDF8', marginBottom: '8px' }}>
                <Building2 size={24} />
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
                8+ مكاتب مدمجة
              </div>
              <div style={{ fontSize: '0.74rem', color: '#94A3B8', lineHeight: 1.4 }}>
                ربط فوري بين الطباعة، المالية، المكتبة، وشؤون الطلاب.
              </div>
            </div>

            <div style={{
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '16px',
              backdropFilter: 'blur(8px)'
            }}>
              <div style={{ color: '#34D399', marginBottom: '8px' }}>
                <CheckCircle2 size={24} />
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
                متابعة المهام الحية
              </div>
              <div style={{ fontSize: '0.74rem', color: '#94A3B8', lineHeight: 1.4 }}>
                دورة حياة موثقة من الإرسال حتى التنفيذ والتحقق.
              </div>
            </div>

            <div style={{
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '16px',
              backdropFilter: 'blur(8px)'
            }}>
              <div style={{ color: '#FBBF24', marginBottom: '8px' }}>
                <Monitor size={24} />
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
                مراقبة الأجهزة
              </div>
              <div style={{ fontSize: '0.74rem', color: '#94A3B8', lineHeight: 1.4 }}>
                بث الشاشة المرخص وجرد حواسيب المكاتب النشطة.
              </div>
            </div>
          </div>
        </div>

        {/* Footer info on Left Side */}
        <div style={{
          position: 'relative',
          zIndex: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid rgba(255, 255, 255, 0.12)',
          paddingTop: '20px',
          fontSize: '0.8rem',
          color: '#94A3B8'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
            <span>خوادم العمليات المركزية تعمل بكفاءة (WebSocket Connected)</span>
          </div>
          <div>© 2026 University IT Operations Authority</div>
        </div>
      </div>

      {/* ── RIGHT AUTH FORM SECTION ── */}
      <div style={{
        flex: '0.85',
        backgroundColor: '#FFFFFF',
        color: '#0F172A',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '50px 65px',
        position: 'relative',
        boxShadow: '-10px 0 40px rgba(0,0,0,0.25)',
        zIndex: 10,
        overflowY: 'auto'
      }}>
        {/* Language selector toggle */}
        <div style={{
          position: 'absolute',
          top: '30px',
          left: '40px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: '#F1F5F9',
          padding: '4px 10px',
          borderRadius: '8px',
          fontSize: '0.8rem'
        }}>
          <Globe size={14} color="#64748B" />
          <select 
            value={lang}
            onChange={(e) => {
              const newLang = e.target.value as 'ar' | 'en' | 'so';
              setLang(newLang);
              if (onLanguageChange) onLanguageChange(newLang);
            }}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="ar">العربية (Arabic)</option>
            <option value="en">English (UK)</option>
            <option value="so">Soomaali (Somali)</option>
          </select>
        </div>

        <div style={{ maxWidth: '440px', width: '100%', margin: '0 auto' }}>
          {/* Institution Crest in Form Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: '#0A192F',
              border: '2px solid #D4AF37',
              boxShadow: '0 4px 12px rgba(10, 25, 47, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              <img 
                src={logoSrc} 
                alt="University Emblem" 
                onError={handleLogoError}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </div>
            <div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0A192F', margin: 0, letterSpacing: '-0.02em' }}>
                تسجيل الدخول للنظام
              </h2>
              <p style={{ fontSize: '0.84rem', color: '#64748B', margin: 0, fontWeight: 500 }}>
                بوابة المكاتب والإدارة الجامعية المركزية
              </p>
            </div>
          </div>

          {/* Quick Profile Role Switcher Tabs (For Demo & Fast Auth) */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '8px', display: 'block' }}>
              اختر نوع الحساب / الدور الوظيفي:
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px',
              backgroundColor: '#F8FAFC',
              padding: '6px',
              borderRadius: '12px',
              border: '1px solid #E2E8F0'
            }}>
              <button
                type="button"
                onClick={() => handleRoleSelect('director')}
                style={{
                  padding: '8px 6px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: selectedRole === 'director' ? '#0A192F' : 'transparent',
                  color: selectedRole === 'director' ? '#FFFFFF' : '#475569',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: selectedRole === 'director' ? '0 2px 8px rgba(10, 25, 47, 0.25)' : 'none'
                }}
              >
                🏛️ مدير الجامعة
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('printing')}
                style={{
                  padding: '8px 6px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: selectedRole === 'printing' ? '#0A192F' : 'transparent',
                  color: selectedRole === 'printing' ? '#FFFFFF' : '#475569',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: selectedRole === 'printing' ? '0 2px 8px rgba(10, 25, 47, 0.25)' : 'none'
                }}
              >
                🖨️ مكتب الطباعة
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('library')}
                style={{
                  padding: '8px 6px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: selectedRole === 'library' ? '#0A192F' : 'transparent',
                  color: selectedRole === 'library' ? '#FFFFFF' : '#475569',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: selectedRole === 'library' ? '0 2px 8px rgba(10, 25, 47, 0.25)' : 'none'
                }}
              >
                📚 المكتبة الطبية
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
              marginTop: '6px'
            }}>
              <button
                type="button"
                onClick={() => handleRoleSelect('finance')}
                style={{
                  padding: '6px 8px',
                  borderRadius: '8px',
                  border: selectedRole === 'finance' ? '1.5px solid #2563EB' : '1px solid #E2E8F0',
                  backgroundColor: selectedRole === 'finance' ? '#EFF6FF' : '#FFFFFF',
                  color: selectedRole === 'finance' ? '#1D4ED8' : '#64748B',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                💰 إدارة المالية والمرتبات
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('it')}
                style={{
                  padding: '6px 8px',
                  borderRadius: '8px',
                  border: selectedRole === 'it' ? '1.5px solid #2563EB' : '1px solid #E2E8F0',
                  backgroundColor: selectedRole === 'it' ? '#EFF6FF' : '#FFFFFF',
                  color: selectedRole === 'it' ? '#1D4ED8' : '#64748B',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                💻 إدارة تقنية المعلومات (IT)
              </button>
            </div>
          </div>

          {/* Error message banner */}
          {errorMessage && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FCA5A5',
              color: '#B91C1C',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.84rem',
              marginBottom: '18px'
            }}>
              <AlertCircle size={16} color="#DC2626" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Main Auth Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Username / Email */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#334155',
                marginBottom: '6px'
              }}>
                البريد الإلكتروني أو الرقم الوظيفي
              </label>
              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }}>
                <div style={{
                  position: 'absolute',
                  right: '14px',
                  color: '#94A3B8',
                  pointerEvents: 'none'
                }}>
                  <Mail size={18} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="name@university.edu"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 42px 12px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.92rem',
                    color: '#0F172A',
                    backgroundColor: '#FFFFFF',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#2563EB';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#CBD5E1';
                    e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#334155'
                }}>
                  كلمة المرور
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563EB',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  نسيت كلمة المرور؟
                </button>
              </div>

              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }}>
                <div style={{
                  position: 'absolute',
                  right: '14px',
                  color: '#94A3B8',
                  pointerEvents: 'none'
                }}>
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 42px 12px 42px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.92rem',
                    color: '#0F172A',
                    backgroundColor: '#FFFFFF',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#2563EB';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#CBD5E1';
                    e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    background: 'none',
                    border: 'none',
                    color: '#94A3B8',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  aria-label="Toggle Password Visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember me option */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  accentColor: '#2563EB'
                }}
              />
              <label 
                htmlFor="rememberMe" 
                style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 500, cursor: 'pointer', userSelect: 'none' }}
              >
                تذكر بيانات هذا الجهاز للأعمال اليومية
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                height: '48px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                fontSize: '0.98rem',
                fontWeight: 700,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                transition: 'all 0.2s ease',
                opacity: isLoading ? 0.8 : 1,
                marginTop: '6px'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) e.currentTarget.style.backgroundColor = '#1D4ED8';
              }}
              onMouseLeave={(e) => {
                if (!isLoading) e.currentTarget.style.backgroundColor = '#2563EB';
              }}
            >
              {isLoading ? (
                <>
                  <div style={{
                    width: '18px',
                    height: '18px',
                    border: '2px solid rgba(255,255,255,0.4)',
                    borderTopColor: '#FFFFFF',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                  }} />
                  <span>جارٍ التحقق والربط...</span>
                </>
              ) : (
                <>
                  <span>دخول المنظومة التشغيلية</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Quick Access Helper */}
          <div style={{
            marginTop: '28px',
            padding: '14px',
            backgroundColor: '#F8FAFC',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            fontSize: '0.78rem',
            color: '#64748B',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px'
          }}>
            <ShieldCheck size={20} color="#2563EB" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <span style={{ fontWeight: 700, color: '#334155' }}>حماية المؤسسة الأكاديمية: </span>
              يتم تشفير كافة جلسات الاتصال وربط أجهزة المكاتب ببروتوكول موثق وفقاً لصلاحيات الإدارة العامة للجامعة.
            </div>
          </div>
        </div>
      </div>

      {/* ── FORGOT PASSWORD MODAL ── */}
      {showForgotModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          backgroundColor: 'rgba(10, 25, 47, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '460px',
            width: '100%',
            padding: '30px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            position: 'relative',
            color: '#0F172A'
          }}>
            <button
              onClick={() => setShowForgotModal(false)}
              style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                background: 'none',
                border: 'none',
                color: '#64748B',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>

            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <HelpCircle size={26} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 8px 0', color: '#0A192F' }}>
              استعادة كلمة المرور الرسمية
            </h3>

            <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.6, marginBottom: '20px' }}>
              وفقاً للائحة الأمن السيبراني للجامعة، تتم إعادة تعيين كلمات المرور لحسابات مدراء المكاتب عبر إحدى الطرق التالية:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <div style={{
                padding: '12px',
                backgroundColor: '#F8FAFC',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <Building2 size={20} color="#0A192F" />
                <div style={{ fontSize: '0.84rem' }}>
                  <div style={{ fontWeight: 700, color: '#1E293B' }}>مكتب مدير الجامعة العام</div>
                  <div style={{ color: '#64748B', fontSize: '0.76rem' }}>مبنى الإدارة المركزية - الدور الرابع</div>
                </div>
              </div>

              <div style={{
                padding: '12px',
                backgroundColor: '#F8FAFC',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <Cpu size={20} color="#2563EB" />
                <div style={{ fontSize: '0.84rem' }}>
                  <div style={{ fontWeight: 700, color: '#1E293B' }}>إدارة الدعم الفني وتقنية المعلومات (IT)</div>
                  <div style={{ color: '#64748B', fontSize: '0.76rem' }}>التحويلة الداخلية: 104 • support@university.edu</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowForgotModal(false)}
              style={{
                width: '100%',
                height: '44px',
                backgroundColor: '#0A192F',
                color: '#FFFFFF',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              حسناً، فهمت الإجراءات
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
