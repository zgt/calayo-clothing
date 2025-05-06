// app/api/commissions/route.ts

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "~/utils/supabase/server";
import crypto from "crypto";

interface CommissionRequest {
  garmentType: string;
  measurements: {
    // Basic measurements (original)
    chest?: number | null;
    waist?: number | null;
    hips?: number | null;
    length?: number | null;
    inseam?: number | null;
    shoulders?: number | null;
    // Additional measurements (new)
    neck?: number | null;
    sleeve_length?: number | null;
    bicep?: number | null;
    forearm?: number | null;
    wrist?: number | null;
    armhole_depth?: number | null;
    back_width?: number | null;
    front_chest_width?: number | null;
    thigh?: number | null;
    knee?: number | null;
    calf?: number | null;
    ankle?: number | null;
    rise?: number | null;
    outseam?: number | null;
    height?: number | null;
    weight?: number | null;
    torso_length?: number | null;
    shoulder_slope?: number | null;
    posture?: string | null;
  };
  budget: string;
  timeline: string;
  details: string;
}

interface CommissionMeasurements {
  id: string;
  commission_id: string;
  chest?: number | null;
  waist?: number | null;
  hips?: number | null;
  length?: number | null;
  inseam?: number | null;
  shoulders?: number | null;
  neck?: number | null;
  sleeve_length?: number | null;
  bicep?: number | null;
  forearm?: number | null;
  wrist?: number | null;
  armhole_depth?: number | null;
  back_width?: number | null;
  front_chest_width?: number | null;
  thigh?: number | null;
  knee?: number | null;
  calf?: number | null;
  ankle?: number | null;
  rise?: number | null;
  outseam?: number | null;
  height?: number | null;
  weight?: number | null;
  torso_length?: number | null;
  shoulder_slope?: number | null;
  posture?: string | null;
}

interface CommissionResponse {
  id: string;
}

interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

type MeasurementKey = keyof Omit<CommissionMeasurements, 'commission_id'>;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the authorization header
    // const authHeader = request.headers.get('Authorization');
    // if (!authHeader?.startsWith('Bearer ')) {
    //   return NextResponse.json(
    //     { error: "Unauthorized. Please sign in to submit a commission." },
    //     { status: 401 }
    //   );
    // }

    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to submit a commission." },
        { status: 401 }
      );
    }
    
    // Parse request body
    const requestData = await request.json() as CommissionRequest;
    
    // Format the commission data for PostgreSQL (without measurements)
    const commissionData = {
      id: crypto.randomUUID(), // Generate a UUID for the commission
      status: "Pending",
      garment_type: requestData.garmentType,
      budget: requestData.budget,
      timeline: requestData.timeline,
      details: requestData.details,
      user_id: session.user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Validate required fields
    if (!commissionData.garment_type || !commissionData.budget || 
        !commissionData.timeline || !commissionData.details) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Start a transaction to ensure both operations succeed or fail together
    const { data: commission, error: commissionError } = await supabase
      .from('commissions')
      .insert(commissionData)
      .select('id')
      .single() as { data: CommissionResponse | null, error: SupabaseError | null };
      
    if (commissionError) {
      return NextResponse.json(
        { error: commissionError.message },
        { status: 500 }
      );
    }
    
    if (!commission) {
      return NextResponse.json(
        { error: "Failed to create commission" },
        { status: 500 }
      );
    }
    
    const measurementsId = crypto.randomUUID()
    
    // Now insert the measurements linked to the commission
    const measurementsFields = Object.entries(requestData.measurements || {})
      .filter(([key]) => key !== 'profile_id' && key !== 'id') // Filter out profile_id and id
      .reduce((acc, [key, value]) => {
        const measurementKey = key as MeasurementKey;
        
        if (measurementKey === 'posture') {
          acc[measurementKey] = value as string | null;
        } else {
          const numValue = value === "" ? null : Number(value);
          if (numValue !== null) {
            acc[measurementKey] = numValue;
          }
        }
        
        return acc;
      }, {} as Record<MeasurementKey, number | string | null>);

    // Create the final data object with dates set after spreading the fields
    const measurementsData = {
      ...measurementsFields,
      id: measurementsId,
      commission_id: commission.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { error: measurementsError } = await supabase
      .from('commission_measurements')
      .insert(measurementsData);
      
    if (measurementsError) {
      // If measurements insertion fails, try to delete the commission to maintain consistency
      await supabase.from('commissions').delete().eq('id', commission.id);
      
      return NextResponse.json(
        { error: measurementsError.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Commission submitted successfully",
      data: commission
    });
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An error occurred processing your request";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}