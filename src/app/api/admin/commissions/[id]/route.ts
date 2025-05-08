// src/app/api/admin/commissions/[id]/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "~/utils/supabase/server";

type CommissionStatus = 'pending' | 'approved' | 'in progress' | 'ready' | 'completed' | 'cancelled';

type UpdateCommissionBody = {
  status: CommissionStatus;
};

type CommissionResponse = {
  id: string;
  status: CommissionStatus;
  updated_at: string;
  garment_type: string;
  budget: string;
  timeline: string;
  details: string | null;
  created_at: string;
  user_id: string;
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

type Profile = {
  full_name: string | null;
  email: string | null;
};

type CommissionDetails = {
  id: string;
  status: CommissionStatus;
  user_id: string;
  garment_type: string;
  budget: string;
  timeline: string;
  details: string | null;
  created_at: string;
  updated_at: string;
  commission_measurements: CommissionMeasurements | null;
  profiles: Profile;
};

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    console.log('here in patch')
    const supabase = await createClient();
    const params = await context.params;
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }
    
    // Check if user is admin
    const adminId = process.env.NEXT_PUBLIC_ADMIN_ID;
    if (user.id !== adminId) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await request.json() as UpdateCommissionBody;
    const { status } = body;
    console.log(status);
    
    // Validate status
    const validStatuses: CommissionStatus[] = ['pending', 'approved', 'in progress', 'ready', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status.toLowerCase() as CommissionStatus)) {
      return NextResponse.json(
        { error: "Invalid status provided" },
        { status: 400 }
      );
    }
    
    // Update commission status
    const { data, error } = await supabase
      .from('commissions')
      .update({ 
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .returns<CommissionResponse[]>();
      
    if (error) {
      console.error("Error updating commission:", error);
      return NextResponse.json(
        { error: "Failed to update commission status" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: "Commission status updated successfully",
      data
    });
    
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const params = await context.params;
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }
    
    // Check if user is admin
    const adminId = process.env.NEXT_PUBLIC_ADMIN_ID;
    if (user.id !== adminId) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }
    
    // Fetch commission details
    const { data, error } = await supabase
      .from('commissions')
      .select(`
        *,
        commission_measurements(*),
        profiles:user_id(full_name, email)
      `)
      .eq('id', params.id)
      .single<CommissionDetails>();
      
    if (error) {
      console.error("Error fetching commission:", error);
      return NextResponse.json(
        { error: "Failed to fetch commission details" },
        { status: 500 }
      );
    }
    
    if (!data) {
      return NextResponse.json(
        { error: "Commission not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data
    });
    
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}