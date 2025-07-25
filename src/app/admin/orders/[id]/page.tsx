// src/app/admin/orders/[id]/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "~/utils/supabase/server";
import { auth, type User } from "~/lib/auth";
import { headers } from "next/headers";
import { Suspense } from "react";
import AdminCommissionDetails from "./_components/AdminCommissionDetails";

export const metadata = {
  title: "Admin Commission Details | Calayo Clothing",
  description: "View and manage customer commission details",
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

type CommissionUser = {
  name: string | null;
  email: string | null;
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
  user: CommissionUser;
};

// Simple loading skeleton
function LoadingDetails() {
  return (
    <div className="animate-pulse">
      <div className="mb-6 flex items-center justify-between">
        <div className="h-8 w-48 rounded bg-emerald-900/50"></div>
        <div className="h-8 w-24 rounded bg-emerald-900/50"></div>
      </div>
      <div className="rounded-lg border border-emerald-700/20 bg-gradient-to-br from-emerald-900/30 to-emerald-950/80 p-6 shadow-2xl backdrop-blur-sm">
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

export default async function AdminCommissionDetailsPage(props: {
  params: paramsType;
}) {
  const params = await props.params;

  // Check authentication using Better-Auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    // Redirect to login if not authenticated
    redirect("/login");
  }

  // Check if user is admin using role field
  const user = session.user as User;
  if (user.role !== "admin") {
    // Redirect to home if not admin
    redirect("/");
  }

  const supabase = await createClient();

  // Fetch commission details
  const { data: commission, error: commissionError } = await supabase
    .from("commissions")
    .select(
      `
      *,
      commission_measurements(*),
      user:user_id(name, email)
    `,
    )
    .eq("id", params.id)
    .single<Commission>();

  if (commissionError) {
    console.error("Error fetching commission:", commissionError);
    // Redirect to admin orders page if commission not found
    redirect("/admin/orders");
  }

  if (!commission) {
    // Redirect to admin orders page if commission not found
    redirect("/admin/orders");
  }

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<LoadingDetails />}>
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">
              Commission Details{" "}
              <span className="text-purple-400">(Admin)</span>
            </h1>
            <Link
              href="/admin/orders"
              className="rounded-md border border-emerald-700/30 bg-emerald-900/50 px-4 py-2 text-sm font-medium text-emerald-100 hover:bg-emerald-800/50"
            >
              Back to Admin Dashboard
            </Link>
          </div>

          <AdminCommissionDetails commission={commission} />
        </Suspense>
      </div>
    </main>
  );
}
