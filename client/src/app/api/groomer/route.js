import { NextResponse } from "next/server";
import { connectToDatabase } from "@/../db/dbConfig";
import Groomer from "@/../db/schema/groomer.schema";

// GET - Fetch groomers with filtering
export async function GET(request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    
    // Query parameters
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 12;
    const search = searchParams.get("search") || "";
    const specialization = searchParams.get("specialization") || "";
    const location = searchParams.get("location") || "";
    const serviceType = searchParams.get("serviceType") || "";
    const minRating = parseFloat(searchParams.get("minRating")) || 0;
    const maxPrice = parseFloat(searchParams.get("maxPrice")) || 1000;
    const petType = searchParams.get("petType") || "";
    const petSize = searchParams.get("petSize") || "";
    const sortBy = searchParams.get("sortBy") || "rating";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    
    // Build filter
    const filter = {
      isActive: true,
      approvalStatus: "approved"
    };
    
    // Search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { bio: { $regex: search, $options: "i" } },
        { groomingSpecialties: { $in: [new RegExp(search, "i")] } },
        { "salon.name": { $regex: search, $options: "i" } }
      ];
    }
    
    // Specialization filter
    if (specialization) {
      filter.groomingSpecialties = { $in: [specialization] };
    }
    
    // Location filter  
    if (location) {
      filter.$or = [
        { "location.city": { $regex: location, $options: "i" } },
        { "location.state": { $regex: location, $options: "i" } }
      ];
    }
    
    // Service type filter
    if (serviceType) {
      filter.serviceTypes = { $in: [serviceType] };
    }
    
    // Pet type filter
    if (petType) {
      filter.petTypesSupported = { $in: [petType] };
    }
    
    // Pet size filter
    if (petSize) {
      filter.petSizeLimit = { $in: [petSize] };
    }
    
    // Rating filter
    if (minRating > 0) {
      filter["rating.average"] = { $gte: minRating };
    }
    
    // Price filter (using base service prices)
    if (maxPrice < 1000) {
      filter["services.basePrice"] = { $lte: maxPrice };
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Build sort object
    let sortObj = {};
    switch (sortBy) {
      case "rating":
        sortObj = { "rating.average": sortOrder === "desc" ? -1 : 1 };
        break;
      case "experience":
        sortObj = { yearsOfExperience: sortOrder === "desc" ? -1 : 1 };
        break;
      case "price":
        sortObj = { "services.0.basePrice": sortOrder === "desc" ? -1 : 1 };
        break;
      case "name":
        sortObj = { name: sortOrder === "desc" ? -1 : 1 };
        break;
      default:
        sortObj = { "rating.average": -1 };
    }
    
    // Fetch groomers
    const groomers = await Groomer.find(filter)
      .select("-password")
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Get total count
    const totalGroomers = await Groomer.countDocuments(filter);
    const totalPages = Math.ceil(totalGroomers / limit);
    
    // Enrich groomers with computed fields
    const enrichedGroomers = groomers.map(groomer => ({
      ...groomer,
      isAvailableNow: checkCurrentAvailability(groomer.availability),
      nextAvailableSlot: getNextAvailableSlot(groomer.availability),
      responseTimeFormatted: formatResponseTime(groomer.stats.responseTime),
      basePrice: groomer.services.length > 0 ? Math.min(...groomer.services.map(s => s.basePrice)) : 0,
      distance: location ? calculateDistance(location, groomer.location) : null
    }));
    
    // Get filter options for frontend
    const [specializations, locations, petTypes] = await Promise.all([
      Groomer.distinct("groomingSpecialties", { isActive: true, approvalStatus: "approved" }),
      Groomer.distinct("location.city", { isActive: true, approvalStatus: "approved" }),
      Groomer.distinct("petTypesSupported", { isActive: true, approvalStatus: "approved" })
    ]);
    
    // Get price range
    const priceStats = await Groomer.aggregate([
      { $match: { isActive: true, approvalStatus: "approved" } },
      { $unwind: "$services" },
      {
        $group: {
          _id: null,
          minPrice: { $min: "$services.basePrice" },
          maxPrice: { $max: "$services.basePrice" },
          avgPrice: { $avg: "$services.basePrice" }
        }
      }
    ]);
    
    return NextResponse.json({
      success: true,
      data: {
        groomers: enrichedGroomers,
        pagination: {
          currentPage: page,
          totalPages,
          totalGroomers,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        filters: {
          specializations: specializations.flat().filter(Boolean),
          locations: locations.filter(Boolean),
          petTypes: petTypes.flat().filter(Boolean),
          serviceTypes: ["in_salon", "mobile", "both"],
          petSizes: ["Small (under 25lbs)", "Medium (25-60lbs)", "Large (60-100lbs)", "Extra Large (100lbs+)"],
          priceRange: priceStats[0] || { minPrice: 0, maxPrice: 200, avgPrice: 75 }
        }
      }
    });
    
  } catch (error) {
    console.error("Error fetching groomers:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch groomers" },
      { status: 500 }
    );
  }
}

// Helper functions
function checkCurrentAvailability(availability) {
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'lowercase' });
  const currentTime = now.toTimeString().slice(0, 5);
  
  const dayAvailability = availability[currentDay];
  if (!dayAvailability || !dayAvailability.isAvailable) {
    return false;
  }
  
  return dayAvailability.slots.some(slot => {
    return currentTime >= slot.startTime && 
           currentTime <= slot.endTime && 
           !slot.isBooked;
  });
}

function getNextAvailableSlot(availability) {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() + i);
    const dayName = checkDate.toLocaleDateString('en-US', { weekday: 'lowercase' });
    
    const dayAvailability = availability[dayName];
    if (dayAvailability && dayAvailability.isAvailable) {
      const availableSlot = dayAvailability.slots.find(slot => !slot.isBooked);
      if (availableSlot) {
        return {
          date: checkDate.toISOString().split('T')[0],
          time: availableSlot.startTime
        };
      }
    }
  }
  
  return null;
}

function formatResponseTime(minutes) {
  if (minutes < 60) {
    return `${minutes} minutes`;
  } else if (minutes < 1440) {
    const hours = Math.floor(minutes / 60);
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  } else {
    const days = Math.floor(minutes / 1440);
    return `${days} day${days > 1 ? 's' : ''}`;
  }
}

function calculateDistance(location, groomerLocation) {
  // Simplified distance calculation - in real app would use proper geolocation
  // For now, just return a mock distance
  return Math.floor(Math.random() * 20) + 1; // 1-20 miles
}