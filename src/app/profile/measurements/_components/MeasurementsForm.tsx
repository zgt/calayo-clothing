"use client";

import { useState } from "react";
import { createClient } from "~/utils/supabase/client";

type ProfileMeasurements = {
  id?: string;
  profile_id: string;
  // Basic measurements
  chest: number | null;
  waist: number | null;
  hips: number | null;
  length: number | null;
  inseam: number | null;
  shoulders: number | null;
  // Additional upper body
  neck: number | null;
  sleeve_length: number | null;
  bicep: number | null;
  forearm: number | null;
  wrist: number | null;
  armhole_depth: number | null;
  back_width: number | null;
  front_chest_width: number | null;
  // Additional lower body
  thigh: number | null;
  knee: number | null;
  calf: number | null;
  ankle: number | null;
  rise: number | null;
  outseam: number | null;
  // Full body
  height: number | null;
  weight: number | null;
  // Formal wear
  torso_length: number | null;
  shoulder_slope: number | null;
  posture: string | null;
  // Preferences
  size_preference: string | null;
  fit_preference: string | null;
  [key: string]: unknown;
};

interface MeasurementsFormProps {
  measurements: ProfileMeasurements | null;
  userId: string;
}

// Helper component for measurement inputs
function MeasurementInput({ 
  label, 
  name, 
  value, 
  onChange 
}: { 
  label: string; 
  name: string; 
  value: string | number; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-emerald-200">
        {label} (inches)
      </label>
      <div className="relative mt-1">
        <input
          type="number"
          step="0.1"
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className="block w-full rounded-lg border border-emerald-700/30 bg-emerald-950/50 px-3 py-2 text-emerald-100 placeholder:text-emerald-600/50 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
          placeholder="0.0"
        />
      </div>
    </div>
  );
}

export default function MeasurementsForm({ measurements, userId }: MeasurementsFormProps) {
  const supabase = createClient();
  
  // Initialize measurements from profile or empty
  const [formData, setFormData] = useState({
    // Basic measurements
    chest: measurements?.chest ?? "",
    waist: measurements?.waist ?? "",
    hips: measurements?.hips ?? "",
    length: measurements?.length ?? "",
    inseam: measurements?.inseam ?? "",
    shoulders: measurements?.shoulders ?? "",
    // Additional upper body
    neck: measurements?.neck ?? "",
    sleeve_length: measurements?.sleeve_length ?? "",
    bicep: measurements?.bicep ?? "",
    forearm: measurements?.forearm ?? "",
    wrist: measurements?.wrist ?? "",
    back_width: measurements?.back_width ?? "",
    // Lower body
    thigh: measurements?.thigh ?? "",
    knee: measurements?.knee ?? "",
    calf: measurements?.calf ?? "",
    ankle: measurements?.ankle ?? "",
    // Full body
    height: measurements?.height ?? "",
    // Preferences
    fit_preference: measurements?.fit_preference ?? "",
  });
  
  const [activeTab, setActiveTab] = useState("basic");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: "", type: "" });
    
    // Convert empty strings to null and strings to numbers where appropriate
    const formattedMeasurements = Object.entries(formData).reduce((acc, [key, value]) => {
      // Handle empty strings
      if (value === "") {
        acc[key] = null;
      } 
      // Convert numeric values to numbers
      else if (key !== "fit_preference" && key !== "posture" && key !== "size_preference") {
        acc[key] = parseFloat(value as string);
      } 
      // Keep string values as strings
      else {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, number | string | null>);
    
    try {
      // Check if measurements already exist for this profile
      const { data: existingMeasurements, error: fetchError } = await supabase
        .from("profile_measurements")
        .select("id")
        .eq("profile_id", userId)
        .maybeSingle();
        
      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError;
      }
      
      // Add profile_id to the measurements data
      const measurementsData = {
        ...formattedMeasurements,
        profile_id: userId,
      };
      
      if (existingMeasurements?.id) {
        // Update existing measurements
        const { error: updateError } = await supabase
          .from("profile_measurements")
          .update(measurementsData)
          .eq("id", existingMeasurements.id);
          
        if (updateError) throw updateError;
      } else {
        // Insert new measurements
        const { error: insertError } = await supabase
          .from("profile_measurements")
          .insert(measurementsData);
          
        if (insertError) throw insertError;
      }
      
      setMessage({
        text: "Measurements updated successfully!",
        type: "success"
      });
    } catch (error) {
      console.error("Error updating measurements:", error);
      setMessage({
        text: "Failed to update measurements. Please try again.",
        type: "error"
      });
    } finally {
      setIsLoading(false);
      
      // Clear success message after 3 seconds
      if (message.type === "success") {
        setTimeout(() => {
          setMessage({ text: "", type: "" });
        }, 3000);
      }
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {message.text && (
        <div 
          className={`mb-4 rounded-md p-3 ${
            message.type === "success" 
              ? "bg-emerald-900/50 text-emerald-200 border border-emerald-700/30" 
              : "bg-red-900/50 text-red-200 border border-red-700/30"
          }`}
        >
          {message.text}
        </div>
      )}
      
      {/* Tab Navigation */}
      <div className="mb-6 border-b border-emerald-700/30">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            type="button"
            onClick={() => setActiveTab("basic")}
            className={`${
              activeTab === "basic"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-emerald-200/70 hover:border-emerald-700/50 hover:text-emerald-200"
            }
            whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors`}
          >
            Basic Measurements
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("upper")}
            className={`${
              activeTab === "upper"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-emerald-200/70 hover:border-emerald-700/50 hover:text-emerald-200"
            }
            whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors`}
          >
            Upper Body
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("lower")}
            className={`${
              activeTab === "lower"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-emerald-200/70 hover:border-emerald-700/50 hover:text-emerald-200"
            }
            whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors`}
          >
            Lower Body
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preferences")}
            className={`${
              activeTab === "preferences"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-emerald-200/70 hover:border-emerald-700/50 hover:text-emerald-200"
            }
            whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors`}
          >
            Fit Preferences
          </button>
        </nav>
      </div>
      
      {/* Basic Measurements Tab */}
      <div className={activeTab === "basic" ? "block" : "hidden"}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          <MeasurementInput
            label="Chest"
            name="chest"
            value={formData.chest}
            onChange={handleChange}
          />
          <MeasurementInput
            label="Waist"
            name="waist"
            value={formData.waist}
            onChange={handleChange}
          />
          <MeasurementInput
            label="Hips"
            name="hips"
            value={formData.hips}
            onChange={handleChange}
          />
          <MeasurementInput
            label="Shoulders"
            name="shoulders"
            value={formData.shoulders}
            onChange={handleChange}
          />
          <MeasurementInput
            label="Length"
            name="length"
            value={formData.length}
            onChange={handleChange}
          />
          <MeasurementInput
            label="Inseam"
            name="inseam"
            value={formData.inseam}
            onChange={handleChange}
          />
          <MeasurementInput
            label="Height"
            name="height"
            value={formData.height}
            onChange={handleChange}
          />
        </div>
      </div>
      
      {/* Upper Body Measurements Tab */}
      <div className={activeTab === "upper" ? "block" : "hidden"}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          <MeasurementInput
            label="Neck"
            name="neck"
            value={formData.neck}
            onChange={handleChange}
          />
          <MeasurementInput
            label="Sleeve Length"
            name="sleeve_length"
            value={formData.sleeve_length}
            onChange={handleChange}
          />
          <MeasurementInput
            label="Bicep"
            name="bicep"
            value={formData.bicep}
            onChange={handleChange}
          />
          <MeasurementInput
            label="Forearm"
            name="forearm"
            value={formData.forearm}
            onChange={handleChange}
          />
          <MeasurementInput
            label="Wrist"
            name="wrist"
            value={formData.wrist}
            onChange={handleChange}
          />
          <MeasurementInput
            label="Back Width"
            name="back_width"
            value={formData.back_width}
            onChange={handleChange}
          />
        </div>
      </div>
      
      {/* Lower Body Measurements Tab */}
      <div className={activeTab === "lower" ? "block" : "hidden"}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          <MeasurementInput
            label="Thigh"
            name="thigh"
            value={formData.thigh}
            onChange={handleChange}
          />
          <MeasurementInput
            label="Knee"
            name="knee"
            value={formData.knee}
            onChange={handleChange}
          />
          <MeasurementInput
            label="Calf"
            name="calf"
            value={formData.calf}
            onChange={handleChange}
          />
          <MeasurementInput
            label="Ankle"
            name="ankle"
            value={formData.ankle}
            onChange={handleChange}
          />
        </div>
      </div>
      
      {/* Fit Preferences Tab */}
      <div className={activeTab === "preferences" ? "block" : "hidden"}>
        <div className="space-y-4">
          <div>
            <label htmlFor="fit_preference" className="block text-sm font-medium text-emerald-200">
              Preferred Fit
            </label>
            <select
              id="fit_preference"
              name="fit_preference"
              value={formData.fit_preference}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-emerald-700/30 bg-emerald-950/50 px-3 py-2 text-emerald-100 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
            >
              <option value="">Select a fit preference</option>
              <option value="Slim">Slim</option>
              <option value="Regular">Regular</option>
              <option value="Relaxed">Relaxed</option>
              <option value="Oversized">Oversized</option>
            </select>
          </div>
          
          <div className="rounded-md bg-emerald-900/50 p-4 border border-emerald-700/30">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-emerald-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-emerald-200">Important note</h3>
                <div className="mt-2 text-sm text-emerald-200/70">
                  <p>
                    Your fit preference helps us customize garments to your liking. 
                    This is in addition to your exact measurements and helps our designers 
                    understand your personal style preferences.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Form Buttons */}
      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => {
            // Reset form to original values
            if (measurements) {
              setFormData({
                chest: measurements.chest ?? "",
                waist: measurements.waist ?? "",
                hips: measurements.hips ?? "",
                length: measurements.length ?? "",
                inseam: measurements.inseam ?? "",
                shoulders: measurements.shoulders ?? "",
                neck: measurements.neck ?? "",
                sleeve_length: measurements.sleeve_length ?? "",
                bicep: measurements.bicep ?? "",
                forearm: measurements.forearm ?? "",
                wrist: measurements.wrist ?? "",
                back_width: measurements.back_width ?? "",
                thigh: measurements.thigh ?? "",
                knee: measurements.knee ?? "",
                calf: measurements.calf ?? "",
                ankle: measurements.ankle ?? "",
                height: measurements.height ?? "",
                fit_preference: measurements.fit_preference ?? "",
              });
            } else {
              // Reset to empty values if no measurements
              setFormData({
                chest: "",
                waist: "",
                hips: "",
                length: "",
                inseam: "",
                shoulders: "",
                neck: "",
                sleeve_length: "",
                bicep: "",
                forearm: "",
                wrist: "",
                back_width: "",
                thigh: "",
                knee: "",
                calf: "",
                ankle: "",
                height: "",
                fit_preference: "",
              });
            }
            setMessage({ text: "", type: "" });
          }}
          className="rounded-lg border border-emerald-700/30 bg-emerald-900/50 px-4 py-2 text-sm font-medium text-emerald-100 hover:bg-emerald-800/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:ring-offset-2 focus:ring-offset-emerald-950/50 transition-all"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-emerald-900/30 hover:shadow-emerald-800/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:ring-offset-2 focus:ring-offset-emerald-950/50 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Save Measurements
            </>
          )}
        </button>
      </div>
    </form>
  );
}