// Constants for commission forms
import type { MeasurementGroups, CommissionFormData } from "./types";

// Required measurements by garment type
export const REQUIRED_MEASUREMENTS: Record<string, string[]> = {
  shirt: ['chest', 'shoulders', 'sleeve_length'],
  jacket: ['chest', 'shoulders', 'sleeve_length', 'bicep'],
  pants: ['waist', 'hips', 'inseam', 'length', 'rise'],
  dress: ['chest', 'waist', 'hips', 'length', 'shoulders'],
  skirt: ['waist', 'hips', 'length'],
  other: [],
};

// Group measurements by body area for better UI organization
export const MEASUREMENT_GROUPS: MeasurementGroups = {
  upper: [
    { id: "chest", label: "Chest" },
    { id: "shoulders", label: "Shoulders" },
    { id: "neck", label: "Neck" },
    { id: "sleeve_length", label: "Sleeve Length" },
    { id: "bicep", label: "Bicep" },
    { id: "forearm", label: "Forearm" },
    { id: "wrist", label: "Wrist" },
    { id: "armhole_depth", label: "Armhole Depth" },
    { id: "back_width", label: "Back Width" },
    { id: "front_chest_width", label: "Front Chest Width" },
  ],
  lower: [
    { id: "waist", label: "Waist" },
    { id: "hips", label: "Hips" },
    { id: "length", label: "Length" },
    { id: "inseam", label: "Inseam" },
    { id: "rise", label: "Rise" },
    { id: "outseam", label: "Outseam" },
    { id: "thigh", label: "Thigh" },
    { id: "knee", label: "Knee" },
    { id: "calf", label: "Calf" },
    { id: "ankle", label: "Ankle" },
  ],
  general: [
    { id: "height", label: "Height" },
    { id: "weight", label: "Weight" },
    { id: "torso_length", label: "Torso Length" },
    { id: "shoulder_slope", label: "Shoulder Slope" },
    { id: "posture", label: "Posture" },
  ]
};

// Default empty measurements with all fields initialized to null
export const getEmptyMeasurements = (): CommissionFormData['measurements'] => ({
  chest: null,
  waist: null,
  hips: null,
  length: null,
  inseam: null,
  shoulders: null,
  neck: null,
  sleeve_length: null,
  bicep: null,
  forearm: null,
  wrist: null,
  armhole_depth: null,
  back_width: null,
  front_chest_width: null,
  thigh: null,
  knee: null,
  calf: null,
  ankle: null,
  rise: null,
  outseam: null,
  height: null,
  weight: null,
  torso_length: null,
  shoulder_slope: null,
  posture: null,
});