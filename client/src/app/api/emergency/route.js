import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../db/dbConfig";
import Emergency from "../../../../db/schema/emergency.schema";
import { getUserByToken } from "../../../../actions/userActions";

// Create a new emergency report
export async function POST(request) {
  try {
    const { emergencyData, token } = await request.json();

    if (!token || !emergencyData) {
      return NextResponse.json(
        {
          success: false,
          error: "Token or emergency data is missing",
        },
        { status: 401 }
      );
    }

    // Authenticate user (accept any valid user role)
    const response = await getUserByToken(token);
    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.message },
        { status: 401 }
      );
    }
    const user = response.user;

    // Validate required fields
    if (!emergencyData.title || !emergencyData.description) {
      return NextResponse.json(
        { success: false, error: "Title and description are required" },
        { status: 400 }
      );
    }

    if (!emergencyData.photos || emergencyData.photos.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one photo is required" },
        { status: 400 }
      );
    }

    if (!emergencyData.location || !emergencyData.location.latitude || !emergencyData.location.longitude) {
      return NextResponse.json(
        { success: false, error: "Location coordinates are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Create emergency report object
    const emergencyObject = {
      title: emergencyData.title,
      description: emergencyData.description,
      photos: emergencyData.photos,
      location: {
        latitude: emergencyData.location.latitude,
        longitude: emergencyData.location.longitude,
        address: emergencyData.location.address || "",
      },
      reporter: user._id,
      severity: emergencyData.severity || "medium",
      animalType: emergencyData.animalType || "",
      contactInfo: {
        phone: emergencyData.contactInfo?.phone || "",
        preferredContact: emergencyData.contactInfo?.preferredContact || "app",
      },
    };

    const emergency = new Emergency(emergencyObject);
    await emergency.save();

    return NextResponse.json({
      success: true,
      message: "Emergency report submitted successfully!",
      emergency: {
        _id: emergency._id.toString(),
        title: emergency.title,
        description: emergency.description,
        photos: emergency.photos,
        location: emergency.location,
        severity: emergency.severity,
        status: emergency.status,
        createdAt: emergency.createdAt,
      },
    });
  } catch (error) {
    console.error("Emergency Report Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to submit emergency report",
      },
      { status: 500 }
    );
  }
}

// Get emergency reports
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit")) || 50;

    await connectToDatabase();

    let query = {};
    
    // Filter by user if specified
    if (userId) {
      query.reporter = userId;
    }
    
    // Filter by status if specified
    if (status) {
      query.status = status;
    }

    const emergencies = await Emergency.find(query)
      .populate("reporter", "name email")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      emergencies: emergencies.map(emergency => ({
        ...emergency,
        _id: emergency._id.toString(),
        reporter: {
          ...emergency.reporter,
          _id: emergency.reporter._id.toString(),
        },
      })),
    });
  } catch (error) {
    console.error("Get Emergency Reports Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch emergency reports",
      },
      { status: 500 }
    );
  }
} 