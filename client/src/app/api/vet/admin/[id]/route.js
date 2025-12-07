import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/../db/dbConfig";
import Vet from "@/../db/schema/vet.schema";
import User from "@/../db/schema/user.schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Middleware to check admin authentication
async function verifyAdmin(request) {
  try {
    const cookieStore = await cookies();
    const userToken = cookieStore.get("userToken")?.value;
    const adminToken = cookieStore.get("adminToken")?.value;
    const token = userToken || adminToken;

    if (!token) {
      return { isAdmin: false, error: "No authentication token" };
    }

    const decoded = jwt.verify(token, process.env.JWT_USER_SECRET);
    const user = await User.findById(decoded.id).select("role").lean();

    if (!user || user.role !== "admin") {
      return { isAdmin: false, error: "Admin access required" };
    }

    return { isAdmin: true, adminId: user._id };
  } catch (error) {
    return { isAdmin: false, error: "Invalid token" };
  }
}

// GET - Get single vet by ID
export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    
    const authCheck = await verifyAdmin(request);
    if (!authCheck.isAdmin) {
      return NextResponse.json(
        { success: false, message: authCheck.error || "Admin access required" },
        { status: 403 }
      );
    }

    const vet = await Vet.findById(params.id).select("-password").lean();
    
    if (!vet) {
      return NextResponse.json(
        { success: false, message: "Vet not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: vet
    });
    
  } catch (error) {
    console.error("Error fetching vet:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch vet" },
      { status: 500 }
    );
  }
}

// PUT - Update vet
export async function PUT(request, { params }) {
  try {
    await connectToDatabase();
    
    const authCheck = await verifyAdmin(request);
    if (!authCheck.isAdmin) {
      return NextResponse.json(
        { success: false, message: authCheck.error || "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const updateData = { ...body };
    
    // If password is provided, hash it
    if (updateData.password && updateData.password.trim() !== "") {
      updateData.password = await bcrypt.hash(updateData.password, 12);
    } else {
      delete updateData.password; // Don't update password if not provided
    }
    
    // Update approvedBy and approvedAt if status is being changed to approved
    if (updateData.approvalStatus === "approved") {
      updateData.approvedBy = authCheck.adminId;
      updateData.approvedAt = new Date();
    }
    
    const vet = await Vet.findByIdAndUpdate(
      params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password").lean();
    
    if (!vet) {
      return NextResponse.json(
        { success: false, message: "Vet not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Vet updated successfully",
      data: vet
    });
    
  } catch (error) {
    console.error("Error updating vet:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update vet" },
      { status: 500 }
    );
  }
}

// DELETE - Delete vet
export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();
    
    const authCheck = await verifyAdmin(request);
    if (!authCheck.isAdmin) {
      return NextResponse.json(
        { success: false, message: authCheck.error || "Admin access required" },
        { status: 403 }
      );
    }

    const vet = await Vet.findByIdAndDelete(params.id);
    
    if (!vet) {
      return NextResponse.json(
        { success: false, message: "Vet not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Vet deleted successfully"
    });
    
  } catch (error) {
    console.error("Error deleting vet:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete vet" },
      { status: 500 }
    );
  }
}

