// app/api/commissions/route.ts

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

interface CommissionRequest {
  status?: string;
  garmentType: string;
  measurements: Record<string, unknown>;
  budget: number;
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
    
    // Format the data for PostgreSQL
    const submissionData = {
      status: requestData.status ?? "Pending",
      garment_type: requestData.garmentType,
      measurements: requestData.measurements,
      budget: requestData.budget,
      timeline: requestData.timeline,
      details: requestData.details,
      user_id: session.user.id
    };
    
    // Validate required fields
    if (!submissionData.garment_type || !submissionData.budget || 
        !submissionData.timeline || !submissionData.details) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Insert into the commissions table
    const { data, error } = await supabase
      .from('commissions')
      .insert(submissionData)
      .select('id')
      .single();
      
    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Commission submitted successfully",
      data 
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