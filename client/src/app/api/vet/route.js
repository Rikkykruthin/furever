import { NextResponse } from "next/server";
import { connectToDatabase } from "@/../db/dbConfig";
import Vet from "@/../db/schema/vet.schema";
import VetReview from "@/../db/schema/vetReview.schema";
import bcrypt from "bcryptjs";

// GET - Fetch vets with filtering and pagination
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
    const maxFee = parseFloat(searchParams.get("maxFee")) || Infinity;
    const sortBy = searchParams.get("sortBy") || "rating";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const languages = searchParams.get("languages") || "";
    
    // Build filter object
    const filter = {
      isActive: true,
      isVerified: true,
      approvalStatus: "approved"
    };
    
    // Search by name or specialization
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { specializations: { $in: [new RegExp(search, "i")] } },
        { bio: { $regex: search, $options: "i" } }
      ];
    }
    
    // Filter by specialization
    if (specialization) {
      filter.specializations = { $in: [specialization] };
    }
    
    // Filter by location
    if (location) {
      filter.$or = [
        { "location.city": { $regex: location, $options: "i" } },
        { "location.state": { $regex: location, $options: "i" } },
        { "location.country": { $regex: location, $options: "i" } }
      ];
    }
    
    // Filter by rating
    if (minRating > 0) {
      filter["rating.average"] = { $gte: minRating };
    }
    
    // Filter by consultation fee
    if (maxFee < Infinity) {
      filter.consultationFee = { $lte: maxFee };
    }
    
    // Filter by languages
    if (languages) {
      const languageList = languages.split(",");
      filter.languages = { $in: languageList };
    }
    
    // Filter by availability (online/offline)
    if (availability === "online") {
      filter.isOnline = true;
    } else if (availability === "available") {
      // Check if vet has any available slots today
      const today = new Date().toLocaleLowerCase().slice(0, 3); // mon, tue, etc
      filter[`availability.${today}.isAvailable`] = true;
    }
    
    // Build sort object
    const sortObj = {};
    switch (sortBy) {
      case "rating":
        sortObj["rating.average"] = sortOrder === "asc" ? 1 : -1;
        break;
      case "experience":
        sortObj.yearsOfExperience = sortOrder === "asc" ? 1 : -1;
        break;
      case "fee":
        sortObj.consultationFee = sortOrder === "asc" ? 1 : -1;
        break;
      case "name":
        sortObj.name = sortOrder === "asc" ? 1 : -1;
        break;
      default:
        sortObj["rating.average"] = -1;
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Fetch vets
    const vets = await Vet.find(filter)
      .select("-password")
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Get total count for pagination
    const totalVets = await Vet.countDocuments(filter);
    const totalPages = Math.ceil(totalVets / limit);
    
    // Add additional computed fields
    const enrichedVets = vets.map(vet => ({
      ...vet,
      isAvailableNow: checkCurrentAvailability(vet.availability),
      nextAvailableSlot: getNextAvailableSlot(vet.availability),
      responseTimeFormatted: formatResponseTime(vet.stats.responseTime)
    }));
    
    return NextResponse.json({
      success: true,
      data: {
        vets: enrichedVets,
        pagination: {
          currentPage: page,
          totalPages,
          totalVets,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        filters: {
          specializations: await getAvailableSpecializations(),
          locations: await getAvailableLocations(),
          languages: await getAvailableLanguages(),
          priceRange: await getPriceRange()
        }
      }
    });
    
  } catch (error) {
    console.error("Error fetching vets:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch vets" },
      { status: 500 }
    );
  }
}

// POST - Create new vet (registration)
export async function POST(request) {
  try {
    await connectToDatabase();
    
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
      location,
      bio,
      languages,
      consultationModes,
      degrees,
      certifications
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
      specializations,
      yearsOfExperience,
      consultationFee,
      location,
      bio,
      languages: languages || ["English"],
      consultationModes: consultationModes || ["video", "chat"],
      degrees: degrees || [],
      certifications: certifications || [],
      approvalStatus: "pending" // Requires admin approval
    });
    
    await vet.save();
    
    // Remove password from response
    const vetResponse = vet.toObject();
    delete vetResponse.password;
    
    return NextResponse.json({
      success: true,
      message: "Vet registration submitted successfully. Awaiting admin approval.",
      data: vetResponse
    }, { status: 201 });
    
  } catch (error) {
    console.error("Error creating vet:", error);
    return NextResponse.json(
      { success: false, message: "Failed to register vet" },
      { status: 500 }
    );
  }
}

// Helper functions
function checkCurrentAvailability(availability) {
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"
  
  const daySchedule = availability[currentDay];
  if (!daySchedule || !daySchedule.isAvailable) return false;
  
  return daySchedule.slots.some(slot => 
    !slot.isBooked && 
    slot.startTime <= currentTime && 
    slot.endTime >= currentTime
  );
}

function getNextAvailableSlot(availability) {
  const now = new Date();
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  for (let i = 0; i < 7; i++) {
    const checkDate = new Date(now);
    checkDate.setDate(now.getDate() + i);
    const dayName = days[checkDate.getDay() === 0 ? 6 : checkDate.getDay() - 1];
    
    const daySchedule = availability[dayName];
    if (daySchedule && daySchedule.isAvailable) {
      const availableSlot = daySchedule.slots.find(slot => !slot.isBooked);
      if (availableSlot) {
        return {
          date: checkDate.toISOString().split('T')[0],
          time: availableSlot.startTime,
          day: dayName
        };
      }
    }
  }
  
  return null;
}

function formatResponseTime(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

async function getAvailableSpecializations() {
  const specializations = await Vet.distinct("specializations", {
    isActive: true,
    isVerified: true,
    approvalStatus: "approved"
  });
  return specializations;
}

async function getAvailableLocations() {
  const locations = await Vet.distinct("location.city", {
    isActive: true,
    isVerified: true,
    approvalStatus: "approved"
  });
  return locations.filter(Boolean);
}

async function getAvailableLanguages() {
  const languages = await Vet.distinct("languages", {
    isActive: true,
    isVerified: true,
    approvalStatus: "approved"
  });
  return languages;
}

async function getPriceRange() {
  const result = await Vet.aggregate([
    {
      $match: {
        isActive: true,
        isVerified: true,
        approvalStatus: "approved"
      }
    },
    {
      $group: {
        _id: null,
        minFee: { $min: "$consultationFee" },
        maxFee: { $max: "$consultationFee" },
        avgFee: { $avg: "$consultationFee" }
      }
    }
  ]);
  
  return result[0] || { minFee: 0, maxFee: 200, avgFee: 50 };
} 