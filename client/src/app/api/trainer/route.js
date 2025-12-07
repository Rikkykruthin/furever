import { NextResponse } from "next/server";
import { connectToDatabase } from "@/../db/dbConfig";
import Trainer from "@/../db/schema/trainer.schema";

// GET - Fetch trainers with filtering
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
    const availability = searchParams.get("availability") || "";
    const minRating = parseFloat(searchParams.get("minRating")) || 0;
    const maxFee = parseFloat(searchParams.get("maxFee")) || 1000;
    const languages = searchParams.get("languages") || "";
    const sortBy = searchParams.get("sortBy") || "rating";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const trainingMode = searchParams.get("trainingMode") || "";
    
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
        { trainingSpecialties: { $in: [new RegExp(search, "i")] } }
      ];
    }
    
    // Specialization filter
    if (specialization) {
      filter.trainingSpecialties = { $in: [specialization] };
    }
    
    // Location filter
    if (location) {
      filter.$or = [
        { "location.city": { $regex: location, $options: "i" } },
        { "location.state": { $regex: location, $options: "i" } }
      ];
    }
    
    // Training mode filter
    if (trainingMode) {
      filter.trainingModes = { $in: [trainingMode] };
    }
    
    // Availability filter
    if (availability === "online") {
      filter.isOnline = true;
    } else if (availability === "available") {
      const today = new Date().toLocaleDateString('en-US', { weekday: 'lowercase' });
      filter[`availability.${today}.isAvailable`] = true;
    }
    
    // Rating filter
    if (minRating > 0) {
      filter["rating.average"] = { $gte: minRating };
    }
    
    // Fee filter
    if (maxFee < 1000) {
      filter.sessionFee = { $lte: maxFee };
    }
    
    // Languages filter
    if (languages) {
      filter.languages = { $in: [languages] };
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
      case "fee":
        sortObj = { sessionFee: sortOrder === "desc" ? -1 : 1 };
        break;
      case "name":
        sortObj = { name: sortOrder === "desc" ? -1 : 1 };
        break;
      default:
        sortObj = { "rating.average": -1 };
    }
    
    // Fetch trainers
    const trainers = await Trainer.find(filter)
      .select("-password")
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Get total count
    const totalTrainers = await Trainer.countDocuments(filter);
    const totalPages = Math.ceil(totalTrainers / limit);
    
    // Enrich trainers with computed fields
    const enrichedTrainers = trainers.map(trainer => ({
      ...trainer,
      isAvailableNow: checkCurrentAvailability(trainer.availability),
      nextAvailableSlot: getNextAvailableSlot(trainer.availability),
      responseTimeFormatted: formatResponseTime(trainer.stats.responseTime)
    }));
    
    // Get filter options for frontend
    const [specializations, locations, languages_list] = await Promise.all([
      Trainer.distinct("trainingSpecialties", { isActive: true, approvalStatus: "approved" }),
      Trainer.distinct("location.city", { isActive: true, approvalStatus: "approved" }),
      Trainer.distinct("languages", { isActive: true, approvalStatus: "approved" })
    ]);
    
    // Get price range
    const priceStats = await Trainer.aggregate([
      { $match: { isActive: true, approvalStatus: "approved" } },
      {
        $group: {
          _id: null,
          minFee: { $min: "$sessionFee" },
          maxFee: { $max: "$sessionFee" },
          avgFee: { $avg: "$sessionFee" }
        }
      }
    ]);
    
    return NextResponse.json({
      success: true,
      data: {
        trainers: enrichedTrainers,
        pagination: {
          currentPage: page,
          totalPages,
          totalTrainers,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        filters: {
          specializations: specializations.flat().filter(Boolean),
          locations: locations.filter(Boolean),
          languages: languages_list.flat().filter(Boolean),
          priceRange: priceStats[0] || { minFee: 0, maxFee: 200, avgFee: 50 }
        }
      }
    });
    
  } catch (error) {
    console.error("Error fetching trainers:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch trainers" },
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