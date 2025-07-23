import { createClient } from "~/utils/supabase/server";
import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../types/supabase";

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

    const response = await supabase
      .from("profile_measurements")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (response.error) {
      console.error("Error fetching measurements:", response.error);
      throw response.error;
    }

    return response.data ? (response.data as UserMeasurements) : {};
  },
);

// Non-cached version for API routes
export async function fetchProfileMeasurementsForAPI(
  userId: string,
  supabase: SupabaseClient<Database>,
): Promise<UserMeasurements> {
  const response = await supabase
    .from("profile_measurements")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (response.error) {
    console.error("Error fetching measurements:", response.error);
    throw response.error;
  }

  return response.data ? (response.data as UserMeasurements) : {};
}
