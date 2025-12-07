import { NextResponse } from "next/server";
import { connectToDatabase } from "@/../db/dbConfig";
import FoodDonation from "@/../db/schema/foodDonation.schema";
import { getUserByToken } from "../../../../actions/userActions";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import User from "@/../db/schema/user.schema";

// GET - Fetch food donations with filtering
export async function GET(request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    
    // Query parameters
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const status = searchParams.get("status") || "available";
    const foodType = searchParams.get("foodType");
    const userId = searchParams.get("userId");
    const lat = parseFloat(searchParams.get("lat"));
    const lng = parseFloat(searchParams.get("lng"));
    const radius = parseFloat(searchParams.get("radius")) || 10; // km
    
    // Build filter
    const filter = {};
    
    if (status) filter.status = status;
    if (foodType) filter.foodType = foodType;
    if (userId) filter.donor = userId;
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Fetch donations
    let donations = await FoodDonation.find(filter)
      .populate("donor", "name email profilePicture")
      .populate("reservedBy", "name email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Filter by location if coordinates provided
    if (lat && lng) {
      donations = donations.filter(donation => {
        const distance = calculateDistance(
          lat,
          lng,
          donation.location.latitude,
          donation.location.longitude
        );
        return distance <= radius;
      });
    }
    
    // Convert Buffer objects to base64 strings and ensure _id is string
    donations = donations.map(donation => {
      const donationObj = { ...donation };
      
      // Convert Buffer objects to base64 strings if they exist
      if (donationObj.donor?.profilePicture && Buffer.isBuffer(donationObj.donor.profilePicture)) {
        donationObj.donor.profilePicture = donationObj.donor.profilePicture.toString('base64');
      }
      
      // Ensure _id is string
      donationObj._id = donationObj._id.toString();
      if (donationObj.donor?._id) {
        donationObj.donor._id = donationObj.donor._id.toString();
      }
      if (donationObj.reservedBy?._id) {
        donationObj.reservedBy._id = donationObj.reservedBy._id.toString();
      }
      
      return donationObj;
    });
    
    // Get total count
    const totalDonations = await FoodDonation.countDocuments(filter);
    const totalPages = Math.ceil(totalDonations / limit);
    
    return NextResponse.json({
      success: true,
      data: {
        donations,
        pagination: {
          currentPage: page,
          totalPages,
          totalDonations,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
    
  } catch (error) {
    console.error("Error fetching food donations:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch food donations" },
      { status: 500 }
    );
  }
}

// POST - Create a new food donation
export async function POST(request) {
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
    const body = await request.json();
    
    // Validate required fields
    if (!body.foodName || !body.foodType || !body.quantity || !body.unit) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    if (!body.location || !body.location.address || !body.location.latitude || !body.location.longitude) {
      return NextResponse.json(
        { success: false, error: "Location information is required" },
        { status: 400 }
      );
    }
    
    if (!body.contactInfo || !body.contactInfo.phone) {
      return NextResponse.json(
        { success: false, error: "Contact information is required" },
        { status: 400 }
      );
    }
    
    // Create donation
    const donation = new FoodDonation({
      donor: user._id,
      foodType: body.foodType,
      foodName: body.foodName,
      quantity: body.quantity,
      unit: body.unit,
      expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
      description: body.description || "",
      images: body.images || [],
      location: body.location,
      contactInfo: body.contactInfo,
      availability: {
        startDate: body.availability?.startDate ? new Date(body.availability.startDate) : new Date(),
        endDate: body.availability?.endDate ? new Date(body.availability.endDate) : null,
        pickupTime: body.availability?.pickupTime || "",
      },
      status: "available",
      notes: body.notes || "",
    });
    
    await donation.save();
    
    // Populate donor info
    await donation.populate("donor", "name email profilePicture");
    
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
    
    return NextResponse.json({
      success: true,
      message: "Food donation created successfully",
      data: donationObj,
    });
    
  } catch (error) {
    console.error("Error creating food donation:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create food donation" },
      { status: 500 }
    );
  }
}

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

