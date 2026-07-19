import { z } from "zod";

// Auth validators
export const signUpSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/[a-z]/, "Password must contain a lowercase letter")
      .regex(/[0-9]/, "Password must contain a number")
      .regex(/[!@#$%^&*()\-_=+\[\]{}|;':",./<>?]/, "Password must contain a special character"),
    confirmPassword: z.string(),
    name: z.string().min(2, "Name must be at least 2 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Project validators
export const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(255),
  description: z.string().max(1000).optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
});

// File upload validators
export const fileUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 52428800, "File size must be less than 50MB")
    .refine(
      (file) => ["pdf", "docx", "xlsx", "csv", "txt", "doc"].includes(file.type.split("/").pop() || ""),
      "File type not supported"
    ),
});

// Insight validators
export const insightSchema = z.object({
  type: z.enum(["customer_need", "pain_point", "feature_request", "feedback", "behavior"]),
  content: z.string().min(1, "Insight content is required"),
  sentiment: z.enum(["positive", "negative", "neutral"]).optional(),
});

// Persona validators
export const personaSchema = z.object({
  type: z.enum(["primary", "secondary", "tertiary"]),
  name: z.string().min(1, "Persona name is required"),
  role: z.string().optional(),
  description: z.string().optional(),
  frustrations: z.string().optional(),
  goals: z.string().optional(),
  behaviors: z.string().optional(),
  size: z.enum(["large", "medium", "small"]).optional(),
});

// Opportunity validators
export const opportunitySchema = z.object({
  title: z.string().min(1, "Opportunity title is required"),
  description: z.string().min(1, "Description is required"),
  severity: z.enum(["high", "medium", "low"]),
  revenue: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
});

// Chat validators
export const chatMessageSchema = z.object({
  message: z.string().min(1, "Message is required").max(2000),
});

// Pagination validators
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
});

// Search validators
export const searchSchema = z.object({
  query: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});
