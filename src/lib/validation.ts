import { z } from "zod";

// Common validation schemas
export const emailSchema = z
  .string()
  .trim()
  .min(1, "L'email est requis")
  .email("Format d'email invalide")
  .max(255, "L'email ne peut pas dépasser 255 caractères");

export const passwordSchema = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères")
  .max(128, "Le mot de passe ne peut pas dépasser 128 caractères")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre"
  );

export const nameSchema = z
  .string()
  .trim()
  .min(1, "Le nom est requis")
  .max(100, "Le nom ne peut pas dépasser 100 caractères")
  .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Le nom contient des caractères invalides");

export const phoneSchema = z
  .string()
  .trim()
  .regex(
    /^(?:\+33|0)[1-9](?:[0-9]{8})$/,
    "Format de téléphone invalide (ex: +33612345678 ou 0612345678)"
  )
  .optional()
  .or(z.literal(""));

export const messageSchema = z
  .string()
  .trim()
  .min(10, "Le message doit contenir au moins 10 caractères")
  .max(2000, "Le message ne peut pas dépasser 2000 caractères");

export const urlSchema = z
  .string()
  .trim()
  .url("Format d'URL invalide")
  .optional()
  .or(z.literal(""));

// Authentication schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Le mot de passe est requis"),
});

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, "Confirmez le mot de passe"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

// Contact form schema
export const contactSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  subject: z.string().trim().min(1, "Le sujet est requis").max(200, "Le sujet est trop long"),
  message: messageSchema,
});

// Approval form schema
export const approvalSchema = z.object({
  decision: z.enum(["approved", "rejected"], {
    required_error: "Une décision est requise",
  }),
  reason: z.string().trim().max(500, "La raison ne peut pas dépasser 500 caractères").optional(),
});

// Platform key validation
export const platformKeySchema = z.enum([
  "emotionscare",
  "nearvity",
  "system-compass",
  "growth-copilot",
  "med-mng",
  "swift-care-hub",
  "track-triumph-tavern",
], {
  errorMap: () => ({ message: "Plateforme invalide" }),
});

// Run type validation
export const runTypeSchema = z.enum([
  "DAILY_EXECUTIVE_BRIEF",
  "CEO_STANDUP_MEETING",
  "PLATFORM_STATUS_REVIEW",
  "SECURITY_AUDIT_RLS",
  "MARKETING_WEEK_PLAN",
  "RELEASE_GATE_CHECK",
  "COMPETITIVE_ANALYSIS",
  "WEEKLY_EXEC_REVIEW",
], {
  errorMap: () => ({ message: "Type de run invalide" }),
});

// Execution request schema
export const executeRunSchema = z.object({
  run_type: runTypeSchema,
  platform_key: platformKeySchema.optional(),
  context_data: z.record(z.unknown()).optional(),
});

// Search/filter schema
export const searchSchema = z.object({
  query: z.string().trim().max(200, "Recherche trop longue").optional(),
  limit: z.number().min(1).max(100).optional().default(10),
  offset: z.number().min(0).optional().default(0),
});

// Sanitization helpers
export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function sanitizeForDisplay(input: string): string {
  // Remove potentially dangerous patterns
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "");
}

// Validation result type
export type ValidationResult<T> = 
  | { success: true; data: T }
  | { success: false; errors: Record<string, string> };

// Generic validation function
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors: Record<string, string> = {};
  result.error.errors.forEach((err) => {
    const path = err.path.join(".");
    errors[path] = err.message;
  });
  
  return { success: false, errors };
}
