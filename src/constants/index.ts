export const APP_NAME = 'Survey Admin Panel';
export const APP_DESCRIPTION = 'Comprehensive admin dashboard for survey platform management';

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
} as const;

export const USER_STATUSES = {
  ACTIVE: 'active',
  BLOCKED: 'blocked',
  SUSPENDED: 'suspended',
  BANNED: 'banned',
} as const;

export const SURVEY_STATUSES = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  DOWNED: 'downed',
} as const;

export const REPORT_STATUSES = {
  PENDING: 'pending',
  REVIEWED: 'reviewed',
  DISMISSED: 'dismissed',
  ACTION_TAKEN: 'action_taken',
} as const;

export const REPORT_TYPES = {
  SURVEY: 'survey',
  USER: 'user',
} as const;

export const MODERATION_ACTIONS = {
  WARNING: 'warning',
  SURVEY_DOWN: 'survey_down',
  ACCOUNT_SUSPEND: 'account_suspend',
  ACCOUNT_BAN: 'account_ban',
  DISMISS_REPORT: 'dismiss_report',
} as const;

export const REPORT_REASONS = [
  'Inappropriate content',
  'Spam',
  'Offensive language',
  'Fraudulent activity',
  'Copyright violation',
  'Harassment',
  'Misleading information',
  'Other',
] as const;

export const PAGINATION_LIMITS = {
  DEFAULT: 10,
  LARGE: 50,
  SMALL: 5,
} as const;

export const SORT_ORDERS = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

export const SUSPENSION_DURATIONS = {
  TEMPORARY_1_DAY: 1,
  TEMPORARY_7_DAYS: 7,
  TEMPORARY_30_DAYS: 30,
  PERMANENT: 999999, // Effectively permanent
} as const;

export const TRANSACTION_TYPES = {
  CREDIT: 'credit',
  DEBIT: 'debit',
  REFUND: 'refund',
} as const;

export const WITHDRAWAL_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
} as const;

export const NOTIFICATION_TYPES = {
  REPORT_THRESHOLD: 'report_threshold',
  WITHDRAWAL_REQUEST: 'withdrawal_request',
  NEW_CREATOR: 'new_creator',
  PAYMENT_FAILURE: 'payment_failure',
  SYSTEM_ALERT: 'system_alert',
} as const;

export const ALERT_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

// Report thresholds
export const REPORT_THRESHOLDS = {
  ADMIN_NOTIFICATION: 2,
  AUTO_SUSPENSION: 3,
  RECOMMENDATION_BAN: 5,
} as const;

// Navigation items
export const NAVIGATION_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Users', href: '/admin/users', icon: 'Users' },
  { label: 'Surveys', href: '/admin/surveys', icon: 'FileText' },
  { label: 'Reports', href: '/admin/reports', icon: 'AlertCircle' },
  { label: 'Payments', href: '/admin/payments', icon: 'CreditCard' },
  { label: 'Notifications', href: '/admin/notifications', icon: 'Bell' },
  { label: 'Settings', href: '/admin/settings', icon: 'Settings' },
] as const;

// Feature flags
export const FEATURES = {
  REAL_TIME_ALERTS: true,
  STRIPE_INTEGRATION: true,
  CSV_EXPORT: true,
  PDF_EXPORT: true,
  DARK_MODE: true,
  EMAIL_NOTIFICATIONS: true,
} as const;

// API endpoints
export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  USERS: '/api/users',
  SURVEYS: '/api/surveys',
  REPORTS: '/api/reports',
  PAYMENTS: '/api/payments',
  NOTIFICATIONS: '/api/notifications',
  EXPORTS: '/api/exports',
} as const;

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy HH:mm',
  API: 'yyyy-MM-dd',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
} as const;

// Cache keys for React Query
export const QUERY_KEYS = {
  USERS: 'users',
  USER: 'user',
  SURVEYS: 'surveys',
  SURVEY: 'survey',
  REPORTS: 'reports',
  REPORT: 'report',
  DASHBOARD_STATS: 'dashboard-stats',
  NOTIFICATIONS: 'notifications',
  PAYMENTS: 'payments',
  WITHDRAWALS: 'withdrawals',
} as const;
