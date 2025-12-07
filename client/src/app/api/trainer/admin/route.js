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

// GET - Fetch all trainers (admin only, includes pending/rejected)
export async function GET(request) {
  try {
    await connectToDatabase();
    
    const authCheck = await verifyAdmin(request);
    if (!authCheck.isAdmin) {
      return NextResponse.json(
        { success: false, message: authCheck.error || "Admin access required" },
        { status: 403 }
      );
    }

    const trainers = await Trainer.find({})
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: trainers
    });
    
  } catch (error) {
    console.error("Error fetching trainers:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch trainers" },
      { status: 500 }
    );
  }
}

// POST - Create new trainer (admin only)
export async function POST(request) {
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
    const {
      name,
      email,
      phone,
      password,
      certificationNumber,
      trainingSpecialties,
      yearsOfExperience,
      sessionFee,
      groupSessionFee,
      currency,
      location,
      bio,
      languages,
      trainingModes,
      petTypesSupported,
      certifications,
      isVerified,
      isActive,
      approvalStatus
    } = body;
    
    // Validation
    if (!name || !email || !phone || !password || !certificationNumber || !trainingSpecialties || !yearsOfExperience || !sessionFee) {
      return NextResponse.json(
        { success: false, message: "All required fields must be provided" },
        { status: 400 }
      );
    }
    
    // Check if trainer already exists
    const existingTrainer = await Trainer.findOne({
      $or: [{ email }, { certificationNumber }]
    });
    
    if (existingTrainer) {
      return NextResponse.json(
        { success: false, message: "Trainer with this email or certification number already exists" },
        { status: 400 }
      );
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create trainer
    const trainer = new Trainer({
      name,
      email,
      phone,
      password: hashedPassword,
      certificationNumber,
      trainingSpecialties: Array.isArray(trainingSpecialties) ? trainingSpecialties : [],
      yearsOfExperience,
      sessionFee,
      groupSessionFee: groupSessionFee || null,
      currency: currency || "USD",
      location: location || {},
      bio: bio || "",
      languages: languages || ["English"],
      trainingModes: trainingModes || ["video"],
      petTypesSupported: petTypesSupported || ["Dog"],
      certifications: certifications || [],
      isVerified: isVerified ?? true,
      isActive: isActive ?? true,
      approvalStatus: approvalStatus || "approved",
      approvedBy: authCheck.adminId,
      approvedAt: new Date()
    });
    
    await trainer.save();
    
    // Remove password from response
    const trainerResponse = trainer.toObject();
    delete trainerResponse.password;
    
    return NextResponse.json({
      success: true,
      message: "Trainer created successfully",
      data: trainerResponse
    }, { status: 201 });
    
  } catch (error) {
    console.error("Error creating trainer:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create trainer" },
      { status: 500 }
    );
  }
}

