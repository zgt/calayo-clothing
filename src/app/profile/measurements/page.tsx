// src/app/profile/measurements/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";

import { createClient } from "~/utils/supabase/server";
import MeasurementsForm from "./_components/MeasurementsForm";
import type { Database } from "~/types/supabase";

type Profile = {
  id: string;
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

// Default empty profile with all fields set to null
const emptyProfile: Omit<Profile, 'id'> = {
  // Basic measurements
  chest: null,
  waist: null,
  hips: null,
  length: null,
  inseam: null,
  shoulders: null,
  // Additional upper body
  neck: null,
  sleeve_length: null,
  bicep: null,
  forearm: null,
  wrist: null,
  armhole_depth: null,
  back_width: null,
  front_chest_width: null,
  // Additional lower body
  thigh: null,
  knee: null,
  calf: null,
  ankle: null,
  rise: null,
  outseam: null,
  // Full body
  height: null,
  weight: null,
  // Formal wear
  torso_length: null,
  shoulder_slope: null,
  posture: null,
  // Preferences
  size_preference: null,
  fit_preference: null,
};

export default async function MeasurementsPage() {
  const supabase = await createClient();
  
  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    // Redirect to login if not authenticated
    redirect("/login");
  }
  
  // Fetch user profile with measurements
  const { data: dbProfile, error: profileError }: PostgrestSingleResponse<Database["public"]["Tables"]["profiles"]["Row"]> = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  
  if (profileError && profileError.code !== "PGRST116") {
    console.error("Error fetching profile:", profileError);
  }

  // Transform the database profile into the format expected by MeasurementsForm
  const profile: Profile | null = dbProfile ? {
    id: dbProfile.id,
    ...emptyProfile,
    ...(dbProfile.measurements as Record<string, unknown>),
  } as Profile : null;
  
  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-950 to-gray-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">My Measurements</h1>
          <Link 
            href="/profile" 
            className="rounded-md bg-emerald-900/50 px-4 py-2 text-sm font-medium text-emerald-100 hover:bg-emerald-800/50 border border-emerald-700/30"
          >
            Back to Profile
          </Link>
        </div>
        
        <div className="mx-auto max-w-3xl">
          <div className="rounded-lg bg-gradient-to-br from-emerald-900/30 to-emerald-950/80 backdrop-blur-sm p-6 shadow-2xl border border-emerald-700/20">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white">Update Your Measurements</h2>
              <p className="mt-1 text-sm text-emerald-200/70">
                Accurate measurements help us create perfectly fitting garments for you.
                Enter your measurements in inches.
              </p>
            </div>
            
            <MeasurementsForm profile={profile} userId={user.id} />
          </div>
          
          <div className="mt-6 rounded-lg bg-gradient-to-br from-emerald-900/30 to-emerald-950/80 backdrop-blur-sm p-6 shadow-2xl border border-emerald-700/20">
            <h2 className="mb-4 text-xl font-semibold text-white">Measurement Guide</h2>
            
            <div className="space-y-4">
              <MeasurementGuideItem 
                title="Chest" 
                description="Measure around the fullest part of your chest, keeping the tape measure parallel to the floor."
              />
              
              <MeasurementGuideItem 
                title="Waist" 
                description="Measure around your natural waistline, which is the narrowest part of your torso."
              />
              
              <MeasurementGuideItem 
                title="Hips" 
                description="Measure around the fullest part of your hips and buttocks."
              />
              
              <MeasurementGuideItem 
                title="Shoulders" 
                description="Measure across your back from the edge of one shoulder to the edge of the other shoulder."
              />
              
              <MeasurementGuideItem 
                title="Sleeve Length" 
                description="Measure from the edge of your shoulder to your wrist with your arm slightly bent."
              />
              
              <MeasurementGuideItem 
                title="Inseam" 
                description="Measure from the crotch to the bottom of the ankle along the inside of your leg."
              />
              
              <div className="rounded-md bg-emerald-900/50 p-4 border border-emerald-700/30">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-emerald-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-emerald-200">Measurement tips:</h3>
                    <div className="mt-2 text-sm text-emerald-200/70">
                      <ul className="list-disc space-y-1 pl-5">
                        <li>Use a fabric measuring tape for accuracy</li>
                        <li>Wear light, fitted clothing when measuring</li>
                        <li>Stand naturally with feet shoulder-width apart</li>
                        <li>Keep the measuring tape snug but not tight</li>
                        <li>For best results, have someone help you measure</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// Helper components
function MeasurementGuideItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="border-b border-emerald-700/30 pb-3">
      <h3 className="text-sm font-medium text-emerald-200">{title}</h3>
      <p className="mt-1 text-sm text-emerald-200/70">{description}</p>
    </div>
  );
}