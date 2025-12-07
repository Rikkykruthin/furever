import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/../db/dbConfig";
import Trainer from "@/../db/schema/trainer.schema";
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

// GET - Fetch single trainer (admin only)
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

    const { id } = params;
    const trainer = await Trainer.findById(id)
      .select("-password")
      .lean();

    if (!trainer) {
      return NextResponse.json(
        { success: false, message: "Trainer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: trainer
    });
    
  } catch (error) {
    console.error("Error fetching trainer:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch trainer" },
      { status: 500 }
    );
  }
}

// PUT - Update trainer (admin only)
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

    const { id } = params;
    const body = await request.json();
    
    const trainer = await Trainer.findById(id);
    if (!trainer) {
      return NextResponse.json(
        { success: false, message: "Trainer not found" },
        { status: 404 }
      );
    }

    // Update fields
    if (body.name) trainer.name = body.name;
    if (body.email) trainer.email = body.email;
    if (body.phone) trainer.phone = body.phone;
    if (body.password) {
      trainer.password = await bcrypt.hash(body.password, 12);
    }
    if (body.certificationNumber) trainer.certificationNumber = body.certificationNumber;
    if (body.trainingSpecialties) trainer.trainingSpecialties = body.trainingSpecialties;
    if (body.yearsOfExperience !== undefined) trainer.yearsOfExperience = body.yearsOfExperience;
    if (body.sessionFee !== undefined) trainer.sessionFee = body.sessionFee;
    if (body.groupSessionFee !== undefined) trainer.groupSessionFee = body.groupSessionFee;
    if (body.currency) trainer.currency = body.currency;
    if (body.location) trainer.location = { ...trainer.location, ...body.location };
    if (body.bio !== undefined) trainer.bio = body.bio;
    if (body.languages) trainer.languages = body.languages;
    if (body.trainingModes) trainer.trainingModes = body.trainingModes;
    if (body.petTypesSupported) trainer.petTypesSupported = body.petTypesSupported;
    if (body.certifications) trainer.certifications = body.certifications;
    if (body.isVerified !== undefined) trainer.isVerified = body.isVerified;
    if (body.isActive !== undefined) trainer.isActive = body.isActive;
    if (body.approvalStatus) {
      trainer.approvalStatus = body.approvalStatus;
      if (body.approvalStatus === "approved") {
        trainer.approvedBy = authCheck.adminId;
        trainer.approvedAt = new Date();
      }
    }

    await trainer.save();
    
    // Remove password from response
    const trainerResponse = trainer.toObject();
    delete trainerResponse.password;
    
    return NextResponse.json({
      success: true,
      message: "Trainer updated successfully",
      data: trainerResponse
    });
    
  } catch (error) {
    console.error("Error updating trainer:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update trainer" },
      { status: 500 }
    );
  }
}

// DELETE - Delete trainer (admin only)
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

    const { id } = params;
    const trainer = await Trainer.findByIdAndDelete(id);

    if (!trainer) {
      return NextResponse.json(
        { success: false, message: "Trainer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Trainer deleted successfully"
    });
    
  } catch (error) {
    console.error("Error deleting trainer:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete trainer" },
      { status: 500 }
    );
  }
}

