import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../db/dbConfig";
import User from "../../../../../db/schema/user.schema";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

// Ensure database is connected
connectToDatabase();

export async function PUT(request) {
  try {
    const cookieStore = cookies();
    const userToken = cookieStore.get("userToken")?.value;
    const sellerToken = cookieStore.get("sellerToken")?.value;
    const adminToken = cookieStore.get("adminToken")?.value;

    const token = userToken || sellerToken || adminToken;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "User not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      name, 
      bio, 
      profilePicture, 
      storeName,
      phone,
      location,
      website,
      linkedin,
      twitter,
      instagram
    } = body;
    
    // Validate input
    if (!name) {
      return NextResponse.json(
        { success: false, error: "Name is required" },
        { status: 400 }
      );
    }

    let userId;
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_USER_SECRET);
      userId = decoded.id;
    } catch (error) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    // Prepare update data
    const updateData = {
      name,
      bio,
      profilePicture,
      updatedAt: new Date()
    };

    // Add optional fields if provided
    if (phone !== undefined) updateData.phone = phone;
    if (location !== undefined) updateData.location = location;
    if (website !== undefined) updateData.website = website;
    if (linkedin !== undefined) updateData.linkedin = linkedin;
    if (twitter !== undefined) updateData.twitter = twitter;
    if (instagram !== undefined) updateData.instagram = instagram;

    // Add storeName if user is a seller
    if (storeName !== undefined) {
      updateData.storeName = storeName;
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        ...updatedUser.toObject(),
        _id: updatedUser._id.toString(),
        userType: updatedUser.role,
        isAdmin: updatedUser.role === "admin",
        isSeller: updatedUser.role === "seller"
      }
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const cookieStore = cookies();
    const userToken = cookieStore.get("userToken")?.value;
    const sellerToken = cookieStore.get("sellerToken")?.value;
    const adminToken = cookieStore.get("adminToken")?.value;

    const token = userToken || sellerToken || adminToken;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "User not authenticated" },
        { status: 401 }
      );
    }

    let userId;
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_USER_SECRET);
      userId = decoded.id;
    } catch (error) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        ...user.toObject(),
        _id: user._id.toString(),
        userType: user.role,
        isAdmin: user.role === "admin",
        isSeller: user.role === "seller"
      }
    });
  } catch (error) {
    console.error("Profile retrieval error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
} 