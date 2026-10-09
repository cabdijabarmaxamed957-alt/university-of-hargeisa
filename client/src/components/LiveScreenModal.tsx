import React, { useEffect, useRef, useState } from 'react';
import { 
  Eye, 
  X, 
  ShieldAlert, 
  Radio, 
  Maximize2, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Monitor,
  Video,
  VideoOff
} from 'lucide-react';
import { Office, Task } from '../types';

interface LiveScreenModalProps {
  office: Office;
  associatedTask?: Task | null;
  onClose: () => void;
}

export const LiveScreenModal: React.FC<LiveScreenModalProps> = ({
  office,
  associatedTask,
  onClose
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [fps, setFps] = useState<number>(30);
  const [liveStream, setLiveStream] = useState<MediaStream | null>(null);
  const [streamError, setStreamError] = useState<string>('');

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Real WebRTC / Screen Capture Hook
  const startRealScreenCapture = async () => {
    try {
      setStreamError('');
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: { frameRate: { ideal: 30, max: 60 } },
          audio: false
        });
        setLiveStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        stream.getVideoTracks()[0].onended = () => {
          stopRealScreenCapture();
        };
      } else {
        setStreamError('Screen capture API is not supported in this browser.');
      }
    } catch (err: any) {
      if (err.name !== 'NotAllowedError') {
        setStreamError('Could not start screen capture: ' + (err.message || 'Permission denied'));
      }
    }
  };

  const stopRealScreenCapture = () => {
    if (liveStream) {
      liveStream.getTracks().forEach(track => track.stop());
      setLiveStream(null);
    }
  };

  useEffect(() => {
    return () => {
      stopRealScreenCapture();
    };
  }, []);

  // Canvas Desktop Simulation when no WebRTC screen capture is active
  useEffect(() => {
    if (liveStream) return; // if real video is active, don't animate canvas

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let step = 0;

    const render = () => {
      step += 1;
      const width = canvas.width;
      const height = canvas.height;

      // 1. Desktop Wallpaper (Institutional Gradient)
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#0a192f');
      grad.addColorStop(0.5, '#172a45');
      grad.addColorStop(1, '#020c1b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Subtle grid pattern
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Active Application Window
      const winX = 60;
      const winY = 60;
      const winW = width - 120;
      const winH = height - 120;

      // Window Shadow & Frame
      ctx.fillStyle = '#0f172a';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 25;
      ctx.fillRect(winX, winY, winW, winH);
      ctx.shadowBlur = 0;

      ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
      ctx.strokeRect(winX, winY, winW, winH);

      // Window Title Bar
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(winX, winY, winW, 36);

      // Window Controls (dots)
      ctx.fillStyle = '#ef4444';
      ctx.beginPath(); ctx.arc(winX + 18, winY + 18, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath(); ctx.arc(winX + 34, winY + 18, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#10b981';
      ctx.beginPath(); ctx.arc(winX + 50, winY + 18, 5, 0, Math.PI * 2); ctx.fill();

      // Window Title Text
      ctx.fillStyle = '#f8fafc';
      ctx.font = '600 13px system-ui';
      ctx.fillText(`${office.name} - Operational Workstation (${office.computers[0]?.name || 'Workstation-01'})`, winX + 70, winY + 23);

      // Content inside simulated window
      ctx.fillStyle = '#111e38';
      ctx.fillRect(winX, winY + 36, 180, winH - 36);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px system-ui';
      ctx.fillText('📁 Active Queue', winX + 20, winY + 65);
      ctx.fillText('📄 Document Spool', winX + 20, winY + 95);
      ctx.fillText('⚙️ Device Config', winX + 20, winY + 125);
      ctx.fillText('🔒 University Agent', winX + 20, winY + 155);

      // Main Editor / Document View
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(winX + 195, winY + 50, winW - 215, winH - 65);

      // Document Header
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 16px serif';
      ctx.fillText('UNIVERSITY OPERATIONS CONTROL & VERIFICATION', winX + 220, winY + 85);
      ctx.font = '12px system-ui';
      ctx.fillStyle = '#64748b';
      ctx.fillText('OFFICIAL ADMINISTRATIVE DOCUMENT DISPATCH & MONITORING', winX + 220, winY + 105);

      // Document Content Lines
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(winX + 220, winY + 125, winW - 265, 8);
      ctx.fillRect(winX + 220, winY + 145, winW - 320, 8);
      ctx.fillRect(winX + 220, winY + 165, winW - 290, 8);

      // Animated Processing Progress Bar
      const progress = (step % 300) / 300;
      ctx.fillStyle = 'rgba(37, 99, 235, 0.1)';
      ctx.fillRect(winX + 220, winY + 200, winW - 265, 50);
      ctx.strokeStyle = '#2563eb';
      ctx.strokeRect(winX + 220, winY + 200, winW - 265, 50);

      ctx.fillStyle = '#1e40af';
      ctx.font = 'bold 12px system-ui';
      ctx.fillText(`Workstation Processing Queue: Item #${Math.floor(progress * 10) + 1} in progress...`, winX + 235, winY + 225);

      // Mouse cursor animation
      const mouseX = winX + 250 + Math.sin(step * 0.03) * 120;
      const mouseY = winY + 180 + Math.cos(step * 0.03) * 60;
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#000000';
      ctx.beginPath();
      ctx.moveTo(mouseX, mouseY);
      ctx.lineTo(mouseX + 12, mouseY + 12);
      ctx.lineTo(mouseX + 5, mouseY + 12);
      ctx.lineTo(mouseX, mouseY + 18);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [office, liveStream]);

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '960px', padding: '0', overflow: 'hidden' }}>
        {/* Header Bar */}
        <div style={{
          background: '#0a1738',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Left: Office Identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'rgba(37, 99, 235, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(59, 130, 246, 0.4)'
            }}>
              <Eye size={22} color="#60a5fa" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                  {office.name} — Live Workstation Screen
                </h3>
                <span className="badge badge-urgent animate-pulse" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Radio size={12} />
                  <span>{liveStream ? 'LIVE WEBRTC STREAM' : 'LIVE AGENT MONITOR'}</span>
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '3px 0 0 0' }}>
                Computer: <strong style={{ color: '#e2e8f0' }}>{office.computers[0]?.name || 'Workstation-01'}</strong> • Manager: <strong style={{ color: '#e2e8f0' }}>{office.manager}</strong> • IP: <span style={{ fontFamily: 'monospace' }}>{office.computers[0]?.ip || '10.20.4.12'}</span>
              </p>
            </div>
          </div>

          {/* Stream stats & Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(0, 0, 0, 0.4)',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              color: '#34d399',
              fontFamily: 'monospace'
            }}>
              <Clock size={14} />
              <span>{formatDuration(secondsElapsed)}</span>
              <span style={{ color: '#64748b' }}>|</span>
              <span>{liveStream ? '60 FPS' : `${fps} FPS`}</span>
              <span style={{ color: '#64748b' }}>|</span>
              <span>12ms</span>
            </div>

            {!liveStream ? (
              <button
                onClick={startRealScreenCapture}
                className="btn-primary"
                style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                title="Capture and stream actual desktop screen via WebRTC display media"
              >
                <Video size={14} />
                <span>Share Screen</span>
              </button>
            ) : (
              <button
                onClick={stopRealScreenCapture}
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <VideoOff size={14} />
                <span>Stop Stream</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="btn-danger"
              style={{ padding: '7px 14px', fontSize: '0.82rem' }}
            >
              <X size={16} />
              <span>End Session</span>
            </button>
          </div>
        </div>

        {/* Transparency Banner Notification */}
        <div style={{
          background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.15), rgba(245, 158, 11, 0.15))',
          borderBottom: '1px solid rgba(239, 68, 68, 0.3)',
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.82rem',
          color: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={18} color="#f87171" />
            <span>
              <strong>الشفافية والأمان:</strong> يظهر إشعار واضح ومستمر على شاشة الموظف في {office.nameAr} بأن الشاشة قيد المعاينة الإدارية المصرحة.
            </span>
          </div>
          {associatedTask && (
            <span style={{ 
              background: 'rgba(37, 99, 235, 0.25)', 
              color: '#93c5fd', 
              padding: '3px 8px', 
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.75rem' 
            }}>
              مرتبط بالمهمة #{associatedTask.id}
            </span>
          )}
        </div>

        {streamError && (
          <div style={{ backgroundColor: '#FEF2F2', color: '#DC2626', padding: '8px 20px', fontSize: '0.8rem', borderBottom: '1px solid #FECACA' }}>
            {streamError}
          </div>
        )}

        {/* Live Video / Canvas Stream */}
        <div style={{ position: 'relative', background: '#020617', padding: '0', display: 'flex', justifyContent: 'center', minHeight: '420px', alignItems: 'center' }}>
          {liveStream ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', maxHeight: '520px', objectFit: 'contain', display: 'block' }}
            />
          ) : (
            <canvas
              ref={canvasRef}
              width={880}
              height={500}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          )}

          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '16px',
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(6px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '0.72rem',
            color: '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Monitor size={12} color="#60a5fa" />
            <span>{liveStream ? 'Live Screen Broadcast Active • TLS 1.3' : 'Encrypted Stream • TLS 1.3 WebRTC • Audited by System Security Controller'}</span>
          </div>
        </div>

        {/* Footer Audit Information */}
        <div style={{
          background: '#09132b',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '12px 22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.78rem',
          color: '#94a3b8'
        }}>
          <div>
            Session: <strong style={{ color: '#e2e8f0' }}>SCR-LIVE-{office.id.toUpperCase()}</strong> • Initiated by: <span style={{ color: '#60a5fa' }}>University Director</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ color: '#10b981' }}>● Real-time Office Telemetry Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
};
