// src/app/admin/orders/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "~/utils/supabase/server";
import { auth, type User } from "~/lib/auth";
import { headers } from "next/headers";
import { Suspense } from "react";
import AdminCommissionsTable from "./_components/AdminCommissionsTable";
import InstagramSyncButton from "./_components/InstagramSyncButton";

export const metadata = {
  title: "Admin Dashboard | Calayo Clothing",
  description: "Manage all commission orders",
};

// Simple loading state component
function LoadingCommissions() {
  return (
    <div className="animate-pulse">
      <div className="mb-6 flex items-center justify-between">
        <div className="h-8 w-48 rounded bg-emerald-900/50"></div>
      </div>
      <div className="rounded-lg border border-emerald-700/20 bg-gradient-to-br from-emerald-900/30 to-emerald-950/80 p-6 shadow-2xl backdrop-blur-sm">
        <div className="mb-4 h-6 w-48 rounded bg-emerald-900/50"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
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

export default async function AdminOrdersPage() {
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

  // Fetch all commissions and join with user table
  const { data: commissionsData, error: commissionsError } = await supabase
    .from("commissions")
    .select(
      `
      *,
      commission_measurements(*),
      user:user_id(name, email)
    `,
    )
    .order("created_at", { ascending: false });

  if (commissionsError) {
    console.error("Error fetching commissions:", commissionsError);
  }

  const commissions = commissionsData ?? [];

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<LoadingCommissions />}>
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <span className="inline-flex items-center rounded-md border border-purple-700/30 bg-purple-900/50 px-3 py-1 text-sm font-medium text-purple-200">
              Admin Access
            </span>
          </div>

          <div className="mb-6">
            <InstagramSyncButton />
          </div>

          <AdminCommissionsTable commissions={commissions} />
        </Suspense>
      </div>
    </main>
  );
}
