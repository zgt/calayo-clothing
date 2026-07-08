"use client";

// Mobile commissions experience: a guided five-step flow with a slim sticky
// progress header and a collapsible live 3D preview. Replaces the old
// sticky-section single scroll.

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronDown, ChevronLeft, Pencil } from "lucide-react";
import { GarmentViewer } from "~/app/_components/3d/GarmentViewer";
import { GarmentSilhouette } from "~/app/_components/3d/GarmentSilhouette";
import { StepSlider } from "../StepSlider";
import { FormTextarea } from "../FormTextarea";
import { SubmitButton } from "../SubmitButton";
import { DesignPanel } from "../DesignPanel";
import { MobileMeasurementsStep } from "./MobileMeasurementsStep";
import { REQUIRED_MEASUREMENTS } from "../../constants";
import {
  DEFAULT_GARMENT_COLOR,
  MEASUREMENT_BOUNDS,
  BUDGET_OPTIONS,
  TIMELINE_OPTIONS,
  checkMeasurementPlausibility,
  getFabricById,
  styleGroupsForGarment,
  validateDesign,
} from "~/lib/commission-design";
import type { CommissionDesign } from "~/lib/commission-design";
import type { CommissionFormData, MeasurementKey } from "../../types";

const GARMENT_TILES = [
  { value: "shirt", label: "Shirt" },
  { value: "jacket", label: "Jacket" },
  { value: "pants", label: "Pants" },
  { value: "dress", label: "Dress" },
];

const UNIT_SUFFIX: Record<string, string> = {
  in: "in",
  lbs: "lbs",
  deg: "\u00b0",
};

const STEPS = [
  { id: "garment", title: "Choose your garment" },
  { id: "design", title: "Design it" },
  { id: "measurements", title: "Your measurements" },
  { id: "budget", title: "Budget & details" },
  { id: "review", title: "Review & submit" },
] as const;

type StepId = (typeof STEPS)[number]["id"];

// Per-step validation so Next can gate advancement. Mirrors the shared
// rules used by validateCommissionForm / the server schema.
function validateStep(
  stepId: StepId,
  formData: CommissionFormData,
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (stepId === "garment" && !formData.garmentType) {
    errors.garmentType = "Please select a garment type";
  }

  if (stepId === "design") {
    const problems = validateDesign(formData.design, formData.garmentType);
    if (problems.length > 0) errors.design = problems.join("; ");
  }

  if (stepId === "measurements") {
    for (const field of REQUIRED_MEASUREMENTS[formData.garmentType] ?? []) {
      if (!formData.measurements[field as MeasurementKey]) {
        errors[`measurements.${field}`] = "Required";
      }
    }
    for (const [field, value] of Object.entries(formData.measurements)) {
      if (typeof value !== "number") continue;
      const warning = checkMeasurementPlausibility(field, value);
      if (warning && !errors[`measurements.${field}`]) {
        errors[`measurements.${field}`] = warning;
      }
    }
  }

  if (stepId === "budget") {
    if (!formData.budget) errors.budget = "Please select a budget range";
    if (!formData.timeline) errors.timeline = "Please select a timeline";
    if (!formData.details) errors.details = "Please provide additional details";
  }

  return errors;
}

interface MobileCommissionFlowProps {
  formData: CommissionFormData;
  errors: Record<string, string>;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  onSelectChange: (value: string, field: keyof CommissionFormData) => void;
  onLoadMeasurements: () => void;
  isLoadingMeasurements: boolean;
  isSubmitting: boolean;
  onDesignChange: (design: Partial<CommissionDesign>) => void;
}

export function MobileCommissionFlow({
  formData,
  errors,
  onInputChange,
  onSelectChange,
  onLoadMeasurements,
  isLoadingMeasurements,
  isSubmitting,
  onDesignChange,
}: MobileCommissionFlowProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const [previewOpen, setPreviewOpen] = useState(false);
  const reducedMotion = useReducedMotion();

  const step = STEPS[stepIndex]!;
  // Parent errors (from submit-time validation) merged under local ones.
  const mergedErrors = { ...errors, ...stepErrors };

  const goToStep = (index: number) => {
    const clamped = Math.max(0, Math.min(STEPS.length - 1, index));
    setDirection(clamped > stepIndex ? 1 : -1);
    setStepErrors({});
    setStepIndex(clamped);
    // The 3D payoff moment is the design step; open the preview there.
    setPreviewOpen(STEPS[clamped]!.id === "design");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNext = () => {
    const problems = validateStep(step.id, formData);
    setStepErrors(problems);
    if (Object.keys(problems).length > 0) return;
    goToStep(stepIndex + 1);
  };

  const handleGarmentSelect = (value: string) => {
    onSelectChange(value, "garmentType");
    setStepErrors({});
  };

  // Editing a field clears its step error immediately so live feedback
  // (like plausibility warnings) isn't masked by a stale "Required".
  const clearFieldError = (name: string) => {
    setStepErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    clearFieldError(e.target.name);
    onInputChange(e);
  };

  const handleSelectField = (
    value: string,
    field: keyof CommissionFormData,
  ) => {
    clearFieldError(field);
    onSelectChange(value, field);
  };

  const fabric = getFabricById(formData.design.fabric);
  const displayColor = formData.design.colorHex ?? DEFAULT_GARMENT_COLOR;

  const variants = {
    enter: (dir: number) => ({
      x: reducedMotion ? 0 : dir * 60,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({
      x: reducedMotion ? 0 : dir * -60,
      opacity: 0,
    }),
  };

  const filledMeasurements = Object.entries(formData.measurements).filter(
    ([, value]) => value != null && value !== "",
  );

  return (
    <div className="min-h-screen px-4 pt-4 pb-40">
      {/* Sticky header: progress + collapsible live preview */}
      <div className="sticky top-2 z-30 mb-4">
        <div className="overflow-hidden rounded-2xl border border-emerald-700/20 bg-emerald-950/80 shadow-2xl backdrop-blur-md">
          {/* pr clears the site's floating profile chrome (fixed top-right) */}
          <div className="py-3 pr-28 pl-4">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-semibold text-white">
                {step.title}
              </span>
              <span className="text-xs whitespace-nowrap text-emerald-200/60">
                {stepIndex + 1} of {STEPS.length}
              </span>
            </div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-emerald-900/60">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                animate={{
                  width: `${((stepIndex + 1) / STEPS.length) * 100}%`,
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {formData.garmentType && (
            <>
              <button
                type="button"
                onClick={() => setPreviewOpen((s) => !s)}
                aria-expanded={previewOpen}
                className="flex w-full items-center gap-3 border-t border-emerald-800/40 py-2.5 pr-28 pl-4 text-left"
              >
                <GarmentSilhouette
                  garmentType={formData.garmentType}
                  color={displayColor}
                  className="h-7 w-7 flex-shrink-0"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-white capitalize">
                    {formData.garmentType}
                    {formData.design.colorName
                      ? ` · ${formData.design.colorName}`
                      : ""}
                  </span>
                  {fabric && (
                    <span className="block truncate text-xs text-emerald-200/60">
                      {fabric.label}
                    </span>
                  )}
                </span>
                {formData.design.colorHex && (
                  <span
                    className="h-5 w-5 flex-shrink-0 rounded-full border border-white/30"
                    style={{ backgroundColor: displayColor }}
                    aria-hidden
                  />
                )}
                <ChevronDown
                  className={`h-4 w-4 flex-shrink-0 text-emerald-300 transition-transform ${
                    previewOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence initial={false}>
                {previewOpen && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 288 }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <GarmentViewer
                      className="h-72 w-full rounded-none border-0"
                      garmentType={formData.garmentType}
                      colorHex={formData.design.colorHex}
                      fabric={formData.design.fabric}
                      disableInteraction
                      autoRotate
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait" custom={direction} initial={false}>
        <motion.div
          key={step.id}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <div className="rounded-2xl border border-emerald-700/15 bg-gradient-to-br from-emerald-900/15 to-emerald-950/25 p-5 shadow-2xl backdrop-blur-sm">
            {step.id === "garment" && (
              <div>
                <p className="mb-4 text-sm text-emerald-200/70">
                  What should we make for you?
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {GARMENT_TILES.map((tile) => {
                    const isSelected = formData.garmentType === tile.value;
                    return (
                      <button
                        key={tile.value}
                        type="button"
                        onClick={() => handleGarmentSelect(tile.value)}
                        aria-pressed={isSelected}
                        className={`flex flex-col items-center gap-2 rounded-2xl border p-4 transition-colors ${
                          isSelected
                            ? "border-emerald-400 bg-emerald-500/20"
                            : "border-emerald-700/30 bg-emerald-950/40 active:bg-emerald-900/40"
                        }`}
                      >
                        <GarmentSilhouette
                          garmentType={tile.value}
                          color={isSelected ? "#10b981" : "#3f5c50"}
                          className="h-14 w-14"
                        />
                        <span
                          className={`text-sm font-medium ${
                            isSelected ? "text-white" : "text-emerald-200/80"
                          }`}
                        >
                          {tile.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {mergedErrors.garmentType && (
                  <p className="mt-3 text-xs text-red-400">
                    {mergedErrors.garmentType}
                  </p>
                )}
              </div>
            )}

            {step.id === "design" && (
              <DesignPanel
                garmentType={formData.garmentType}
                design={formData.design}
                onDesignChange={onDesignChange}
                error={mergedErrors.design}
              />
            )}

            {step.id === "measurements" && (
              <MobileMeasurementsStep
                formData={formData}
                errors={mergedErrors}
                onInputChange={handleFieldChange}
                onLoadMeasurements={onLoadMeasurements}
                isLoadingMeasurements={isLoadingMeasurements}
              />
            )}

            {step.id === "budget" && (
              <div className="space-y-6">
                <StepSlider
                  id="budget"
                  name="budget"
                  label="Budget Range"
                  value={formData.budget}
                  onChange={(value) => handleSelectField(value, "budget")}
                  options={BUDGET_OPTIONS}
                  placeholder="Set your budget"
                  error={mergedErrors.budget}
                  required
                />
                <StepSlider
                  id="timeline"
                  name="timeline"
                  label="Timeline"
                  value={formData.timeline}
                  onChange={(value) => handleSelectField(value, "timeline")}
                  options={TIMELINE_OPTIONS}
                  placeholder="Set your timeline"
                  error={mergedErrors.timeline}
                  required
                />
                <FormTextarea
                  id="details"
                  name="details"
                  label="Additional Details"
                  value={formData.details}
                  onChange={handleFieldChange}
                  placeholder="Describe your vision, inspiration, or special requirements..."
                  error={mergedErrors.details}
                  rows={5}
                  required
                />
              </div>
            )}

            {step.id === "review" && (
              <ReviewStep
                formData={formData}
                filledMeasurements={filledMeasurements}
                onEdit={goToStep}
              />
            )}
          </div>

          {/* Step controls */}
          <div className="mt-5 flex items-center gap-3">
            {stepIndex > 0 && (
              <button
                type="button"
                onClick={() => goToStep(stepIndex - 1)}
                className="flex items-center gap-1 rounded-xl border border-emerald-700/40 px-5 py-3.5 text-sm font-medium text-emerald-200 active:bg-emerald-900/40"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>
            )}
            {step.id !== "review" ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/40 active:from-emerald-700 active:to-emerald-600"
              >
                {step.id === "garment" && !formData.garmentType
                  ? "Choose a garment to continue"
                  : "Continue"}
              </button>
            ) : (
              <div className="flex-1">
                <SubmitButton isLoading={isSubmitting} />
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function ReviewRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <dt className="text-sm text-emerald-200/70 first-letter:capitalize">
        {label}
      </dt>
      <dd className="text-right text-sm font-medium text-white">{children}</dd>
    </div>
  );
}

function ReviewSection({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-emerald-700/20 pb-4 last:border-0 last:pb-0">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-wide text-emerald-300/90 uppercase">
          {title}
        </h3>
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-emerald-300 active:bg-emerald-900/40"
        >
          <Pencil className="h-3 w-3" />
          Edit
        </button>
      </div>
      <dl className="mt-1 divide-y divide-emerald-800/20">{children}</dl>
    </div>
  );
}

function ReviewStep({
  formData,
  filledMeasurements,
  onEdit,
}: {
  formData: CommissionFormData;
  filledMeasurements: [string, number | string | null][];
  onEdit: (step: number) => void;
}) {
  const fabric = getFabricById(formData.design.fabric);
  const styleGroups = styleGroupsForGarment(formData.garmentType);

  return (
    <div className="space-y-4">
      <ReviewSection title="Garment" onEdit={() => onEdit(0)}>
        <ReviewRow label="Type">
          <span className="capitalize">{formData.garmentType}</span>
        </ReviewRow>
      </ReviewSection>

      <ReviewSection title="Design" onEdit={() => onEdit(1)}>
        {formData.design.colorHex && (
          <ReviewRow label="Color">
            <span className="flex items-center justify-end gap-2">
              <span
                className="h-4 w-4 rounded-full border border-white/30"
                style={{ backgroundColor: formData.design.colorHex }}
                aria-hidden
              />
              {formData.design.colorName ?? formData.design.colorHex}
            </span>
          </ReviewRow>
        )}
        {fabric && <ReviewRow label="Fabric">{fabric.label}</ReviewRow>}
        {Object.entries(formData.design.styleOptions).map(
          ([groupId, value]) => {
            const group = styleGroups.find((g) => g.id === groupId);
            const option = group?.options.find((o) => o.value === value);
            if (!group || !option) return null;
            return (
              <ReviewRow key={groupId} label={group.label}>
                {option.label}
              </ReviewRow>
            );
          },
        )}
        {!formData.design.colorHex &&
          !fabric &&
          Object.keys(formData.design.styleOptions).length === 0 && (
            <p className="py-2 text-sm text-emerald-200/50">
              No design preferences set
            </p>
          )}
      </ReviewSection>

      <ReviewSection title="Measurements" onEdit={() => onEdit(2)}>
        {filledMeasurements.length > 0 ? (
          filledMeasurements.map(([id, value]) => {
            const unit =
              typeof value === "number"
                ? ` ${UNIT_SUFFIX[MEASUREMENT_BOUNDS[id]?.unit ?? "in"]}`
                : "";
            return (
              <ReviewRow key={id} label={id.replace(/_/g, " ")}>
                {`${value}${unit}`}
              </ReviewRow>
            );
          })
        ) : (
          <p className="py-2 text-sm text-emerald-200/50">
            No measurements provided
          </p>
        )}
      </ReviewSection>

      <ReviewSection title="Budget & Details" onEdit={() => onEdit(3)}>
        <ReviewRow label="Budget">
          {BUDGET_OPTIONS.find((b) => b.value === formData.budget)?.label ??
            "—"}
        </ReviewRow>
        <ReviewRow label="Timeline">
          {TIMELINE_OPTIONS.find((t) => t.value === formData.timeline)?.label ??
            "—"}
        </ReviewRow>
        {formData.details && (
          <div className="py-2.5">
            <dt className="mb-1 text-sm text-emerald-200/70">Details</dt>
            <dd className="text-sm break-words text-white">
              {formData.details}
            </dd>
          </div>
        )}
      </ReviewSection>
    </div>
  );
}
