import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { cache } from "react";
import type { SupabaseClient, PostgrestError } from "@supabase/supabase-js";
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
export const fetchProfileMeasurements = cache(async (userId: string): Promise<UserMeasurements> => {
  const supabase = createServerComponentClient<Database>({ cookies });
  
  const { data, error } = await supabase
    .from('profiles')
    .select('measurements')
    .eq('id', userId)
    .single();
    
  if (error) {
    console.error("Error fetching measurements:", error);
    throw error;
  }
  
  return data?.measurements as UserMeasurements ?? {};
});

// Non-cached version for API routes
export async function fetchProfileMeasurementsForAPI(
  userId: string,
  supabase: SupabaseClient<Database>
): Promise<UserMeasurements> {
  const { data, error } = await supabase
    .from('profiles')
    .select('measurements')
    .eq('id', userId)
    .single();
    
  if (error) {
    console.error("Error fetching measurements:", error);
    throw error;
  }
  
  return data?.measurements as UserMeasurements ?? {};
}