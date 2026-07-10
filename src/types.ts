export type ViewId = 'dashboard' | 'campaigns' | 'scheduler' | 'analytics' | 'integrations' | 'profile' | 'users' | 'aeo';

export type Role = 'admin' | 'user';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
}

export interface Post {
  id: string;
  content: string;
  platforms: string[];
  scheduledDate: Date;
  status: 'published' | 'scheduled' | 'draft' | 'failed' | 'partial_failed';
  image?: string | null;
  publishLogs?: Record<string, { success: boolean; message: string }>;
  publishedAt?: string;
}

export interface MetricData {
  name: string;
  visitors: number;
  conversions: number;
  revenue: number;
}
