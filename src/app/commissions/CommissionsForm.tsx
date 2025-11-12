"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSession } from "~/lib/auth-client";
import { api } from "~/trpc/react";

// Import our new components and utilities
import { GSAPFormContainer } from "./components/GSAPFormContainer";
import { useMeasurementLoader } from "./hooks/useMeasurementLoader";
import { validateCommissionForm } from "./utils";
import { getEmptyMeasurements } from "./constants";
import type { CommissionFormData, MeasurementKey } from "./types";

export default function CommissionsForm() {
  const { data: session } = useSession();
  const user = session?.user;
  const router = useRouter();

  const [formData, setFormData] = useState<CommissionFormData>({
    garmentType: "",
    measurements: getEmptyMeasurements(),
    budget: "",
    timeline: "",
    details: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentMeasurement, setCurrentMeasurement] =
    useState<MeasurementKey | null>(null);

  // Use our custom hook for measurement loading
  const { isLoadingMeasurements, loadMeasurementsFromProfile } =
    useMeasurementLoader({
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
      toast.error(
        error.message || "An error occurred while submitting your request.",
      );
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    if (name.startsWith("measurements.")) {
      const measurementField = name.split(".")[1] as MeasurementKey;
      setFormData((prev) => ({
        ...prev,
        measurements: {
          ...prev.measurements,
          [measurementField]:
            value === ""
              ? null
              : measurementField === "posture"
                ? value
                : parseFloat(value) || null,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSelectChange = (
    value: string,
    field: keyof CommissionFormData,
  ) => {
    if (field === "garmentType") {
      // Reset measurements when garment type changes
      setFormData({
        ...formData,
        garmentType: value,
        measurements: getEmptyMeasurements(),
      });
    } else {
      setFormData({
        ...formData,
        [field]: value,
      });
    }
  };

  const handleMeasurementChange = (measurement: MeasurementKey | null) => {
    setCurrentMeasurement(measurement);
  };

  return (
    <GSAPFormContainer
      formData={formData}
      errors={errors}
      onInputChange={handleInputChange}
      onSelectChange={handleSelectChange}
      onSubmit={handleSubmit}
      onLoadMeasurements={loadMeasurementsFromProfile}
      isLoadingMeasurements={isLoadingMeasurements}
      isSubmitting={createCommissionMutation.isPending}
      currentMeasurement={currentMeasurement}
      onMeasurementChange={handleMeasurementChange}
    />
  );
}
