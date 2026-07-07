"use client";

// Mobile measurements step: the garment's required measurements as a plain
// list of inputs, with every other relevant field behind an optional
// disclosure grouped by body area. Guidance is tap-to-reveal (no hover).

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Info } from "lucide-react";
import { LoadMeasurementsButton } from "../LoadMeasurementsButton";
import { MEASUREMENT_GROUPS, REQUIRED_MEASUREMENTS } from "../../constants";
import { shouldShowMeasurement } from "../../utils";
import {
  MEASUREMENT_BOUNDS,
  checkMeasurementPlausibility,
} from "~/lib/commission-design";
import { MEASUREMENT_GUIDE_ITEMS } from "../../measurementGuideData";
import type { CommissionFormData, MeasurementKey } from "../../types";

const UNIT_SUFFIX: Record<string, string> = {
  in: "in",
  lbs: "lbs",
  deg: "°",
};

interface MeasurementFieldProps {
  id: string;
  label: string;
  value: number | string | null;
  error?: string;
  required: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function MeasurementField({
  id,
  label,
  value,
  error,
  required,
  onChange,
}: MeasurementFieldProps) {
  const [showGuide, setShowGuide] = useState(false);
  const guide = MEASUREMENT_GUIDE_ITEMS[id as MeasurementKey];
  const isPosture = id === "posture";
  const unit = UNIT_SUFFIX[MEASUREMENT_BOUNDS[id]?.unit ?? "in"];
  const warning =
    typeof value === "number" ? checkMeasurementPlausibility(id, value) : null;

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label
          htmlFor={`measurements.${id}`}
          className="text-sm font-medium text-emerald-100"
        >
          {label}
          {required && <span className="ml-1 text-emerald-400">*</span>}
        </label>
        {guide && (
          <button
            type="button"
            onClick={() => setShowGuide((s) => !s)}
            aria-expanded={showGuide}
            aria-label={`How to measure ${label}`}
            className="flex h-8 w-8 items-center justify-center rounded-full text-emerald-300/70 transition-colors hover:bg-emerald-800/30 hover:text-emerald-200"
          >
            <Info className="h-4 w-4" />
          </button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {showGuide && guide && (
          <motion.p
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-2 overflow-hidden text-xs leading-relaxed text-emerald-200/70"
          >
            {guide.description}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="relative">
        {isPosture ? (
          <input
            type="text"
            id={`measurements.${id}`}
            name={`measurements.${id}`}
            value={(value as string) ?? ""}
            onChange={onChange}
            placeholder="e.g., straight, slightly forward"
            className={`w-full rounded-xl border bg-emerald-950/50 px-4 py-3 text-white placeholder-emerald-400/40 focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
              error ? "border-red-500" : "border-emerald-700/30"
            }`}
          />
        ) : (
          <>
            <input
              type="number"
              id={`measurements.${id}`}
              name={`measurements.${id}`}
              value={(value as number) ?? ""}
              onChange={onChange}
              placeholder="0.0"
              step="0.1"
              min="0"
              inputMode="decimal"
              className={`w-full rounded-xl border bg-emerald-950/50 py-3 pr-12 pl-4 text-white placeholder-emerald-400/40 focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                error ? "border-red-500" : "border-emerald-700/30"
              }`}
            />
            <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-emerald-400/60">
              {unit}
            </span>
          </>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
      {!error && warning && (
        <p className="mt-1.5 text-xs text-amber-400">{warning}</p>
      )}
    </div>
  );
}

interface MobileMeasurementsStepProps {
  formData: CommissionFormData;
  errors: Record<string, string>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLoadMeasurements: () => void;
  isLoadingMeasurements: boolean;
}

export function MobileMeasurementsStep({
  formData,
  errors,
  onInputChange,
  onLoadMeasurements,
  isLoadingMeasurements,
}: MobileMeasurementsStepProps) {
  const [showOptional, setShowOptional] = useState(false);
  const requiredIds = REQUIRED_MEASUREMENTS[formData.garmentType] ?? [];

  const groups = [
    { label: "Upper Body", fields: MEASUREMENT_GROUPS.upper },
    { label: "Lower Body", fields: MEASUREMENT_GROUPS.lower },
    { label: "General", fields: MEASUREMENT_GROUPS.general },
  ]
    .map((group) => ({
      ...group,
      fields: group.fields.filter(
        (f) =>
          shouldShowMeasurement(f.id, formData.garmentType) &&
          !requiredIds.includes(f.id),
      ),
    }))
    .filter((group) => group.fields.length > 0);

  const allFields = [
    ...MEASUREMENT_GROUPS.upper,
    ...MEASUREMENT_GROUPS.lower,
    ...MEASUREMENT_GROUPS.general,
  ];
  const requiredFields = requiredIds
    .map((id) => allFields.find((f) => f.id === id))
    .filter((f): f is { id: string; label: string } => Boolean(f));

  const optionalFilledCount = groups
    .flatMap((g) => g.fields)
    .filter(
      (f) => formData.measurements[f.id as MeasurementKey] != null,
    ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-emerald-200/70">
          {requiredFields.length > 0
            ? `${requiredFields.length} measurements needed for your ${formData.garmentType}`
            : "No specific measurements required — add any that help"}
        </p>
        <LoadMeasurementsButton
          onClick={onLoadMeasurements}
          isLoading={isLoadingMeasurements}
        />
      </div>

      {requiredFields.length > 0 && (
        <div className="space-y-5">
          {requiredFields.map((field) => (
            <MeasurementField
              key={field.id}
              id={field.id}
              label={field.label}
              value={formData.measurements[field.id as MeasurementKey]}
              error={errors[`measurements.${field.id}`]}
              required
              onChange={onInputChange}
            />
          ))}
        </div>
      )}

      {groups.length > 0 && (
        <div className="border-t border-emerald-700/20 pt-4">
          <button
            type="button"
            onClick={() => setShowOptional((s) => !s)}
            aria-expanded={showOptional}
            className="flex w-full items-center justify-between rounded-xl px-1 py-2 text-left"
          >
            <span className="text-sm font-medium text-emerald-100">
              More measurements
              <span className="ml-2 text-xs font-normal text-emerald-200/60">
                {optionalFilledCount > 0
                  ? `${optionalFilledCount} added`
                  : "optional — better fit"}
              </span>
            </span>
            <ChevronDown
              className={`h-5 w-5 text-emerald-300 transition-transform ${
                showOptional ? "rotate-180" : ""
              }`}
            />
          </button>

          <AnimatePresence initial={false}>
            {showOptional && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="space-y-6 pt-4">
                  {groups.map((group) => (
                    <div key={group.label}>
                      <h4 className="mb-3 text-xs font-semibold tracking-wide text-emerald-300/80 uppercase">
                        {group.label}
                      </h4>
                      <div className="space-y-5">
                        {group.fields.map((field) => (
                          <MeasurementField
                            key={field.id}
                            id={field.id}
                            label={field.label}
                            value={
                              formData.measurements[
                                field.id as MeasurementKey
                              ]
                            }
                            error={errors[`measurements.${field.id}`]}
                            required={false}
                            onChange={onInputChange}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
