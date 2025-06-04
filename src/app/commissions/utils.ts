// Utility functions for commission forms
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { UserMeasurements, SupabaseError, MeasurementKey, CommissionFormData } from "./types";
import { REQUIRED_MEASUREMENTS, MEASUREMENT_GROUPS } from "./constants";

// Helper function to fetch profile measurements
export const fetchProfileMeasurements = async (userId: string): Promise<UserMeasurements> => {
  const supabase = createClientComponentClient();
  
  const { data, error } = await supabase
    .from('profile_measurements')
    .select('*')
    .eq('profile_id', userId)
    .single() as { data: UserMeasurements | null; error: SupabaseError | null };
    
  if (error) {
    console.error("Error fetching measurements:", error);
    throw new Error(error.message);
  }
  
  return data ?? {};
};

// Helper function to determine if a measurement field should be shown based on the garment type
export const shouldShowMeasurement = (measurementId: string, garmentType: string): boolean => {
  // For general measurements, always show
  if (MEASUREMENT_GROUPS.general.some(m => m.id === measurementId)) {
    return true;
  }
  
  // For upper body measurements, show for shirt, jacket, dress
  if (MEASUREMENT_GROUPS.upper.some(m => m.id === measurementId)) {
    return ['shirt', 'jacket', 'dress', 'other'].includes(garmentType);
  }
  
  // For lower body measurements, show for pants, skirt, dress
  if (MEASUREMENT_GROUPS.lower.some(m => m.id === measurementId)) {
    return ['pants', 'skirt', 'dress', 'other'].includes(garmentType);
  }
  
  return true;
};

// Helper function to check if a measurement is required
export const isMeasurementRequired = (measurementId: string, garmentType: string): boolean => {
  const requiredMeasurements = REQUIRED_MEASUREMENTS[garmentType] ?? [];
  return requiredMeasurements.includes(measurementId);
};

// Form validation function
export const validateCommissionForm = (formData: CommissionFormData): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  if (!formData.garmentType) {
    errors.garmentType = "Please select a garment type";
  }
  
  if (!formData.budget) {
    errors.budget = "Please select a budget range";
  }
  
  if (!formData.timeline) {
    errors.timeline = "Please select a timeline";
  }
  
  if (!formData.details) {
    errors.details = "Please provide additional details";
  }

  // Validate required measurements based on garment type
  const requiredMeasurements = REQUIRED_MEASUREMENTS[formData.garmentType] ?? [];
  for (const field of requiredMeasurements) {
    if (!formData.measurements[field as MeasurementKey]) {
      errors[`measurements.${field}`] = "Required";
    }
  }

  return errors;
};

// Helper function for number input validation
export const handleNumberInput = (e: React.KeyboardEvent<HTMLInputElement>): void => {
  // Allow only numbers, backspace, delete, tab, arrows, home, end
  const allowedKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End', '.'];
  const key = e.key;
  
  // Check if the key is not a number or one of the allowed control keys
  if (!/^[0-9]$/.test(key) && !allowedKeys.includes(key)) {
    e.preventDefault();
  }
};