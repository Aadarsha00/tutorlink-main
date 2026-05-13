// src/services/api.ts
import axiosInstance from "@/lib/axios";

/* ======================================================
   TYPES
====================================================== */

export interface User {
  id: number;
  email: string;
  role: "teacher" | "parent" | "admin";
  first_name: string;
  last_name: string;
  full_name?: string;
  profile_picture?: string;
  profile_picture_verified?: boolean | null;
  profile_picture_rejection_reason?: string;
  is_active: boolean;
  is_email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Users {
  results: User[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface RegisterData {
  email: string;
  password: string;
  re_password: string;
  role: "teacher" | "parent";
  first_name: string;
  last_name: string;
  profile_picture?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ActivationData {
  uid: string;
  token: string;
}

export interface PasswordResetData {
  email: string;
}

export interface PasswordResetConfirmData {
  uid: string;
  token: string;
  new_password: string;
  re_new_password: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
  re_new_password: string;
}

export interface UpdateUserData {
  first_name?: string;
  last_name?: string;
  profile_picture?: string;
}

const multipartConfig = {
  headers: {
    "Content-Type": "multipart/form-data",
  },
};

export interface LandingStats {
  teachers: number;
  parents: number;
  subjects: number;
  average_rating: number;
}

export interface LandingData {
  stats: LandingStats;
  subjects: Subject[];
  featured_tutors: TeacherProfile[];
  hero_tutors: TeacherProfile[];
  latest_gigs: Gig[];
}

export interface ContactMessageData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface PublicTestimonial {
  id: number;
  name: string;
  grade: string;
  subject: string;
  image: string | null;
  rating: number;
  quote: string;
  improvement: string;
  tutorName: string;
}

export interface PublicTutorsResponse {
  count: number;
  results: TeacherProfile[];
  subjects: Subject[];
  locations: string[];
}

export interface PublicTutorReview {
  id: number;
  parent_name: string;
  score: number;
  review: string;
  gig_title: string;
  subject: string;
  grade: string;
  created_at: string;
}

export interface PublicTutorDetails extends TeacherProfile {
  reviews: PublicTutorReview[];
}

export interface PublicTutorFilters {
  search?: string;
  subject_id?: string;
  location?: string;
  verification_status?: string;
  is_premium?: boolean;
  min_rating?: string;
}

export interface UserStats {
  total_users: number;
  active_users: number;
  teachers: { total: number; active: number };
  parents: { total: number; active: number };
  admins: { total: number; active: number };
}

/* ======================================================
   PROFILE TYPES
====================================================== */

export interface Subject {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
}

export interface Grade {
  id: number;
  name: string;
  order: number;
  is_active: boolean;
}

export interface TeacherAvailability {
  id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}
export type DocumentType =
  | "citizenship_front"
  | "citizenship_back"
  | "academic"
  | "cv"
  | "other";
export type ParentDocumentType =
  | "citizenship_front"
  | "citizenship_back"
  | "id_card"
  | "supporting_document";
export interface VerificationDocument {
  id: number;
  user: {
    id: number;
    email: string;
    full_name: string;
    role: string;
    profile_picture?: string | null;
  };
  document_type: DocumentType;
  file_name: string;
  file_url: string;
  file_size: number;
  uploaded_at: string;

  verified: boolean | null; // ✅ FIX
  verified_at?: string;
  notes: string;
  rejection_reason?: string;
}
export interface ParentVerificationDocument {
  id: number;
  user: {
    id: number;
    email: string;
    full_name: string;
    role: string;
    profile_picture?: string | null;
  };
  document_type: ParentDocumentType;
  file_name: string;
  file_url: string;
  file_size: number;
  uploaded_at: string;

  verified: boolean | null; // ✅ FIX
  verified_at?: string;
  notes: string;
  rejection_reason?: string;
}

export interface VerificationDocuments {
  results: VerificationDocument[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface TeacherProfile {
  id: number;
  user: User;
  full_name: string;
  phone: string;
  citizenship_number: string;
  education: string;
  experience_years: number;
  subjects: Subject[];
  subject_ids?: number[]; // For write operations
  grades: Grade[];
  grade_ids?: number[]; // For write operations
  location: string;
  address: string;
  hourly_rate_min: number;
  hourly_rate_max: number;
  availability_slots: TeacherAvailability[];
  bio: string;
  verification_status: "pending" | "verified" | "rejected";
  documents: VerificationDocument[];
  is_premium: boolean;
  premium_expires_at?: string;
  average_rating: number;
  total_reviews: number;
  created_at: string;
  updated_at: string;
}

export interface ParentProfile {
  id: number;
  user: User;
  full_name: string;
  phone: string;
  citizenship_number: string;
  location: string;
  address: string;
  average_rating: number;
  total_reviews: number;
  created_at: string;
  updated_at: string;
}

/* ======================================================
   GIG TYPES
====================================================== */
export type GigStatus =
  | "draft"
  | "open"
  | "selection_pending"
  | "confirmation_pending"
  | "payment_pending"
  | "active"
  | "completed"
  | "cancelled"
  | "disputed";

export interface Gig {
  id: number;
  parent: number;
  parent_profile?: ParentProfile;
  title: string;
  subject: string;
  grade: string;
  description: string;
  budget_min: number;
  budget_max: number;
  schedule: Record<string, any>;
  location: string;
  duration_weeks: number;
  sessions_per_week: number;
  status: GigStatus;
  selected_teacher?: number;
  hired_teacher?: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
  closed_at?: string;
  applications_count?: number;
  progress_percentage?: number;
  days_remaining?: number;
}

export interface Gigs {
  results: Gig[];
  count: number;
  next: string | null;
  previous: string | null;
}

/* ======================================================
   APPLICATION TYPES
====================================================== */

export interface Application {
  id: number;
  gig:
    | number
    | {
        id: number;
        title: string;
        subject: string;
        grade: string;
        budget_min: number;
        budget_max: number;
        location: string;
        status?: GigStatus;
      };
  teacher: number;
  teacher_profile?: TeacherProfile;
  cover_letter: string;
  proposed_rate: number;
  status: string;
  selected_at?: string;
  response_deadline?: string;
  responded_at?: string;
  match_cancelled_at?: string;
  match_cancelled_by?: number | null;
  match_cancel_reason?: string;
  rate_change_proposed_rate?: number | null;
  rate_change_proposed_by?: number | null;
  rate_change_proposed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Applications {
  results: Application[];
  count: number;
  next: string | null;
  previous: string | null;
}

/* ======================================================
   JOB TYPES
====================================================== */
export type JobStatus = "draft" | "open" | "closed" | "cancelled";
export type JobApplicationStatus =
  | "pending"
  | "reviewed"
  | "shortlisted"
  | "accepted"
  | "rejected"
  | "withdrawn";

export interface Job {
  id: number;
  created_by: number;
  title: string;
  school_name: string;
  school_address: string;
  school_contact_email?: string;
  school_contact_phone?: string;
  subject: string;
  grade?: string;
  employment_type: string;
  description: string;
  requirements: string;
  salary_min?: number | null;
  salary_max?: number | null;
  location: string;
  deadline?: string | null;
  status: JobStatus;
  applications_count?: number;
  has_applied?: boolean;
  created_at: string;
  updated_at: string;
  published_at?: string | null;
  closed_at?: string | null;
}

export interface Jobs {
  results: Job[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface JobDetails {
  id: number;
  title: string;
  school_name: string;
  subject: string;
  grade?: string;
  employment_type: string;
  salary_min?: number | null;
  salary_max?: number | null;
  location: string;
  deadline?: string | null;
  status: string;
  created_at: string;
}

export interface JobApplication {
  id: number;
  job: number;
  job_details?: JobDetails;
  teacher: number;
  teacher_profile?: TeacherProfile;
  cv_document?: VerificationDocument;
  cover_letter: string;
  status: JobApplicationStatus;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface JobApplications {
  results: JobApplication[];
  count: number;
  next: string | null;
  previous: string | null;
}

/* ======================================================
   PAYMENT TYPES
====================================================== */

export interface PremiumSubscription {
  id: number;
  teacher: number;
  teacher_name: string;
  amount: number;
  duration_days: number;
  starts_at?: string;
  expires_at?: string;
  status: "pending" | "active" | "expired" | "cancelled";
  khalti_pidx?: string;
  khalti_transaction_id?: string;
  created_at: string;
  updated_at: string;
}

/* ======================================================
   NOTIFICATION TYPES
====================================================== */

export interface Notification {
  id: number;
  user: number;
  notification_type: string;
  title: string;
  message: string;
  link: string;
  metadata?: Record<string, any>;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

/* ======================================================
   MESSAGING TYPES
====================================================== */

export interface MessagingUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: "teacher" | "parent" | "admin";
  profile_picture?: string | null;
}

export interface ChatMessage {
  id: number;
  conversation: number;
  sender: MessagingUser;
  body: string;
  read_at?: string | null;
  created_at: string;
}

export interface ChatConversation {
  id: number;
  gig: {
    id: number;
    title: string;
    subject: string;
    grade: string;
    status: string;
  };
  parent: MessagingUser;
  teacher: MessagingUser;
  other_user: MessagingUser | null;
  is_active: boolean;
  matched_application_id?: number | null;
  last_message: ChatMessage | null;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

/* ======================================================
   RATING TYPES
====================================================== */

export interface Rating {
  id: number;
  rater: User;
  ratee: User;
  rater_name: string;
  ratee_name: string;
  gig: number;
  gig_title: string;
  rater_type: "parent" | "teacher";
  score: number; // 1-5
  review: string;
  created_at: string;
}

export interface CreateRatingData {
  gig: number;
  score: number;
  review?: string;
}

export interface UpdateRatingData {
  score?: number;
  review?: string;
}

export interface RatingStats {
  user_id: number;
  average_rating: number;
  total_ratings: number;
  rating_distribution: Record<string, number>; // {"1": 0, "2": 1, "3": 5, "4": 10, "5": 20}
  recent_ratings: Rating[];
}

export interface CanRateResponse {
  can_rate: boolean;
  reason: string | null;
}

/* ======================================================
   DASHBOARD STATS TYPES
====================================================== */

// src/services/api.ts - Complete Type Definitions

/* ======================================================
   ENHANCED TEACHER STATS TYPES
====================================================== */

export interface ApplicationTrends {
  month: string;
  count: number;
}

export interface EarningsTrend {
  month: string;
  gross_earnings: number;
  platform_fees: number;
  net_earnings: number;
  gig_count: number;
}

export interface EarningsBySubject {
  subject: string;
  earnings: number;
  gig_count: number;
}

export interface SuccessRate {
  month: string;
  success_rate: number;
  total_applications: number;
  successful_applications: number;
}

export interface RateComparison {
  gig_title: string;
  proposed_rate: number;
  actual_earnings: number;
}

export interface TopParent {
  parent_id: number;
  email: string;
  name: string;
  gig_count: number;
}

export interface SubjectCount {
  subject: string;
  count: number;
}

export interface GradeCount {
  grade: string;
  count: number;
}

export interface GigCreation {
  month: string;
  count: number;
}

export interface RatingTrend {
  month: string;
  total_ratings: number;
  average_rating: number;
}

export interface EnhancedTeacherStats {
  // Filter metadata
  filters?: {
    date_from: string;
    date_to: string;
  };

  // Summary metrics
  summary: {
    total_applications: number;
    pending_applications: number;
    selected_applications: number;
    accepted_applications: number;
    rejected_applications: number;
    recent_applications: number;
    acceptance_rate: number;
    active_gigs: number;
    completed_gigs: number;
    total_hired_gigs: number;
    average_rating: number;
    total_reviews: number;
    recent_ratings: number;
    total_earned: number;
    recent_earnings: number;
    avg_earnings_per_gig: number;
    avg_proposed_rate: number;
    avg_gig_duration_weeks: number;
    avg_response_time_hours: number | null;
    is_premium: boolean;
    premium_expires_at: string | null;
  };

  // Chart data
  charts: {
    application_trends: ApplicationTrends[];
    success_rate: SuccessRate[];
    gig_completion: GigCreation[];
    earnings_trends: EarningsTrend[];
    rating_trends: RatingTrend[];
  };

  // Distribution data
  distributions: {
    applications_by_status: Record<string, number>;
    applications_by_subject: SubjectCount[];
    applications_by_grade: GradeCount[];
    gigs_by_status: Record<string, number>;
    gigs_by_subject: SubjectCount[];
    gigs_by_grade: GradeCount[];
    earnings_by_subject: EarningsBySubject[];
    rating_distribution: Record<string, number>;
  };

  // Top performers
  top_performers: {
    top_parents: TopParent[];
  };

  // Additional insights
  insights: {
    rate_comparison: RateComparison[];
  };

  // Premium info
  premium: {
    is_active: boolean;
    expires_at: string | null;
    current_subscription: PremiumSubscription | null;
  };
}

/* ======================================================
   ENHANCED PARENT STATS TYPES
====================================================== */

export interface SpendingTrend {
  month: string;
  amount: number;
  gig_count: number;
}

export interface GigsBySubject {
  subject: string;
  count: number;
}

export interface GigsByGrade {
  grade: string;
  count: number;
}

export interface BudgetDistribution {
  range: string;
  count: number;
}

export interface HiredTeacher {
  teacher_id: number;
  email: string;
  name: string;
  gig_count: number;
}

export interface EnhancedParentStats {
  // Filter metadata
  filters?: {
    date_from: string;
    date_to: string;
  };

  // Summary metrics
  summary: {
    total_gigs: number;
    open_gigs: number;
    active_gigs: number;
    completed_gigs: number;
    total_applications: number;
    recent_applications: number;
    average_rating: number;
    total_reviews: number;
    total_spent: number;
    avg_gig_budget: number;
    avg_applications_per_gig: number;
    avg_selection_time_days: number | null;
  };

  // Chart data
  charts: {
    spending_trends: SpendingTrend[];
    gig_creation: GigCreation[];
    application_trends: ApplicationTrends[];
    rating_trends: RatingTrend[];
  };

  // Distribution data
  distributions: {
    gigs_by_status: Record<string, number>;
    gigs_by_subject: GigsBySubject[];
    gigs_by_grade: GigsByGrade[];
    applications_by_status: Record<string, number>;
    rating_distribution: Record<string, number>;
    budget_distribution: BudgetDistribution[];
  };

  // Top performers
  top_performers: {
    hired_teachers: HiredTeacher[];
  };
}

/* ======================================================
   ENHANCED ADMIN STATS TYPES
====================================================== */

export interface RevenueByMonth {
  month: string;
  gig_revenue: number;
  premium_revenue: number;
  total_revenue: number;
  gig_count: number;
  premium_count: number;
}

export interface WeeklyRevenue {
  week: string;
  revenue: number;
  count: number;
}

export interface UserGrowth {
  month: string;
  parent: number;
  teacher: number;
  admin: number;
  total: number;
}

export interface DailyActiveUsers {
  date: string;
  active_users: number;
}

export interface AcceptanceRate {
  month: string;
  acceptance_rate: number;
  rejection_rate: number;
  total_applications: number;
}

export interface PremiumTrends {
  month: string;
  subscriptions: number;
  revenue: number;
}

export interface SubscriptionByDuration {
  duration: string;
  count: number;
}

export interface AvgRatingByRole {
  role: string;
  average_rating: number;
  total_ratings: number;
}

export interface PaymentMethod {
  method: string;
  count: number;
  total_amount: number;
}

export interface TopTeacher {
  teacher_id: number;
  email: string;
  name: string;
  total_earnings: number;
  completed_gigs: number;
}

export interface TopParentAdmin {
  parent_id: number;
  email: string;
  name: string;
  total_spent: number;
  gigs_posted: number;
}

export interface SubjectRevenue {
  subject: string;
  revenue: number;
  gig_count: number;
}

export interface PremiumUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  subscription_id: number;
  starts_at: string;
  expires_at: string;
  duration_days: number;
  amount: number;
}

export interface EnhancedAdminStats {
  // Filter metadata
  filters?: {
    date_from: string;
    date_to: string;
  };

  summary: {
    platform_earnings: number;
    premium_earnings: number;
    gig_earnings: number;
    total_users: number;
    active_gigs: number;
    total_gigs: number;
    total_applications: number;
    total_ratings: number;
    active_premium_users: number;
    total_premium_subscriptions: number;
    avg_completion_time_days: number | null;
    payment_success_rate: number;
    avg_payment_amount: number;
  };

  charts: {
    revenue_by_month: RevenueByMonth[];
    weekly_revenue: WeeklyRevenue[];
    user_growth: UserGrowth[];
    daily_active_users: DailyActiveUsers[];
    gig_creation: GigCreation[];
    application_trends: ApplicationTrends[];
    acceptance_rate: AcceptanceRate[];
    premium_trends: PremiumTrends[];
    rating_trends: RatingTrend[];
  };

  distributions: {
    users_by_role: Record<string, number>;
    gigs_by_status: Record<string, number>;
    gigs_by_subject: SubjectCount[];
    gigs_by_grade: GradeCount[];
    budget_distribution: BudgetDistribution[];
    applications_by_status: Record<string, number>;
    subscriptions_by_duration: SubscriptionByDuration[];
    rating_distribution: Record<string, number>;
    avg_ratings_by_role: AvgRatingByRole[];
    payment_methods: PaymentMethod[];
  };

  top_performers: {
    teachers: TopTeacher[];
    parents: TopParentAdmin[];
    subjects_by_revenue: SubjectRevenue[];
  };

  details: {
    premium_users: PremiumUser[];
    recent_payment_stats: {
      total: number;
      completed: number;
      failed: number;
      pending: number;
    };
  };
}

/* ======================================================
   STATS FILTER TYPES
====================================================== */

export interface StatsFilters {
  date_from?: string;
  date_to?: string;
}

/* ======================================================
   LEGACY TYPES (for backward compatibility)
====================================================== */

export interface TeacherStats {
  total_applications: number;
  pending_applications: number;
  active_gigs: number;
  total_earnings: number;
  acceptance_rate: number;
  average_rating: number;
  total_reviews: number;
}

export interface ParentStats extends EnhancedParentStats {}

export interface AdminStats extends EnhancedAdminStats {}

/* ======================================================
   PREMIUM SUBSCRIPTION TYPE
====================================================== */

export interface PremiumSubscription {
  id: number;
  teacher: number;
  teacher_name: string;
  amount: number;
  duration_days: number;
  starts_at?: string;
  expires_at?: string;
  status: "pending" | "active" | "expired" | "cancelled";
  khalti_pidx?: string;
  khalti_transaction_id?: string;
  created_at: string;
  updated_at: string;
}

// Update the existing ParentStats interface to use the enhanced version
export interface ParentStats extends EnhancedParentStats {}

export interface ProfileCompletion {
  is_complete: boolean;
  profile_exists: boolean;
  missing_fields?: string[];
  missing_documents?: string[];
  completion_percentage: number;
  has_documents?: {
    citizenship_front?: boolean;
    citizenship_back?: boolean;
    academic?: boolean;
    experience?: boolean;
    id_card?: boolean;
    supporting_document?: boolean;
  };
  document_count?: number;
  message?: string;
}

export interface PremiumPlan {
  id: string;
  name: string;
  duration_days: number;
  amount: number;
  currency: string;
  savings?: number;
  popular?: boolean;
  features: string[];
}

export interface PremiumPlanResponse {
  plans: PremiumPlan[];
  count: number;
}

export interface PremiumEligibility {
  eligible: boolean;
  reason: string | null;
  current_subscription?: PremiumSubscription;
  stats?: {
    completed_gigs: number;
    selected_applications: number;
    active_gigs: number;
  };
}

export interface PremiumSubscribeResponse {
  subscription: PremiumSubscription;
  message: string;
  payment_url?: string;
  pidx?: string;
}

export interface PremiumVerifyResponse {
  success: boolean;
  message: string;
  subscription?: PremiumSubscription;
  status?: string;
}

export interface GigPayment {
  id: number;
  gig: number;
  gig_title: string;
  parent: number;
  parent_name: string;
  teacher: number;
  teacher_name: string;
  amount: number;
  platform_fee: number;
  teacher_amount: number;
  status: "pending" | "completed" | "failed" | "refunded";
  khalti_pidx?: string;
  khalti_transaction_id?: string;
  created_at: string;
  paid_at?: string;
}

export interface InitiateGigPaymentResponse {
  payment: GigPayment;
  message: string;
  payment_url?: string;
  pidx?: string;
}

export interface VerifyGigPaymentResponse {
  success: boolean;
  message: string;
  payment?: GigPayment;
  status?: string;
}

export interface PaymentStatusResponse {
  payment_required: boolean;
  payment_completed: boolean;
  payment: GigPayment | null;
}

/* ======================================================
   AUTH API
====================================================== */

export const authAPI = {
  register: (data: RegisterData) =>
    axiosInstance.post<User>("/auth/users/", data).then((r) => r.data),

  login: (data: LoginData) =>
    axiosInstance
      .post<AuthTokens>("/auth/jwt/create/", data)
      .then((r) => r.data),

  refreshToken: (refresh: string) =>
    axiosInstance
      .post<{ access: string }>("/auth/jwt/refresh/", { refresh })
      .then((r) => r.data),

  verifyToken: (token: string) =>
    axiosInstance.post("/auth/jwt/verify/", { token }),

  activateAccount: (data: ActivationData) =>
    axiosInstance.post("/auth/users/activation/", data),

  resendActivation: (email: string) =>
    axiosInstance.post("/auth/users/resend_activation/", { email }),

  resetPassword: (data: PasswordResetData) =>
    axiosInstance.post("/auth/users/reset_password/", data),

  resetPasswordConfirm: (data: PasswordResetConfirmData) =>
    axiosInstance.post("/auth/users/reset_password_confirm/", data),

  changePassword: (data: ChangePasswordData) =>
    axiosInstance.post("/auth/users/set_password/", data),

  getCurrentUser: () =>
    axiosInstance.get<User>("/auth/users/me/").then((r) => r.data),

  updateCurrentUser: (data: UpdateUserData) =>
    axiosInstance
      .patch<User>("/auth/users/me/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data),

  deleteAccount: (current_password: string) =>
    axiosInstance.delete("/auth/users/me/", { data: { current_password } }),
};

/* ======================================================
   USERS API
====================================================== */

export const userAPI = {
  getAll: () => axiosInstance.get<Users>("/users/").then((r) => r.data),
  getById: (id: number) =>
    axiosInstance.get<User>(`/users/${id}/`).then((r) => r.data),
  teachers: () =>
    axiosInstance.get<User[]>("/users/teachers/").then((r) => r.data),
  parents: () =>
    axiosInstance.get<User[]>("/users/parents/").then((r) => r.data),
  byRole: (role: string) =>
    axiosInstance
      .get<User[]>("/users/role/", { params: { role } })
      .then((r) => r.data),
  stats: () =>
    axiosInstance.get<UserStats>("/users/stats/").then((r) => r.data),
};

/* ======================================================
   PUBLIC API
====================================================== */

export const publicAPI = {
  landing: () =>
    axiosInstance.get<LandingData>("/public/landing/").then((r) => r.data),
  tutors: (params?: PublicTutorFilters) =>
    axiosInstance
      .get<PublicTutorsResponse>("/public/tutors/", { params })
      .then((r) => r.data),
  tutor: (id: number) =>
    axiosInstance
      .get<PublicTutorDetails>(`/public/tutors/${id}/`)
      .then((r) => r.data),
  gigs: () =>
    axiosInstance.get<Gigs>("/public/gigs/").then((r) => r.data),
  gig: (id: number) =>
    axiosInstance.get<Gig>(`/public/gigs/${id}/`).then((r) => r.data),
  testimonials: () =>
    axiosInstance
      .get<{ results: PublicTestimonial[] }>("/public/testimonials/")
      .then((r) => r.data.results),
  contact: (data: ContactMessageData) =>
    axiosInstance
      .post<{ message: string }>("/public/contact/", data)
      .then((r) => r.data),
};

/* ======================================================
   PROFILES API
====================================================== */

export const profileAPI = {
  // Subjects & Grades
  subjects: () =>
    axiosInstance.get<Subject[]>("/profiles/subjects/").then((r) => r.data),
  grades: () =>
    axiosInstance.get<Grade[]>("/profiles/grades/").then((r) => r.data),

  // Teacher Profile
  teacher: {
    get: () =>
      axiosInstance
        .get<TeacherProfile>("/profiles/teacher/")
        .then((r) => r.data),
    getById: (id: number) =>
      axiosInstance
        .get<TeacherProfile>(`/profiles/teacher/${id}/`)
        .then((r) => r.data),
    list: (params?: {
      verification_status?: string;
      is_premium?: boolean;
      location?: string;
      subject_id?: number;
      grade_id?: number;
      search?: string;
      order_by?: string;
    }) =>
      axiosInstance
        .get<TeacherProfile[]>("/profiles/teachers/", { params })
        .then((r) => r.data),
    create: (data: Partial<TeacherProfile> | FormData) =>
      axiosInstance
        .post<TeacherProfile>(
          "/profiles/teacher/",
          data,
          data instanceof FormData ? multipartConfig : undefined
        )
        .then((r) => r.data),
    update: (data: Partial<TeacherProfile> | FormData) =>
      axiosInstance
        .put<TeacherProfile>(
          "/profiles/teacher/",
          data,
          data instanceof FormData ? multipartConfig : undefined
        )
        .then((r) => r.data),
    patch: (data: Partial<TeacherProfile> | FormData) =>
      axiosInstance
        .patch<TeacherProfile>(
          "/profiles/teacher/",
          data,
          data instanceof FormData ? multipartConfig : undefined
        )
        .then((r) => r.data),
  },

  // Parent Profile
  parent: {
    get: () =>
      axiosInstance.get<ParentProfile>("/profiles/parent/").then((r) => r.data),
    getById: (id: number) =>
      axiosInstance
        .get<ParentProfile>(`/profiles/parent/${id}/`)
        .then((r) => r.data),
    create: (data: Partial<ParentProfile> | FormData) =>
      axiosInstance
        .post<ParentProfile>(
          "/profiles/parent/",
          data,
          data instanceof FormData ? multipartConfig : undefined
        )
        .then((r) => r.data),
    update: (data: Partial<ParentProfile> | FormData) =>
      axiosInstance
        .put<ParentProfile>(
          "/profiles/parent/",
          data,
          data instanceof FormData ? multipartConfig : undefined
        )
        .then((r) => r.data),
    patch: (data: Partial<ParentProfile> | FormData) =>
      axiosInstance
        .patch<ParentProfile>(
          "/profiles/parent/",
          data,
          data instanceof FormData ? multipartConfig : undefined
        )
        .then((r) => r.data),
  },
};

/* ======================================================
   DOCUMENT API
====================================================== */

export const documentAPI = {
  // Upload parent document
  uploadParent: (
    file: File,
    documentType: ParentDocumentType = "citizenship_front"
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("document_type", documentType);

    return axiosInstance
      .post("/profiles/parent/documents/upload/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((r) => r.data);
  },

  // Upload teacher document
  uploadTeacher: (file: File, documentType: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("document_type", documentType);

    return axiosInstance
      .post<VerificationDocument>(
        "/profiles/teacher/documents/upload/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )
      .then((r) => r.data);
  },

  // List my documents (teacher or parent)
  listMyTeacher() {
    return axiosInstance
      .get<VerificationDocument[]>("/profiles/teacher/documents/")
      .then((r) => r.data);
  },
  listMyParent() {
    return axiosInstance
      .get<ParentVerificationDocument[]>("/profiles/parent/documents/")
      .then((r) => r.data);
  },

  // Delete document (teacher or parent)
  delete: (documentId: number, userType: "teacher" | "parent") =>
    axiosInstance
      .delete(`/profiles/${userType}/documents/${documentId}/delete/`)
      .then((r) => r.data),

  // Download document (teacher or parent)
  download: (documentId: number, userType: "teacher" | "parent") =>
    axiosInstance
      .get(`/profiles/${userType}/documents/${documentId}/download/`, {
        responseType: "blob",
      })
      .then((r) => r.data),

  // ADMIN ENDPOINTS
  admin: {
    // List all teacher documents
    listTeacherDocuments: () =>
      axiosInstance
        .get<VerificationDocuments>("/profiles/admin/teacher-documents/")
        .then((r) => r.data),

    // List all parent documents
    listParentDocuments: () =>
      axiosInstance
        .get<VerificationDocuments>("/profiles/admin/parent-documents/")
        .then((r) => r.data),

    // List all profile pictures pending or already reviewed by admin
    listProfilePictures: () =>
      axiosInstance
        .get<VerificationDocuments>("/profiles/admin/profile-photos/")
        .then((r) => r.data),

    // Get single teacher document
    getTeacherDocument: (id: number) =>
      axiosInstance
        .get<VerificationDocument>(`/profiles/admin/teacher-documents/${id}/`)
        .then((r) => r.data),

    // Get single parent document
    getParentDocument: (id: number) =>
      axiosInstance
        .get<VerificationDocument>(`/profiles/admin/parent-documents/${id}/`)
        .then((r) => r.data),

    // Verify or reject teacher document
    verifyTeacherDocument: (
      id: number,
      data: {
        verified: boolean;
        notes?: string;
        rejection_reason?: string;
      }
    ) =>
      axiosInstance
        .post<VerificationDocument>(
          `/profiles/admin/teacher-documents/${id}/verify/`,
          data
        )
        .then((r) => r.data),

    // Verify or reject parent document
    verifyParentDocument: (
      id: number,
      data: {
        verified: boolean;
        notes?: string;
        rejection_reason?: string;
      }
    ) =>
      axiosInstance
        .post<VerificationDocument>(
          `/profiles/admin/parent-documents/${id}/verify/`,
          data
        )
        .then((r) => r.data),

    // Verify or reject user profile picture
    verifyProfilePicture: (
      userType: "teacher" | "parent",
      userId: number,
      data: {
        verified: boolean;
        rejection_reason?: string;
      }
    ) =>
      axiosInstance
        .post<VerificationDocument>(
          `/profiles/admin/profile-photos/${userType}/${userId}/verify/`,
          data
        )
        .then((r) => r.data),
  },
};

/* ======================================================
   PROFILE COMPLETION API - ADD THIS NEW SECTION
====================================================== */

export const profileCompletionAPI = {
  check: () =>
    axiosInstance
      .get<ProfileCompletion>("/profiles/check-completion/")
      .then((r) => r.data),
};

/* ======================================================
   GIGS API
====================================================== */

export const gigAPI = {
  list: (params?: any) =>
    axiosInstance.get<Gigs>("/gigs/", { params }).then((r) => r.data),
  get: (id: number) =>
    axiosInstance.get<Gig>(`/gigs/${id}/`).then((r) => r.data),
  create: (data: Partial<Gig>) =>
    axiosInstance.post<Gig>("/gigs/", data).then((r) => r.data),
  update: (id: number, data: Partial<Gig>) =>
    axiosInstance.put<Gig>(`/gigs/${id}/`, data).then((r) => r.data),
  patch: (id: number, data: Partial<Gig>) =>
    axiosInstance.patch<Gig>(`/gigs/${id}/`, data).then((r) => r.data),
  delete: (id: number) => axiosInstance.delete(`/gigs/${id}/`),
};

/* ======================================================
   APPLICATIONS API
====================================================== */

export const applicationAPI = {
  list: () =>
    axiosInstance
      .get<Applications>("/applications/")
      .then((r) => r.data.results),
  get: (id: number) =>
    axiosInstance.get<Application>(`/applications/${id}/`).then((r) => r.data),
  create: (data: Partial<Application>) =>
    axiosInstance.post<Application>("/applications/", data).then((r) => r.data),
  withdraw: (id: number) =>
    axiosInstance
      .post<Application>(`/applications/${id}/withdraw/`)
      .then((r) => r.data),
  select: (id: number) =>
    axiosInstance
      .post<Application>(`/applications/${id}/select/`)
      .then((r) => r.data),
  accept: (id: number) =>
    axiosInstance
      .post<Application>(`/applications/${id}/accept/`)
      .then((r) => r.data),
  reject: (id: number) =>
    axiosInstance
      .post<Application>(`/applications/${id}/reject/`)
      .then((r) => r.data),
  cancelMatch: (id: number, reason?: string) =>
    axiosInstance
      .post<Application>(`/applications/${id}/cancel-match/`, { reason })
      .then((r) => r.data),
  proposeRate: (id: number, proposedRate: number) =>
    axiosInstance
      .post<Application>(`/applications/${id}/propose-rate/`, {
        proposed_rate: proposedRate,
      })
      .then((r) => r.data),
  respondRate: (id: number, decision: "approve" | "reject") =>
    axiosInstance
      .post<Application>(`/applications/${id}/respond-rate/`, { decision })
      .then((r) => r.data),
};

/* ======================================================
   JOBS API
====================================================== */

export const jobAPI = {
  list: (params?: any) =>
    axiosInstance.get<Jobs>("/jobs/", { params }).then((r) => r.data),
  get: (id: number) =>
    axiosInstance.get<Job>(`/jobs/${id}/`).then((r) => r.data),
  create: (data: Partial<Job>) =>
    axiosInstance.post<Job>("/jobs/", data).then((r) => r.data),
  update: (id: number, data: Partial<Job>) =>
    axiosInstance.put<Job>(`/jobs/${id}/`, data).then((r) => r.data),
  patch: (id: number, data: Partial<Job>) =>
    axiosInstance.patch<Job>(`/jobs/${id}/`, data).then((r) => r.data),
  delete: (id: number) => axiosInstance.delete(`/jobs/${id}/`),
  applications: (id: number) =>
    axiosInstance
      .get<JobApplication[]>(`/jobs/${id}/applications/`)
      .then((r) => r.data),
};

export const jobApplicationAPI = {
  list: () =>
    axiosInstance
      .get<JobApplications>("/job-applications/")
      .then((r) => r.data.results),
  get: (id: number) =>
    axiosInstance
      .get<JobApplication>(`/job-applications/${id}/`)
      .then((r) => r.data),
  create: (data: { job: number; cover_letter?: string } | FormData) =>
    axiosInstance
      .post<JobApplication>(
        "/job-applications/",
        data,
        data instanceof FormData ? multipartConfig : undefined
      )
      .then((r) => r.data),
  patch: (
    id: number,
    data: { status?: JobApplicationStatus; admin_notes?: string }
  ) =>
    axiosInstance
      .patch<JobApplication>(`/job-applications/${id}/`, data)
      .then((r) => r.data),
  withdraw: (id: number) =>
    axiosInstance
      .post<JobApplication>(`/job-applications/${id}/withdraw/`)
      .then((r) => r.data),
};

/* ======================================================
   PAYMENTS API (Premium Subscriptions)
====================================================== */

export const paymentAPI = {
  premium: {
    // Create premium subscription
    subscribe: (data: { amount: number; duration_days: number }) =>
      axiosInstance
        .post<{ subscription: PremiumSubscription; message: string }>(
          "/payments/premium/subscribe/",
          data
        )
        .then((r) => r.data),

    // Get my subscriptions
    mySubscriptions: () =>
      axiosInstance
        .get<PremiumSubscription[]>("/payments/premium/my-subscriptions/")
        .then((r) => r.data),

    // Verify payment
    verify: (pidx: string) =>
      axiosInstance
        .post("/payments/premium/verify-payment/", { pidx })
        .then((r) => r.data),

    // Cancel subscription
    cancel: (subscriptionId: number) =>
      axiosInstance
        .post(`/payments/premium/cancel/${subscriptionId}/`)
        .then((r) => r.data),

    // Legacy endpoints (if using the payments app viewset)
    initiatePayment: (id: number) =>
      axiosInstance
        .post(`/subscriptions/${id}/initiate_payment/`)
        .then((r) => r.data),
    verifyPayment: (pidx: string) =>
      axiosInstance
        .post("/subscriptions/verify/", { pidx })
        .then((r) => r.data),
    adminSubscriptions: () =>
      axiosInstance
        .get<PremiumSubscription[]>("/payments/admin/subscriptions/")
        .then((r) => r.data),
  },
};

/* ======================================================
   NOTIFICATIONS API
====================================================== */

export const notificationAPI = {
  list: () =>
    axiosInstance.get<Notification[]>("/notifications/").then((r) => r.data),
  unreadCount: () =>
    axiosInstance
      .get<{ unread_count: number }>("/notifications/unread-count/")
      .then((r) => r.data),
  markRead: (id: number) =>
    axiosInstance
      .post<{ success: boolean }>(`/notifications/${id}/read/`)
      .then((r) => r.data),
  markAllRead: () =>
    axiosInstance
      .post<{ marked_count: number }>("/notifications/read-all/")
      .then((r) => r.data),
};

/* ======================================================
   MESSAGING API
====================================================== */

export const messagingAPI = {
  conversations: () =>
    axiosInstance
      .get<ChatConversation[] | { results: ChatConversation[] }>(
        "/messaging/conversations/"
      )
      .then((r) => (Array.isArray(r.data) ? r.data : r.data.results || [])),
  conversationForGig: async (gigId: number) => {
    const conversations = await messagingAPI.conversations();
    return conversations.find((conversation) => conversation.gig.id === gigId) || null;
  },
  conversation: (id: number) =>
    axiosInstance
      .get<ChatConversation>(`/messaging/conversations/${id}/`)
      .then((r) => r.data),
  messages: (conversationId: number) =>
    axiosInstance
      .get<ChatMessage[]>(`/messaging/conversations/${conversationId}/messages/`)
      .then((r) => r.data),
  send: (conversationId: number, body: string) =>
    axiosInstance
      .post<ChatMessage>(`/messaging/conversations/${conversationId}/messages/`, {
        body,
      })
      .then((r) => r.data),
  markRead: (conversationId: number) =>
    axiosInstance
      .post<{ marked_count: number; message_ids?: number[]; read_at?: string | null }>(
        `/messaging/conversations/${conversationId}/read/`
      )
      .then((r) => r.data),
  unreadCount: () =>
    axiosInstance
      .get<{ unread_count: number }>("/messaging/unread-count/")
      .then((r) => r.data),
};

/* ======================================================
   RATINGS API
====================================================== */

export const ratingAPI = {
  // Create a new rating
  create: (data: CreateRatingData) =>
    axiosInstance
      .post<Rating>("/profiles/ratings/create/", data)
      .then((r) => r.data),

  // Get my ratings (given, received, or all)
  my: (type?: "given" | "received" | "all") =>
    axiosInstance
      .get<Rating[]>("/profiles/ratings/my/", { params: { type } })
      .then((r) => r.data),

  // Get ratings for a specific user
  byUser: (userId: number) =>
    axiosInstance
      .get<Rating[]>(`/profiles/ratings/user/${userId}/`)
      .then((r) => r.data),

  // Get rating statistics for current user
  myStats: () =>
    axiosInstance
      .get<RatingStats>("/profiles/ratings/stats/")
      .then((r) => r.data),

  // Get rating statistics for a specific user
  userStats: (userId: number) =>
    axiosInstance
      .get<RatingStats>(`/profiles/ratings/stats/${userId}/`)
      .then((r) => r.data),

  // Check if can rate a specific gig
  canRate: (gigId: number) =>
    axiosInstance
      .get<CanRateResponse>(`/profiles/ratings/can-rate/${gigId}/`)
      .then((r) => r.data),

  // NEW: Get current user's rating for a specific gig
  getForGig: (gigId: number) =>
    axiosInstance
      .get<{ exists: boolean; rating: Rating | null }>(
        `/profiles/ratings/gig/${gigId}/`
      )
      .then((r) => r.data),

  // NEW: Get all rateable gigs for current user
  getRateableGigs: () =>
    axiosInstance
      .get<{
        rateable_gigs: Array<{
          gig_id: number;
          gig_title: string;
          gig_status: string;
          teacher_id?: number;
          teacher_name?: string;
          parent_id?: number;
          parent_name?: string;
          already_rated: boolean;
          can_rate: boolean;
        }>;
        count: number;
      }>("/profiles/ratings/rateable-gigs/")
      .then((r) => r.data),

  // Update a rating
  update: (ratingId: number, data: UpdateRatingData) =>
    axiosInstance
      .patch<Rating>(`/profiles/ratings/${ratingId}/`, data)
      .then((r) => r.data),

  // Delete a rating
  delete: (ratingId: number) =>
    axiosInstance
      .delete(`/profiles/ratings/${ratingId}/delete/`)
      .then((r) => r.data),
};

/* ======================================================
   STATS API
====================================================== */

export interface StatsFilters {
  date_from?: string;
  date_to?: string;
}

export const statsAPI = {
  teacher: (filters?: StatsFilters) =>
    axiosInstance
      .get<EnhancedTeacherStats>("/profiles/teacher/stats/", {
        params: filters,
      })
      .then((r) => r.data),
  parent: (filters?: StatsFilters) =>
    axiosInstance
      .get<ParentStats>("/profiles/parent/stats/", { params: filters })
      .then((r) => r.data),
  admin: (filters?: StatsFilters) =>
    axiosInstance
      .get<EnhancedAdminStats>("/profiles/admin/stats/", { params: filters })
      .then((r) => r.data),
};

/* ======================================================
   Premium API
====================================================== */

export const premiumAPI = {
  // Get available premium plans
  plans: () =>
    axiosInstance
      .get<{ plans: PremiumPlan[] }>("/profiles/premium/plans/")
      .then((r) => r.data),

  // Check eligibility for premium subscription
  checkEligibility: () =>
    axiosInstance
      .get<PremiumEligibility>("/profiles/premium/eligibility/")
      .then((r) => r.data),

  // Subscribe to premium
  subscribe: (data: { amount: number; duration_days: number }) =>
    axiosInstance
      .post<PremiumSubscribeResponse>("/profiles/premium/subscribe/", data)
      .then((r) => r.data),

  // Get my subscriptions
  mySubscriptions: () =>
    axiosInstance
      .get<PremiumSubscription[]>("/profiles/premium/my-subscriptions/")
      .then((r) => r.data),

  // Verify payment
  verifyPayment: (pidx: string) =>
    axiosInstance
      .post<PremiumVerifyResponse>("/profiles/premium/verify-payment/", {
        pidx,
      })
      .then((r) => r.data),

  // Cancel subscription
  cancelSubscription: (subscriptionId: number) =>
    axiosInstance
      .post<{ message: string; subscription: PremiumSubscription }>(
        `/profiles/premium/cancel/${subscriptionId}/`
      )
      .then((r) => r.data),
};

/* ======================================================
   GIG PAYMENTS API
====================================================== */

export const gigPaymentAPI = {
  // Initiate payment for gig
  initiate: (gigId: number) =>
    axiosInstance
      .post<InitiateGigPaymentResponse>(
        `/payments/gig-payments/initiate/${gigId}/`
      )
      .then((r) => r.data),

  // Verify payment
  verify: (pidx: string) =>
    axiosInstance
      .post<VerifyGigPaymentResponse>("/payments/gig-payments/verify/", {
        pidx,
      })
      .then((r) => r.data),

  // Get my payments
  myPayments: () =>
    axiosInstance
      .get<GigPayment[]>("/payments/gig-payments/my-payments/")
      .then((r) => r.data),

  // Check payment status for a gig
  status: (gigId: number) =>
    axiosInstance
      .get<PaymentStatusResponse>(`/payments/gig-payments/status/${gigId}/`)
      .then((r) => r.data),
};

/* ======================================================
   EXPORT
====================================================== */

export default {
  auth: authAPI,
  users: userAPI,
  profiles: profileAPI,
  gigs: gigAPI,
  applications: applicationAPI,
  jobs: jobAPI,
  jobApplications: jobApplicationAPI,
  payments: paymentAPI,
  notifications: notificationAPI,
  messaging: messagingAPI,
  ratings: ratingAPI,
  stats: statsAPI,
  documents: documentAPI,
  profileCompletion: profileCompletionAPI,
  premium: premiumAPI,
  gigPayments: gigPaymentAPI,
  public: publicAPI,
};
