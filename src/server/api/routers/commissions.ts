/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any, @typescript-eslint/no-redundant-type-constituents */
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  adminProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import crypto from "crypto";

// Zod schemas for input validation
const measurementsSchema = z.object({
  chest: z.number().nullable().optional(),
  waist: z.number().nullable().optional(),
  hips: z.number().nullable().optional(),
  length: z.number().nullable().optional(),
  inseam: z.number().nullable().optional(),
  shoulders: z.number().nullable().optional(),
  neck: z.number().nullable().optional(),
  sleeve_length: z.number().nullable().optional(),
  bicep: z.number().nullable().optional(),
  forearm: z.number().nullable().optional(),
  wrist: z.number().nullable().optional(),
  armhole_depth: z.number().nullable().optional(),
  back_width: z.number().nullable().optional(),
  front_chest_width: z.number().nullable().optional(),
  thigh: z.number().nullable().optional(),
  knee: z.number().nullable().optional(),
  calf: z.number().nullable().optional(),
  ankle: z.number().nullable().optional(),
  rise: z.number().nullable().optional(),
  outseam: z.number().nullable().optional(),
  height: z.number().nullable().optional(),
  weight: z.number().nullable().optional(),
  torso_length: z.number().nullable().optional(),
  shoulder_slope: z.number().nullable().optional(),
  posture: z.string().nullable().optional(),
});

const createCommissionSchema = z.object({
  garmentType: z.string().min(1, "Garment type is required"),
  measurements: measurementsSchema,
  budget: z.string().min(1, "Budget is required"),
  timeline: z.string().min(1, "Timeline is required"),
  details: z.string().min(1, "Details are required"),
});

const updateCommissionStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum([
    "Pending",
    "Approved",
    "In Progress",
    "Completed",
    "Cancelled",
  ]),
});

type MeasurementKey = keyof Omit<
  z.infer<typeof measurementsSchema>,
  "id" | "commission_id"
>;

export const commissionsRouter = createTRPCRouter({
  // Create a new commission
  create: protectedProcedure
    .input(createCommissionSchema)
    .mutation(async ({ input, ctx }) => {
      const { supabase, user } = ctx;

      try {
        // Generate commission ID
        const commissionId = crypto.randomUUID();

        // Format the commission data for PostgreSQL
        const commissionData = {
          id: commissionId,
          status: "Pending",
          garment_type: input.garmentType,
          budget: input.budget,
          timeline: input.timeline,
          details: input.details,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Insert commission
        const { data: commission, error: commissionError } = (await supabase
          .from("commissions")
          .insert(commissionData)
          .select("id")
          .single()) as { data: { id: string } | null; error: any };

        if (commissionError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: commissionError.message,
          });
        }

        if (!commission) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create commission",
          });
        }

        // Process measurements
        const measurementsId = crypto.randomUUID();

        const measurementsFields = Object.entries(input.measurements || {})
          .filter(([key]) => key !== "profile_id" && key !== "id")
          .reduce(
            (acc, [key, value]) => {
              const measurementKey = key as MeasurementKey;

              if (measurementKey === "posture") {
                acc[measurementKey] = value as string | null;
              } else {
                const numValue =
                  value === null || value === undefined ? null : Number(value);
                if (numValue !== null && !isNaN(numValue)) {
                  acc[measurementKey] = numValue;
                }
              }

              return acc;
            },
            {} as Record<MeasurementKey, number | string | null>,
          );

        // Create measurements data
        const measurementsData = {
          ...measurementsFields,
          id: measurementsId,
          commission_id: commission.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Insert measurements
        const { error: measurementsError } = await supabase
          .from("commission_measurements")
          .insert(measurementsData);

        if (measurementsError) {
          // Rollback: delete commission if measurements fail
          await supabase.from("commissions").delete().eq("id", commission.id);

          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: measurementsError.message,
          });
        }

        return {
          success: true,
          message: "Commission submitted successfully",
          data: commission,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "An error occurred processing your request",
        });
      }
    }),

  // Get user's commissions
  getUserCommissions: protectedProcedure.query(async ({ ctx }) => {
    const { supabase, user } = ctx;

    const { data: commissions, error } = (await supabase
      .from("commissions")
      .select(
        `
          *,
          commission_measurements (*)
        `,
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })) as {
      data: any[] | null;
      error: any;
    };

    if (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message,
      });
    }

    return commissions ?? [];
  }),

  // Get commission by ID (user can only access their own)
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const { supabase, user } = ctx;

      const { data: commission, error } = (await supabase
        .from("commissions")
        .select(
          `
          *,
          commission_measurements (*)
        `,
        )
        .eq("id", input.id)
        .eq("user_id", user.id)
        .single()) as { data: any | null; error: any };

      if (error) {
        throw new TRPCError({
          code:
            error.code === "PGRST116" ? "NOT_FOUND" : "INTERNAL_SERVER_ERROR",
          message:
            error.code === "PGRST116" ? "Commission not found" : error.message,
        });
      }

      return commission;
    }),

  // Admin procedures
  admin: createTRPCRouter({
    // Get all commissions (admin only)
    getAll: adminProcedure.query(async ({ ctx }) => {
      const { supabase } = ctx;

      const { data: commissions, error } = (await supabase
        .from("commissions")
        .select(
          `
            *,
            commission_measurements (*),
            profiles (first_name, last_name, email)
          `,
        )
        .order("created_at", { ascending: false })) as {
        data: any[] | null;
        error: any;
      };

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }

      return commissions ?? [];
    }),

    // Update commission status (admin only)
    updateStatus: adminProcedure
      .input(updateCommissionStatusSchema)
      .mutation(async ({ input, ctx }) => {
        const { supabase } = ctx;

        const { data: commission, error } = (await supabase
          .from("commissions")
          .update({
            status: input.status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", input.id)
          .select()
          .single()) as { data: any | null; error: any };

        if (error) {
          throw new TRPCError({
            code:
              error.code === "PGRST116" ? "NOT_FOUND" : "INTERNAL_SERVER_ERROR",
            message:
              error.code === "PGRST116"
                ? "Commission not found"
                : error.message,
          });
        }

        return commission;
      }),

    // Get commission by ID (admin can access any)
    getById: adminProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ input, ctx }) => {
        const { supabase } = ctx;

        const { data: commission, error } = (await supabase
          .from("commissions")
          .select(
            `
            *,
            commission_measurements (*),
            profiles (first_name, last_name, email)
          `,
          )
          .eq("id", input.id)
          .single()) as { data: any | null; error: any };

        if (error) {
          throw new TRPCError({
            code:
              error.code === "PGRST116" ? "NOT_FOUND" : "INTERNAL_SERVER_ERROR",
            message:
              error.code === "PGRST116"
                ? "Commission not found"
                : error.message,
          });
        }

        return commission;
      }),
  }),
});
