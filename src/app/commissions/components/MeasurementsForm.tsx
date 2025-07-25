// Complete measurements form component
import React from "react";
import Link from "next/link";
import { MeasurementSection } from "./MeasurementSection";
import { LoadMeasurementsButton } from "./LoadMeasurementsButton";
import { MEASUREMENT_GROUPS } from "../constants";
import type { CommissionFormData } from "../types";

interface MeasurementsFormProps {
  formData: CommissionFormData;
  errors: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLoadMeasurements: () => void;
  isLoadingMeasurements: boolean;
}

export const MeasurementsForm: React.FC<MeasurementsFormProps> = ({
  formData,
  errors,
  onChange,
  onLoadMeasurements,
  isLoadingMeasurements,
}) => {
  if (!formData.garmentType) {
    return null;
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <label className="block text-sm font-medium text-emerald-100">
          Measurements (inches)
        </label>
        <LoadMeasurementsButton
          onClick={onLoadMeasurements}
          isLoading={isLoadingMeasurements}
        />
      </div>

      {/* Upper Body Measurements - Show for shirts, jackets, dresses */}
      {["shirt", "jacket", "dress", "other"].includes(formData.garmentType) && (
        <MeasurementSection
          title="Upper Body"
          measurements={MEASUREMENT_GROUPS.upper}
          garmentType={formData.garmentType}
          formData={formData}
          errors={errors}
          onChange={onChange}
        />
      )}

      {/* Lower Body Measurements - Show for pants, skirts, dresses */}
      {["pants", "skirt", "dress", "other"].includes(formData.garmentType) && (
        <MeasurementSection
          title="Lower Body"
          measurements={MEASUREMENT_GROUPS.lower}
          garmentType={formData.garmentType}
          formData={formData}
          errors={errors}
          onChange={onChange}
        />
      )}

      {/* General Body Measurements - Always show */}
      <MeasurementSection
        title="General Information"
        measurements={MEASUREMENT_GROUPS.general}
        garmentType={formData.garmentType}
        formData={formData}
        errors={errors}
        onChange={onChange}
      />

      {/* Small notice about measurement loading */}
      <div className="mt-6 text-center text-xs text-emerald-300/60">
        <p>
          You can load your saved measurements from your profile using the
          &ldquo;Load from Profile&rdquo; button.
        </p>
        <p className="mt-1">
          Need to update your profile measurements?{" "}
          <Link
            href="/profile/measurements"
            className="text-emerald-400 hover:underline"
          >
            Go to Profile Measurements
          </Link>
        </p>
      </div>
    </div>
  );
};
