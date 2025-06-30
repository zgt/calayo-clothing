// src/app/profile/page.tsx - Updated version
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "~/utils/supabase/server";
import ProfileSection from "./_components/ProfileSection";

type Profile = {
  id: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  website?: string | null;
  location?: string | null;
  phone?: string | null;
};

export type ProfileMeasurements = {
  id: string;
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
};

type SupabaseError = {
  code: string;
  message: string;
  details?: string;
  hint?: string;
};

function LoadingProfile() {
  return (
    <div className="animate-pulse">
      <div className="mb-6 flex items-center justify-between">
        <div className="h-8 w-48 rounded bg-emerald-900/50"></div>
        <div className="h-10 w-32 rounded bg-emerald-900/50"></div>
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="rounded-lg bg-gradient-to-br from-emerald-900/30 to-emerald-950/80 backdrop-blur-sm p-6 shadow-2xl border border-emerald-700/20">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 h-24 w-24 rounded-full bg-emerald-900/50"></div>
            <div className="mx-auto mb-2 h-6 w-32 rounded bg-emerald-900/50"></div>
            <div className="mx-auto h-4 w-48 rounded bg-emerald-900/50"></div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 w-20 rounded bg-emerald-900/50"></div>
                <div className="h-4 w-32 rounded bg-emerald-900/50"></div>
              </div>
            ))}
          </div>
        </div>
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-lg bg-gradient-to-br from-emerald-900/30 to-emerald-950/80 backdrop-blur-sm p-6 shadow-2xl border border-emerald-700/20">
            <div className="mb-4 h-6 w-48 rounded bg-emerald-900/50"></div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-md border border-emerald-700/30 p-3">
                  <div className="mb-2 h-4 w-24 rounded bg-emerald-900/50"></div>
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="flex justify-between">
                        <div className="h-4 w-16 rounded bg-emerald-900/50"></div>
                        <div className="h-4 w-12 rounded bg-emerald-900/50"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg bg-gradient-to-br from-emerald-900/30 to-emerald-950/80 backdrop-blur-sm p-6 shadow-2xl border border-emerald-700/20">
            <div className="mb-4 h-6 w-32 rounded bg-emerald-900/50"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 w-full rounded bg-emerald-900/50"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function ProfilePage() {
  const supabase = await createClient();
  
  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    // Redirect to login if not authenticated
    redirect("/login");
  }
  
  // Fetch user profile
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single() as { data: Profile | null; error: SupabaseError | null };
  
  if (profileError && profileError.code !== "PGRST116") {
    console.error("Error fetching profile:", profileError);
  }
  
  // Fetch user measurements from the new profile_measurements table
  const { data: measurementsData, error: measurementsError } = await supabase
    .from("profile_measurements")
    .select("*")
    .eq("profile_id", user.id)
    .single() as { data: ProfileMeasurements | null; error: SupabaseError | null };
  
  if (measurementsError && measurementsError.code !== "PGRST116") {
    console.error("Error fetching measurements:", measurementsError);
  }

  // Create profile and measurements objects for display
  const profile: Profile | null = profileData ? {
    ...profileData,
    email: user.email ?? "",
  } : null;
  
  const measurements: ProfileMeasurements | null = measurementsData ?? null;
  console.log(measurements);
  
  return (
    <main className="min-h-screen ">
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<LoadingProfile />}>
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">My Profile</h1>
          </div>

          <ProfileSection profile={profile} user={user} measurements={measurements} />
        </Suspense>
      </div>
    </main>
  );
}