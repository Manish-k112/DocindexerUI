export type PageId =
  | 'home'
  | 'verify'
  | 'research'
  | 'intent'
  | 'analytics'
  | 'admin';

export const PAGE_ROUTES: Record<PageId, string> = {
  home: '/',
  verify: '/queues/verify',
  research: '/queues/research',
  intent: '/queues/intent',
  analytics: '/analytics',
  admin: '/admin'
};

export const QUEUE_TABS = ['Verification', 'Research', 'Intent Review', 'Completed'] as const;
export type QueueTab = (typeof QUEUE_TABS)[number];

export interface VerifyItem {
  id: number;
  file: string;
  type: string;
  channel: string;
  pages: number;
  time: string;
  confidence: number;
  audit: string;
  patient: string;
  claim: string;
  provider: string;
  reason: string;
  locked: boolean;
  lockedBy?: string;
}

export interface ResearchItem {
  id: number;
  file: string;
  type: string;
  channel: string;
  pages: number;
  time: string;
  badge: string;
  badgeColor: string;
  reason: string;
  locked: boolean;
  lockedBy?: string;
}

export interface IntentItem {
  id: number;
  file: string;
  type: string;
  channel: string;
  pages: number;
  time: string;
  badge: string;
  badgeColor: string;
  reason: string;
  scenario: 'conflict' | 'low-conf' | 'no-form';
  audit: string;
  patient: string;
  locked?: boolean;
  lockedBy?: string;
}

export type FeedItemType = 'processing' | 'success' | 'error' | 'handoff';

export interface FeedItem {
  type: FeedItemType;
  file: string;
  meta: string;
  reason?: string;
  time: string;
}

export interface AgentInfo {
  name: string;
  status: 'Processing' | 'Active' | 'Idle';
}

export type QueueItem = VerifyItem | ResearchItem | IntentItem;
