// src/app/profile/measurements/page.tsx - Updated version
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "~/utils/supabase/server";
import MeasurementsForm from "./_components/MeasurementsForm";
import MeasurementGuide from "./_components/MeasurementGuide";

type ProfileMeasurements = {
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
  [key: string]: unknown;
};

type SupabaseError = {
  code: string;
  message: string;
  details?: string;
  hint?: string;
};

export default async function MeasurementsPage() {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    // Redirect to login if not authenticated
    redirect("/login");
  }

  // Fetch user profile measurements
  const { data: measurements, error: measurementsError } = (await supabase
    .from("profile_measurements")
    .select("*")
    .eq("profile_id", user.id)
    .single()) as {
    data: ProfileMeasurements | null;
    error: SupabaseError | null;
  };

  if (measurementsError && measurementsError.code !== "PGRST116") {
    console.error("Error fetching measurements:", measurementsError);
  }

  // Create measurements object
  const profileMeasurements: ProfileMeasurements | null = measurements ?? null;

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">My Measurements</h1>
          <Link
            href="/profile"
            className="rounded-md border border-emerald-700/30 bg-emerald-900/50 px-4 py-2 text-sm font-medium text-emerald-100 hover:bg-emerald-800/50"
          >
            Back to Profile
          </Link>
        </div>

        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-emerald-700/20 bg-gradient-to-br from-emerald-900/30 to-emerald-950/80 p-6 shadow-2xl backdrop-blur-sm">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-white">
                  Update Your Measurements
                </h2>
                <p className="mt-1 text-sm text-emerald-200/70">
                  Accurate measurements help us create perfectly fitting
                  garments for you. Enter your measurements in inches.
                </p>
              </div>

              <MeasurementsForm
                measurements={profileMeasurements}
                userId={user.id}
              />
            </div>

            <MeasurementGuide />
          </div>
        </div>
      </div>
    </main>
  );
}
