import { z } from "zod"
import { createFindParams } from "@medusajs/medusa/api/utils/validators"

// Simple HTML sanitization helper (removes common HTML/script tags)
const sanitizeHtml = (input: string) => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
};

// Custom sanitization transform
const sanitizedString = (maxLength: number) => 
  z.string()
    .max(maxLength, `Must be ${maxLength} characters or less`)
    .min(1, "Required")
    .transform(sanitizeHtml)
    .refine(val => val.length > 0, "Cannot be empty after sanitization");

export const StoreCreateReview = z.object({
  title: z.string()
    .max(100, "Title must be 100 characters or less")
    .transform(sanitizeHtml)
    .optional(),
  content: sanitizedString(2000),
  rating: z.preprocess(
    (val) => {
      if (val && typeof val === "string") {
        return parseInt(val)
      }
      return val
    },
    z.number()
      .int("Rating must be a whole number")
      .min(1, "Rating must be at least 1")
      .max(5, "Rating must be at most 5")
  ),
  product_id: z.string().min(1, "Product ID is required"),
  // Remove first_name and last_name - we'll get this from customer data
});

export const StoreGetReviews = createFindParams({
  limit: 50,
  offset: 0,
}).extend({
  product_id: z.string().optional(),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
});

export const StoreGetProductReviews = createFindParams({
  limit: 20,
  offset: 0,
}).extend({
  status: z.enum(["pending", "approved", "rejected"]).default("approved"),
});

export type StoreCreateReviewReq = z.infer<typeof StoreCreateReview>
export type StoreGetReviewsReq = z.infer<typeof StoreGetReviews>
export type StoreGetProductReviewsReq = z.infer<typeof StoreGetProductReviews>