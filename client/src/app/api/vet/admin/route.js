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

// GET - Fetch all vets (admin only, includes pending/rejected)
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

    const vets = await Vet.find({})
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: vets
    });
    
  } catch (error) {
    console.error("Error fetching vets:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch vets" },
      { status: 500 }
    );
  }
}

// POST - Create new vet (admin only)
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
      licenseNumber,
      specializations,
      yearsOfExperience,
      consultationFee,
      currency,
      location,
      bio,
      languages,
      consultationModes,
      degrees,
      certifications,
      isVerified,
      isActive,
      approvalStatus
    } = body;
    
    // Validation
    if (!name || !email || !phone || !password || !licenseNumber || !specializations || !yearsOfExperience || !consultationFee) {
      return NextResponse.json(
        { success: false, message: "All required fields must be provided" },
        { status: 400 }
      );
    }
    
    // Check if vet already exists
    const existingVet = await Vet.findOne({
      $or: [{ email }, { licenseNumber }]
    });
    
    if (existingVet) {
      return NextResponse.json(
        { success: false, message: "Vet with this email or license number already exists" },
        { status: 400 }
      );
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create vet
    const vet = new Vet({
      name,
      email,
      phone,
      password: hashedPassword,
      licenseNumber,
      specializations: Array.isArray(specializations) ? specializations : [],
      yearsOfExperience,
      consultationFee,
      currency: currency || "USD",
      location: location || {},
      bio: bio || "",
      languages: languages || ["English"],
      consultationModes: consultationModes || ["video", "chat"],
      degrees: degrees || [],
      certifications: certifications || [],
      isVerified: isVerified ?? true,
      isActive: isActive ?? true,
      approvalStatus: approvalStatus || "approved",
      approvedBy: authCheck.adminId,
      approvedAt: new Date()
    });
    
    await vet.save();
    
    // Remove password from response
    const vetResponse = vet.toObject();
    delete vetResponse.password;
    
    return NextResponse.json({
      success: true,
      message: "Vet created successfully",
      data: vetResponse
    }, { status: 201 });
    
  } catch (error) {
    console.error("Error creating vet:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create vet" },
      { status: 500 }
    );
  }
}

