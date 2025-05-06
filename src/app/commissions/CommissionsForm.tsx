"use client";

import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "~/context/auth";

// Types
export interface CommissionFormData {
  garmentType: string;
  measurements: {
    // Basic measurements (original)
    chest: number | null;
    waist: number | null;
    hips: number | null;
    length: number | null;
    inseam: number | null;
    shoulders: number | null;
    // Additional measurements (new)
    neck: number | null;
    sleeve_length: number | null;
    bicep: number | null;
    forearm: number | null;
    wrist: number | null;
    armhole_depth: number | null;
    back_width: number | null;
    front_chest_width: number | null;
    thigh: number | null;
    knee: number | null;
    calf: number | null;
    ankle: number | null;
    rise: number | null;
    outseam: number | null;
    height: number | null;
    weight: number | null;
    torso_length: number | null;
    shoulder_slope: number | null;
    posture: string | null;
  };
  budget: string;
  timeline: string;
  details: string;
}

interface UserMeasurements {
  chest?: number | null;
  waist?: number | null;
  hips?: number | null;
  length?: number | null;
  inseam?: number | null;
  shoulders?: number | null;
  neck?: number | null;
  sleeve_length?: number | null;
  bicep?: number | null;
  forearm?: number | null;
  wrist?: number | null;
  armhole_depth?: number | null;
  back_width?: number | null;
  front_chest_width?: number | null;
  thigh?: number | null;
  knee?: number | null;
  calf?: number | null;
  ankle?: number | null;
  rise?: number | null;
  outseam?: number | null;
  height?: number | null;
  weight?: number | null;
  torso_length?: number | null;
  shoulder_slope?: number | null;
  posture?: string | null;
}

type SupabaseError = {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
};

interface ApiResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    garment_type: string;
    budget: string;
    timeline: string;
    details: string;
    user_id: string;
    status: string;
  };
  error?: string;
}

// Helper function to fetch profile measurements
const fetchProfileMeasurements = async (userId: string): Promise<UserMeasurements> => {
  const supabase = createClientComponentClient();
  
  const { data, error } = await supabase
    .from('profile_measurements')
    .select('*')
    .eq('profile_id', userId)
    .single() as { data: UserMeasurements | null; error: SupabaseError | null };
    
  if (error) {
    console.error("Error fetching measurements:", error);
    throw new Error(error.message);
  }
  
  return data ?? {};
};

// Default empty measurements with all fields initialized to null
const getEmptyMeasurements = () => ({
  chest: null,
  waist: null,
  hips: null,
  length: null,
  inseam: null,
  shoulders: null,
  neck: null,
  sleeve_length: null,
  bicep: null,
  forearm: null,
  wrist: null,
  armhole_depth: null,
  back_width: null,
  front_chest_width: null,
  thigh: null,
  knee: null,
  calf: null,
  ankle: null,
  rise: null,
  outseam: null,
  height: null,
  weight: null,
  torso_length: null,
  shoulder_slope: null,
  posture: null,
});

// Required measurements by garment type
const REQUIRED_MEASUREMENTS: Record<string, string[]> = {
  shirt: ['chest', 'shoulders', 'sleeve_length'],
  jacket: ['chest', 'shoulders', 'sleeve_length', 'bicep'],
  pants: ['waist', 'hips', 'inseam', 'length', 'rise'],
  dress: ['chest', 'waist', 'hips', 'length', 'shoulders'],
  skirt: ['waist', 'hips', 'length'],
  other: [],
};

type MeasurementKey = keyof CommissionFormData['measurements'];

export default function CommissionsForm() {
  const { user } = useAuth();
  const supabase = createClientComponentClient();
  const router = useRouter();
  
  const [formData, setFormData] = useState<CommissionFormData>({
    garmentType: "",
    measurements: getEmptyMeasurements(),
    budget: "",
    timeline: "",
    details: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMeasurements, setIsLoadingMeasurements] = useState(false);
  
  // Group measurements by body area for better UI organization
  const measurementGroups = {
    upper: [
      { id: "chest", label: "Chest" },
      { id: "shoulders", label: "Shoulders" },
      { id: "neck", label: "Neck" },
      { id: "sleeve_length", label: "Sleeve Length" },
      { id: "bicep", label: "Bicep" },
      { id: "forearm", label: "Forearm" },
      { id: "wrist", label: "Wrist" },
      { id: "armhole_depth", label: "Armhole Depth" },
      { id: "back_width", label: "Back Width" },
      { id: "front_chest_width", label: "Front Chest Width" },
    ],
    lower: [
      { id: "waist", label: "Waist" },
      { id: "hips", label: "Hips" },
      { id: "length", label: "Length" },
      { id: "inseam", label: "Inseam" },
      { id: "rise", label: "Rise" },
      { id: "outseam", label: "Outseam" },
      { id: "thigh", label: "Thigh" },
      { id: "knee", label: "Knee" },
      { id: "calf", label: "Calf" },
      { id: "ankle", label: "Ankle" },
    ],
    general: [
      { id: "height", label: "Height" },
      { id: "weight", label: "Weight" },
      { id: "torso_length", label: "Torso Length" },
      { id: "shoulder_slope", label: "Shoulder Slope" },
      { id: "posture", label: "Posture" },
    ]
  };

  // Function to load measurements from user profile
  const loadMeasurementsFromProfile = async () => {
    if (!user) {
      toast.error("You must be logged in to load your measurements");
      router.push("/login");
      return;
    }
    
    const userId = user.id;
    
    if (!userId) {
      toast.error("User ID not found");
      return;
    }
    
    setIsLoadingMeasurements(true);
    
    try {
      const profileMeasurements = await fetchProfileMeasurements(userId);
      
      if (!profileMeasurements || Object.keys(profileMeasurements).length === 0) {
        toast("No saved measurements found in your profile");
        return;
      }
      
      // Update form with measurements from profile
      setFormData(prev => ({
        ...prev,
        measurements: {
          ...prev.measurements,
          ...profileMeasurements
        }
      }));
      
      toast.success("Your saved measurements have been loaded");
    } catch (error) {
      console.error("Error loading measurements:", error);
      toast.error("Failed to load your measurements");
    } finally {
      setIsLoadingMeasurements(false);
    }
  };

  // Function to submit commission to Supabase using the updated API route
  const submitCommission = async (data: CommissionFormData) => {
    // First, check if user is authenticated
    if (!user) {
      toast.error("You must be logged in to submit a commission request");
      router.push("/login");
      return null;
    }
    
    try {
      // Format the data for API submission
      const submissionData = {
        garmentType: data.garmentType,
        measurements: data.measurements,
        budget: data.budget,
        timeline: data.timeline,
        details: data.details,
      };

      // Submit to the API route
      const response = await fetch('/api/commissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });
      
      if (!response.ok) {
        const errorData = await response.json() as { error: string };
        throw new Error(errorData.error ?? 'Failed to submit commission');
      }
      
      const result = await response.json() as ApiResponse;
      return result.data;
    } catch (error) {
      console.error("Error submitting commission:", error);
      throw error;
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.garmentType) {
      newErrors.garmentType = "Please select a garment type";
    }
    
    if (!formData.budget) {
      newErrors.budget = "Please select a budget range";
    }
    
    if (!formData.timeline) {
      newErrors.timeline = "Please select a timeline";
    }
    
    if (!formData.details) {
      newErrors.details = "Please provide additional details";
    }

    // Validate required measurements based on garment type
    const requiredMeasurements = REQUIRED_MEASUREMENTS[formData.garmentType] ?? [];
    for (const field of requiredMeasurements) {
      if (!formData.measurements[field as MeasurementKey]) {
        newErrors[`measurements.${field}`] = "Required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Check if user is authenticated before submitting
    if (!user) {
      toast.error("You must be logged in to submit a commission request");
      router.push("/login");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const insertedData = await submitCommission(formData);
      
      if (insertedData) {
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
      }
    } catch (error) {
      toast.error("An error occurred while submitting your request.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

  const handleNumberInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow only numbers, backspace, delete, tab, arrows, home, end
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End', '.'];
    const key = e.key;
    
    // Check if the key is not a number or one of the allowed control keys
    if (!/^[0-9]$/.test(key) && !allowedKeys.includes(key)) {
      e.preventDefault();
    }
  };

  // Helper function to determine if a measurement field should be shown based on the garment type
  const shouldShowMeasurement = (measurementId: string) => {
    const currentGarmentType = formData.garmentType;
    
    // For general measurements, always show
    if (measurementGroups.general.some(m => m.id === measurementId)) {
      return true;
    }
    
    // For upper body measurements, show for shirt, jacket, dress
    if (measurementGroups.upper.some(m => m.id === measurementId)) {
      return ['shirt', 'jacket', 'dress', 'other'].includes(currentGarmentType);
    }
    
    // For lower body measurements, show for pants, skirt, dress
    if (measurementGroups.lower.some(m => m.id === measurementId)) {
      return ['pants', 'skirt', 'dress', 'other'].includes(currentGarmentType);
    }
    
    return true;
  };

  // Helper function to check if a measurement is required
  const isMeasurementRequired = (measurementId: string) => {
    const garmentType = formData.garmentType;
    const requiredMeasurements = REQUIRED_MEASUREMENTS[garmentType] ?? [];
    return requiredMeasurements.includes(measurementId);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-950 to-gray-950 flex items-center justify-center p-4">
      <div className="-mt-30 w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-gradient-to-br from-emerald-900/30 to-emerald-950/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-emerald-700/20"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Clothing Commission Request</h2>
            <p className="text-emerald-200/70">Tell us about your dream garment</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Garment Type */}
            <div>
              <label htmlFor="garmentType" className="block text-emerald-100 font-medium mb-2 text-sm">
                Garment Type
              </label>
              <div className="relative">
                <select
                  id="garmentType"
                  name="garmentType"
                  value={formData.garmentType}
                  onChange={(e) => handleSelectChange(e.target.value, "garmentType")}
                  className={`w-full pl-3 pr-10 py-3 bg-emerald-950/50 border ${errors.garmentType ? "border-red-500" : "border-emerald-700/30"} rounded-lg shadow-sm text-emerald-100 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all appearance-none`}
                >
                  <option value="" disabled>Select garment type</option>
                  <option value="shirt">Shirt</option>
                  <option value="jacket">Jacket</option>
                  <option value="pants">Pants</option>
                  <option value="dress">Dress</option>
                  <option value="skirt">Skirt</option>
                  <option value="other">Other</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-5 w-5 text-emerald-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              {errors.garmentType && (
                <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.garmentType}</p>
              )}
            </div>

            {/* Measurements */}
            {formData.garmentType && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-emerald-100 font-medium text-sm">Measurements (inches)</label>
                  <button
                    type="button"
                    onClick={loadMeasurementsFromProfile}
                    disabled={isLoadingMeasurements}
                    className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors flex items-center"
                  >
                    {!isLoadingMeasurements ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="animate-spin h-4 w-4 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {isLoadingMeasurements ? "Loading..." : "Load from Profile"}
                  </button>
                </div>
                
                {/* Conditionally render the appropriate measurement fields based on garment type */}
                {formData.garmentType && (
                  <>
                    {/* Upper Body Measurements - Show for shirts, jackets, dresses */}
                    {['shirt', 'jacket', 'dress', 'other'].includes(formData.garmentType) && (
                      <div className="mb-4">
                        <h3 className="text-emerald-100 text-sm font-medium mb-2">Upper Body</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {measurementGroups.upper
                            .filter(m => shouldShowMeasurement(m.id))
                            .map(measurement => (
                              <div key={measurement.id}>
                                <label 
                                  htmlFor={measurement.id} 
                                  className="block text-emerald-200/80 text-xs mb-1 flex"
                                >
                                  {measurement.label}
                                  {isMeasurementRequired(measurement.id) && (
                                    <span className="text-emerald-400 ml-1">*</span>
                                  )}
                                </label>
                                <input
                                  id={measurement.id}
                                  name={`measurements.${measurement.id}`}
                                  type={measurement.id === "posture" ? "text" : "number"}
                                  step="0.1"
                                  min="0"
                                  value={formData.measurements[measurement.id as keyof typeof formData.measurements] ?? ""}
                                  onChange={handleInputChange}
                                  onKeyDown={measurement.id === "posture" ? undefined : handleNumberInput}
                                  className={`w-full pl-3 pr-3 py-2 bg-emerald-950/50 border ${
                                    errors[`measurements.${measurement.id}`] ? "border-red-500" : "border-emerald-700/30"
                                  } rounded-lg shadow-sm text-emerald-100 placeholder:text-emerald-600/50 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all`}
                                  placeholder={measurement.id === "posture" ? "Description..." : "0.0"}
                                />
                                {errors[`measurements.${measurement.id}`] && (
                                  <p className="text-red-400 text-xs mt-1">{errors[`measurements.${measurement.id}`]}</p>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Lower Body Measurements - Show for pants, skirts, dresses */}
                    {['pants', 'skirt', 'dress', 'other'].includes(formData.garmentType) && (
                      <div className="mb-4">
                        <h3 className="text-emerald-100 text-sm font-medium mb-2">Lower Body</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {measurementGroups.lower
                            .filter(m => shouldShowMeasurement(m.id))
                            .map(measurement => (
                              <div key={measurement.id}>
                                <label 
                                  htmlFor={measurement.id} 
                                  className="block text-emerald-200/80 text-xs mb-1 flex"
                                >
                                  {measurement.label}
                                  {isMeasurementRequired(measurement.id) && (
                                    <span className="text-emerald-400 ml-1">*</span>
                                  )}
                                </label>
                                <input
                                  id={measurement.id}
                                  name={`measurements.${measurement.id}`}
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  value={formData.measurements[measurement.id as keyof typeof formData.measurements] ?? ""}
                                  onChange={handleInputChange}
                                  onKeyDown={handleNumberInput}
                                  className={`w-full pl-3 pr-3 py-2 bg-emerald-950/50 border ${
                                    errors[`measurements.${measurement.id}`] ? "border-red-500" : "border-emerald-700/30"
                                  } rounded-lg shadow-sm text-emerald-100 placeholder:text-emerald-600/50 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all`}
                                  placeholder="0.0"
                                />
                                {errors[`measurements.${measurement.id}`] && (
                                  <p className="text-red-400 text-xs mt-1">{errors[`measurements.${measurement.id}`]}</p>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                    
                    {/* General Body Measurements - Always show */}
                    <div>
                      <h3 className="text-emerald-100 text-sm font-medium mb-2">General Information</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {measurementGroups.general.map(measurement => (
                          <div key={measurement.id}>
                            <label htmlFor={measurement.id} className="block text-emerald-200/80 text-xs mb-1">
                              {measurement.label}
                            </label>
                            <input
                              id={measurement.id}
                              name={`measurements.${measurement.id}`}
                              type={measurement.id === "posture" ? "text" : "number"}
                              step="0.1"
                              min="0"
                              value={formData.measurements[measurement.id as keyof typeof formData.measurements] ?? ""}
                              onChange={handleInputChange}
                              onKeyDown={measurement.id === "posture" ? undefined : handleNumberInput}
                              className={`w-full pl-3 pr-3 py-2 bg-emerald-950/50 border ${
                                errors[`measurements.${measurement.id}`] ? "border-red-500" : "border-emerald-700/30"
                              } rounded-lg shadow-sm text-emerald-100 placeholder:text-emerald-600/50 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all`}
                              placeholder={measurement.id === "posture" ? "Description..." : "0.0"}
                            />
                            {errors[`measurements.${measurement.id}`] && (
                              <p className="text-red-400 text-xs mt-1">{errors[`measurements.${measurement.id}`]}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Budget Range */}
            <div>
              <label htmlFor="budget" className="block text-emerald-100 font-medium mb-2 text-sm">
                Budget Range
              </label>
              <div className="relative">
                <select
                  id="budget"
                  name="budget"
                  value={formData.budget}
                  onChange={(e) => handleSelectChange(e.target.value, "budget")}
                  className={`w-full pl-3 pr-10 py-3 bg-emerald-950/50 border ${errors.budget ? "border-red-500" : "border-emerald-700/30"} rounded-lg shadow-sm text-emerald-100 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all appearance-none`}
                >
                  <option value="" disabled>Select budget range</option>
                  <option value="100-300">$100 - $300</option>
                  <option value="300-500">$300 - $500</option>
                  <option value="500-1000">$500 - $1000</option>
                  <option value="1000+">$1000+</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-5 w-5 text-emerald-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              {errors.budget && (
                <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.budget}</p>
              )}
            </div>

            {/* Timeline */}
            <div>
              <label htmlFor="timeline" className="block text-emerald-100 font-medium mb-2 text-sm">
                Timeline
              </label>
              <div className="relative">
                <select
                  id="timeline"
                  name="timeline"
                  value={formData.timeline}
                  onChange={(e) => handleSelectChange(e.target.value, "timeline")}
                  className={`w-full pl-3 pr-10 py-3 bg-emerald-950/50 border ${errors.timeline ? "border-red-500" : "border-emerald-700/30"} rounded-lg shadow-sm text-emerald-100 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all appearance-none`}
                >
                  <option value="" disabled>Select timeline</option>
                  <option value="1-2weeks">1-2 weeks</option>
                  <option value="3-4weeks">3-4 weeks</option>
                  <option value="1-2months">1-2 months</option>
                  <option value="flexible">Flexible</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-5 w-5 text-emerald-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              {errors.timeline && (
                <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.timeline}</p>
              )}
            </div>

            {/* Additional Details */}
            <div>
              <label htmlFor="details" className="block text-emerald-100 font-medium mb-2 text-sm">
                Additional Details
              </label>
              <textarea
                id="details"
                name="details"
                value={formData.details}
                onChange={handleInputChange}
                placeholder="Tell us more about your vision..."
                className={`w-full h-32 px-3 py-2 bg-emerald-950/50 border ${errors.details ? "border-red-500" : "border-emerald-700/30"} rounded-lg shadow-sm text-emerald-100 placeholder:text-emerald-600/50 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none`}
              ></textarea>
              {errors.details && (
                <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.details}</p>
              )}
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-medium rounded-lg shadow-lg shadow-emerald-900/30 flex items-center justify-center transition-all duration-200 hover:shadow-emerald-800/40 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Submit Commission Request
                </>
              )}
            </button>
          </form>
          
          {/* Small notice about measurement loading */}
          <div className="mt-6 text-center text-xs text-emerald-300/60">
            <p>You can load your saved measurements from your profile using the &ldquo;Load from Profile&rdquo; button.</p>
            <p className="mt-1">Need to update your profile measurements? <Link href="/profile/settings" className="text-emerald-400 hover:underline">Go to Profile Settings</Link></p>
          </div>
        </motion.div>
      </div>
      <Toaster position="bottom-right" />
    </main>
  );
}