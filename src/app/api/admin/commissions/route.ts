// src/app/api/admin/commissions/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "~/utils/supabase/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
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
    const body = await request.json();
    const { status } = body;
    
    // Validate status
    const validStatuses = ['pending', 'approved', 'in progress', 'ready', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status.toLowerCase())) {
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
      .select();
      
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
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
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
      .single();
      
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