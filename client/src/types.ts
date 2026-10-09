export type UserRole = 'director' | 'office_manager' | 'it_admin';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  officeId: string | null;
  fullName: string;
  name?: string;
  avatar?: string;
  title?: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface Computer {
  id: string;
  name: string;
  os: string;
  status: 'online' | 'offline';
  agentVersion?: string | null;
  lastPing?: string | null;
  lastHeartbeat?: string | null;
  ip: string;
  token?: string | null;
}

export interface Office {
  id: string;
  name: string;
  nameAr: string;
  manager: string;
  category: string;
  location: string;
  status: 'online' | 'offline';
  devicesCount?: number;
  activeTasks?: number;
  pendingTasks?: number;
  unreadMessages?: number;
  computers: Computer[];
}

export type TaskStatus = 'new' | 'received' | 'accepted' | 'in_progress' | 'completed' | 'verified' | 'cancelled';
export type TaskPriority = 'normal' | 'important' | 'urgent';

export interface TaskTimeline {
  id?: string;
  status: TaskStatus;
  time: string;
  by: string;
  note: string;
}

export interface TaskAttachment {
  id?: string;
  name: string;
  size: string;
  mimeType?: string;
  url?: string;
  pages?: number;
}

export interface Task {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  officeId: string;
  officeName: string;
  manager: string;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: string;
  createdBy?: string;
  attachment?: TaskAttachment | null;
  timeline: TaskTimeline[];
  screenSessionId?: string | null;
}

export interface AnnouncementDelivery {
  id?: string;
  officeId: string;
  officeName: string;
  status: 'delivered' | 'read' | 'received' | 'offline' | 'pending';
  deliveredAt?: string;
  readAt?: string | null;
  time?: string;
}

export interface Announcement {
  id: string;
  title: string;
  titleAr: string;
  content: string;
  createdAt: string;
  sentBy: string;
  target: string;
  deliveredCount?: number;
  totalOffices?: number;
  deliveries: AnnouncementDelivery[];
}

export interface DirectMessage {
  id: string;
  officeId: string;
  senderRole?: 'director' | 'office';
  sender?: 'director' | 'office';
  senderName: string;
  senderUserId?: string;
  content: string;
  createdAt?: string;
  timestamp?: string;
  isRead?: boolean;
  read?: boolean;
}

export interface AuditLog {
  id: string;
  type: string;
  action: string;
  office: string;
  actor: string;
  timestamp?: string;
  createdAt?: string;
  severity: 'info' | 'warning' | 'high' | 'success';
}

export interface ScreenSession {
  id?: string;
  sessionId?: string;
  officeId: string;
  officeName: string;
  manager: string;
  computerName: string;
  startedAt: string;
  endedAt?: string | null;
  requestedBy: string;
  taskId?: string | null;
}

export interface SystemStats {
  totalOffices: number;
  onlineOffices: number;
  offlineOffices: number;
  pendingTasks: number;
  activeTasks: number;
  completedTasks: number;
  totalTasks?: number;
  unreadMessages: number;
  activeScreenSessionsCount: number;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: {
    api: { status: string; responseTimeMs: number };
    database: { status: string; queryTimeMs: number };
    websocket: { status: string; connectedClients: number };
    devices: {
      total: number;
      online: number;
      offline: number;
      registeredAgents: number;
    };
  };
}
