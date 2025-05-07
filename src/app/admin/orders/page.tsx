// src/app/admin/orders/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "~/utils/supabase/server";
import { Suspense } from "react";
import AdminCommissionsTable from "./_components/AdminCommissionsTable";

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
      <div className="rounded-lg bg-gradient-to-br from-emerald-900/30 to-emerald-950/80 backdrop-blur-sm p-6 shadow-2xl border border-emerald-700/20">
        <div className="mb-4 h-6 w-48 rounded bg-emerald-900/50"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 w-full rounded bg-emerald-900/50"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  
  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    // Redirect to login if not authenticated
    redirect("/login");
  }
  
  // Check if user is admin
  const adminId = process.env.NEXT_PUBLIC_ADMIN_ID;
  if (user.id !== adminId) {
    // Redirect to home if not admin
    redirect("/");
  }
  
  // Fetch all commissions and join with user profiles
  const { data: commissionsData, error: commissionsError } = await supabase
    .from("commissions")
    .select(`
      *,
      commission_measurements(*),
      profiles:user_id(full_name, email)
    `)
    .order("created_at", { ascending: false });
    
  if (commissionsError) {
    console.error("Error fetching commissions:", commissionsError);
  }

  const commissions = commissionsData ?? [];
  
  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-950 to-gray-950">
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<LoadingCommissions />}>
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-purple-900/50 text-purple-200 border border-purple-700/30">
              Admin Access
            </span>
          </div>

          <AdminCommissionsTable commissions={commissions} />
        </Suspense>
      </div>
    </main>
  );
}