import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Search, 
  Paperclip, 
  CheckCheck, 
  Clock, 
  Building2, 
  User, 
  ShieldCheck, 
  Sparkles, 
  Filter, 
  PlusCircle,
  Eye,
  CheckCircle2,
  AlertCircle,
  Megaphone
} from 'lucide-react';
import { Office, DirectMessage } from '../types';

interface MessagesCenterProps {
  offices: Office[];
  selectedOfficeId: string;
  onSelectOffice: (id: string) => void;
  messages: DirectMessage[];
  onSendMessage: (officeId: string, content: string) => void;
  onOpenCreateTask?: (officeId: string) => void;
  onStartScreenView?: (officeId: string, taskId?: string) => void;
}

export const MessagesCenter: React.FC<MessagesCenterProps> = ({
  offices,
  selectedOfficeId,
  onSelectOffice,
  messages,
  onSendMessage,
  onOpenCreateTask,
  onStartScreenView
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'academic' | 'administrative'>('all');
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedOffice = offices.find(o => o.id === selectedOfficeId) || offices[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedOfficeId]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    onSendMessage(selectedOfficeId, inputText.trim());
    setInputText('');
  };

  const filteredOffices = offices.filter(office => {
    const matchesSearch = office.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          office.nameAr.includes(searchTerm) ||
                          office.manager.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    if (activeFilter === 'unread') return (office.unreadMessages ?? 0) > 0;
    if (activeFilter === 'academic') return office.category === 'Academic';
    if (activeFilter === 'administrative') return office.category === 'Administrative';
    return true;
  });

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '360px 1fr',
      gap: '20px',
      height: 'calc(100vh - 140px)',
      minHeight: '620px'
    }}>
      {/* ── LEFT PANE: Conversation & Office Inboxes ── */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden'
      }}>
        {/* Header with Search & Filter Tabs */}
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <MessageSquare size={18} />
              </div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                مراسلات المكاتب
              </h2>
            </div>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              backgroundColor: '#EFF6FF',
              color: '#1D4ED8',
              padding: '3px 9px',
              borderRadius: '20px'
            }}>
              {offices.length} مكاتب مسجلة
            </span>
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', right: '12px', top: '11px' }} />
            <input
              type="text"
              placeholder="بحث في المكاتب أو المدراء..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 38px 9px 12px',
                borderRadius: '10px',
                border: '1px solid #CBD5E1',
                fontSize: '0.84rem',
                backgroundColor: '#F8FAFC',
                color: '#0F172A',
                outline: 'none'
              }}
            />
          </div>

          {/* Filter Chips */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
            <button
              onClick={() => setActiveFilter('all')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: activeFilter === 'all' ? '#0A192F' : '#F1F5F9',
                color: activeFilter === 'all' ? '#FFFFFF' : '#64748B',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              الكل
            </button>
            <button
              onClick={() => setActiveFilter('unread')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: activeFilter === 'unread' ? '#2563EB' : '#F1F5F9',
                color: activeFilter === 'unread' ? '#FFFFFF' : '#64748B',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              غير المقروءة
            </button>
            <button
              onClick={() => setActiveFilter('academic')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: activeFilter === 'academic' ? '#0A192F' : '#F1F5F9',
                color: activeFilter === 'academic' ? '#FFFFFF' : '#64748B',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              أكاديمية
            </button>
            <button
              onClick={() => setActiveFilter('administrative')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: activeFilter === 'administrative' ? '#0A192F' : '#F1F5F9',
                color: activeFilter === 'administrative' ? '#FFFFFF' : '#64748B',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              إدارية
            </button>
          </div>
        </div>

        {/* Office Conversation List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          {filteredOffices.map((office) => {
            const isSelected = office.id === selectedOfficeId;

            return (
              <div
                key={office.id}
                onClick={() => onSelectOffice(office.id)}
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  marginBottom: '4px',
                  backgroundColor: isSelected ? '#EFF6FF' : 'transparent',
                  border: isSelected ? '1.5px solid #3B82F6' : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = '#F8FAFC';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      backgroundColor: isSelected ? '#1E3A8A' : '#F1F5F9',
                      color: isSelected ? '#FFFFFF' : '#1E293B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.9rem'
                    }}>
                      <Building2 size={20} />
                    </div>
                    {/* Status Dot */}
                    <div style={{
                      position: 'absolute',
                      bottom: '-2px',
                      right: '-2px',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: office.status === 'online' ? '#10B981' : '#94A3B8',
                      border: '2px solid #FFFFFF'
                    }} />
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      color: '#0F172A',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {office.nameAr}
                    </div>
                    <div style={{
                      fontSize: '0.74rem',
                      color: '#64748B',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {office.manager}
                    </div>
                  </div>
                </div>

                {(office.unreadMessages ?? 0) > 0 && (
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    borderRadius: '12px',
                    padding: '2px 8px',
                    flexShrink: 0
                  }}>
                    {office.unreadMessages}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── RIGHT PANE: Dedicated Real-Time Chat Workspace ── */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden'
      }}>
        {/* Chat Conversation Top Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #E2E8F0',
          backgroundColor: '#F8FAFC',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: '#0A192F',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(10, 25, 47, 0.2)'
            }}>
              <Building2 size={22} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  {selectedOffice?.nameAr}
                </h3>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  backgroundColor: selectedOffice?.status === 'online' ? '#ECFDF5' : '#F1F5F9',
                  color: selectedOffice?.status === 'online' ? '#059669' : '#64748B',
                  border: selectedOffice?.status === 'online' ? '1px solid #A7F3D0' : '1px solid #CBD5E1'
                }}>
                  {selectedOffice?.status === 'online' ? 'متصل الآن 🟢' : 'غير متصل ⚪'}
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>المسؤول: <strong>{selectedOffice?.manager}</strong></span>
                <span>•</span>
                <span>الموقع: {selectedOffice?.location}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions in Chat Header */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {onOpenCreateTask && (
              <button
                onClick={() => onOpenCreateTask(selectedOffice.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  border: '1px solid #3B82F6',
                  backgroundColor: '#EFF6FF',
                  color: '#1D4ED8',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <PlusCircle size={15} />
                <span>إسناد مهمة</span>
              </button>
            )}

            {onStartScreenView && selectedOffice && (
              <button
                onClick={() => onStartScreenView(selectedOffice.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  border: '1px solid #10B981',
                  backgroundColor: '#ECFDF5',
                  color: '#047857',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Eye size={15} />
                <span>بث الشاشة</span>
              </button>
            )}
          </div>
        </div>

        {/* Message Stream Area */}
        <div style={{
          flex: 1,
          padding: '24px',
          overflowY: 'auto',
          backgroundColor: '#F8FAFC',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {messages.length === 0 ? (
            <div style={{
              margin: 'auto',
              textAlign: 'center',
              color: '#94A3B8',
              padding: '40px 20px'
            }}>
              <MessageSquare size={44} style={{ opacity: 0.4, marginBottom: '12px' }} />
              <div style={{ fontSize: '0.98rem', fontWeight: 700, color: '#475569' }}>
                لا توجد رسائل سابقة مع هذا المكتب
              </div>
              <p style={{ fontSize: '0.82rem', maxWidth: '300px', margin: '6px auto 0' }}>
                يمكنك بدء التواصل المباشر وإرسال التوجيهات أو الاستفسارات وسيقوم المكتب بالرد الفوري.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isFromDirector = msg.sender === 'director';

              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isFromDirector ? 'flex-start' : 'flex-end'
                  }}
                >
                  <div style={{
                    maxWidth: '75%',
                    padding: '14px 18px',
                    borderRadius: isFromDirector ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
                    backgroundColor: isFromDirector ? '#0A192F' : '#FFFFFF',
                    color: isFromDirector ? '#FFFFFF' : '#0F172A',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                    border: isFromDirector ? 'none' : '1px solid #E2E8F0'
                  }}>
                    <div style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: isFromDirector ? '#60A5FA' : '#2563EB',
                      marginBottom: '4px'
                    }}>
                      {isFromDirector ? 'إدارة الجامعة (University Director)' : msg.senderName}
                    </div>

                    <div style={{ fontSize: '0.92rem', lineHeight: 1.55, wordBreak: 'break-word' }}>
                      {msg.content}
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: '4px',
                      marginTop: '6px',
                      fontSize: '0.68rem',
                      color: isFromDirector ? '#94A3B8' : '#94A3B8'
                    }}>
                      <span>{msg.timestamp}</span>
                      {isFromDirector && <CheckCheck size={13} color="#60A5FA" />}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Composition Input Area */}
        <form
          onSubmit={handleSend}
          style={{
            padding: '16px 20px',
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <input
            type="text"
            placeholder={`اكتب رسالة أو توجيهاً لمكتب ${selectedOffice?.nameAr}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '10px',
              border: '1.5px solid #CBD5E1',
              fontSize: '0.9rem',
              color: '#0F172A',
              backgroundColor: '#F8FAFC',
              outline: 'none'
            }}
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: inputText.trim() ? 'pointer' : 'not-allowed',
              opacity: inputText.trim() ? 1 : 0.6,
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
            }}
          >
            <span>إرسال</span>
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
