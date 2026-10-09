/**
 * server/index.js — University Operations Backend
 * Secure REST + WebSocket server with JWT auth, persistent storage,
 * rate limiting, file uploads, and office isolation.
 */

import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { db } from './datastore.js';
import {
  verifyPassword,
  generateToken,
  authenticateToken,
  requireRole,
  requireOfficeAccess
} from './auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:4173'],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS']
}));
app.use(express.json({ limit: '10mb' }));

// ─── FILE UPLOADS ─────────────────────────────────────────────────────────────

const UPLOADS_DIR = path.join(__dirname, 'uploads');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const ALLOWED_EXTENSIONS = [
  '.pdf', '.doc', '.docx', '.xls', '.xlsx',
  '.png', '.jpg', '.jpeg', '.gif', '.csv',
  '.txt', '.ppt', '.pptx', '.zip'
];
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${path.extname(file.originalname).toLowerCase()}`;
    cb(null, safeName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_EXTENSIONS.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`));
    }
  }
});

// ─── RATE LIMITING ────────────────────────────────────────────────────────────

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min window
  max: 10, // max 10 login attempts per IP
  message: { error: 'Too many login attempts. Please wait 15 minutes and try again.' },
  standardHeaders: true,
  legacyHeaders: false
});

// ─── WEBSOCKET ────────────────────────────────────────────────────────────────

function broadcast(type, payload) {
  const message = JSON.stringify({ type, payload, timestamp: new Date().toISOString() });
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

wss.on('connection', (ws) => {
  // Send initial state snapshot to new client
  try {
    const stats = db.getReportStats(null);
    const screenSessions = db.getActiveScreenSessionsMap();
    const offices = db.getOffices();
    ws.send(JSON.stringify({
      type: 'INIT_STATE',
      payload: { stats, screenSessions, officeCount: offices.length },
      timestamp: new Date().toISOString()
    }));
  } catch (err) {
    console.error('WS init error:', err.message);
  }

  ws.on('message', (rawMsg) => {
    try {
      const data = JSON.parse(rawMsg.toString());
      // Desktop agent can push screen frames via WebSocket
      if (data.type === 'SCREEN_FRAME') {
        broadcast('SCREEN_FRAME', data.payload);
      }
      // Device heartbeat via WS (alternative to REST)
      if (data.type === 'DEVICE_HEARTBEAT') {
        const { deviceId, token, agentVersion } = data.payload || {};
        if (deviceId && token) {
          const device = db.getDeviceByToken(token);
          if (device && device.id === deviceId) {
            db.updateDeviceHeartbeat(deviceId, agentVersion);
          }
        }
      }
    } catch {
      // ignore malformed messages
    }
  });

  ws.on('error', () => {});
});

// ─── HEALTH ENDPOINT (public) ─────────────────────────────────────────────────

app.get('/api/ping', (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// ─── AUTH ROUTES ──────────────────────────────────────────────────────────────

app.post('/api/auth/login', authLimiter, async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = db.getUserByEmail(email.toLowerCase().trim());

  // Use a fixed-time comparison path to prevent timing attacks / user enumeration
  const dummyHash = '$2a$10$X4kv7j5ZcG39WgogSl16xuW55peNGZ4JfqH4cq2MrKFzPHmwR6Vwy';
  const hash = user ? user.passwordHash : dummyHash;
  const valid = await verifyPassword(password, hash);

  if (!user || !valid) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  // Update last login
  db.updateLastLogin(user.id);

  db.addAuditLog({
    type: 'AUTH_LOGIN',
    action: `User "${user.fullName}" (${user.role}) logged in successfully.`,
    office: user.officeId || 'System',
    actor: user.fullName,
    severity: 'info'
  });

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
    officeId: user.officeId,
    fullName: user.fullName
  });

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      officeId: user.officeId,
      fullName: user.fullName
    }
  });
});

app.post('/api/auth/logout', authenticateToken, (req, res) => {
  db.addAuditLog({
    type: 'AUTH_LOGOUT',
    action: `User "${req.user.fullName}" logged out.`,
    office: req.user.officeId || 'System',
    actor: req.user.fullName,
    severity: 'info'
  });
  res.json({ message: 'Logged out successfully.' });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = db.getUserById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  const userData = {
    id: user.id,
    email: user.email,
    role: user.role,
    officeId: user.officeId,
    fullName: user.fullName
  };
  res.json({
    ...userData,
    user: userData
  });
});

// ─── HEALTH / IT MONITORING ───────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  const t0 = Date.now();
  const dbHealthy = db.isHealthy();
  const dbLatency = Date.now() - t0;

  const devices = db.getDevices();
  const onlineDevices = devices.filter(d => {
    if (!d.lastHeartbeat) return d.status === 'online' && !d.token;
    return (Date.now() - new Date(d.lastHeartbeat).getTime()) < 90000;
  });

  res.json({
    status: dbHealthy ? 'ok' : 'degraded',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    services: {
      api: { status: 'ok', responseTimeMs: Date.now() - t0 },
      database: { status: dbHealthy ? 'ok' : 'error', queryTimeMs: dbLatency },
      websocket: { status: 'ok', connectedClients: wss.clients.size },
      devices: {
        total: devices.length,
        online: onlineDevices.length,
        offline: devices.length - onlineDevices.length,
        registeredAgents: devices.filter(d => !!d.token).length
      }
    }
  });
});

// ─── STATS ────────────────────────────────────────────────────────────────────

app.get('/api/stats', authenticateToken, (req, res) => {
  const officeFilter = req.user.role === 'office_manager' ? req.user.officeId : null;
  const stats = db.getReportStats(officeFilter);
  const messages = db.getMessages();
  const unread = messages.filter(m => !m.isRead && m.senderRole === 'office').length;

  res.json({
    totalOffices: stats.totalOffices,
    onlineOffices: stats.onlineOffices,
    offlineOffices: stats.totalOffices - stats.onlineOffices,
    pendingTasks: stats.pendingTasks,
    activeTasks: stats.activeTasks,
    completedTasks: stats.completedTasks,
    totalTasks: stats.totalTasks,
    unreadMessages: unread,
    activeScreenSessionsCount: db.getActiveScreenSessions().length
  });
});

app.get('/api/stats/reports', authenticateToken, (req, res) => {
  const officeFilter = req.user.role === 'office_manager' ? req.user.officeId : (req.query.officeId || null);
  res.json(db.getReportStats(officeFilter));
});

// ─── OFFICES ──────────────────────────────────────────────────────────────────

app.get('/api/offices', authenticateToken, (req, res) => {
  const offices = db.getOffices();
  if (req.user.role === 'office_manager') {
    return res.json(offices.filter(o => o.id === req.user.officeId));
  }
  res.json(offices);
});

app.post('/api/offices', authenticateToken, requireRole(['director']), (req, res) => {
  const { name, nameAr, manager, category, location } = req.body || {};
  if (!name?.trim() || !manager?.trim()) {
    return res.status(400).json({ error: 'Office name and manager name are required.' });
  }
  const id = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_');
  const existing = db.getOfficeById(id);
  if (existing) return res.status(409).json({ error: 'An office with this name already exists.' });

  const newOffice = db.addOffice({ id, name: name.trim(), nameAr: nameAr?.trim() || name.trim(), manager: manager.trim(), category, location });
  db.addAuditLog({
    type: 'OFFICE_ADDED',
    action: `New office registered: "${name}" (Manager: ${manager})`,
    office: name,
    actor: req.user.fullName,
    severity: 'info'
  });
  broadcast('OFFICE_ADDED', newOffice);
  res.status(201).json(newOffice);
});

// ─── TASKS ────────────────────────────────────────────────────────────────────

app.get('/api/tasks', authenticateToken, (req, res) => {
  const tasks = db.getTasks();
  if (req.user.role === 'office_manager') {
    return res.json(tasks.filter(t => t.officeId === req.user.officeId));
  }
  res.json(tasks);
});

app.post('/api/tasks', authenticateToken, requireRole(['director', 'it_admin']), (req, res) => {
  const { title, titleAr, description, officeId, priority, attachment } = req.body || {};
  if (!title?.trim() || !officeId) {
    return res.status(400).json({ error: 'Task title and target office are required.' });
  }
  const office = db.getOfficeById(officeId);
  if (!office) return res.status(404).json({ error: 'Office not found.' });

  const newTask = db.addTask({
    title: title.trim(),
    titleAr: titleAr?.trim() || title.trim(),
    description: description?.trim() || '',
    officeId,
    officeName: office.name,
    manager: office.manager,
    priority: priority || 'normal',
    createdBy: req.user.id,
    attachment: attachment || null
  });

  db.addAuditLog({
    type: 'TASK_CREATED',
    action: `Task created: "${title}" → [${office.name}] (Priority: ${priority || 'normal'})`,
    office: office.name,
    actor: req.user.fullName,
    severity: priority === 'urgent' ? 'high' : 'info'
  });

  broadcast('TASK_CREATED', newTask);
  res.status(201).json(newTask);
});

app.patch('/api/tasks/:id/status', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { status, note } = req.body || {};
  const { role, officeId: userOfficeId, fullName } = req.user;

  if (!status) return res.status(400).json({ error: 'New status is required.' });

  const task = db.getTaskById(id);
  if (!task) return res.status(404).json({ error: 'Task not found.' });

  // Office managers: own office tasks only
  if (role === 'office_manager' && task.officeId !== userOfficeId) {
    return res.status(403).json({ error: 'Access denied: this task belongs to a different office.' });
  }

  // Enforce valid state machine transitions
  const VALID_TRANSITIONS = {
    'new': ['received', 'accepted', 'in_progress', 'cancelled'],
    'received': ['accepted', 'in_progress', 'cancelled'],
    'accepted': ['in_progress', 'completed', 'cancelled'],
    'in_progress': ['completed', 'accepted', 'cancelled'],
    'completed': ['verified', 'in_progress'],
    'verified': ['in_progress'],
    'cancelled': ['new']
  };

  const allowed = VALID_TRANSITIONS[task.status] || [];
  if (!allowed.includes(status)) {
    return res.status(400).json({
      error: `Invalid transition: cannot move task from "${task.status}" to "${status}".`,
      allowedTransitions: allowed
    });
  }

  const updated = db.updateTaskStatus(id, status, fullName, note);
  db.addAuditLog({
    type: 'TASK_STATUS_UPDATED',
    action: `Task [${id.slice(-8)}] status changed: ${task.status} → ${status}`,
    office: task.officeName,
    actor: fullName,
    severity: status === 'completed' || status === 'verified' ? 'success' : 'info'
  });

  broadcast('TASK_UPDATED', updated);
  res.json(updated);
});

// ─── MESSAGES ─────────────────────────────────────────────────────────────────

app.get('/api/messages/:officeId', authenticateToken, requireOfficeAccess('officeId'), (req, res) => {
  res.json(db.getMessagesByOffice(req.params.officeId));
});

app.post('/api/messages', authenticateToken, (req, res) => {
  const { officeId, content } = req.body || {};
  const { role, officeId: userOfficeId, fullName, id: userId } = req.user;

  if (!officeId || !content?.trim()) {
    return res.status(400).json({ error: 'officeId and message content are required.' });
  }

  // Office managers can only send to their own office
  if (role === 'office_manager' && officeId !== userOfficeId) {
    return res.status(403).json({ error: 'You can only send messages to your own office.' });
  }

  const office = db.getOfficeById(officeId);
  if (!office) return res.status(404).json({ error: 'Office not found.' });

  const newMsg = db.addMessage({
    officeId,
    senderRole: role === 'office_manager' ? 'office' : 'director',
    senderName: fullName,
    senderUserId: userId,
    content: content.trim()
  });

  db.addAuditLog({
    type: 'MESSAGE_SENT',
    action: `Message sent to [${office.name}] by ${fullName}`,
    office: office.name,
    actor: fullName,
    severity: 'info'
  });

  broadcast('NEW_MESSAGE', newMsg);
  res.status(201).json(newMsg);
});

app.patch('/api/messages/:officeId/read', authenticateToken, requireOfficeAccess('officeId'), (req, res) => {
  db.markMessagesRead(req.params.officeId);
  res.json({ success: true });
});

// ─── ANNOUNCEMENTS ────────────────────────────────────────────────────────────

app.get('/api/announcements', authenticateToken, (_req, res) => {
  res.json(db.getAnnouncements());
});

app.post('/api/announcements', authenticateToken, requireRole(['director']), (req, res) => {
  const { title, titleAr, content, message, targetOffices } = req.body || {};
  const bodyText = content || message;
  if (!title?.trim() || !bodyText?.trim()) {
    return res.status(400).json({ error: 'Title and content are required.' });
  }

  const allOffices = db.getOffices();
  let targetList = allOffices;
  let targetDesc = 'all_offices';

  if (Array.isArray(targetOffices) && targetOffices.length > 0) {
    targetList = allOffices.filter(o => targetOffices.includes(o.id));
    if (targetList.length === 0) return res.status(400).json({ error: 'No valid target offices found.' });
    targetDesc = targetOffices.join(',');
  }

  const newAnn = db.addAnnouncement({
    title: title.trim(),
    titleAr: titleAr?.trim() || title.trim(),
    content: bodyText.trim(),
    sentBy: req.user.fullName,
    target: targetDesc,
    offices: targetList
  });

  db.addAuditLog({
    type: 'ANNOUNCEMENT_BROADCAST',
    action: `Announcement: "${title}" broadcast to ${targetList.length} office(s)`,
    office: targetList.length === allOffices.length ? 'All Offices' : targetList.map(o => o.name).join(', '),
    actor: req.user.fullName,
    severity: 'high'
  });

  broadcast('NEW_ANNOUNCEMENT', newAnn);
  res.status(201).json(newAnn);
});

// ─── AUDIT LOGS ───────────────────────────────────────────────────────────────

app.get('/api/audit-logs', authenticateToken, requireRole(['director', 'it_admin']), (_req, res) => {
  res.json(db.getAuditLogs());
});

// ─── SCREEN SESSIONS ──────────────────────────────────────────────────────────

app.get('/api/screen-sessions', authenticateToken, requireRole(['director', 'it_admin']), (_req, res) => {
  res.json(db.getActiveScreenSessionsMap());
});

app.post('/api/screen/start', authenticateToken, requireRole(['director', 'it_admin']), (req, res) => {
  const { officeId, taskId } = req.body || {};
  if (!officeId) return res.status(400).json({ error: 'officeId is required.' });

  const office = db.getOfficeById(officeId);
  if (!office) return res.status(404).json({ error: 'Office not found.' });
  if (office.status === 'offline') {
    return res.status(400).json({ error: 'Cannot start screen view: the office computer is offline or no agent is connected.' });
  }

  const session = db.startScreenSession({
    officeId,
    officeName: office.name,
    manager: office.manager,
    computerName: (office.computers?.[0]?.name) || 'Office-Workstation',
    requestedBy: req.user.fullName,
    taskId: taskId || null
  });

  db.addAuditLog({
    type: 'SCREEN_SESSION_STARTED',
    action: `Live screen view initiated on [${office.name}] by ${req.user.fullName}`,
    office: office.name,
    actor: req.user.fullName,
    severity: 'warning'
  });

  broadcast('SCREEN_SESSION_STARTED', session);
  res.status(201).json({
    success: true,
    id: session.id,
    officeId: session.officeId,
    officeName: session.officeName,
    manager: session.manager,
    computerName: session.computerName,
    requestedBy: session.requestedBy,
    startedAt: session.startedAt,
    session
  });
});

app.post('/api/screen/stop', authenticateToken, requireRole(['director', 'it_admin']), (req, res) => {
  const { officeId } = req.body || {};
  if (!officeId) return res.status(400).json({ error: 'officeId is required.' });

  const session = db.endScreenSession(officeId);
  if (!session) return res.status(404).json({ error: 'No active screen session found for this office.' });

  db.addAuditLog({
    type: 'SCREEN_SESSION_CLOSED',
    action: `Live screen session ended for [${officeId}]`,
    office: officeId,
    actor: req.user.fullName,
    severity: 'info'
  });

  broadcast('SCREEN_SESSION_ENDED', { officeId, sessionId: session.id });
  res.json({ success: true });
});

// ─── DEVICE HEARTBEAT (Device Agent auth or JWT) ──────────────────────────────

app.post('/api/devices/heartbeat', (req, res) => {
  const { deviceId, token, agentVersion, status } = req.body || {};
  if (!deviceId) {
    return res.status(400).json({ error: 'deviceId is required.' });
  }

  // Allow heartbeat if token matches or device exists
  let authenticated = false;
  if (token) {
    const device = db.getDeviceByToken(token);
    if (device && device.id === deviceId) authenticated = true;
  }
  
  // Or check auth header
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    authenticated = true;
  }

  // Update heartbeat in DB
  db.updateDeviceHeartbeat(deviceId, agentVersion);
  res.json({ success: true, received: true, serverTime: new Date().toISOString() });
});

app.get('/api/devices', authenticateToken, requireRole(['director', 'it_admin']), (_req, res) => {
  res.json(db.getDevices());
});

// ─── FILE UPLOAD / DOWNLOAD ───────────────────────────────────────────────────

app.post('/api/upload', authenticateToken, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file was uploaded.' });

  const att = db.addAttachment({
    filename: req.file.filename,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
    uploadedBy: req.user.id,
    taskId: req.body.taskId || null
  });

  res.status(201).json({
    id: att.id,
    name: req.file.originalname,
    size: req.file.size > 1024 * 1024
      ? `${(req.file.size / 1024 / 1024).toFixed(2)} MB`
      : `${(req.file.size / 1024).toFixed(1)} KB`,
    mimeType: req.file.mimetype,
    url: `/api/files/${att.id}`
  });
});

app.get('/api/files/:id', authenticateToken, (req, res) => {
  const att = db.getAttachmentById(req.params.id);
  if (!att) return res.status(404).json({ error: 'File not found.' });

  const filePath = path.join(UPLOADS_DIR, att.filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found on server.' });

  res.setHeader('Content-Disposition', `attachment; filename="${att.originalName}"`);
  res.setHeader('Content-Type', att.mimeType || 'application/octet-stream');
  fs.createReadStream(filePath).pipe(res);
});

// ─── 404 CATCH-ALL ────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ error: 'API endpoint not found.' });
});

// ─── GLOBAL ERROR HANDLER ─────────────────────────────────────────────────────

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('Server Error:', err);
  res.status(500).json({ error: 'An internal server error occurred.' });
});

// ─── START ────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log('\n🏛️  University Operations Backend v2.0');
  console.log(`   REST API: http://localhost:${PORT}/api`);
  console.log(`   WebSocket: ws://localhost:${PORT}`);
  console.log(`   Database:  ${path.join(__dirname, 'data', 'university.json')}`);
  console.log('\n');
});
