import { createClient } from "~/utils/supabase/server";
import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../types/supabase";

type ProfileMeasurementsRow =
  Database["public"]["Tables"]["profile_measurements"]["Row"];

export interface UserMeasurements {
  chest?: number;
  waist?: number;
  hips?: number;
  length?: number;
  inseam?: number;
  shoulders?: number;
}

// Cached version for server components
export const fetchProfileMeasurements = cache(
  async (userId: string): Promise<UserMeasurements> => {
    const supabase = await createClient();

    const result = await supabase
      .from("profile_measurements")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (result.error) {
      console.error("Error fetching measurements:", result.error);
      return {};
    }

    const data = result.data as ProfileMeasurementsRow | null;
    return data ? (data as UserMeasurements) : {};
  },
);

// Non-cached version for API routes
export async function fetchProfileMeasurementsForAPI(
  userId: string,
  supabase: SupabaseClient<Database>,
): Promise<UserMeasurements> {
  const result = await supabase
    .from("profile_measurements")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (result.error) {
    console.error("Error fetching measurements:", result.error);
    return {};
  }

  const data = result.data as ProfileMeasurementsRow | null;
  return data ? (data as UserMeasurements) : {};
}
