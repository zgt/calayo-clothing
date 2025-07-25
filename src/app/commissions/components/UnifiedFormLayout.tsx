"use client";

import { forwardRef, useState, useEffect } from "react";
import { FormSelect } from "./FormSelect";
import { FormTextarea } from "./FormTextarea";
import { MeasurementNavigator } from "./MeasurementNavigator";
import { MeasurementGuideDisplay } from "./MeasurementGuideDisplay";
import { SubmitButton } from "./SubmitButton";
import { GarmentViewer } from "~/app/_components/3d/GarmentViewer";
import StickyTabs from "~/app/_components/ui/sticky-section-tabs";
import type { CommissionFormData, MeasurementKey } from "../types";

interface UnifiedFormLayoutProps {
  formData: CommissionFormData;
  errors: Record<string, string>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (value: string, field: keyof CommissionFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onLoadMeasurements: () => void;
  isLoadingMeasurements: boolean;
  isSubmitting: boolean;
  currentMeasurement: MeasurementKey | null;
  onMeasurementChange: (measurement: MeasurementKey | null) => void;
  onExpand: () => void;
  onMobileGarmentSelect: () => void;
}


const budgetOptions = [
  { value: "100-300", label: "$100 - $300" },
  { value: "300-500", label: "$300 - $500" },
  { value: "500-1000", label: "$500 - $1000" },
  { value: "1000+", label: "$1000+" },
];

const timelineOptions = [
  { value: "1-2weeks", label: "1-2 weeks" },
  { value: "3-4weeks", label: "3-4 weeks" },
  { value: "1-2months", label: "1-2 months" },
  { value: "flexible", label: "Flexible" },
];

const garmentOptions = [
  { value: "shirt", label: "Shirt" },
  { value: "jacket", label: "Jacket" },
  { value: "pants", label: "Pants" },
  { value: "dress", label: "Dress" },
  { value: "skirt", label: "Skirt" },
  { value: "other", label: "Other" },
];

export const UnifiedFormLayout = forwardRef<HTMLDivElement, UnifiedFormLayoutProps>(
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
      onExpand,
      onMobileGarmentSelect,
    },
    ref
  ) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
      const checkIsMobile = () => {
        setIsMobile(window.innerWidth < 1024);
      };
      
      checkIsMobile();
      window.addEventListener('resize', checkIsMobile);
      return () => window.removeEventListener('resize', checkIsMobile);
    }, []);

    const handleGarmentTypeChange = (value: string) => {
      onSelectChange(value, "garmentType");
      if (value && !isMobile) {
        onExpand();
      }
      if(value && isMobile){
        onMobileGarmentSelect();
      }
    };

    if (isMobile) {
      return (
        <div ref={ref} className="min-h-screen">
          <div className="mx-auto">
            {/* Fixed 3D Preview at top */}
            {formData.garmentType && (
              <div className="sticky top-0 z-30 h-48 w-full" style={{ backgroundColor: "black" }}>
                <GarmentViewer 
                  className="w-full h-full" 
                  garmentType={formData.garmentType} 
                  disableInteraction={true}
                />
              </div>
            )}

            {/* Sticky Tabs Form */}
            <form onSubmit={onSubmit}>
              <StickyTabs
                mainNavHeight={formData.garmentType ? "12rem" : "38rem"}
                rootClassName="bg-transparent"
                navSpacerClassName="bg-transparent"
                sectionClassName="bg-transparent"
              >
                <StickyTabs.Item title="Garment Type" id="garment-type">
                  <div className="bg-gradient-to-br from-emerald-900/10 to-emerald-950/20 backdrop-blur-md  shadow-2xl p-6 border border-emerald-700/30">
                    <FormSelect
                      id="garmentType"
                      name="garmentType"
                      label="Garment Type"
                      value={formData.garmentType}
                      onChange={handleGarmentTypeChange}
                      options={garmentOptions}
                      placeholder="Select garment type"
                      error={errors.garmentType}
                      required
                    />
                  </div>
                </StickyTabs.Item>

                <StickyTabs.Item title="Budget & Timeline" id="budget-timeline">
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-emerald-900/10 to-emerald-950/20 backdrop-blur-md shadow-2xl p-6 border border-emerald-700/30">
                      <div className="space-y-6">
                        <FormSelect
                          id="budget"
                          name="budget"
                          label="Budget Range"
                          value={formData.budget}
                          onChange={(value) => onSelectChange(value, "budget")}
                          options={budgetOptions}
                          placeholder="Select budget range"
                          error={errors.budget}
                          required
                        />

                        <FormSelect
                          id="timeline"
                          name="timeline"
                          label="Timeline"
                          value={formData.timeline}
                          onChange={(value) => onSelectChange(value, "timeline")}
                          options={timelineOptions}
                          placeholder="Select timeline"
                          error={errors.timeline}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </StickyTabs.Item>

                <StickyTabs.Item title="Additional Details" id="details">
                  <div className="bg-gradient-to-br from-emerald-900/10 to-emerald-950/20 backdrop-blur-md  shadow-2xl p-6 border border-emerald-700/30">
                    <FormTextarea
                      id="details"
                      name="details"
                      label="Additional Details"
                      value={formData.details}
                      onChange={onInputChange}
                      placeholder="Describe your vision, preferred colors, style, fit, or any special requirements..."
                      error={errors.details}
                      rows={6}
                      required
                    />
                  </div>
                </StickyTabs.Item>

                <StickyTabs.Item title="Measurements" id="measurements">
                  <div className="">
                  <MeasurementGuideDisplay currentMeasurement={currentMeasurement} />
                    <div className="bg-gradient-to-br from-emerald-900/10 to-emerald-950/20 backdrop-blur-md  shadow-2xl p-6 border border-emerald-700/30">
                      <MeasurementNavigator
                        formData={formData}
                        errors={errors}
                        onChange={onInputChange}
                        onLoadMeasurements={onLoadMeasurements}
                        isLoadingMeasurements={isLoadingMeasurements}
                        onMeasurementChange={onMeasurementChange}
                      />
                    </div>
                    
                    
                  </div>
                </StickyTabs.Item>

                <StickyTabs.Item title="Review & Submit" id="review">
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-emerald-900/10 to-emerald-950/20 backdrop-blur-md  shadow-2xl p-6 border border-emerald-700/30">
                      <div className="space-y-4 mb-8">
                        <div className="flex justify-between py-3 border-b border-emerald-700/20">
                          <span className="text-emerald-200">Garment Type:</span>
                          <span className="text-white font-medium">{formData.garmentType}</span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-emerald-700/20">
                          <span className="text-emerald-200">Budget:</span>
                          <span className="text-white font-medium">{budgetOptions.find(b => b.value === formData.budget)?.label}</span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-emerald-700/20">
                          <span className="text-emerald-200">Timeline:</span>
                          <span className="text-white font-medium">{timelineOptions.find(t => t.value === formData.timeline)?.label}</span>
                        </div>
                        <div className="py-3">
                          <span className="text-emerald-200 block mb-2">Details:</span>
                          <p className="text-white text-sm">{formData.details}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pb-8">
                      <SubmitButton isLoading={isSubmitting} />
                    </div>
                  </div>
                </StickyTabs.Item>
              </StickyTabs>
            </form>
          </div>
        </div>
      );
    }

    // Desktop layout (unchanged)
    return (
      <div ref={ref} className="min-h-screen p-4">
        <div className="max-w-6xl mx-auto">
          {/* Form wrapper for all elements */}
          <form onSubmit={onSubmit} className="relative">
            {/* Initial container for centered position */}

            {/* Grid layout for expanded state - hidden initially */}
            <div id="expanded-grid" className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Commission Request + Additional Details */}
              <div id="column-1" className="space-y-6 opacity-0 grid-column-inline-grid">
                {/* Target position for commission request card after flip */}
                <div 
                id="main-form-card"
                data-flip-id="commission-request-card"
                className="w-full max-w-md"
              >
                <div id="main-card-gradient" className="h-full bg-gradient-to-br from-emerald-900/20 to-emerald-950/30 backdrop-blur-xs rounded-2xl shadow-2xl p-8 border border-emerald-700/10">
                  <div id="card-header" className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">
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
                      options={garmentOptions}
                      placeholder="Select garment type"
                      error={errors.garmentType}
                      required
                    />

                    {/* Budget and Timeline - hidden initially, shown after expansion */}
                    <div id="budget-timeline-target">
                    </div>
                  </div>
                </div>
              </div>
                
                
              </div>

              {/* Center Column - Garment Image Placeholder */}
              <div className="grid-column-inline-grid">
              <div id="column-2" className="space-y-6 ">
                  <div 
                      id="commission-request-target" className=""
                    >
                      <div id="budget-timeline-section" className="space-y-6 opacity-0">
                      <FormSelect
                        id="budget"
                        name="budget"
                        label="Budget Range"
                        value={formData.budget}
                        onChange={(value) => onSelectChange(value, "budget")}
                        options={budgetOptions}
                        placeholder="Select budget range"
                        error={errors.budget}
                        required
                      />

                      <FormSelect
                        id="timeline"
                        name="timeline"
                        label="Timeline"
                        value={formData.timeline}
                        onChange={(value) => onSelectChange(value, "timeline")}
                        options={timelineOptions}
                        placeholder="Select timeline"
                        error={errors.timeline}
                        required
                      />
                    </div>
                    </div>
                

                <div 
                  id="garment-preview-card"
                  className="opacity-0 w-full max-w-sm aspect-square"
                >
                  <GarmentViewer className="w-full h-full" garmentType={formData.garmentType} />
                </div>
                
                <div 
                  id="additional-details-card"
                  className="opacity-0 bg-gradient-to-br from-emerald-900/20 to-emerald-950/30 backdrop-blur-xs rounded-2xl shadow-2xl p-6 border border-emerald-700/10"
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


              </div>
              </div>

              {/* Right Column - Measurement Guide and Measurements */}
              <div id="column-3" className="space-y-6 grid-column-inline-grid opacity-0">
                <div id="measurement-guide-card" style={{height:'16rem'}}>
                  <MeasurementGuideDisplay currentMeasurement={currentMeasurement} />
                </div>
                <div 
                  id="measurement-navigator-card"
                  className="bg-gradient-to-br from-emerald-900/20 to-emerald-950/30 backdrop-blur-xs rounded-2xl shadow-2xl p-6 border border-emerald-700/10"
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
                <div id="submit-button-container" className="submit-container">
                  <SubmitButton isLoading={isSubmitting} />
                </div>


                
              </div>
            </div>

          </form>
        </div>
      </div>
    );
  }
);

UnifiedFormLayout.displayName = "UnifiedFormLayout";