// DJOBBA Database Type Definitions
// This file contains all TypeScript interfaces for database entities

// Database
export interface Database {
  public: {
    Tables: {
      microcopy: {
        Row: Microcopy;
        Insert: Omit<Microcopy, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Insert>;
      };
      verification_badges: {
        Row: VerificationBadge;
        Insert: Omit<VerificationBadge, 'verified_at'>;
        Update: Partial<Insert>;
      };
      reviews: {
        Row: Review;
        Insert: Omit<Review, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Insert>;
      };
      wallets: {
        Row: Wallet;
        Insert: Omit<Wallet, 'updated_at'>;
        Update: Partial<Insert>;
      };
      wallet_transactions: {
        Row: WalletTransaction;
        Insert: Omit<WalletTransaction, 'id' | 'created_at'>;
        Update: Partial<Insert>;
      };
      message_threads: {
        Row: MessageThread;
        Insert: Omit<MessageThread, 'id' | 'created_at' | 'last_message_at'>;
        Update: Partial<Insert>;
      };
      messages: {
        Row: Message;
        Insert: Omit<Message, 'id' | 'created_at' | 'is_read' | 'read_at'>;
        Update: Partial<Insert>;
      };
      audit_logs: {
        Row: AuditLog;
        Insert: Omit<AuditLog, 'id' | 'created_at'>;
        Update: Partial<Insert>;
      };
      user_profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Insert>;
      };
      assignments: {
        Row: Assignment;
        Insert: Omit<Assignment, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Insert>;
      };
      applications: {
        Row: Application;
        Insert: Omit<Application, 'id' | 'applied_at' | 'updated_at'>;
        Update: Partial<Insert>;
      };
      contracts: {
        Row: Contract;
        Insert: Omit<Contract, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Insert>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at' | 'is_read' | 'read_at'>;
        Update: Partial<Insert>;
      };
      factoring_requests: {
        Row: FactoringRequest;
        Insert: Omit<FactoringRequest, 'id' | 'created_at' | 'processed_at'>;
        Update: Partial<Insert>;
      };
    };
    Views: {
      assignment_metrics: {
        Row: AssignmentMetrics;
      };
      professional_metrics: {
        Row: ProfessionalMetrics;
      };
      assignment_feed: {
        Row: AssignmentFeed;
      };
    };
    Functions: {
      check_badge_requirements: {
        Args: { p_user_id: string };
        Returns: number;
      };
      get_professional_stats: {
        Args: { p_user_id: string };
        Returns: Json;
      };
      refresh_assignment_metrics_hourly: {
        Args: Record<PropertyKey, never>;
        Returns: void;
      };
      send_review_invitation: {
        Args: Record<PropertyKey, never>;
        Returns: void;
      };
    };
  };
}

// Types
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Core Entities
export interface Microcopy {
  id: string;
  key: string;
  category: string;
  text_nl: string;
  text_en: string | null;
  context: string | null;
  variables: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface VerificationBadge {
  user_id: string;
  badge_type: 'email_verified' | 'phone_verified' | 'id_verified' | 'address_verified' | 'company_verified';
  verified_at: string;
  verified_by: string | null;
  evidence: Record<string, any>;
}

export interface Review {
  id: string;
  reviewer_id: string;
  reviewed_id: string;
  contract_id: string | null;
  assignment_id: string | null;
  rating: number;
  would_recommend: boolean;
  comment: string | null;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
}

export interface Wallet {
  professional_id: string;
  pending_balance_cents: number;
  available_balance_cents: number;
  total_earned_cents: number;
  updated_at: string;
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  type: 'earning' | 'withdrawal' | 'fee' | 'bonus';
  amount_cents: number;
  description: string | null;
  reference_id: string | null;
  created_at: string;
}

export interface MessageThread {
  id: string;
  participant1_id: string;
  participant2_id: string;
  assignment_id: string | null;
  last_message_at: string;
  created_at: string;
}

export interface Message {
  id: string;
  thread_id: string;
  sender_id: string;
  content: string | null;
  file_url: string | null;
  file_type: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface UserProfile {
  id: string;
  account_type: 'professional' | 'employer' | 'both';
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  date_of_birth: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string;
  bio: string | null;
  skills: string[];
  availability: Record<string, any>;
  hourly_rate_cents: number | null;
  company_name: string | null;
  vat_number: string | null;
  chamber_of_commerce: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Assignment {
  id: string;
  employer_id: string;
  title: string;
  description: string;
  type: 'short' | 'permanent';
  category: string | null;
  location: string | null;
  remote_allowed: boolean;
  duration_days: number | null;
  salary_cents: number | null;
  hourly_rate_cents: number | null;
  requirements: any[];
  benefits: any[];
  status: 'active' | 'filled' | 'closed' | 'draft';
  application_deadline: string | null;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  assignment_id: string;
  professional_id: string;
  cover_letter: string | null;
  proposed_rate_cents: number | null;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  applied_at: string;
  updated_at: string;
}

export interface Contract {
  id: string;
  assignment_id: string;
  professional_id: string;
  employer_id: string;
  type: 'short' | 'permanent';
  start_date: string;
  end_date: string | null;
  rate_cents: number;
  factoring_enabled: boolean;
  factoring_fee_percent: number;
  status: 'active' | 'completed' | 'terminated' | 'paused';
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, any>;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface FactoringRequest {
  id: string;
  contract_id: string;
  professional_id: string;
  amount_cents: number;
  fee_percent: number;
  fee_cents: number;
  payout_amount_cents: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  processed_at: string | null;
  created_at: string;
}

// Views
export interface AssignmentMetrics {
  type: 'short' | 'permanent';
  category: string | null;
  total_assignments: number;
  filled_assignments: number;
  active_assignments: number;
  avg_rate: number | null;
  week: string;
}

export interface ProfessionalMetrics {
  professional_id: string;
  total_contracts: number;
  short_contracts: number;
  permanent_contracts: number;
  avg_rating: number;
  total_reviews: number;
  total_earned: number;
  month: string;
}

export interface AssignmentFeed {
  id: string;
  employer_id: string;
  title: string;
  description: string;
  type: 'short' | 'permanent';
  category: string | null;
  location: string | null;
  remote_allowed: boolean;
  duration_days: number | null;
  salary_cents: number | null;
  hourly_rate_cents: number | null;
  requirements: any[];
  benefits: any[];
  status: 'active' | 'filled' | 'closed' | 'draft';
  application_deadline: string | null;
  created_at: string;
  updated_at: string;
  employer_name: string;
  company_name: string | null;
  application_count: number;
}

// Extended types for UI
export interface AssignmentWithDetails extends Assignment {
  employer_name: string;
  company_name: string | null;
  application_count: number;
  has_applied?: boolean;
}

export interface ContractWithDetails extends Contract {
  assignment_title: string;
  professional_name: string;
  employer_name: string;
}

export interface ReviewWithDetails extends Review {
  reviewer_name?: string;
  reviewed_name?: string;
  assignment_title?: string;
}

export interface MessageThreadWithDetails extends MessageThread {
  other_participant_name: string;
  other_participant_id: string;
  last_message?: string;
  unread_count: number;
  assignment_title?: string;
}

export interface ProfessionalStats {
  total_contracts: number;
  active_contracts: number;
  completed_contracts: number;
  avg_rating: number;
  total_reviews: number;
  wallet_balance: number;
  pending_earnings: number;
  total_earned: number;
}

export interface EmployerStats {
  total_assignments: number;
  active_assignments: number;
  filled_assignments: number;
  avg_time_to_fill: number;
  total_applications: number;
  active_candidates: number;
}

// UI State Types
export interface AccountTypeSelection {
  type: 'professional' | 'employer' | 'both' | null;
  preferences: {
    prefers_short_assignments: boolean;
    prefers_permanent_contracts: boolean;
    min_hourly_rate?: number;
    max_hourly_rate?: number;
    locations: string[];
    remote_only: boolean;
  };
}

export interface ChatState {
  activeThreads: MessageThreadWithDetails[];
  currentThread: MessageThreadWithDetails | null;
  messages: Message[];
  isTyping: Record<string, boolean>;
  unreadCounts: Record<string, number>;
}

export interface WalletState {
  balance: Wallet;
  transactions: WalletTransaction[];
  pendingWithdrawals: number;
  availableForWithdrawal: number;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  lastChecked: string | null;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  accountType: 'professional' | 'employer' | 'both';
  acceptTerms: boolean;
}

export interface ProfileForm {
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  bio: string;
  skills: string[];
  hourlyRate: number;
  companyName: string;
  vatNumber: string;
  chamberOfCommerce: string;
}

export interface AssignmentForm {
  title: string;
  description: string;
  type: 'short' | 'permanent';
  category: string;
  location: string;
  remoteAllowed: boolean;
  durationDays: number | null;
  salary: number | null;
  hourlyRate: number | null;
  requirements: string[];
  benefits: string[];
  applicationDeadline: string | null;
}

export interface ApplicationForm {
  coverLetter: string;
  proposedRate: number | null;
  availability: string;
}

export interface ReviewForm {
  rating: number;
  wouldRecommend: boolean;
  comment: string;
  isAnonymous: boolean;
}

export interface FactoringForm {
  contractId: string;
  acceptTerms: boolean;
  bankAccount: {
    iban: string;
    accountHolder: string;
  };
}

// API Response Types
export interface ApiResponse<T = any> {
  data: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export interface DashboardData {
  stats: ProfessionalStats | EmployerStats;
  recentActivity: any[];
  upcomingDeadlines: any[];
  charts: {
    earnings: ChartData[];
    assignments: ChartData[];
    ratings: ChartData[];
  };
}

export interface ChartData {
  date: string;
  value: number;
  label?: string;
}

// Filter and Search Types
export interface AssignmentFilters {
  type?: 'short' | 'permanent' | 'all';
  category?: string;
  location?: string;
  remoteAllowed?: boolean;
  minRate?: number;
  maxRate?: number;
  duration?: string;
  postedAfter?: string;
  deadlineAfter?: string;
}

export interface SearchParams {
  query: string;
  filters: AssignmentFilters;
  sort: 'newest' | 'oldest' | 'rate_high' | 'rate_low' | 'deadline';
  page: number;
  limit: number;
}

// Component Props Types
export interface VerificationBadgesProps {
  userId: string;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  interactive?: boolean;
}

export interface AccountTypeSelectProps {
  onSelect: (type: AccountTypeSelection) => void;
  defaultType?: 'professional' | 'employer' | 'both';
}

export interface TwoTabFeedProps {
  shortAssignments: AssignmentWithDetails[];
  longAssignments: AssignmentWithDetails[];
  onAssignmentClick: (assignment: AssignmentWithDetails) => void;
}

export interface WalletDashboardProps {
  userId: string;
  showTransactionHistory?: boolean;
  allowWithdrawal?: boolean;
}

export interface ChatWindowProps {
  threadId: string;
  currentUserId: string;
  onNewThread?: (userId: string) => void;
}

export interface ReviewFormProps {
  contractId: string;
  reviewerId: string;
  reviewedId: string;
  onSubmit: (review: ReviewForm) => void;
  initialRating?: number;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Export commonly used type unions
export type UserRole = 'professional' | 'employer' | 'admin';
export type AssignmentStatus = 'active' | 'filled' | 'closed' | 'draft';
export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';
export type ContractStatus = 'active' | 'completed' | 'terminated' | 'paused';
export type NotificationType = 'application' | 'message' | 'contract' | 'payment' | 'review' | 'system';
export type MessageFileType = 'image' | 'document' | 'video' | 'audio' | 'other';

// Database function return types
export type DatabaseFunction<T extends Record<string, any>> = T & {
  ReturnType: any;
};
