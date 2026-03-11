export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  approved?: boolean;
  systemRole?: string;
}

export interface Project {
  id: string;
  name: string;
  key: string;
  description?: string;
  owner_id: string;
  myRole: string;
  memberCount: number;
  created_at: string;
}

export interface ProjectMember {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: string;
  invitedAt: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface Ticket {
  id: string;
  projectId: string;
  projectKey?: string;
  ticketNumber: number;
  title: string;
  description?: string;
  type: string;
  priority: string;
  status: string;
  reporter: { id: string; name: string; email: string };
  assignee: { id: string; name: string; email: string } | null;
  dueDate?: string;
  labels: Label[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  authorAvatar?: string;
}

export interface Attachment {
  id: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  url: string;
  attachmentType?: 'file' | 'log';
  createdAt: string;
  uploaderName: string;
}

export interface PendingUser {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  oldValue?: string;
  newValue?: string;
  createdAt: string;
  userId: string;
  userName: string;
  userEmail: string;
}
