/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any, @typescript-eslint/no-redundant-type-constituents */
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  adminProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import crypto from "crypto";
import {
  GARMENT_TYPES,
  BUDGET_VALUES,
  TIMELINE_VALUES,
  MEASUREMENT_BOUNDS,
  UNIT_LABELS,
  HEX_COLOR_PATTERN,
  validateDesign,
  REQUIRED_MEASUREMENTS,
} from "~/lib/commission-design";

// Zod schemas for input validation

// Numeric measurement bounded to its plausible range (shared with the client
// so both validation layers agree).
const boundedMeasurement = (field: keyof typeof MEASUREMENT_BOUNDS) => {
  const bound = MEASUREMENT_BOUNDS[field]!;
  return z
    .number()
    .min(
      bound.min,
      `${field} should be at least ${bound.min} ${UNIT_LABELS[bound.unit]}`,
    )
    .max(
      bound.max,
      `${field} should be at most ${bound.max} ${UNIT_LABELS[bound.unit]}`,
    )
    .nullable()
    .optional();
};

const measurementsSchema = z.object({
  chest: boundedMeasurement("chest"),
  waist: boundedMeasurement("waist"),
  hips: boundedMeasurement("hips"),
  length: boundedMeasurement("length"),
  inseam: boundedMeasurement("inseam"),
  shoulders: boundedMeasurement("shoulders"),
  neck: boundedMeasurement("neck"),
  sleeve_length: boundedMeasurement("sleeve_length"),
  bicep: boundedMeasurement("bicep"),
  forearm: boundedMeasurement("forearm"),
  wrist: boundedMeasurement("wrist"),
  armhole_depth: boundedMeasurement("armhole_depth"),
  back_width: boundedMeasurement("back_width"),
  front_chest_width: boundedMeasurement("front_chest_width"),
  thigh: boundedMeasurement("thigh"),
  knee: boundedMeasurement("knee"),
  calf: boundedMeasurement("calf"),
  ankle: boundedMeasurement("ankle"),
  rise: boundedMeasurement("rise"),
  outseam: boundedMeasurement("outseam"),
  height: boundedMeasurement("height"),
  weight: boundedMeasurement("weight"),
  torso_length: boundedMeasurement("torso_length"),
  shoulder_slope: boundedMeasurement("shoulder_slope"),
  posture: z.string().max(200).nullable().optional(),
});

const designSchema = z.object({
  colorHex: z
    .string()
    .regex(HEX_COLOR_PATTERN, "Color must be a hex value like #1f2a44")
    .nullable(),
  colorName: z.string().max(64).nullable(),
  fabric: z.string().max(64).nullable(),
  styleOptions: z.record(z.string(), z.string().max(64)),
});

const createCommissionSchema = z
  .object({
    garmentType: z.enum(GARMENT_TYPES, { error: "Garment type is required" }),
    measurements: measurementsSchema,
    design: designSchema,
    budget: z.enum(BUDGET_VALUES, { error: "Budget is required" }),
    timeline: z.enum(TIMELINE_VALUES, { error: "Timeline is required" }),
    details: z.string().min(1, "Details are required").max(5000),
  })
  .superRefine((input, ctx) => {
    // Design choices must exist in the option tree for the chosen garment.
    for (const problem of validateDesign(input.design, input.garmentType)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["design"],
        message: problem,
      });
    }

    // Required measurements per garment (previously only checked client-side).
    for (const field of REQUIRED_MEASUREMENTS[input.garmentType] ?? []) {
      const value =
        input.measurements[field as keyof z.infer<typeof measurementsSchema>];
      if (value === null || value === undefined || value === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["measurements", field],
          message: `${field} is required for a ${input.garmentType}`,
        });
      }
    }
  });

const updateCommissionStatusSchema = z.object({
  id: z.string().min(1, "Commission ID is required"),
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
          color_hex: input.design.colorHex,
          color_name: input.design.colorName,
          fabric: input.design.fabric,
          design_options:
            Object.keys(input.design.styleOptions).length > 0
              ? input.design.styleOptions
              : null,
          user_id: (user as any).id,
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
          console.error("Error creating commission:", commissionError);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create commission",
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
          .filter(([key]) => key !== "user_id" && key !== "id")
          .reduce(
            (acc, [key, value]) => {
              const measurementKey = key as MeasurementKey;

              if (measurementKey === "posture") {
                acc[measurementKey] = value;
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

          console.error(
            "Error creating commission measurements:",
            measurementsError,
          );
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create commission",
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

        console.error("Error processing commission request:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An error occurred processing your request",
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
      .eq("user_id", (user as any).id)
      .order("created_at", { ascending: false })) as {
      data: any[] | null;
      error: any;
    };

    if (error) {
      console.error("Error fetching commissions:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch commissions",
      });
    }

    return commissions ?? [];
  }),

  // Get commission by ID (user can only access their own)
  getById: protectedProcedure
    .input(z.object({ id: z.string().min(1, "Commission ID is required") }))
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
        .eq("user_id", (user as any).id)
        .single()) as { data: any | null; error: any };

      if (error) {
        if (error.code !== "PGRST116") {
          console.error("Error fetching commission:", error);
        }
        throw new TRPCError({
          code:
            error.code === "PGRST116" ? "NOT_FOUND" : "INTERNAL_SERVER_ERROR",
          message:
            error.code === "PGRST116"
              ? "Commission not found"
              : "Failed to fetch commission",
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
            user (name, email)
          `,
        )
        .order("created_at", { ascending: false })) as {
        data: any[] | null;
        error: any;
      };

      if (error) {
        console.error("Error fetching commissions:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch commissions",
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
          if (error.code !== "PGRST116") {
            console.error("Error updating commission status:", error);
          }
          throw new TRPCError({
            code:
              error.code === "PGRST116" ? "NOT_FOUND" : "INTERNAL_SERVER_ERROR",
            message:
              error.code === "PGRST116"
                ? "Commission not found"
                : "Failed to update commission status",
          });
        }

        return commission;
      }),

    // Get commission by ID (admin can access any)
    getById: adminProcedure
      .input(z.object({ id: z.string().min(1, "Commission ID is required") }))
      .query(async ({ input, ctx }) => {
        const { supabase } = ctx;

        const { data: commission, error } = (await supabase
          .from("commissions")
          .select(
            `
            *,
            commission_measurements (*),
            user (name, email)
          `,
          )
          .eq("id", input.id)
          .single()) as { data: any | null; error: any };

        if (error) {
          if (error.code !== "PGRST116") {
            console.error("Error fetching commission:", error);
          }
          throw new TRPCError({
            code:
              error.code === "PGRST116" ? "NOT_FOUND" : "INTERNAL_SERVER_ERROR",
            message:
              error.code === "PGRST116"
                ? "Commission not found"
                : "Failed to fetch commission",
          });
        }

        return commission;
      }),
  }),
});
