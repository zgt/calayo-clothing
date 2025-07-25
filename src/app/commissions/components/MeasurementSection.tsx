// Component for displaying a section of measurements (upper, lower, general)
import React from "react";
import { MeasurementInput } from "./MeasurementInput";
import { shouldShowMeasurement, isMeasurementRequired } from "../utils";
import type { MeasurementField, CommissionFormData, MeasurementKey } from "../types";

interface MeasurementSectionProps {
  title: string;
  measurements: MeasurementField[];
  garmentType: string;
  formData: CommissionFormData;
  errors: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const MeasurementSection: React.FC<MeasurementSectionProps> = ({
  title,
  measurements,
  garmentType,
  formData,
  errors,
  onChange,
}) => {
  const visibleMeasurements = measurements.filter(m => shouldShowMeasurement(m.id, garmentType));

  if (visibleMeasurements.length === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      <h3 className="text-emerald-100 text-sm font-medium mb-2">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {visibleMeasurements.map(measurement => (
          <MeasurementInput
            key={measurement.id}
            id={measurement.id}
            name={`measurements.${measurement.id}`}
            label={measurement.label}
            value={formData.measurements[measurement.id as MeasurementKey] ?? ""}
            onChange={onChange}
            error={errors[`measurements.${measurement.id}`]}
            required={isMeasurementRequired(measurement.id, garmentType)}
            type={measurement.id === "posture" ? "text" : "number"}
          />
        ))}
      </div>
    </div>
  );
};