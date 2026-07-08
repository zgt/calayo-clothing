// Utility functions for commission forms
import type { MeasurementKey, CommissionFormData } from "./types";
import { REQUIRED_MEASUREMENTS, MEASUREMENT_GROUPS } from "./constants";
import {
  checkMeasurementPlausibility,
  validateDesign,
} from "~/lib/commission-design";

// Helper function to determine if a measurement field should be shown based on the garment type
export const shouldShowMeasurement = (
  measurementId: string,
  garmentType: string,
): boolean => {
  // For general measurements, always show
  if (MEASUREMENT_GROUPS.general.some((m) => m.id === measurementId)) {
    return true;
  }

  // For upper body measurements, show for shirt, jacket, dress
  if (MEASUREMENT_GROUPS.upper.some((m) => m.id === measurementId)) {
    return ["shirt", "jacket", "dress"].includes(garmentType);
  }

  // For lower body measurements, show for pants and dresses
  if (MEASUREMENT_GROUPS.lower.some((m) => m.id === measurementId)) {
    return ["pants", "dress"].includes(garmentType);
  }

  return true;
};

// Helper function to check if a measurement is required
export const isMeasurementRequired = (
  measurementId: string,
  garmentType: string,
): boolean => {
  const requiredMeasurements = REQUIRED_MEASUREMENTS[garmentType] ?? [];
  return requiredMeasurements.includes(measurementId);
};

// Form validation function
export const validateCommissionForm = (
  formData: CommissionFormData,
): Record<string, string> => {
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
  const requiredMeasurements =
    REQUIRED_MEASUREMENTS[formData.garmentType] ?? [];
  for (const field of requiredMeasurements) {
    if (!formData.measurements[field as MeasurementKey]) {
      errors[`measurements.${field}`] = "Required";
    }
  }

  // Reject values outside plausible human ranges (catches typos and
  // cm-vs-inches mix-ups). Mirrors the server-side Zod bounds.
  for (const [field, value] of Object.entries(formData.measurements)) {
    if (typeof value !== "number") continue;
    const warning = checkMeasurementPlausibility(field, value);
    if (warning && !errors[`measurements.${field}`]) {
      errors[`measurements.${field}`] = warning;
    }
  }

  // Design selections must exist in the option tree for the garment.
  const designProblems = validateDesign(formData.design, formData.garmentType);
  if (designProblems.length > 0) {
    errors.design = designProblems.join("; ");
  }

  return errors;
};

// Helper function for number input validation
export const handleNumberInput = (
  e: React.KeyboardEvent<HTMLInputElement>,
): void => {
  // Allow only numbers, backspace, delete, tab, arrows, home, end
  const allowedKeys = [
    "Backspace",
    "Delete",
    "Tab",
    "ArrowLeft",
    "ArrowRight",
    "Home",
    "End",
    ".",
  ];
  const key = e.key;

  // Check if the key is not a number or one of the allowed control keys
  if (!/^[0-9]$/.test(key) && !allowedKeys.includes(key)) {
    e.preventDefault();
  }
};
