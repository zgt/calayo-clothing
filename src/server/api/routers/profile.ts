import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  nameSchema,
  locationSchema,
  phoneSchema,
  websiteSchema,
  bioSchema,
} from "~/lib/profile-validation";

// Zod schema for profile measurements input validation
const profileMeasurementsSchema = z.object({
  // Basic measurements
  chest: z.number().nullable().optional(),
  waist: z.number().nullable().optional(),
  hips: z.number().nullable().optional(),
  length: z.number().nullable().optional(),
  inseam: z.number().nullable().optional(),
  shoulders: z.number().nullable().optional(),
  // Additional upper body
  neck: z.number().nullable().optional(),
  sleeve_length: z.number().nullable().optional(),
  bicep: z.number().nullable().optional(),
  forearm: z.number().nullable().optional(),
  wrist: z.number().nullable().optional(),
  armhole_depth: z.number().nullable().optional(),
  back_width: z.number().nullable().optional(),
  front_chest_width: z.number().nullable().optional(),
  // Additional lower body
  thigh: z.number().nullable().optional(),
  knee: z.number().nullable().optional(),
  calf: z.number().nullable().optional(),
  ankle: z.number().nullable().optional(),
  rise: z.number().nullable().optional(),
  outseam: z.number().nullable().optional(),
  // Full body
  height: z.number().nullable().optional(),
  weight: z.number().nullable().optional(),
  // Formal wear
  torso_length: z.number().nullable().optional(),
  shoulder_slope: z.number().nullable().optional(),
  posture: z.string().max(100).nullable().optional(),
  // Preferences
  size_preference: z.string().max(100).nullable().optional(),
  fit_preference: z.string().max(100).nullable().optional(),
});

export const profileRouter = createTRPCRouter({
  updateName: protectedProcedure
    .input(
      z.object({
        name: nameSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from("user")
        .update({ name: input.name })
        .eq("id", ctx.user.id);

      if (error) {
        throw new Error("Failed to update name");
      }

      return { success: true };
    }),

  updateLocation: protectedProcedure
    .input(
      z.object({
        location: locationSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from("user")
        .update({ location: input.location || null })
        .eq("id", ctx.user.id);

      if (error) {
        throw new Error("Failed to update location");
      }

      return { success: true };
    }),

  updatePhone: protectedProcedure
    .input(
      z.object({
        phone: phoneSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from("user")
        .update({ phone: input.phone || null })
        .eq("id", ctx.user.id);

      if (error) {
        throw new Error("Failed to update phone");
      }

      return { success: true };
    }),

  updateWebsite: protectedProcedure
    .input(
      z.object({
        website: websiteSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Normalize URL - add https:// if no protocol specified
      let website = input.website;
      if (website && !website.startsWith("http")) {
        website = `https://${website}`;
      }

      const { error } = await ctx.supabase
        .from("user")
        .update({ website: website || null })
        .eq("id", ctx.user.id);

      if (error) {
        throw new Error("Failed to update website");
      }

      return { success: true };
    }),

  updateBio: protectedProcedure
    .input(
      z.object({
        bio: bioSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from("user")
        .update({ bio: input.bio || null })
        .eq("id", ctx.user.id);

      if (error) {
        throw new Error("Failed to update bio");
      }

      return { success: true };
    }),

  // General update mutation for updating multiple fields at once
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: nameSchema.optional(),
        location: locationSchema.optional(),
        phone: phoneSchema.optional(),
        website: websiteSchema.optional(),
        bio: bioSchema.optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updateData: Record<string, string | null> = {};

      // Only include provided fields
      if (input.name !== undefined) updateData.name = input.name;
      if (input.location !== undefined)
        updateData.location = input.location || null;
      if (input.phone !== undefined) updateData.phone = input.phone || null;
      if (input.website !== undefined) {
        let website = input.website;
        if (website && !website.startsWith("http")) {
          website = `https://${website}`;
        }
        updateData.website = website || null;
      }
      if (input.bio !== undefined) updateData.bio = input.bio || null;

      const { error } = await ctx.supabase
        .from("user")
        .update(updateData)
        .eq("id", ctx.user.id);

      if (error) {
        throw new Error("Failed to update profile");
      }

      return { success: true };
    }),

  // Get current user profile
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("user")
      .select("id, email, name, bio, website, location, phone, image, role")
      .eq("id", ctx.user.id)
      .single();

    if (error) {
      throw new Error("Failed to fetch profile");
    }

    return data;
  }),

  // Get current user's profile measurements
  getMeasurements: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("profile_measurements")
      .select("*")
      .eq("user_id", ctx.user.id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching measurements:", error);
      throw new Error("Failed to fetch measurements");
    }

    return data ?? null;
  }),

  // Create or update the current user's profile measurements
  upsertMeasurements: protectedProcedure
    .input(profileMeasurementsSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if measurements already exist for this user
      const { data: existing, error: fetchError } = await ctx.supabase
        .from("profile_measurements")
        .select("id")
        .eq("user_id", ctx.user.id)
        .maybeSingle();

      if (fetchError) {
        console.error("Error checking existing measurements:", fetchError);
        throw new Error("Failed to save measurements");
      }

      if (existing?.id) {
        // Update existing measurements (never trust a client-supplied user_id)
        const { error: updateError } = await ctx.supabase
          .from("profile_measurements")
          .update(input)
          .eq("id", existing.id);

        if (updateError) {
          console.error("Error updating measurements:", updateError);
          throw new Error("Failed to save measurements");
        }
      } else {
        // Insert new measurements scoped to the authenticated user
        const { error: insertError } = await ctx.supabase
          .from("profile_measurements")
          .insert({ ...input, user_id: ctx.user.id });

        if (insertError) {
          console.error("Error inserting measurements:", insertError);
          throw new Error("Failed to save measurements");
        }
      }

      return { success: true };
    }),
});
