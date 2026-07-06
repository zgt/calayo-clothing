// Custom hook for loading measurements from user profile
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSession } from "~/lib/auth-client";
import { api } from "~/trpc/react";
import type { CommissionFormData, UserMeasurements } from "../types";

interface UseMeasurementLoaderProps {
  setFormData: React.Dispatch<React.SetStateAction<CommissionFormData>>;
}

// Measurement columns to pull from a stored profile measurements row,
// excluding non-measurement columns (id, user_id, created_at, updated_at,
// size_preference, fit_preference).
const MEASUREMENT_KEYS = [
  "chest",
  "waist",
  "hips",
  "length",
  "inseam",
  "shoulders",
  "neck",
  "sleeve_length",
  "bicep",
  "forearm",
  "wrist",
  "armhole_depth",
  "back_width",
  "front_chest_width",
  "thigh",
  "knee",
  "calf",
  "ankle",
  "rise",
  "outseam",
  "height",
  "weight",
  "torso_length",
  "shoulder_slope",
  "posture",
] as const satisfies readonly (keyof UserMeasurements)[];

export const useMeasurementLoader = ({
  setFormData,
}: UseMeasurementLoaderProps) => {
  const { data: session } = useSession();
  const user = session?.user;
  const router = useRouter();
  const utils = api.useUtils();
  const [isLoadingMeasurements, setIsLoadingMeasurements] = useState(false);

  const loadMeasurementsFromProfile = async () => {
    if (!user) {
      toast.error("You must be logged in to load your measurements");
      router.push("/login");
      return;
    }

    const userId = user.id;

    if (!userId) {
      toast.error("User ID not found");
      return;
    }

    setIsLoadingMeasurements(true);

    try {
      const data = await utils.profile.getMeasurements.fetch();

      // Map the returned row into the UserMeasurements shape, keeping only
      // measurement columns.
      const profileMeasurements: UserMeasurements = {};
      if (data) {
        const source = data as Record<string, unknown>;
        for (const key of MEASUREMENT_KEYS) {
          const value = source[key];
          if (
            typeof value === "number" ||
            typeof value === "string" ||
            value === null
          ) {
            (profileMeasurements as Record<string, unknown>)[key] = value;
          }
        }
      }

      if (
        !data ||
        Object.keys(profileMeasurements).length === 0
      ) {
        toast.error(
          "No measurements found in your profile. Please add your measurements in your profile first.",
        );
        return;
      }

      // Update form with measurements from profile
      setFormData((prev) => ({
        ...prev,
        measurements: {
          ...prev.measurements,
          ...profileMeasurements,
        },
      }));

      toast.success("Your saved measurements have been loaded");
    } catch (error) {
      console.error("Error loading measurements:", error);
      toast.error("Failed to load your measurements");
    } finally {
      setIsLoadingMeasurements(false);
    }
  };

  return {
    isLoadingMeasurements,
    loadMeasurementsFromProfile,
  };
};
