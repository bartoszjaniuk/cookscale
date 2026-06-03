import { z } from "zod";

export const CalculateDishRequestSchema = z.object({
  description: z.string().trim().min(1, "description_required").max(3000, "description_too_long"),
  language: z.enum(["pl", "en"]).optional(),
});

export const ErrorResponseSchema = z.object({
  error: z.string(),
  message: z.string().optional(),
  reset_at: z.string().optional(),
});
