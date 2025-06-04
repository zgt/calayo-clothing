// Custom hook for loading measurements from user profile
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useAuth } from "~/context/auth";
import { fetchProfileMeasurements } from "../utils";
import type { CommissionFormData } from "../types";

interface UseMeasurementLoaderProps {
  setFormData: React.Dispatch<React.SetStateAction<CommissionFormData>>;
}

export const useMeasurementLoader = ({ setFormData }: UseMeasurementLoaderProps) => {
  const { user } = useAuth();
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
      
      if (!profileMeasurements || Object.keys(profileMeasurements).length === 0) {
        toast("No saved measurements found in your profile");
        return;
      }
      
      // Update form with measurements from profile
      setFormData(prev => ({
        ...prev,
        measurements: {
          ...prev.measurements,
          ...profileMeasurements
        }
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