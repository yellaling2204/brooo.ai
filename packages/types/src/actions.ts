export type ActionType =
  | 'task'
  | 'reminder'
  | 'deadline'
  | 'follow_up'
  | 'renewal'
  | 'payment'
  | 'application'
  | 'appointment'
  | 'warning'
  | 'information';

export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';

export type ActionStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'dismissed';

export type DocumentCategory =
  | 'career'
  | 'finance'
  | 'insurance'
  | 'education'
  | 'government'
  | 'bills'
  | 'personal'
  | 'scam_risk'
  | 'other';

export interface ActionObject {
  id: string;
  userId: string;
  sourceId?: string | null;
  documentId?: string | null;
  type: ActionType;
  title: string;
  summary?: string | null;
  priority: PriorityLevel;
  deadline?: string | null;
  status: ActionStatus;
  confidence: number;
  requiresConfirmation: boolean;
  entities: Record<string, any>;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface TaskObject {
  id: string;
  userId: string;
  actionId?: string | null;
  title: string;
  notes?: string | null;
  dueDate?: string | null;
  priority: PriorityLevel;
  isCompleted: boolean;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReminderObject {
  id: string;
  userId: string;
  actionId?: string | null;
  title: string;
  scheduledAt: string;
  repeatRule?: string | null;
  status: 'pending' | 'sent' | 'cancelled';
  notificationId?: string | null;
  createdAt: string;
}

