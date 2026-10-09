/**
 * datastore.js — JSON file-based persistent storage
 * Replaces in-memory state. Data survives server restarts.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'university.json');

// ─── INITIAL SEED DATA ────────────────────────────────────────────────────────

function buildInitialData() {
  const now = new Date().toISOString();
  return {
    _meta: { version: '2.0', seeded: true, createdAt: now },

    // Users — passwords are hashed at first-boot
    users: [
      {
        id: 'u1', email: 'director@university.edu',
        passwordHash: bcrypt.hashSync('UniversityDirector@2026!', 10),
        role: 'director', officeId: null, fullName: 'Dr. Mohammed Al-Qassim',
        isActive: true, createdAt: now, lastLogin: null
      },
      {
        id: 'u2', email: 'ahmed@university.edu',
        passwordHash: bcrypt.hashSync('AhmedPrinting@2026!', 10),
        role: 'office_manager', officeId: 'printing', fullName: 'Ahmed Al-Mansoor',
        isActive: true, createdAt: now, lastLogin: null
      },
      {
        id: 'u3', email: 'hassan@university.edu',
        passwordHash: bcrypt.hashSync('HassanLibrary@2026!', 10),
        role: 'office_manager', officeId: 'medical_library', fullName: 'Hassan Al-Omari',
        isActive: true, createdAt: now, lastLogin: null
      },
      {
        id: 'u4', email: 'omar@university.edu',
        passwordHash: bcrypt.hashSync('OmarFinance@2026!', 10),
        role: 'office_manager', officeId: 'finance', fullName: 'Omar Al-Farhan',
        isActive: true, createdAt: now, lastLogin: null
      },
      {
        id: 'u5', email: 'noc@university.edu',
        passwordHash: bcrypt.hashSync('NOCAdmin@2026!', 10),
        role: 'it_admin', officeId: null, fullName: 'Network Operations Center',
        isActive: true, createdAt: now, lastLogin: null
      }
    ],

    offices: [
      {
        id: 'printing', name: 'Printing Office', nameAr: 'مكتب الطباعة والتصوير',
        manager: 'Ahmed Al-Mansoor', category: 'Operational',
        location: 'Central Campus - Bldg B, Ground Floor', status: 'online',
        computers: [
          { id: 'DEV-PRN-01', name: 'Printing-Main-PC', os: 'Windows 11 Pro', status: 'online', agentVersion: '1.2.0', lastPing: now, ip: '10.20.4.12', token: 'DEV_AGENT_TOKEN_PRN_01' },
          { id: 'DEV-PRN-02', name: 'HighSpeed-Plotter-PC', os: 'Windows 10 Enterprise', status: 'online', agentVersion: '1.2.0', lastPing: now, ip: '10.20.4.15', token: 'DEV_AGENT_TOKEN_PRN_02' }
        ]
      },
      {
        id: 'medical_library', name: 'Medical Library', nameAr: 'المكتبة الطبية',
        manager: 'Hassan Al-Omari', category: 'Academic',
        location: 'Medical Tower - 2nd Floor', status: 'online',
        computers: [
          { id: 'DEV-LIB-01', name: 'Library-Admin-PC', os: 'Windows 11 Pro', status: 'online', agentVersion: '1.2.0', lastPing: now, ip: '10.20.5.20', token: 'DEV_AGENT_TOKEN_LIB_01' },
          { id: 'DEV-LIB-02', name: 'Catalog-Workstation', os: 'Ubuntu 22.04 LTS', status: 'offline', agentVersion: null, lastPing: null, ip: '10.20.5.21', token: 'DEV_AGENT_TOKEN_LIB_02' }
        ]
      },
      {
        id: 'finance', name: 'Finance Office', nameAr: 'مكتب الشؤون المالية',
        manager: 'Omar Al-Farhan', category: 'Administrative',
        location: 'Admin Wing - 3rd Floor, Room 310', status: 'online',
        computers: [
          { id: 'DEV-FIN-01', name: 'Finance-Director-PC', os: 'Windows 11 Pro', status: 'online', agentVersion: '1.2.0', lastPing: now, ip: '10.20.6.30', token: 'DEV_AGENT_TOKEN_FIN_01' },
          { id: 'DEV-FIN-02', name: 'Accounts-Payable-PC', os: 'Windows 10 Enterprise', status: 'online', agentVersion: '1.2.0', lastPing: now, ip: '10.20.6.31', token: 'DEV_AGENT_TOKEN_FIN_02' }
        ]
      },
      {
        id: 'students_affairs', name: 'Students Affairs Office', nameAr: 'مكتب شؤون الطلاب',
        manager: 'Fatima Al-Zahrawi', category: 'Academic',
        location: 'Main Hall - Ground Floor', status: 'offline',
        computers: [
          { id: 'DEV-STU-01', name: 'Students-Main-PC', os: 'Windows 11 Pro', status: 'offline', agentVersion: null, lastPing: null, ip: '10.20.7.40', token: 'DEV_AGENT_TOKEN_STU_01' }
        ]
      },
      {
        id: 'maintenance', name: 'Maintenance Office', nameAr: 'مكتب الصيانة',
        manager: 'Khalid Bin Saleh', category: 'Operational',
        location: 'Service Block - East Wing', status: 'online',
        computers: [
          { id: 'DEV-MNT-01', name: 'Maintenance-PC', os: 'Windows 10 Pro', status: 'online', agentVersion: '1.2.0', lastPing: now, ip: '10.20.8.50', token: 'DEV_AGENT_TOKEN_MNT_01' }
        ]
      }
    ],

    tasks: [],
    taskHistory: [],
    messages: [],
    announcements: [],
    announcementDeliveries: [],
    auditLogs: [],
    screenSessions: [],
    attachments: [],
    _counters: { tasks: 0, messages: 0, announcements: 0, sessions: 0, attachments: 0 }
  };
}

// ─── DATA STORE CLASS ─────────────────────────────────────────────────────────

class DataStore {
  constructor() {
    this._data = null;
    this._loaded = false;
  }

  _load() {
    if (this._loaded) return;
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      this._data = JSON.parse(content);
      console.log('📦 Database loaded from', DB_FILE);
    } catch {
      console.log('📦 No existing database found — seeding initial data...');
      this._data = buildInitialData();
      this._save();
      console.log('✅ Initial database seeded. Default credentials:');
      console.log('   director@university.edu / UniversityDirector@2026!');
      console.log('   ahmed@university.edu / AhmedPrinting@2026!');
      console.log('   hassan@university.edu / HassanLibrary@2026!');
      console.log('   omar@university.edu / OmarFinance@2026!');
      console.log('   noc@university.edu / NOCAdmin@2026!');
      console.log('⚠️  CHANGE THESE CREDENTIALS IN PRODUCTION!');
    }
    this._loaded = true;
  }

  _save() {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      fs.writeFileSync(DB_FILE, JSON.stringify(this._data, null, 2), 'utf-8');
    } catch (err) {
      console.error('❌ Failed to persist data:', err.message);
    }
  }

  _nextId(type) {
    this._load();
    if (!this._data._counters) this._data._counters = {};
    this._data._counters[type] = (this._data._counters[type] || 0) + 1;
    return `${type.slice(0, 3).toUpperCase()}-${Date.now()}-${this._data._counters[type]}`;
  }

  isHealthy() {
    try {
      this._load();
      return !!this._data;
    } catch { return false; }
  }

  // ─── USERS ───────────────────────────────────────────────
  getUserByEmail(email) {
    this._load();
    return this._data.users.find(u => u.email === email.toLowerCase() && u.isActive) || null;
  }

  getUserById(id) {
    this._load();
    return this._data.users.find(u => u.id === id) || null;
  }

  updateLastLogin(userId) {
    this._load();
    const user = this._data.users.find(u => u.id === userId);
    if (user) {
      user.lastLogin = new Date().toISOString();
      this._save();
    }
  }

  // ─── OFFICES ─────────────────────────────────────────────
  getOffices() {
    this._load();
    return this._data.offices || [];
  }

  getOfficeById(id) {
    this._load();
    return this._data.offices.find(o => o.id === id) || null;
  }

  addOffice(data) {
    this._load();
    const office = {
      id: data.id,
      name: data.name,
      nameAr: data.nameAr || data.name,
      manager: data.manager,
      category: data.category || 'Administrative',
      location: data.location || 'Campus',
      status: 'online',
      computers: []
    };
    this._data.offices.push(office);
    this._save();
    return office;
  }

  updateOfficeStatus(officeId, status) {
    this._load();
    const office = this._data.offices.find(o => o.id === officeId);
    if (office) { office.status = status; this._save(); }
  }

  // ─── TASKS ───────────────────────────────────────────────
  getTasks() {
    this._load();
    return this._data.tasks.map(t => ({
      ...t,
      timeline: this._data.taskHistory.filter(h => h.taskId === t.id)
    }));
  }

  getTaskById(id) {
    this._load();
    const task = this._data.tasks.find(t => t.id === id);
    if (!task) return null;
    return {
      ...task,
      timeline: this._data.taskHistory.filter(h => h.taskId === id)
    };
  }

  addTask(data) {
    this._load();
    const id = this._nextId('tasks');
    const now = new Date().toISOString();
    const task = {
      id,
      title: data.title,
      titleAr: data.titleAr || data.title,
      description: data.description || '',
      officeId: data.officeId,
      officeName: data.officeName,
      manager: data.manager,
      priority: data.priority || 'normal',
      status: 'new',
      createdAt: now,
      createdBy: data.createdBy,
      attachment: data.attachment || null,
      screenSessionId: null
    };
    this._data.tasks.push(task);
    // Initial history entry
    this._data.taskHistory.push({
      id: `TH-${Date.now()}`,
      taskId: id,
      status: 'new',
      by: 'System',
      time: now,
      note: 'Task created'
    });
    this._save();
    return { ...task, timeline: this._data.taskHistory.filter(h => h.taskId === id) };
  }

  updateTaskStatus(taskId, status, by, note) {
    this._load();
    const task = this._data.tasks.find(t => t.id === taskId);
    if (!task) return null;
    task.status = status;
    const now = new Date().toISOString();
    if (status === 'in_progress' && !task.startedAt) {
      task.startedAt = now;
    }
    if (status === 'completed') {
      task.completedAt = now;
    }
    const histEntry = {
      id: `TH-${Date.now()}`,
      taskId,
      status,
      by: by || 'System',
      time: now,
      note: note || ''
    };
    this._data.taskHistory.push(histEntry);
    this._save();
    return { ...task, timeline: this._data.taskHistory.filter(h => h.taskId === taskId) };
  }

  // ─── MESSAGES ─────────────────────────────────────────────
  getMessages() {
    this._load();
    return this._data.messages;
  }

  getMessagesByOffice(officeId) {
    this._load();
    return this._data.messages.filter(m => m.officeId === officeId);
  }

  addMessage(data) {
    this._load();
    const msg = {
      id: this._nextId('messages'),
      officeId: data.officeId,
      senderRole: data.senderRole,
      senderName: data.senderName,
      senderUserId: data.senderUserId,
      content: data.content,
      createdAt: new Date().toISOString(),
      isRead: false
    };
    this._data.messages.push(msg);
    this._save();
    return msg;
  }

  markMessagesRead(officeId) {
    this._load();
    let changed = false;
    this._data.messages.forEach(m => {
      if (m.officeId === officeId && !m.isRead) {
        m.isRead = true;
        changed = true;
      }
    });
    if (changed) this._save();
  }

  // ─── ANNOUNCEMENTS ───────────────────────────────────────
  getAnnouncements() {
    this._load();
    return this._data.announcements.map(a => ({
      ...a,
      deliveries: this._data.announcementDeliveries.filter(d => d.announcementId === a.id)
    }));
  }

  addAnnouncement(data) {
    this._load();
    const id = this._nextId('announcements');
    const now = new Date().toISOString();
    const ann = {
      id,
      title: data.title,
      titleAr: data.titleAr || data.title,
      content: data.content,
      sentBy: data.sentBy,
      target: data.target || 'all_offices',
      createdAt: now
    };
    this._data.announcements.push(ann);

    // Create delivery records per target office
    const targetOffices = data.offices || [];
    const deliveries = targetOffices.map(o => ({
      id: `AD-${Date.now()}-${o.id}`,
      announcementId: id,
      officeId: o.id,
      officeName: o.name,
      status: 'delivered',
      deliveredAt: now,
      readAt: null
    }));
    this._data.announcementDeliveries.push(...deliveries);
    this._save();

    return {
      ...ann,
      deliveries
    };
  }

  // ─── AUDIT LOGS ──────────────────────────────────────────
  getAuditLogs() {
    this._load();
    return [...this._data.auditLogs].reverse(); // newest first
  }

  addAuditLog(data) {
    this._load();
    const log = {
      id: `LOG-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: data.type,
      action: data.action,
      office: data.office || 'System',
      actor: data.actor || 'System',
      severity: data.severity || 'info',
      createdAt: new Date().toISOString()
    };
    this._data.auditLogs.push(log);
    // Keep only last 1000 logs
    if (this._data.auditLogs.length > 1000) {
      this._data.auditLogs = this._data.auditLogs.slice(-1000);
    }
    this._save();
    return log;
  }

  // ─── SCREEN SESSIONS ──────────────────────────────────────
  getActiveScreenSessions() {
    this._load();
    return this._data.screenSessions.filter(s => !s.endedAt);
  }

  getActiveScreenSessionsMap() {
    const sessions = this.getActiveScreenSessions();
    const map = {};
    sessions.forEach(s => { map[s.officeId] = s; });
    return map;
  }

  startScreenSession(data) {
    this._load();
    // End any existing session for this office
    this._data.screenSessions.forEach(s => {
      if (s.officeId === data.officeId && !s.endedAt) {
        s.endedAt = new Date().toISOString();
      }
    });
    const session = {
      id: this._nextId('sessions'),
      officeId: data.officeId,
      officeName: data.officeName,
      manager: data.manager,
      computerName: data.computerName || 'Workstation',
      startedAt: new Date().toISOString(),
      endedAt: null,
      requestedBy: data.requestedBy,
      taskId: data.taskId || null
    };
    this._data.screenSessions.push(session);
    this._save();
    return session;
  }

  endScreenSession(officeId) {
    this._load();
    const session = this._data.screenSessions.find(s => s.officeId === officeId && !s.endedAt);
    if (!session) return null;
    session.endedAt = new Date().toISOString();
    this._save();
    return session;
  }

  // ─── DEVICES ─────────────────────────────────────────────
  getDevices() {
    this._load();
    const allComputers = [];
    this._data.offices.forEach(o => {
      (o.computers || []).forEach(c => {
        // Determine live online status from last heartbeat
        let isOnline = c.status === 'online';
        if (c.lastHeartbeat) {
          const elapsed = Date.now() - new Date(c.lastHeartbeat).getTime();
          isOnline = elapsed < 90000; // 90 seconds timeout
        }
        allComputers.push({ ...c, officeId: o.id, officeName: o.name, isOnline });
      });
    });
    return allComputers;
  }

  getDeviceByToken(token) {
    this._load();
    for (const office of this._data.offices) {
      const device = (office.computers || []).find(c => c.token === token);
      if (device) return { ...device, officeId: office.id };
    }
    return null;
  }

  updateDeviceHeartbeat(deviceId, agentVersion) {
    this._load();
    let changed = false;
    for (const office of this._data.offices) {
      const device = (office.computers || []).find(c => c.id === deviceId);
      if (device) {
        device.lastHeartbeat = new Date().toISOString();
        device.status = 'online';
        if (agentVersion) device.agentVersion = agentVersion;
        changed = true;
        break;
      }
    }
    if (changed) this._save();
  }

  // ─── FILE ATTACHMENTS ─────────────────────────────────────
  addAttachment(data) {
    this._load();
    const att = {
      id: this._nextId('attachments'),
      filename: data.filename,
      originalName: data.originalName,
      mimeType: data.mimeType,
      size: data.size,
      uploadedBy: data.uploadedBy,
      uploadedAt: new Date().toISOString(),
      taskId: data.taskId || null
    };
    this._data.attachments.push(att);
    this._save();
    return att;
  }

  getAttachmentById(id) {
    this._load();
    return this._data.attachments.find(a => a.id === id) || null;
  }

  linkAttachmentToTask(attachmentId, taskId) {
    this._load();
    const att = this._data.attachments.find(a => a.id === attachmentId);
    if (att) { att.taskId = taskId; this._save(); }
  }

  // ─── REPORTS / STATS ──────────────────────────────────────
  getReportStats(officeIdFilter) {
    this._load();
    const tasks = officeIdFilter
      ? this._data.tasks.filter(t => t.officeId === officeIdFilter)
      : this._data.tasks;

    const history = this._data.taskHistory;

    // Calculate avg response time (created → first accepted)
    let totalResponseMs = 0, responseCount = 0;
    let totalCompletionMs = 0, completionCount = 0;

    tasks.forEach(t => {
      const taskHistory = history.filter(h => h.taskId === t.id);
      const createdEntry = taskHistory.find(h => h.status === 'new');
      const acceptedEntry = taskHistory.find(h => h.status === 'accepted');
      const completedEntry = taskHistory.find(h => h.status === 'completed');

      if (createdEntry && acceptedEntry) {
        const diff = new Date(acceptedEntry.time) - new Date(createdEntry.time);
        if (diff > 0) { totalResponseMs += diff; responseCount++; }
      }
      if (createdEntry && completedEntry) {
        const diff = new Date(completedEntry.time) - new Date(createdEntry.time);
        if (diff > 0) { totalCompletionMs += diff; completionCount++; }
      }
    });

    const avgResponseMin = responseCount > 0 ? Math.round(totalResponseMs / responseCount / 60000) : null;
    const avgCompletionHrs = completionCount > 0 ? Math.round(totalCompletionMs / completionCount / 3600000 * 10) / 10 : null;

    const offices = officeIdFilter
      ? this._data.offices.filter(o => o.id === officeIdFilter)
      : this._data.offices;

    return {
      totalTasks: tasks.length,
      pendingTasks: tasks.filter(t => ['new', 'received', 'accepted'].includes(t.status)).length,
      activeTasks: tasks.filter(t => t.status === 'in_progress').length,
      completedTasks: tasks.filter(t => ['completed', 'verified'].includes(t.status)).length,
      avgResponseTimeMin: avgResponseMin,
      avgCompletionTimeHrs: avgCompletionHrs,
      totalOffices: offices.length,
      onlineOffices: offices.filter(o => o.status === 'online').length,
      officeBreakdown: offices.map(o => ({
        id: o.id,
        name: o.name,
        tasks: tasks.filter(t => t.officeId === o.id).length,
        completed: tasks.filter(t => t.officeId === o.id && ['completed', 'verified'].includes(t.status)).length,
        pending: tasks.filter(t => t.officeId === o.id && ['new', 'received', 'accepted'].includes(t.status)).length
      }))
    };
  }
}

export const db = new DataStore();
