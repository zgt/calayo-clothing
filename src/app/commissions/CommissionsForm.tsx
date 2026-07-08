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
import { getEmptyDesign, getFabricById } from "~/lib/commission-design";
import type {
  CommissionDesign,
  GarmentType,
  BudgetValue,
  TimelineValue,
} from "~/lib/commission-design";
import type { CommissionFormData, MeasurementKey } from "./types";

export default function CommissionsForm() {
  const { data: session } = useSession();
  const user = session?.user;
  const router = useRouter();

  const [formData, setFormData] = useState<CommissionFormData>({
    garmentType: "",
    design: getEmptyDesign(),
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
        design: getEmptyDesign(),
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

    // Use tRPC mutation to submit commission. Validation above guarantees
    // these narrow to the server's enums.
    createCommissionMutation.mutate({
      garmentType: formData.garmentType as GarmentType,
      design: formData.design,
      measurements: formData.measurements,
      budget: formData.budget as BudgetValue,
      timeline: formData.timeline as TimelineValue,
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
      // Reset measurements and garment-specific design choices when the
      // garment changes. Color carries over (it's universal); fabric only
      // survives if the new garment offers it.
      const fabric = getFabricById(formData.design.fabric);
      const fabricStillOffered =
        fabric?.garments.includes(value as GarmentType) ?? false;
      setFormData({
        ...formData,
        garmentType: value,
        measurements: getEmptyMeasurements(),
        design: {
          ...formData.design,
          fabric: fabricStillOffered ? formData.design.fabric : null,
          styleOptions: {},
        },
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

  const handleDesignChange = (design: Partial<CommissionDesign>) => {
    setFormData((prev) => ({
      ...prev,
      design: { ...prev.design, ...design },
    }));
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
      onDesignChange={handleDesignChange}
    />
  );
}
