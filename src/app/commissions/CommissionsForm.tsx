"use client";

import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { motion } from "framer-motion";
import type { User } from "@supabase/supabase-js";
import { useAuth } from "~/context/auth";

// Types
export interface CommissionFormData {
  _id: string;
  status: string;
  garmentType: string;
  measurements: {
    chest: number;
    waist: number;
    hips: number;
    length: number;
    inseam: number;
    shoulders: number;
  };
  budget: string;
  timeline: string;
  details: string;
  user_id: string;
}

interface UserMeasurements {
  chest?: number;
  waist?: number;
  hips?: number;
  length?: number;
  inseam?: number;
  shoulders?: number;
}

type SupabaseError = {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
};

// Helper function to fetch profile measurements
const fetchProfileMeasurements = async (userId: string): Promise<UserMeasurements> => {
  const supabase = createClientComponentClient();
  console.log("userId", userId);
  
  const { data, error } = await supabase
    .from('profile_measurements')
    .select('*')
    .eq('profile_id', userId)
    .single() as { data: UserMeasurements | null; error: SupabaseError | null };
    
  console.log("data", data);
    
  if (error) {
    console.error("Error fetching measurements:", error);
    throw new Error(error.message);
  }
  
  return data ?? {};
};

export default function Commissions() {
  const { user } = useAuth();
  const supabase = createClientComponentClient();
  const router = useRouter();
  
  const [formData, setFormData] = useState<CommissionFormData>({
    _id: "",
    status: "",
    garmentType: "",
    measurements: {
      chest: 0,
      waist: 0,
      hips: 0,
      length: 0,
      inseam: 0,
      shoulders: 0
    },
    budget: "",
    timeline: "",
    details: "",
    user_id: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMeasurements, setIsLoadingMeasurements] = useState(false);

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
      const measurements = await fetchProfileMeasurements(userId);
      
      if (!measurements || Object.keys(measurements).length === 0) {
        toast("No saved measurements found in your profile");
        return;
      }
      
      // Update form with measurements from profile
      setFormData(prev => ({
        ...prev,
        measurements: {
          chest: measurements.chest ?? prev.measurements.chest,
          waist: measurements.waist ?? prev.measurements.waist,
          hips: measurements.hips ?? prev.measurements.hips,
          length: measurements.length ?? prev.measurements.length,
          inseam: measurements.inseam ?? prev.measurements.inseam,
          shoulders: measurements.shoulders ?? prev.measurements.shoulders
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

  // Function to submit commission to Supabase
  const submitCommission = async (data: CommissionFormData) => {
    // First, check if user is authenticated
    if (!user) {
      toast.error("You must be logged in to submit a commission request");
      router.push("/login");
      return null;
    }
    
    try {
      // Format the data for PostgreSQL
      const submissionData = {
        status: "Pending",
        garment_type: data.garmentType,
        measurements: data.measurements, // Using JSONB column in PostgreSQL
        budget: data.budget,
        timeline: data.timeline,
        details: data.details,
        user_id: user.id
      };
      
      // Insert into the commissions table
      const { data: insertedData, error } = await supabase
        .from('commissions')
        .insert(submissionData)
        .select('id')
        .single();
        
      if (error) {
        console.error("Supabase error:", error);
        throw new Error(error.message);
      }
      
      return insertedData;
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

    // Validate measurements based on garment type
    const garmentType = formData.garmentType;
    const measurements = formData.measurements;

    if (garmentType === "shirt" || garmentType === "jacket") {
      if (!measurements.chest || measurements.chest <= 0) {
        newErrors["measurements.chest"] = "Required";
      }
      if (!measurements.shoulders || measurements.shoulders <= 0) {
        newErrors["measurements.shoulders"] = "Required";
      }
    } else if (garmentType === "pants") {
      if (!measurements.waist || measurements.waist <= 0) {
        newErrors["measurements.waist"] = "Required";
      }
      if (!measurements.hips || measurements.hips <= 0) {
        newErrors["measurements.hips"] = "Required";
      }
      if (!measurements.length || measurements.length <= 0) {
        newErrors["measurements.length"] = "Required";
      }
      if (!measurements.inseam || measurements.inseam <= 0) {
        newErrors["measurements.inseam"] = "Required";
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
          _id: "",
          status: "",
          garmentType: "",
          measurements: {
            chest: 0,
            waist: 0,
            hips: 0,
            length: 0,
            inseam: 0,
            shoulders: 0
          },
          budget: "",
          timeline: "",
          details: "",
          user_id: ""
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
      const measurement = name.split(".")[1] as keyof typeof formData.measurements;
      setFormData({
        ...formData,
        measurements: {
          ...formData.measurements,
          [measurement]: parseFloat(value) || 0
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSelectChange = (value: string, field: keyof CommissionFormData) => {
    if (field === "garmentType") {
      // Reset measurements when garment type changes
      setFormData({
        ...formData,
        garmentType: value,
        measurements: {
          chest: 0,
          waist: 0,
          hips: 0,
          length: 0,
          inseam: 0,
          shoulders: 0
        }
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

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-950 to-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Chest */}
                <div>
                  <label htmlFor="chest" className="block text-emerald-200/80 text-xs mb-1">Chest</label>
                  <input
                    id="chest"
                    name="measurements.chest"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.measurements.chest}
                    onChange={handleInputChange}
                    onKeyDown={handleNumberInput}
                    disabled={formData.garmentType === "pants"}
                    className={`w-full pl-3 pr-3 py-2 bg-emerald-950/50 border ${errors["measurements.chest"] ? "border-red-500" : "border-emerald-700/30"} rounded-lg shadow-sm text-emerald-100 placeholder:text-emerald-600/50 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                    placeholder="0.0"
                  />
                  {errors["measurements.chest"] && (
                    <p className="text-red-400 text-xs mt-1">{errors["measurements.chest"]}</p>
                  )}
                </div>
                
                {/* Shoulders */}
                <div>
                  <label htmlFor="shoulders" className="block text-emerald-200/80 text-xs mb-1">Shoulders</label>
                  <input
                    id="shoulders"
                    name="measurements.shoulders"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.measurements.shoulders}
                    onChange={handleInputChange}
                    onKeyDown={handleNumberInput}
                    disabled={formData.garmentType === "pants"}
                    className={`w-full pl-3 pr-3 py-2 bg-emerald-950/50 border ${errors["measurements.shoulders"] ? "border-red-500" : "border-emerald-700/30"} rounded-lg shadow-sm text-emerald-100 placeholder:text-emerald-600/50 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                    placeholder="0.0"
                  />
                  {errors["measurements.shoulders"] && (
                    <p className="text-red-400 text-xs mt-1">{errors["measurements.shoulders"]}</p>
                  )}
                </div>
                
                {/* Waist */}
                <div>
                  <label htmlFor="waist" className="block text-emerald-200/80 text-xs mb-1">Waist</label>
                  <input
                    id="waist"
                    name="measurements.waist"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.measurements.waist}
                    onChange={handleInputChange}
                    onKeyDown={handleNumberInput}
                    disabled={formData.garmentType === "shirt" || formData.garmentType === "jacket"}
                    className={`w-full pl-3 pr-3 py-2 bg-emerald-950/50 border ${errors["measurements.waist"] ? "border-red-500" : "border-emerald-700/30"} rounded-lg shadow-sm text-emerald-100 placeholder:text-emerald-600/50 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                    placeholder="0.0"
                  />
                  {errors["measurements.waist"] && (
                    <p className="text-red-400 text-xs mt-1">{errors["measurements.waist"]}</p>
                  )}
                </div>
                
                {/* Hips */}
                <div>
                  <label htmlFor="hips" className="block text-emerald-200/80 text-xs mb-1">Hips</label>
                  <input
                    id="hips"
                    name="measurements.hips"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.measurements.hips}
                    onChange={handleInputChange}
                    onKeyDown={handleNumberInput}
                    disabled={formData.garmentType === "shirt" || formData.garmentType === "jacket"}
                    className={`w-full pl-3 pr-3 py-2 bg-emerald-950/50 border ${errors["measurements.hips"] ? "border-red-500" : "border-emerald-700/30"} rounded-lg shadow-sm text-emerald-100 placeholder:text-emerald-600/50 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                    placeholder="0.0"
                  />
                  {errors["measurements.hips"] && (
                    <p className="text-red-400 text-xs mt-1">{errors["measurements.hips"]}</p>
                  )}
                </div>
                
                {/* Length */}
                <div>
                  <label htmlFor="length" className="block text-emerald-200/80 text-xs mb-1">Length</label>
                  <input
                    id="length"
                    name="measurements.length"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.measurements.length}
                    onChange={handleInputChange}
                    onKeyDown={handleNumberInput}
                    disabled={formData.garmentType === "shirt" || formData.garmentType === "jacket"}
                    className={`w-full pl-3 pr-3 py-2 bg-emerald-950/50 border ${errors["measurements.length"] ? "border-red-500" : "border-emerald-700/30"} rounded-lg shadow-sm text-emerald-100 placeholder:text-emerald-600/50 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                    placeholder="0.0"
                  />
                  {errors["measurements.length"] && (
                    <p className="text-red-400 text-xs mt-1">{errors["measurements.length"]}</p>
                  )}
                </div>
                
                {/* Inseam */}
                <div>
                  <label htmlFor="inseam" className="block text-emerald-200/80 text-xs mb-1">Inseam</label>
                  <input
                    id="inseam"
                    name="measurements.inseam"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.measurements.inseam}
                    onChange={handleInputChange}
                    onKeyDown={handleNumberInput}
                    disabled={formData.garmentType === "shirt" || formData.garmentType === "jacket"}
                    className={`w-full pl-3 pr-3 py-2 bg-emerald-950/50 border ${errors["measurements.inseam"] ? "border-red-500" : "border-emerald-700/30"} rounded-lg shadow-sm text-emerald-100 placeholder:text-emerald-600/50 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                    placeholder="0.0"
                  />
                  {errors["measurements.inseam"] && (
                    <p className="text-red-400 text-xs mt-1">{errors["measurements.inseam"]}</p>
                  )}
                </div>
              </div>
            </div>

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