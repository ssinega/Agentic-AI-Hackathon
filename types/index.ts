// User types
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Project types
export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  archivedAt?: Date;
}

// Document types
export interface Document {
  id: string;
  projectId: string;
  originalName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  uploadedAt: Date;
}

// Insight types
export enum InsightType {
  CUSTOMER_NEED = "customer_need",
  PAIN_POINT = "pain_point",
  FEATURE_REQUEST = "feature_request",
  FEEDBACK = "feedback",
  BEHAVIOR = "behavior",
}

export enum Sentiment {
  POSITIVE = "positive",
  NEGATIVE = "negative",
  NEUTRAL = "neutral",
}

export interface Insight {
  id: string;
  projectId: string;
  type: InsightType | string;
  content: string;
  frequency: number;
  sentiment?: Sentiment | string;
  confidence: number;
  extractedAt: Date;
}

// Theme types
export interface Theme {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  frequency: number;
  relatedInsights: string[];
  createdAt: Date;
}

// Persona types
export enum PersonaType {
  PRIMARY = "primary",
  SECONDARY = "secondary",
  TERTIARY = "tertiary",
}

export enum PersonaSize {
  LARGE = "large",
  MEDIUM = "medium",
  SMALL = "small",
}

export interface Persona {
  id: string;
  projectId: string;
  type: PersonaType | string;
  name: string;
  role?: string;
  description?: string;
  frustrations?: string;
  goals?: string;
  behaviors?: string;
  size?: PersonaSize | string;
  createdAt: Date;
}

// Opportunity types
export enum OpportunitySeverity {
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
}

export interface Opportunity {
  id: string;
  projectId: string;
  title: string;
  description: string;
  frequency: number;
  severity: OpportunitySeverity | string;
  revenue?: string;
  confidence: number;
  score: number;
  ranking?: number;
  createdAt: Date;
}

// Report types
export enum ReportFormat {
  HTML = "html",
  PDF = "pdf",
  JSON = "json",
}

export interface Report {
  id: string;
  projectId: string;
  title: string;
  generatedAt: Date;
  content: string;
  format: ReportFormat | string;
  createdAt: Date;
}

// Chat types
export interface ChatMessage {
  id: string;
  projectId: string;
  userId: string;
  message: string;
  response: string;
  createdAt: Date;
}

export interface ChatHistory {
  id: string;
  projectId: string;
  userId: string;
  message: string;
  response: string;
  createdAt: Date;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// File upload types
export interface UploadProgress {
  fileName: string;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  error?: string;
}

// Analytics types
export interface DashboardStats {
  totalProjects: number;
  totalInsights: number;
  totalPersonas: number;
  totalOpportunities: number;
  recentActivity: string[];
}

export interface InsightStats {
  byType: Record<string, number>;
  bySentiment: Record<string, number>;
  topThemes: Theme[];
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

export interface CreateProjectFormData {
  name: string;
  description?: string;
}

export interface UpdateProjectFormData {
  name?: string;
  description?: string;
}
