import { z } from "zod";

// Validation schemas for different field types
export const nameSchema = z.string().min(1, "Name cannot be empty").max(100, "Name is too long");
export const locationSchema = z.string().max(100, "Location is too long");
export const phoneSchema = z.string().refine((phone) => {
  if (!phone) return true; // Allow empty
  // Basic phone validation - adjust pattern as needed
  const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
}, "Please enter a valid phone number");
export const websiteSchema = z.string().refine((url) => {
  if (!url) return true; // Allow empty
  try {
    new URL(url.startsWith('http') ? url : `https://${url}`);
    return true;
  } catch {
    return false;
  }
}, "Please enter a valid website URL");
export const bioSchema = z.string().max(500, "Bio cannot exceed 500 characters");

// Export validation schemas for use in components
export const profileValidation = {
  name: nameSchema,
  location: locationSchema,
  phone: phoneSchema,
  website: websiteSchema,
  bio: bioSchema,
};