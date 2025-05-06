// app/api/commissions/route.ts

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

interface CommissionRequest {
  status?: string;
  garmentType: string;
  measurements: {
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
    thigh?: number | null;
    knee?: number | null;
    calf?: number | null;
    ankle?: number | null;
  };
  budget: string;
  timeline: string;
  details: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
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
      status: requestData.status ?? "Pending",
      garment_type: requestData.garmentType,
      budget: requestData.budget,
      timeline: requestData.timeline,
      details: requestData.details,
      user_id: session.user.id
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
      .single();
      
    if (commissionError) {
      console.error("Supabase error inserting commission:", commissionError);
      return NextResponse.json(
        { error: commissionError.message },
        { status: 500 }
      );
    }
    
    // Now insert the measurements linked to the commission
    const measurementsData = {
      commission_id: commission.id,
      ...Object.entries(requestData.measurements).reduce((acc, [key, value]) => {
        // Convert any empty strings to null
        acc[key] = value === "" ? null : value;
        return acc;
      }, {} as Record<string, any>)
    };
    
    const { error: measurementsError } = await supabase
      .from('commission_measurements')
      .insert(measurementsData);
      
    if (measurementsError) {
      console.error("Supabase error inserting measurements:", measurementsError);
      
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
    console.error("Error submitting commission:", error);
    const errorMessage = error instanceof Error ? error.message : "An error occurred processing your request";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}