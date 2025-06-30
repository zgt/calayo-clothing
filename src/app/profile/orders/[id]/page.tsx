// src/app/profile/orders/[id]/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "~/utils/supabase/server";
import { Suspense } from "react";
import CommissionDetails from "./_components/CommissionDetails";

export const metadata = {
  title: "Commission Details | Calayo Clothing",
  description: "View the details of your custom clothing commission",
};

type CommissionMeasurements = {
  id: string;
  commission_id: string;
  chest: number | null;
  waist: number | null;
  hips: number | null;
  length: number | null;
  inseam: number | null;
  shoulders: number | null;
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

type Commission = {
  id: string;
  status: string;
  garment_type: string;
  budget: string;
  timeline: string;
  details: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  commission_measurements: CommissionMeasurements | null;
};

function LoadingDetails() {
  return (
    <div className="animate-pulse">
      <div className="mb-6 flex items-center justify-between">
        <div className="h-8 w-48 rounded bg-emerald-900/50"></div>
        <div className="h-8 w-24 rounded bg-emerald-900/50"></div>
      </div>
      <div className="rounded-lg bg-gradient-to-br from-emerald-900/30 to-emerald-950/80 backdrop-blur-sm p-6 shadow-2xl border border-emerald-700/20">
        <div className="mb-4 h-6 w-48 rounded bg-emerald-900/50"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 w-full rounded bg-emerald-900/50"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
export type paramsType = Promise<{ id: string }>;

export default async function CommissionDetailsPage( props : { params: paramsType }) {
  const supabase = await createClient();
  const params = await props.params;

  
  
  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    // Redirect to login if not authenticated
    redirect("/login");
  }
  
  // Fetch commission details
  const { data: commission, error: commissionError } = await supabase
    .from("commissions")
    .select(`
      *,
      commission_measurements(*)
    `)
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single<Commission>();
    
  if (commissionError) {
    console.error("Error fetching commission:", commissionError);
    // Redirect to orders page if commission not found
    redirect("/profile/orders");
  }
  
  if (!commission) {
    // Redirect to orders page if commission not found
    redirect("/profile/orders");
  }
  
  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<LoadingDetails />}>
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">Commission Details</h1>
            <Link
              href="/profile/orders"
              className="rounded-md bg-emerald-900/50 px-4 py-2 text-sm font-medium text-emerald-100 hover:bg-emerald-800/50 border border-emerald-700/30"
            >
              Back to Commissions
            </Link>
          </div>

          <CommissionDetails commission={commission} />
        </Suspense>
      </div>
    </main>
  );
}