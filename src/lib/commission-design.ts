// Shared commission design domain: color swatches, fabric presets,
// per-garment style options, and measurement plausibility bounds.
// Imported by both the client form and the tRPC router so the two
// validation layers can't drift.

export const GARMENT_TYPES = ["shirt", "jacket", "pants", "dress"] as const;

export type GarmentType = (typeof GARMENT_TYPES)[number];

// Budget and timeline tiers. Values double as the DB-stored enum keys and are
// validated by both the client form and the tRPC router, so labels live here
// too (single source of truth) to keep the picker UI and the schema in sync.
// Ordered from smallest/soonest to largest/most-relaxed so a slider reads
// left-to-right naturally.
export const BUDGET_OPTIONS = [
  { value: "50-100", label: "$50–$100" },
  { value: "100-250", label: "$100–$250" },
  { value: "250-500", label: "$250–$500" },
  { value: "500-750", label: "$500–$750" },
  { value: "750-1000", label: "$750–$1,000" },
  { value: "1000-1500", label: "$1,000–$1,500" },
  { value: "1500+", label: "$1,500+" },
] as const;

export const TIMELINE_OPTIONS = [
  { value: "1-2weeks", label: "1–2 weeks" },
  { value: "3-4weeks", label: "3–4 weeks" },
  { value: "1-2months", label: "1–2 months" },
  { value: "2-3months", label: "2–3 months" },
  { value: "flexible", label: "Flexible" },
] as const;

export type BudgetValue = (typeof BUDGET_OPTIONS)[number]["value"];
export type TimelineValue = (typeof TIMELINE_OPTIONS)[number]["value"];

// Non-empty tuples for z.enum(). Derived from the option lists above so the
// two can never drift apart.
export const BUDGET_VALUES = BUDGET_OPTIONS.map((o) => o.value) as [
  BudgetValue,
  ...BudgetValue[],
];
export const TIMELINE_VALUES = TIMELINE_OPTIONS.map((o) => o.value) as [
  TimelineValue,
  ...TimelineValue[],
];

// ---------------------------------------------------------------------------
// Color
// ---------------------------------------------------------------------------

export interface ColorSwatch {
  hex: string;
  name: string;
}

// Curated dye palette. Hexes are the "true" fabric color; the 3D scene's
// lighting will shift them, which is why the UI always shows the flat chip
// alongside the rendered garment.
export const COLOR_SWATCHES: ColorSwatch[] = [
  { hex: "#f4efe6", name: "Ivory" },
  { hex: "#d9d3c7", name: "Bone" },
  { hex: "#8e8e93", name: "Stone Grey" },
  { hex: "#3b3b40", name: "Charcoal" },
  { hex: "#141416", name: "Black" },
  { hex: "#1f2a44", name: "Navy" },
  { hex: "#4a6fa5", name: "Slate Blue" },
  { hex: "#1e4034", name: "Forest" },
  { hex: "#10b981", name: "Emerald" },
  { hex: "#5a5f3c", name: "Olive" },
  { hex: "#5c1f2e", name: "Burgundy" },
  { hex: "#a24e36", name: "Rust" },
  { hex: "#b98a5a", name: "Camel" },
  { hex: "#d9a5a0", name: "Blush" },
];

export const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;

// Neutral grey used before the client picks a color (matches the previous
// static garment tint).
export const DEFAULT_GARMENT_COLOR = "#d1d5db";

export function swatchNameForHex(hex: string): string {
  const match = COLOR_SWATCHES.find(
    (s) => s.hex.toLowerCase() === hex.toLowerCase(),
  );
  return match?.name ?? "Custom";
}

// ---------------------------------------------------------------------------
// Fabric
// ---------------------------------------------------------------------------

export interface FabricPreset {
  id: string;
  label: string;
  description: string;
  // MeshPhysicalMaterial params used by the 3D viewer.
  material: {
    roughness: number;
    sheen: number;
    sheenRoughness: number;
  };
  garments: readonly GarmentType[];
}

export const FABRIC_PRESETS: readonly FabricPreset[] = [
  {
    id: "cotton-poplin",
    label: "Cotton Poplin",
    description: "Crisp, smooth and breathable — the classic shirting cloth.",
    material: { roughness: 0.8, sheen: 0.15, sheenRoughness: 0.9 },
    garments: ["shirt", "dress"],
  },
  {
    id: "linen",
    label: "Linen",
    description: "Airy with a dry, textured hand. Softens with wear.",
    material: { roughness: 0.92, sheen: 0.05, sheenRoughness: 1 },
    garments: ["shirt", "jacket", "pants", "dress"],
  },
  {
    id: "wool-suiting",
    label: "Wool Suiting",
    description: "Structured drape with a subtle matte lustre.",
    material: { roughness: 0.85, sheen: 0.2, sheenRoughness: 0.8 },
    garments: ["jacket", "pants"],
  },
  {
    id: "denim",
    label: "Denim",
    description: "Rugged twill that breaks in beautifully.",
    material: { roughness: 0.95, sheen: 0, sheenRoughness: 1 },
    garments: ["jacket", "pants"],
  },
  {
    id: "silk-charmeuse",
    label: "Silk Charmeuse",
    description: "Fluid and lustrous with a soft, liquid drape.",
    material: { roughness: 0.35, sheen: 0.6, sheenRoughness: 0.4 },
    garments: ["shirt", "dress"],
  },
  {
    id: "satin",
    label: "Satin",
    description: "High-shine face with a smooth, formal finish.",
    material: { roughness: 0.3, sheen: 0.8, sheenRoughness: 0.35 },
    garments: ["dress"],
  },
  {
    id: "velvet",
    label: "Velvet",
    description: "Deep pile that catches light directionally.",
    material: { roughness: 1, sheen: 1, sheenRoughness: 0.5 },
    garments: ["jacket", "dress"],
  },
  {
    id: "jersey-knit",
    label: "Jersey Knit",
    description: "Soft stretch knit for relaxed, close-to-body pieces.",
    material: { roughness: 0.9, sheen: 0.1, sheenRoughness: 0.95 },
    garments: ["shirt", "dress"],
  },
];

export function getFabricById(id: string | null): FabricPreset | null {
  if (!id) return null;
  return FABRIC_PRESETS.find((f) => f.id === id) ?? null;
}

export function fabricsForGarment(garment: string): FabricPreset[] {
  return FABRIC_PRESETS.filter((f) =>
    f.garments.includes(garment as GarmentType),
  );
}

// ---------------------------------------------------------------------------
// Style options (dynamic option tree keyed on garment type)
// ---------------------------------------------------------------------------

export interface StyleOption {
  value: string;
  label: string;
}

export interface StyleOptionGroup {
  id: string;
  label: string;
  options: readonly StyleOption[];
}

const FIT_GROUP: StyleOptionGroup = {
  id: "fit",
  label: "Fit",
  options: [
    { value: "slim", label: "Slim" },
    { value: "tailored", label: "Tailored" },
    { value: "relaxed", label: "Relaxed" },
    { value: "oversized", label: "Oversized" },
  ],
};

export const GARMENT_STYLE_OPTIONS: Record<
  GarmentType,
  readonly StyleOptionGroup[]
> = {
  shirt: [
    FIT_GROUP,
    {
      id: "collar",
      label: "Collar",
      options: [
        { value: "spread", label: "Spread" },
        { value: "point", label: "Point" },
        { value: "button-down", label: "Button-Down" },
        { value: "band", label: "Band" },
        { value: "camp", label: "Camp" },
      ],
    },
    {
      id: "cuff",
      label: "Cuffs",
      options: [
        { value: "barrel", label: "Barrel" },
        { value: "two-button", label: "Two-Button" },
        { value: "french", label: "French" },
        { value: "short-sleeve", label: "Short Sleeve" },
      ],
    },
    {
      id: "pocket",
      label: "Pockets",
      options: [
        { value: "none", label: "None" },
        { value: "single-chest", label: "Single Chest" },
        { value: "double-chest", label: "Double Chest" },
      ],
    },
  ],
  jacket: [
    FIT_GROUP,
    {
      id: "lapel",
      label: "Lapel",
      options: [
        { value: "notch", label: "Notch" },
        { value: "peak", label: "Peak" },
        { value: "shawl", label: "Shawl" },
        { value: "collarless", label: "Collarless" },
      ],
    },
    {
      id: "closure",
      label: "Closure",
      options: [
        { value: "two-button", label: "Two-Button" },
        { value: "three-button", label: "Three-Button" },
        { value: "double-breasted", label: "Double-Breasted" },
        { value: "zip", label: "Zip" },
      ],
    },
    {
      id: "lining",
      label: "Lining",
      options: [
        { value: "unlined", label: "Unlined" },
        { value: "half", label: "Half-Lined" },
        { value: "full", label: "Fully Lined" },
        { value: "contrast", label: "Contrast Lining" },
      ],
    },
    {
      id: "vents",
      label: "Vents",
      options: [
        { value: "none", label: "None" },
        { value: "single", label: "Single" },
        { value: "double", label: "Double" },
      ],
    },
  ],
  pants: [
    {
      id: "fit",
      label: "Leg Fit",
      options: [
        { value: "slim", label: "Slim" },
        { value: "straight", label: "Straight" },
        { value: "tapered", label: "Tapered" },
        { value: "wide", label: "Wide" },
      ],
    },
    {
      id: "rise_style",
      label: "Rise",
      options: [
        { value: "low", label: "Low" },
        { value: "mid", label: "Mid" },
        { value: "high", label: "High" },
      ],
    },
    {
      id: "pleats",
      label: "Front",
      options: [
        { value: "flat-front", label: "Flat Front" },
        { value: "single-pleat", label: "Single Pleat" },
        { value: "double-pleat", label: "Double Pleat" },
      ],
    },
    {
      id: "break",
      label: "Break",
      options: [
        { value: "none", label: "No Break" },
        { value: "quarter", label: "Quarter" },
        { value: "half", label: "Half" },
        { value: "full", label: "Full" },
      ],
    },
    {
      id: "hem",
      label: "Hem",
      options: [
        { value: "plain", label: "Plain" },
        { value: "cuffed", label: "Cuffed" },
      ],
    },
  ],
  dress: [
    {
      id: "silhouette",
      label: "Silhouette",
      options: [
        { value: "a-line", label: "A-Line" },
        { value: "sheath", label: "Sheath" },
        { value: "fit-and-flare", label: "Fit & Flare" },
        { value: "wrap", label: "Wrap" },
        { value: "slip", label: "Slip" },
      ],
    },
    {
      id: "neckline",
      label: "Neckline",
      options: [
        { value: "crew", label: "Crew" },
        { value: "v-neck", label: "V-Neck" },
        { value: "square", label: "Square" },
        { value: "boat", label: "Boat" },
        { value: "halter", label: "Halter" },
        { value: "off-shoulder", label: "Off-Shoulder" },
      ],
    },
    {
      id: "sleeve",
      label: "Sleeves",
      options: [
        { value: "sleeveless", label: "Sleeveless" },
        { value: "cap", label: "Cap" },
        { value: "short", label: "Short" },
        { value: "three-quarter", label: "Three-Quarter" },
        { value: "long", label: "Long" },
      ],
    },
    {
      id: "length",
      label: "Length",
      options: [
        { value: "mini", label: "Mini" },
        { value: "knee", label: "Knee" },
        { value: "midi", label: "Midi" },
        { value: "maxi", label: "Maxi" },
      ],
    },
    {
      id: "closure",
      label: "Closure",
      options: [
        { value: "back-zip", label: "Back Zip" },
        { value: "side-zip", label: "Side Zip" },
        { value: "buttons", label: "Buttons" },
        { value: "pullover", label: "Pullover" },
      ],
    },
  ],
};

export function styleGroupsForGarment(
  garment: string,
): readonly StyleOptionGroup[] {
  return GARMENT_STYLE_OPTIONS[garment as GarmentType] ?? [];
}

// ---------------------------------------------------------------------------
// Design selection (the shape stored on the form and sent to the server)
// ---------------------------------------------------------------------------

export interface CommissionDesign {
  colorHex: string | null;
  colorName: string | null;
  fabric: string | null;
  styleOptions: Record<string, string>;
}

export function getEmptyDesign(): CommissionDesign {
  return { colorHex: null, colorName: null, fabric: null, styleOptions: {} };
}

// Validates a design selection against the option tree for a garment.
// Returns human-readable problems; empty array means valid. Every design
// field is optional — this only rejects values that don't exist for the
// chosen garment.
export function validateDesign(
  design: CommissionDesign,
  garmentType: string,
): string[] {
  const problems: string[] = [];

  if (design.colorHex !== null && !HEX_COLOR_PATTERN.test(design.colorHex)) {
    problems.push("Color must be a hex value like #1f2a44");
  }

  if (design.fabric !== null) {
    const fabric = getFabricById(design.fabric);
    if (!fabric) {
      problems.push(`Unknown fabric "${design.fabric}"`);
    } else if (!fabric.garments.includes(garmentType as GarmentType)) {
      problems.push(
        `${fabric.label} is not offered for ${garmentType || "this garment"}`,
      );
    }
  }

  const groups = styleGroupsForGarment(garmentType);
  for (const [groupId, value] of Object.entries(design.styleOptions)) {
    const group = groups.find((g) => g.id === groupId);
    if (!group) {
      problems.push(`Unknown style option "${groupId}" for ${garmentType}`);
      continue;
    }
    if (!group.options.some((o) => o.value === value)) {
      problems.push(`"${value}" is not a valid ${group.label} choice`);
    }
  }

  return problems;
}

// ---------------------------------------------------------------------------
// Measurements
// ---------------------------------------------------------------------------

// Required measurements by garment type (shared by client validation and the
// tRPC input schema).
export const REQUIRED_MEASUREMENTS: Record<string, string[]> = {
  shirt: ["chest", "shoulders", "sleeve_length"],
  jacket: ["chest", "shoulders", "sleeve_length", "bicep"],
  pants: ["waist", "hips", "inseam", "length", "rise"],
  dress: ["chest", "waist", "hips", "length", "shoulders"],
};

export interface MeasurementBound {
  min: number;
  max: number;
  unit: "in" | "lbs" | "deg";
}

// Deliberately generous adult ranges — these catch typos and unit mix-ups
// (e.g. centimeters entered as inches), not unusual bodies.
export const MEASUREMENT_BOUNDS: Record<string, MeasurementBound> = {
  chest: { min: 20, max: 70, unit: "in" },
  waist: { min: 18, max: 70, unit: "in" },
  hips: { min: 20, max: 75, unit: "in" },
  length: { min: 10, max: 70, unit: "in" },
  inseam: { min: 15, max: 45, unit: "in" },
  shoulders: { min: 12, max: 30, unit: "in" },
  neck: { min: 10, max: 26, unit: "in" },
  sleeve_length: { min: 15, max: 42, unit: "in" },
  bicep: { min: 7, max: 30, unit: "in" },
  forearm: { min: 6, max: 25, unit: "in" },
  wrist: { min: 4, max: 14, unit: "in" },
  armhole_depth: { min: 5, max: 16, unit: "in" },
  back_width: { min: 10, max: 30, unit: "in" },
  front_chest_width: { min: 10, max: 30, unit: "in" },
  thigh: { min: 10, max: 40, unit: "in" },
  knee: { min: 8, max: 30, unit: "in" },
  calf: { min: 8, max: 30, unit: "in" },
  ankle: { min: 5, max: 20, unit: "in" },
  rise: { min: 6, max: 22, unit: "in" },
  outseam: { min: 20, max: 55, unit: "in" },
  height: { min: 36, max: 90, unit: "in" },
  weight: { min: 50, max: 500, unit: "lbs" },
  torso_length: { min: 10, max: 35, unit: "in" },
  shoulder_slope: { min: 0, max: 45, unit: "deg" },
};

export const UNIT_LABELS: Record<MeasurementBound["unit"], string> = {
  in: "inches",
  lbs: "pounds",
  deg: "degrees",
};

// Returns a warning string when a value is outside the plausible range,
// otherwise null. Null/absent values are always fine.
export function checkMeasurementPlausibility(
  field: string,
  value: number | null | undefined,
): string | null {
  if (value === null || value === undefined) return null;
  const bound = MEASUREMENT_BOUNDS[field];
  if (!bound) return null;
  if (value < bound.min || value > bound.max) {
    return `Expected ${bound.min}–${bound.max} ${UNIT_LABELS[bound.unit]} — double-check this one`;
  }
  return null;
}
