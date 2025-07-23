// Custom hook for loading measurements from user profile
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSession } from "~/lib/auth-client";
import { fetchProfileMeasurements } from "../utils";
import type { CommissionFormData } from "../types";

interface UseMeasurementLoaderProps {
  setFormData: React.Dispatch<React.SetStateAction<CommissionFormData>>;
}

export const useMeasurementLoader = ({
  setFormData,
}: UseMeasurementLoaderProps) => {
  const { data: session } = useSession();
  const user = session?.user;
  const router = useRouter();
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
      const profileMeasurements = await fetchProfileMeasurements(userId);

      if (
        !profileMeasurements ||
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
