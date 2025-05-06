// src/app/profile/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";

import { createClient } from "~/utils/supabase/server";
import ProfileForm from "./_components/ProfileForm";
import type { Database } from "~/types/supabase";

type Profile = {
  id: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  website?: string | null;
  location?: string | null;
  phone?: string | null;
  // Measurements
  chest?: number | null;
  waist?: number | null;
  hips?: number | null;
  length?: number | null;
  inseam?: number | null;
  shoulders?: number | null;
  neck?: number | null;
  sleeve_length?: number | null;
  bicep?: number | null;
  wrist?: number | null;
  thigh?: number | null;
  knee?: number | null;
  calf?: number | null;
  ankle?: number | null;
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
  console.log("User:", user);
  
  // Fetch user profile
  const { data: profileData, error: profileError }: PostgrestSingleResponse<Database["public"]["Tables"]["profiles"]["Row"]> = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  console.log("Profile data:", profileData);
  
  if (profileError && profileError.code !== "PGRST116") {
    console.error("Error fetching profile:", profileError);
  }

  // Transform the profile data to match the expected type
  const profile: Profile | null = profileData ? {
    ...profileData,
    email: user.email ?? "",
  } : null;
  
  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-950 to-gray-950">
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<LoadingProfile />}>
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">My Profile</h1>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Left Column - User Info */}
            <div className="rounded-lg bg-gradient-to-br from-emerald-900/30 to-emerald-950/80 backdrop-blur-sm p-4 shadow-2xl border border-emerald-700/20">
              <div className="mb-4 text-center">
                <div className="mx-auto mb-3 h-20 w-20 overflow-hidden rounded-full bg-emerald-900/50">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={`${profile.full_name ?? 'User'}'s avatar`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl text-emerald-200">
                      {profile?.full_name?.charAt(0) ?? user.email?.charAt(0)}
                    </div>
                  )}
                </div>
                <h2 className="text-xl font-semibold text-white">{profile?.full_name ?? "New User"}</h2>
                <p className="text-sm text-emerald-200/70">{user.email}</p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium text-emerald-200/70">Location:</span>
                  <span className="text-white">{profile?.location ?? "Not specified"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-emerald-200/70">Phone:</span>
                  <span className="text-white">{profile?.phone ?? "Not specified"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-emerald-200/70">Website:</span>
                  <span className="text-white">{profile?.website ?? "Not specified"}</span>
                </div>
                <div className="border-t border-emerald-700/30 pt-3">
                  <span className="block font-medium text-emerald-200/70">Bio:</span>
                  <p className="mt-1 text-white">{profile?.bio ?? "No bio provided."}</p>
                </div>
              </div>
            </div>

            {/* Center/Right Columns - Measurements & Form */}
            <div className="md:col-span-2">
              <div className="mb-6 rounded-lg bg-gradient-to-br from-emerald-900/30 to-emerald-950/80 backdrop-blur-sm p-6 shadow-2xl border border-emerald-700/20">
                <h2 className="mb-4 text-xl font-semibold text-white">Your Measurements</h2>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {/* Basic Measurements */}
                  <MeasurementGroup title="Basic Measurements">
                    <MeasurementItem label="Chest" value={profile?.chest} />
                    <MeasurementItem label="Waist" value={profile?.waist} />
                    <MeasurementItem label="Hips" value={profile?.hips} />
                    <MeasurementItem label="Shoulders" value={profile?.shoulders} />
                    <MeasurementItem label="Length" value={profile?.length} />
                    <MeasurementItem label="Inseam" value={profile?.inseam} />
                  </MeasurementGroup>
                  
                  {/* Upper Body Measurements */}
                  <MeasurementGroup title="Upper Body">
                    <MeasurementItem label="Neck" value={profile?.neck} />
                    <MeasurementItem label="Sleeve" value={profile?.sleeve_length} />
                    <MeasurementItem label="Bicep" value={profile?.bicep} />
                    <MeasurementItem label="Wrist" value={profile?.wrist} />
                  </MeasurementGroup>
                  
                  {/* Lower Body Measurements */}
                  <MeasurementGroup title="Lower Body">
                    <MeasurementItem label="Thigh" value={profile?.thigh} />
                    <MeasurementItem label="Knee" value={profile?.knee} />
                    <MeasurementItem label="Calf" value={profile?.calf} />
                    <MeasurementItem label="Ankle" value={profile?.ankle} />
                  </MeasurementGroup>
                </div>
                
                <div className="mt-4 text-center">
                  <Link 
                    href="/profile/measurements" 
                    className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    Update Measurements
                  </Link>
                </div>
              </div>
              
              {/* Profile Form */}
              <div className="rounded-lg bg-gradient-to-br from-emerald-900/30 to-emerald-950/80 backdrop-blur-sm p-6 shadow-2xl border border-emerald-700/20">
                <h2 className="mb-4 text-xl font-semibold text-white">Edit Profile</h2>
                <ProfileForm profile={profile} user={user} />
              </div>
            </div>
          </div>
        </Suspense>
      </div>
    </main>
  );
}

// Helper components for measurements display
function MeasurementGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-emerald-700/30 p-3">
      <h3 className="mb-2 text-sm font-medium text-emerald-200">{title}</h3>
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
}

function MeasurementItem({ label, value }: { label: string; value?: number | null }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-emerald-200/70">{label}:</span>
      <span className="font-medium text-white">
        {value ? `${value} in` : "—"}
      </span>
    </div>
  );
}