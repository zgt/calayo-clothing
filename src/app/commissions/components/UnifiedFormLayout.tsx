"use client";

import { forwardRef } from "react";
import { FormSelect } from "./FormSelect";
import { StepSlider } from "./StepSlider";
import { FormTextarea } from "./FormTextarea";
import { MeasurementNavigator } from "./MeasurementNavigator";
import { MeasurementGuideDisplay } from "./MeasurementGuideDisplay";
import { SubmitButton } from "./SubmitButton";
import {
  ColorSwatchPicker,
  FabricPicker,
  StyleOptionsPicker,
} from "./DesignPanel";
import { MobileCommissionFlow } from "./mobile/MobileCommissionFlow";
import {
  styleGroupsForGarment,
  BUDGET_OPTIONS,
  TIMELINE_OPTIONS,
} from "~/lib/commission-design";
import { GarmentViewer } from "~/app/_components/3d/GarmentViewer";
import { useMobile } from "~/context/mobile-provider";
import type { CommissionFormData, MeasurementKey } from "../types";
import type { CommissionDesign } from "~/lib/commission-design";

interface UnifiedFormLayoutProps {
  formData: CommissionFormData;
  errors: Record<string, string>;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  onSelectChange: (value: string, field: keyof CommissionFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onLoadMeasurements: () => void;
  isLoadingMeasurements: boolean;
  isSubmitting: boolean;
  currentMeasurement: MeasurementKey | null;
  onMeasurementChange: (measurement: MeasurementKey | null) => void;
  onDesignChange: (design: Partial<CommissionDesign>) => void;
  onExpand: () => void;
}

const BASE_GARMENT_OPTIONS = [
  { value: "shirt", label: "Shirt" },
  { value: "jacket", label: "Jacket" },
  { value: "pants", label: "Pants" },
  { value: "dress", label: "Dress" },
];

export const UnifiedFormLayout = forwardRef<
  HTMLDivElement,
  UnifiedFormLayoutProps
>(
  (
    {
      formData,
      errors,
      onInputChange,
      onSelectChange,
      onSubmit,
      onLoadMeasurements,
      isLoadingMeasurements,
      isSubmitting,
      currentMeasurement,
      onMeasurementChange,
      onDesignChange,
      onExpand,
    },
    ref,
  ) => {
    // The GSAP three-column flow needs the full lg breakpoint; everything
    // narrower gets the guided stepper.
    const { isDesktop } = useMobile();
    const isMobile = !isDesktop;

    const handleGarmentTypeChange = (value: string) => {
      onSelectChange(value, "garmentType");
      if (value && !isMobile) {
        onExpand();
      }
    };

    if (isMobile) {
      return (
        <div ref={ref}>
          <form onSubmit={onSubmit}>
            <MobileCommissionFlow
              formData={formData}
              errors={errors}
              onInputChange={onInputChange}
              onSelectChange={onSelectChange}
              onLoadMeasurements={onLoadMeasurements}
              isLoadingMeasurements={isLoadingMeasurements}
              isSubmitting={isSubmitting}
              onDesignChange={onDesignChange}
            />
          </form>
        </div>
      );
    }

    // Desktop layout (unchanged)
    return (
      <div ref={ref} className="min-h-screen p-4">
        <div className="mx-auto max-w-6xl">
          {/* Form wrapper for all elements */}
          <form onSubmit={onSubmit} className="relative">
            {/* Initial container for centered position */}

            {/* Grid layout for expanded state - hidden initially */}
            <div
              id="expanded-grid"
              className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3"
            >
              {/* Left Column - Commission Request + Additional Details */}
              <div
                id="column-1"
                className="grid-column-inline-grid content-start space-y-6 opacity-0"
              >
                {/* Target position for commission request card after flip */}
                <div
                  id="main-form-card"
                  data-flip-id="commission-request-card"
                  className="w-full max-w-md"
                >
                  <div
                    id="main-card-gradient"
                    className="rounded-2xl border border-emerald-700/10 bg-gradient-to-br from-emerald-900/20 to-emerald-950/30 p-8 shadow-2xl backdrop-blur-xs"
                  >
                    <div id="card-header" className="mb-8 text-center">
                      <h2 className="mb-2 text-3xl font-bold text-white">
                        Clothing Commission Request
                      </h2>
                      <p id="card-subtitle" className="text-emerald-200/70">
                        Tell us about your dream garment
                      </p>
                    </div>

                    <div className="space-y-6">
                      <FormSelect
                        id="garmentType"
                        name="garmentType"
                        label="Garment Type"
                        value={formData.garmentType}
                        onChange={handleGarmentTypeChange}
                        options={BASE_GARMENT_OPTIONS}
                        placeholder="Select garment type"
                        error={errors.garmentType}
                        required
                      />

                      {/* Budget and Timeline - hidden initially, shown after expansion */}
                      <div id="budget-timeline-target"></div>

                      {/* Garment construction options join the request card
                          once a garment is chosen */}
                      {formData.garmentType && (
                        <div id="details-construction-section">
                          {styleGroupsForGarment(formData.garmentType).length >
                          0 ? (
                            <div className="border-t border-emerald-700/20 pt-6">
                              <h3 className="mb-4 text-lg font-semibold text-white">
                                Details &amp; Construction
                              </h3>
                              <StyleOptionsPicker
                                garmentType={formData.garmentType}
                                design={formData.design}
                                onDesignChange={onDesignChange}
                              />
                            </div>
                          ) : (
                            <div className="border-t border-emerald-700/20 pt-6">
                              <p className="text-sm text-emerald-200/60">
                                Describe the construction you have in mind
                                under Additional Details — we&apos;ll design
                                it together.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Center Column - Garment Image Placeholder */}
              <div className="grid-column-inline-grid">
                <div id="column-2" className="space-y-6">
                  <div id="commission-request-target" className="">
                    <div
                      id="budget-timeline-section"
                      className="space-y-6 opacity-0"
                    >
                      <StepSlider
                        id="budget"
                        name="budget"
                        label="Budget Range"
                        value={formData.budget}
                        onChange={(value) => onSelectChange(value, "budget")}
                        options={BUDGET_OPTIONS}
                        placeholder="Set your budget"
                        error={errors.budget}
                        required
                      />

                      <StepSlider
                        id="timeline"
                        name="timeline"
                        label="Timeline"
                        value={formData.timeline}
                        onChange={(value) => onSelectChange(value, "timeline")}
                        options={TIMELINE_OPTIONS}
                        placeholder="Set your timeline"
                        error={errors.timeline}
                        required
                      />
                    </div>
                  </div>

                  <div
                    id="garment-preview-card"
                    className="aspect-[3/4] w-full max-w-sm opacity-0"
                  >
                    <GarmentViewer
                      className="h-full w-full"
                      garmentType={formData.garmentType}
                      colorHex={formData.design.colorHex}
                      fabric={formData.design.fabric}
                    />
                  </div>

                  <div
                    id="design-card"
                    className="w-full max-w-sm rounded-2xl border border-emerald-700/10 bg-gradient-to-br from-emerald-900/20 to-emerald-950/30 p-6 opacity-0 shadow-2xl backdrop-blur-xs"
                  >
                    <div className="space-y-5">
                      <ColorSwatchPicker
                        design={formData.design}
                        onDesignChange={onDesignChange}
                      />
                      <FabricPicker
                        garmentType={formData.garmentType}
                        design={formData.design}
                        onDesignChange={onDesignChange}
                      />
                      {errors.design && (
                        <p className="text-xs text-red-400">{errors.design}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Measurement Guide and Measurements */}
              <div
                id="column-3"
                className="grid-column-inline-grid min-w-0 content-start space-y-6 opacity-0"
              >
                <div
                  id="measurement-guide-card"
                  className="opacity-0"
                  style={{ height: "16rem" }}
                >
                  <MeasurementGuideDisplay
                    currentMeasurement={currentMeasurement}
                  />
                </div>
                <div
                  id="measurement-navigator-card"
                  className="rounded-2xl border border-emerald-700/10 bg-gradient-to-br from-emerald-900/20 to-emerald-950/30 p-6 opacity-0 shadow-2xl backdrop-blur-xs"
                >
                  <MeasurementNavigator
                    formData={formData}
                    errors={errors}
                    onChange={onInputChange}
                    onLoadMeasurements={onLoadMeasurements}
                    isLoadingMeasurements={isLoadingMeasurements}
                    onMeasurementChange={onMeasurementChange}
                  />
                </div>
                <div
                  id="additional-details-card"
                  className="rounded-2xl border border-emerald-700/10 bg-gradient-to-br from-emerald-900/20 to-emerald-950/30 p-6 opacity-0 shadow-2xl backdrop-blur-xs"
                >
                  <FormTextarea
                    id="details"
                    name="details"
                    label="Additional Details"
                    value={formData.details}
                    onChange={onInputChange}
                    placeholder="Tell us more about your vision..."
                    error={errors.details}
                    rows={4}
                    required
                  />
                </div>
                <div id="submit-button-container" className="opacity-0">
                  <SubmitButton isLoading={isSubmitting} />
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  },
);

UnifiedFormLayout.displayName = "UnifiedFormLayout";
