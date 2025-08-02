import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../db/dbConfig";
import Emergency from "../../../../../db/schema/emergency.schema";
import User from "../../../../../db/schema/user.schema";
import { getUserByToken } from "../../../../../actions/userActions";

export async function PUT(request) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { emergencyId, updates, token } = body;

    // Verify admin authentication
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Try to get user without specifying userType to handle unified auth
    const userResponse = await getUserByToken(token);
    if (!userResponse.success) {
      return NextResponse.json(
        { success: false, error: "Invalid authentication" },
        { status: 401 }
      );
    }

    // Check if user has admin role
    const user = userResponse.user;
    if (user.role !== "admin" && !user.isAdmin) {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    // Validate emergency ID
    if (!emergencyId) {
      return NextResponse.json(
        { success: false, error: "Emergency ID is required" },
        { status: 400 }
      );
    }

    // Find and update the emergency
    const emergency = await Emergency.findById(emergencyId);
    if (!emergency) {
      return NextResponse.json(
        { success: false, error: "Emergency report not found" },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData = {
      ...updates,
      lastUpdatedBy: user._id,
      updatedAt: new Date()
    };

    // Add admin activity log
    const adminActivity = {
      adminId: user._id,
      adminName: user.name,
      action: `Updated status to ${updates.status || emergency.status}`,
      timestamp: new Date(),
      changes: updates
    };

    // Update emergency with new data and admin activity
    const updatedEmergency = await Emergency.findByIdAndUpdate(
      emergencyId,
      {
        $set: updateData,
        $push: { adminActivity: adminActivity }
      },
      { new: true, runValidators: true }
    ).populate('reporter', 'name email').populate('lastUpdatedBy', 'name email');

    return NextResponse.json({
      success: true,
      message: "Emergency report updated successfully",
      emergency: updatedEmergency
    });

  } catch (error) {
    console.error("Emergency update error:", error);
    
    // Handle validation errors specifically
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { success: false, error: `Validation failed: ${validationErrors.join(', ')}` },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: "Failed to update emergency report" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { emergencyId, token } = body;

    // Verify admin authentication
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Try to get user without specifying userType to handle unified auth
    const userResponse = await getUserByToken(token);
    if (!userResponse.success) {
      return NextResponse.json(
        { success: false, error: "Invalid authentication" },
        { status: 401 }
      );
    }

    // Check if user has admin role
    const user = userResponse.user;
    if (user.role !== "admin" && !user.isAdmin) {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    // Validate emergency ID
    if (!emergencyId) {
      return NextResponse.json(
        { success: false, error: "Emergency ID is required" },
        { status: 400 }
      );
    }

    // Find and delete the emergency
    const emergency = await Emergency.findById(emergencyId);
    if (!emergency) {
      return NextResponse.json(
        { success: false, error: "Emergency report not found" },
        { status: 404 }
      );
    }

    // Delete the emergency report
    await Emergency.findByIdAndDelete(emergencyId);

    return NextResponse.json({
      success: true,
      message: "Emergency report deleted successfully"
    });

  } catch (error) {
    console.error("Emergency delete error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete emergency report" },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    // Verify admin authentication
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Try to get user without specifying userType to handle unified auth
    const userResponse = await getUserByToken(token);
    if (!userResponse.success) {
      return NextResponse.json(
        { success: false, error: "Invalid authentication" },
        { status: 401 }
      );
    }

    // Check if user has admin role
    const user = userResponse.user;
    if (user.role !== "admin" && !user.isAdmin) {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    // Get all emergencies with additional admin fields
    const emergencies = await Emergency.find({})
      .populate('reporter', 'name email phone')
      .populate('lastUpdatedBy', 'name email')
      .sort({ createdAt: -1 });

    // Add admin statistics
    const stats = {
      total: emergencies.length,
      pending: emergencies.filter(e => e.status === 'pending').length,
      approved: emergencies.filter(e => e.status === 'approved').length,
      inProgress: emergencies.filter(e => e.status === 'in-progress').length,
      resolved: emergencies.filter(e => e.status === 'resolved').length,
      critical: emergencies.filter(e => e.severity === 'critical').length,
    };

    return NextResponse.json({
      success: true,
      emergencies,
      stats
    });

  } catch (error) {
    console.error("Admin fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch emergency reports" },
      { status: 500 }
    );
  }
} 