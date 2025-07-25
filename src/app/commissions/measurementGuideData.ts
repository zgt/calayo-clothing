// Measurement guide descriptions extracted from MeasurementGuide component
export const MEASUREMENT_GUIDE_ITEMS: Record<
  string,
  { title: string; description: string }
> = {
  // Basic measurements
  chest: {
    title: "Chest",
    description:
      "Measure around the fullest part of your chest, keeping the tape measure parallel to the floor.",
  },
  waist: {
    title: "Waist",
    description:
      "Measure around your natural waistline, which is the narrowest part of your torso.",
  },
  hips: {
    title: "Hips",
    description: "Measure around the fullest part of your hips and buttocks.",
  },
  shoulders: {
    title: "Shoulders",
    description:
      "Measure across your back from the edge of one shoulder to the edge of the other shoulder.",
  },
  length: {
    title: "Length",
    description:
      "For tops, measure from the highest point of your shoulder to the desired length down your torso. For jackets/coats, measure from the base of your collar to the desired length.",
  },
  inseam: {
    title: "Inseam",
    description:
      "Measure from the crotch to the bottom of the ankle along the inside of your leg.",
  },

  // Upper body measurements
  neck: {
    title: "Neck",
    description:
      "Measure around the base of your neck, where a collar would sit.",
  },
  sleeve_length: {
    title: "Sleeve Length",
    description:
      "Measure from the edge of your shoulder to your wrist with your arm slightly bent.",
  },
  bicep: {
    title: "Bicep",
    description:
      "Measure around the fullest part of your bicep with your arm relaxed at your side.",
  },
  forearm: {
    title: "Forearm",
    description:
      "Measure around the widest part of your forearm with your arm relaxed.",
  },
  wrist: {
    title: "Wrist",
    description: "Measure around your wrist bone.",
  },
  armhole_depth: {
    title: "Armhole Depth",
    description:
      "Measure from the top of your shoulder down to where the armhole should end under your arm.",
  },
  back_width: {
    title: "Back Width",
    description:
      "Measure across your back from armhole to armhole at the widest point of your shoulder blades.",
  },
  front_chest_width: {
    title: "Front Chest Width",
    description:
      "Measure across the front of your chest from armhole to armhole at the fullest part.",
  },

  // Lower body measurements
  thigh: {
    title: "Thigh",
    description: "Measure around the fullest part of your thigh.",
  },
  knee: {
    title: "Knee",
    description: "Measure around your knee at its widest point while standing.",
  },
  calf: {
    title: "Calf",
    description: "Measure around the widest part of your calf muscle.",
  },
  ankle: {
    title: "Ankle",
    description: "Measure around your ankle bone.",
  },
  rise: {
    title: "Rise",
    description:
      "Measure from the crotch seam to the top of the waistband while seated.",
  },
  outseam: {
    title: "Outseam",
    description:
      "Measure from the top of the waistband to the desired length along the outside of the leg.",
  },

  // Full body measurements
  height: {
    title: "Height",
    description:
      "Stand against a wall without shoes and measure from the floor to the top of your head.",
  },
  weight: {
    title: "Weight",
    description: "Your current weight in pounds, measured on a standard scale.",
  },

  // Formal measurements
  torso_length: {
    title: "Torso Length",
    description:
      "Measure from the base of your neck at the center back to your natural waistline.",
  },
  shoulder_slope: {
    title: "Shoulder Slope",
    description:
      "Measure the angle of your shoulder slope using a tailor's square or angle measuring tool.",
  },
  posture: {
    title: "Posture",
    description:
      "Describe your posture as 'Average', 'Erect', 'Stooped', or 'Forward Head'. For formal wear, this helps tailor the garment to your natural stance.",
  },
};

export const MEASUREMENT_TIPS = [
  "Use a fabric measuring tape for accuracy",
  "Wear light, fitted clothing when measuring",
  "Stand naturally with feet shoulder-width apart",
  "Keep the measuring tape snug but not tight",
  "For best results, have someone help you measure",
  "Take multiple measurements for crucial areas to ensure accuracy",
  "Always measure in a consistent state (e.g., after exhaling)",
];
