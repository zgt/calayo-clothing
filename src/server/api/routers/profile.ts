import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { 
  nameSchema, 
  locationSchema, 
  phoneSchema, 
  websiteSchema, 
  bioSchema 
} from "~/lib/profile-validation";

export const profileRouter = createTRPCRouter({
  updateName: protectedProcedure
    .input(z.object({
      name: nameSchema,
    }))
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
    .input(z.object({
      location: locationSchema,
    }))
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
    .input(z.object({
      phone: phoneSchema,
    }))
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
    .input(z.object({
      website: websiteSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      // Normalize URL - add https:// if no protocol specified
      let website = input.website;
      if (website && !website.startsWith('http')) {
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
    .input(z.object({
      bio: bioSchema,
    }))
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
    .input(z.object({
      name: nameSchema.optional(),
      location: locationSchema.optional(),
      phone: phoneSchema.optional(),
      website: websiteSchema.optional(),
      bio: bioSchema.optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const updateData: Record<string, string | null> = {};

      // Only include provided fields
      if (input.name !== undefined) updateData.name = input.name;
      if (input.location !== undefined) updateData.location = input.location || null;
      if (input.phone !== undefined) updateData.phone = input.phone || null;
      if (input.website !== undefined) {
        let website = input.website;
        if (website && !website.startsWith('http')) {
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
  getProfile: protectedProcedure
    .query(async ({ ctx }) => {
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
});

