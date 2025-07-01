"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import { useAuth } from "~/context/auth";
import { api } from "~/trpc/react";

// Import our new components and utilities
import { FormSelect } from "./components/FormSelect";
import { FormTextarea } from "./components/FormTextarea";
import { MeasurementsForm } from "./components/MeasurementsForm";
import { SubmitButton } from "./components/SubmitButton";
import { useMeasurementLoader } from "./hooks/useMeasurementLoader";
import { validateCommissionForm } from "./utils";
import { getEmptyMeasurements } from "./constants";
import type { CommissionFormData, MeasurementKey } from "./types";

export default function CommissionsForm() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState<CommissionFormData>({
    garmentType: "",
    measurements: getEmptyMeasurements(),
    budget: "",
    timeline: "",
    details: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Use our custom hook for measurement loading
  const { isLoadingMeasurements, loadMeasurementsFromProfile } = useMeasurementLoader({
    setFormData,
  });

  // tRPC mutation for creating commission
  const createCommissionMutation = api.commissions.create.useMutation({
    onSuccess: () => {
      toast.success("Commission request successfully submitted!");
      // Reset form
      setFormData({
        garmentType: "",
        measurements: getEmptyMeasurements(),
        budget: "",
        timeline: "",
        details: "",
      });
      // Redirect to dashboard or commissions list
      router.push("/profile/orders");
    },
    onError: (error) => {
      toast.error(error.message || "An error occurred while submitting your request.");
    },
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const formErrors = validateCommissionForm(formData);
    setErrors(formErrors);
    
    if (Object.keys(formErrors).length > 0) {
      return;
    }
    
    // Check if user is authenticated before submitting
    if (!user) {
      toast.error("You must be logged in to submit a commission request");
      router.push("/login");
      return;
    }
    
    // Use tRPC mutation to submit commission
    createCommissionMutation.mutate({
      garmentType: formData.garmentType,
      measurements: formData.measurements,
      budget: formData.budget,
      timeline: formData.timeline,
      details: formData.details,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith("measurements.")) {
      const measurementField = name.split(".")[1] as MeasurementKey;
      setFormData(prev => ({
        ...prev,
        measurements: {
          ...prev.measurements,
          [measurementField]: value === "" ? null : 
                             measurementField === "posture" ? value : 
                             parseFloat(value) || null
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSelectChange = (value: string, field: keyof CommissionFormData) => {
    if (field === "garmentType") {
      // Reset measurements when garment type changes
      setFormData({
        ...formData,
        garmentType: value,
        measurements: getEmptyMeasurements()
      });
    } else {
      setFormData({
        ...formData,
        [field]: value
      });
    }
  };

  // Form options
  const garmentOptions = [
    { value: "shirt", label: "Shirt" },
    { value: "jacket", label: "Jacket" },
    { value: "pants", label: "Pants" },
    { value: "dress", label: "Dress" },
    { value: "skirt", label: "Skirt" },
    { value: "other", label: "Other" },
  ];

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

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-gradient-to-br from-emerald-900/20 to-emerald-950/30 backdrop-blur-xs rounded-2xl shadow-2xl p-8 border border-emerald-700/10"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Clothing Commission Request</h2>
            <p className="text-emerald-200/70">Tell us about your dream garment</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Garment Type */}
            <FormSelect
              id="garmentType"
              name="garmentType"
              label="Garment Type"
              value={formData.garmentType}
              onChange={(value) => handleSelectChange(value, "garmentType")}
              options={garmentOptions}
              placeholder="Select garment type"
              error={errors.garmentType}
              required
            />

            {/* Measurements */}
            <MeasurementsForm
              formData={formData}
              errors={errors}
              onChange={handleInputChange}
              onLoadMeasurements={loadMeasurementsFromProfile}
              isLoadingMeasurements={isLoadingMeasurements}
            />

            {/* Budget Range */}
            <FormSelect
              id="budget"
              name="budget"
              label="Budget Range"
              value={formData.budget}
              onChange={(value) => handleSelectChange(value, "budget")}
              options={budgetOptions}
              placeholder="Select budget range"
              error={errors.budget}
              required
            />

            {/* Timeline */}
            <FormSelect
              id="timeline"
              name="timeline"
              label="Timeline"
              value={formData.timeline}
              onChange={(value) => handleSelectChange(value, "timeline")}
              options={timelineOptions}
              placeholder="Select timeline"
              error={errors.timeline}
              required
            />

            {/* Additional Details */}
            <FormTextarea
              id="details"
              name="details"
              label="Additional Details"
              value={formData.details}
              onChange={handleInputChange}
              placeholder="Tell us more about your vision..."
              error={errors.details}
              rows={4}
              required
            />

            {/* Submit Button */}
            <SubmitButton isLoading={createCommissionMutation.isPending} />
          </form>
        </motion.div>
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
}