import { NextResponse } from "next/server";
import { connectToDatabase } from "@/../db/dbConfig";
import FoodDonation from "@/../db/schema/foodDonation.schema";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import User from "@/../db/schema/user.schema";

// GET - Get a specific food donation
export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    
    const { id } = params;
    
    const donation = await FoodDonation.findById(id)
      .populate("donor", "name email profilePicture phone")
      .populate("reservedBy", "name email phone")
      .lean();
    
    if (!donation) {
      return NextResponse.json(
        { success: false, message: "Food donation not found" },
        { status: 404 }
      );
    }
    
    // Convert Buffer objects to base64 strings if they exist
    if (donation.donor?.profilePicture && Buffer.isBuffer(donation.donor.profilePicture)) {
      donation.donor.profilePicture = donation.donor.profilePicture.toString('base64');
    }
    
    // Ensure _id is string
    donation._id = donation._id.toString();
    if (donation.donor?._id) {
      donation.donor._id = donation.donor._id.toString();
    }
    if (donation.reservedBy?._id) {
      donation.reservedBy._id = donation.reservedBy._id.toString();
    }
    
    return NextResponse.json({
      success: true,
      data: donation,
    });
    
  } catch (error) {
    console.error("Error fetching food donation:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch food donation" },
      { status: 500 }
    );
  }
}

// PUT - Update food donation (reserve, update status, etc.)
export async function PUT(request, { params }) {
  try {
    await connectToDatabase();
    
    const cookieStore = await cookies();
    const userToken = cookieStore.get("userToken")?.value;
    const sellerToken = cookieStore.get("sellerToken")?.value;
    const adminToken = cookieStore.get("adminToken")?.value;
    
    const token = userToken || sellerToken || adminToken;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }
    
    // Authenticate user
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
    
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }
    
    const { id } = params;
    const body = await request.json();
    
    const donation = await FoodDonation.findById(id);
    
    if (!donation) {
      return NextResponse.json(
        { success: false, message: "Food donation not found" },
        { status: 404 }
      );
    }
    
    // Check if user is the donor or admin
    const isDonor = donation.donor.toString() === userId.toString();
    const isAdmin = user.role === "admin";
    
    // Handle reservation
    if (body.action === "reserve") {
      if (donation.status !== "available") {
        return NextResponse.json(
          { success: false, error: "This donation is no longer available" },
          { status: 400 }
        );
      }
      
      donation.status = "reserved";
      donation.reservedBy = userId;
      donation.reservedAt = new Date();
      
      if (body.notes) {
        donation.notes = body.notes;
      }
    }
    // Handle pickup confirmation
    else if (body.action === "pickup") {
      if (!isDonor && !isAdmin) {
        return NextResponse.json(
          { success: false, error: "Only the donor can confirm pickup" },
          { status: 403 }
        );
      }
      
      donation.status = "picked_up";
      donation.pickedUpAt = new Date();
    }
    // Handle cancellation
    else if (body.action === "cancel") {
      if (!isDonor && donation.reservedBy?.toString() !== userId.toString() && !isAdmin) {
        return NextResponse.json(
          { success: false, error: "Unauthorized to cancel this donation" },
          { status: 403 }
        );
      }
      
      if (donation.status === "reserved") {
        donation.status = "available";
        donation.reservedBy = null;
        donation.reservedAt = null;
      } else {
        donation.status = "cancelled";
      }
    }
    // Handle general update (only donor or admin)
    else {
      if (!isDonor && !isAdmin) {
        return NextResponse.json(
          { success: false, error: "Unauthorized to update this donation" },
          { status: 403 }
        );
      }
      
      // Update allowed fields
      if (body.foodName) donation.foodName = body.foodName;
      if (body.quantity) donation.quantity = body.quantity;
      if (body.unit) donation.unit = body.unit;
      if (body.description !== undefined) donation.description = body.description;
      if (body.status) donation.status = body.status;
      if (body.images) donation.images = body.images;
    }
    
    await donation.save();
    await donation.populate("donor", "name email profilePicture");
    await donation.populate("reservedBy", "name email phone");
    
    // Convert to plain object and handle Buffer objects
    const donationObj = donation.toObject();
    
    // Convert Buffer objects to base64 strings if they exist
    if (donationObj.donor?.profilePicture && Buffer.isBuffer(donationObj.donor.profilePicture)) {
      donationObj.donor.profilePicture = donationObj.donor.profilePicture.toString('base64');
    }
    
    // Convert _id to string
    donationObj._id = donationObj._id.toString();
    if (donationObj.donor?._id) {
      donationObj.donor._id = donationObj.donor._id.toString();
    }
    if (donationObj.reservedBy?._id) {
      donationObj.reservedBy._id = donationObj.reservedBy._id.toString();
    }
    
    return NextResponse.json({
      success: true,
      message: "Food donation updated successfully",
      data: donationObj,
    });
    
  } catch (error) {
    console.error("Error updating food donation:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update food donation" },
      { status: 500 }
    );
  }
}

// DELETE - Delete food donation (only donor or admin)
export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();
    
    const cookieStore = await cookies();
    const userToken = cookieStore.get("userToken")?.value;
    const sellerToken = cookieStore.get("sellerToken")?.value;
    const adminToken = cookieStore.get("adminToken")?.value;
    
    const token = userToken || sellerToken || adminToken;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }
    
    // Authenticate user
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
    
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }
    
    const { id } = params;
    
    const donation = await FoodDonation.findById(id);
    
    if (!donation) {
      return NextResponse.json(
        { success: false, message: "Food donation not found" },
        { status: 404 }
      );
    }
    
    // Check if user is the donor or admin
    const isDonor = donation.donor.toString() === userId.toString();
    const isAdmin = user.role === "admin";
    
    if (!isDonor && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized to delete this donation" },
        { status: 403 }
      );
    }
    
    await FoodDonation.findByIdAndDelete(id);
    
    return NextResponse.json({
      success: true,
      message: "Food donation deleted successfully",
    });
    
  } catch (error) {
    console.error("Error deleting food donation:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete food donation" },
      { status: 500 }
    );
  }
}

