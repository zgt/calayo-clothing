// Shared types for commission forms

export interface CommissionFormData {
  garmentType: string;
  measurements: {
    // Basic measurements (original)
    chest: number | null;
    waist: number | null;
    hips: number | null;
    length: number | null;
    inseam: number | null;
    shoulders: number | null;
    // Additional measurements (new)
    neck: number | null;
    sleeve_length: number | null;
    bicep: number | null;
    forearm: number | null;
    wrist: number | null;
    armhole_depth: number | null;
    back_width: number | null;
    front_chest_width: number | null;
    thigh: number | null;
    knee: number | null;
    calf: number | null;
    ankle: number | null;
    rise: number | null;
    outseam: number | null;
    height: number | null;
    weight: number | null;
    torso_length: number | null;
    shoulder_slope: number | null;
    posture: string | null;
  };
  budget: string;
  timeline: string;
  details: string;
}

export interface UserMeasurements {
  chest?: number | null;
  waist?: number | null;
  hips?: number | null;
  length?: number | null;
  inseam?: number | null;
  shoulders?: number | null;
  neck?: number | null;
  sleeve_length?: number | null;
  bicep?: number | null;
  forearm?: number | null;
  wrist?: number | null;
  armhole_depth?: number | null;
  back_width?: number | null;
  front_chest_width?: number | null;
  thigh?: number | null;
  knee?: number | null;
  calf?: number | null;
  ankle?: number | null;
  rise?: number | null;
  outseam?: number | null;
  height?: number | null;
  weight?: number | null;
  torso_length?: number | null;
  shoulder_slope?: number | null;
  posture?: string | null;
}

export type SupabaseError = {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
};

export type MeasurementKey = keyof CommissionFormData["measurements"];

export interface MeasurementField {
  id: string;
  label: string;
}

export interface MeasurementGroups {
  upper: MeasurementField[];
  lower: MeasurementField[];
  general: MeasurementField[];
}
