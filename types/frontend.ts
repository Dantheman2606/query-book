// ─── Auth ─────────────────────────────────────────────────────────────────────

export type UserRole = 'student' | 'faculty' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department: string;
  avatarUrl: string;
  bio: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
  department?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

// ─── Tags ─────────────────────────────────────────────────────────────────────

export interface Tag {
  id: string;
  name: string;
  queryCount?: number;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export interface QueryTag {
  tagId: string;
  tag: Tag;
}

export interface Query {
  id: string;
  title: string;
  content: string;
  postedBy: string;
  userId: string;
  upvotes: number;
  downvotes: number;
  datePosted: string;
  isEdited: boolean;
  dateEdited: string | null;
  tags?: QueryTag[];
  replies?: Reply[];
  _count?: { replies: number };
}

export interface CreateQueryPayload {
  title: string;
  content: string;
  tags?: string[]; // tag UUIDs
}

export interface QueryFilters {
  search?: string;
  tags?: string[];
  sortBy?: 'recent' | 'popular' | 'trending';
  limit?: number;
  offset?: number;
}

export interface QueryVoteStatus {
  upvoted: boolean;
  downvoted: boolean;
}

// ─── Replies ──────────────────────────────────────────────────────────────────

export interface Reply {
  id: string;
  content: string;
  netVotes: number;
  postedBy: string;
  userId: string;
  queryId: string;
  parentId: string | null;
  datePosted: string;
  isEdited?: boolean;
  children?: Reply[];
  votes?: { userId: string; type: string }[];
}

export interface CreateReplyPayload {
  content: string;
  queryId: string;
  parentId?: string | null;
}

// ─── Announcements ────────────────────────────────────────────────────────────

export interface Announcement {
  id: string;
  title: string;
  content: string;
  postedBy: string;
  userId: string;
  datePosted: string;
  isEdited?: boolean;
  user?: {
    id: string;
    name: string;
    avatarUrl: string;
  };
}

export interface CreateAnnouncementPayload {
  title: string;
  content: string;
}

export interface AnnouncementFilters {
  search?: string;
  sortBy?: 'recent' | 'oldest';
  limit?: number;
  offset?: number;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// ─── API error ────────────────────────────────────────────────────────────────

export interface ApiError {
  message?: string;
  error?: string;
  fields?: Record<string, string[]>;
}

// ─── Toast ────────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}
