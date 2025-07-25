// src/app/profile/orders/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "~/utils/supabase/server";
import { auth } from "~/lib/auth";
import { headers } from "next/headers";
import { Suspense } from "react";
import CommissionsList from "./_components/CommissionsList";

export const metadata = {
  title: "My Commissions | Calayo Clothing",
  description: "View and manage your custom clothing commissions",
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

function LoadingCommissions() {
  return (
    <div className="animate-pulse">
      <div className="mb-6 flex items-center justify-between">
        <div className="h-8 w-48 rounded bg-emerald-900/50"></div>
      </div>
      <div className="rounded-lg border border-emerald-700/10 bg-gradient-to-br from-emerald-900/20 to-emerald-950/30 p-6 shadow-2xl backdrop-blur-xs">
        <div className="mb-4 h-6 w-48 rounded bg-emerald-900/50"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 w-full rounded bg-emerald-900/50"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function OrdersPage() {
  // Check authentication using Better-Auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    // Redirect to login if not authenticated
    redirect("/login");
  }

  const supabase = await createClient();

  // Fetch user commissions
  const { data: commissionsData, error: commissionsError } = await supabase
    .from("commissions")
    .select(
      `
      *,
      commission_measurements(*)
    `,
    )
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })
    .returns<Commission[]>();

  if (commissionsError) {
    console.error("Error fetching commissions:", commissionsError);
  }

  const commissions = commissionsData ?? [];

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<LoadingCommissions />}>
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">My Commissions</h1>
            <a
              href="/commissions"
              className="inline-flex items-center rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-emerald-900/30 transition-all duration-200 hover:from-emerald-500 hover:to-emerald-400 hover:shadow-emerald-800/40"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-2 h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              New Commission
            </a>
          </div>

          <CommissionsList commissions={commissions} />
        </Suspense>
      </div>
    </main>
  );
}
