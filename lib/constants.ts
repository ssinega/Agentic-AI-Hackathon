// Application-wide constants

export const APP_NAME = "DiscoveryOS";
export const APP_DESCRIPTION = "Transform Customer Research into Actionable Product Intelligence";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// File upload constants
export const MAX_FILE_SIZE = 52428800; // 50MB
export const ALLOWED_FILE_TYPES = ["pdf", "docx", "xlsx", "csv", "txt", "doc"];
export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "text/plain",
];

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

// Insight types
export const INSIGHT_TYPES = {
  CUSTOMER_NEED: "customer_need",
  PAIN_POINT: "pain_point",
  FEATURE_REQUEST: "feature_request",
  FEEDBACK: "feedback",
  BEHAVIOR: "behavior",
};

// Sentiments
export const SENTIMENTS = {
  POSITIVE: "positive",
  NEGATIVE: "negative",
  NEUTRAL: "neutral",
};

// Persona types
export const PERSONA_TYPES = {
  PRIMARY: "primary",
  SECONDARY: "secondary",
  TERTIARY: "tertiary",
};

// Persona sizes
export const PERSONA_SIZES = {
  LARGE: "large",
  MEDIUM: "medium",
  SMALL: "small",
};

// Opportunity severity
export const OPPORTUNITY_SEVERITY = {
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
};

// Report formats
export const REPORT_FORMATS = {
  HTML: "html",
  PDF: "pdf",
  JSON: "json",
};

// Navigation items for dashboard
// Navigation items for dashboard
export const SIDEBAR_ITEMS = [
  { label: "Overview", href: "/", icon: "LayoutGrid" },
  { label: "Projects", href: "/projects", icon: "Folder" },
  { label: "Upload", href: "/upload", icon: "Upload" },
  { label: "Insights", href: "/insights", icon: "Lightbulb" },
  { label: "Themes", href: "/themes", icon: "Tags" },
  { label: "Personas", href: "/personas", icon: "Users" },
  { label: "Opportunities", href: "/opportunities", icon: "Target" },
  { label: "Reports", href: "/reports", icon: "FileText" },
  { label: "Chat", href: "/chat", icon: "MessageSquare" },
  { label: "Settings", href: "/settings", icon: "Settings" },
];


// Colors for charts
export const CHART_COLORS = {
  primary: "#6366f1",
  secondary: "#a855f7",
  accent: "#06b6d4",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
};

// Theme colors
export const THEME_COLORS = {
  light: "light",
  dark: "dark",
  auto: "auto",
};

// Validation rules
export const VALIDATION_RULES = {
  MIN_PASSWORD_LENGTH: 8,
  MIN_PROJECT_NAME_LENGTH: 1,
  MAX_PROJECT_NAME_LENGTH: 255,
  MIN_PROJECT_DESCRIPTION_LENGTH: 0,
  MAX_PROJECT_DESCRIPTION_LENGTH: 1000,
};

// API timeout
export const API_TIMEOUT = 30000; // 30 seconds

// Cache duration
export const CACHE_DURATION = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 30 * 60 * 1000, // 30 minutes
  LONG: 24 * 60 * 60 * 1000, // 24 hours
};

// Error messages
export const ERROR_MESSAGES = {
  INVALID_EMAIL: "Invalid email address",
  PASSWORD_TOO_SHORT: "Password must be at least 8 characters",
  PASSWORDS_DO_NOT_MATCH: "Passwords do not match",
  INVALID_FILE_TYPE: "Invalid file type",
  FILE_TOO_LARGE: "File is too large",
  UNAUTHORIZED: "You are not authorized to access this resource",
  NOT_FOUND: "Resource not found",
  INTERNAL_ERROR: "An internal server error occurred",
};

// Success messages
export const SUCCESS_MESSAGES = {
  PROJECT_CREATED: "Project created successfully",
  PROJECT_UPDATED: "Project updated successfully",
  PROJECT_DELETED: "Project deleted successfully",
  FILE_UPLOADED: "File uploaded successfully",
  INSIGHTS_GENERATED: "Insights generated successfully",
};
