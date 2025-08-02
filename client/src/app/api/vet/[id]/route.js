import { NextResponse } from "next/server";
import { connectToDatabase } from "@/../db/dbConfig";
import Vet from "@/../db/schema/vet.schema";
import VetReview from "@/../db/schema/vetReview.schema";
import Appointment from "@/../db/schema/appointment.schema";

// GET - Fetch individual vet profile with reviews and availability
export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const includeReviews = searchParams.get("includeReviews") === "true";
    const includeStats = searchParams.get("includeStats") === "true";
    
    // Fetch vet
    const vet = await Vet.findById(id)
      .select("-password")
      .lean();
    
    if (!vet) {
      return NextResponse.json(
        { success: false, message: "Vet not found" },
        { status: 404 }
      );
    }
    
    // Check if vet is active and approved
    if (!vet.isActive || vet.approvalStatus !== "approved") {
      return NextResponse.json(
        { success: false, message: "Vet profile not available" },
        { status: 403 }
      );
    }
    
    let enrichedVet = {
      ...vet,
      isAvailableNow: checkCurrentAvailability(vet.availability),
      nextAvailableSlot: getNextAvailableSlot(vet.availability),
      responseTimeFormatted: formatResponseTime(vet.stats.responseTime),
      availableSlots: getAvailableSlots(vet.availability, 7) // Next 7 days
    };
    
    // Include reviews if requested
    if (includeReviews) {
      const reviews = await VetReview.find({
        vet: id,
        moderationStatus: "approved",
        isPublic: true
      })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
      
      enrichedVet.reviews = reviews;
      enrichedVet.reviewStats = await getReviewStats(id);
    }
    
    // Include detailed stats if requested
    if (includeStats) {
      enrichedVet.detailedStats = await getDetailedStats(id);
    }
    
    return NextResponse.json({
      success: true,
      data: enrichedVet
    });
    
  } catch (error) {
    console.error("Error fetching vet:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch vet profile" },
      { status: 500 }
    );
  }
}

// PUT - Update vet profile (authenticated vets only)
export async function PUT(request, { params }) {
  try {
    await connectToDatabase();
    
    const { id } = params;
    const body = await request.json();
    
    // TODO: Add authentication middleware to verify vet token
    // For now, we'll assume the request is authenticated
    
    const {
      name,
      phone,
      bio,
      specializations,
      yearsOfExperience,
      consultationFee,
      location,
      languages,
      consultationModes,
      degrees,
      certifications,
      availability,
      notifications
    } = body;
    
    // Find and update vet
    const vet = await Vet.findById(id);
    
    if (!vet) {
      return NextResponse.json(
        { success: false, message: "Vet not found" },
        { status: 404 }
      );
    }
    
    // Update fields
    if (name) vet.name = name;
    if (phone) vet.phone = phone;
    if (bio) vet.bio = bio;
    if (specializations) vet.specializations = specializations;
    if (yearsOfExperience) vet.yearsOfExperience = yearsOfExperience;
    if (consultationFee) vet.consultationFee = consultationFee;
    if (location) vet.location = { ...vet.location, ...location };
    if (languages) vet.languages = languages;
    if (consultationModes) vet.consultationModes = consultationModes;
    if (degrees) vet.degrees = degrees;
    if (certifications) vet.certifications = certifications;
    if (availability) vet.availability = { ...vet.availability, ...availability };
    if (notifications) vet.notifications = { ...vet.notifications, ...notifications };
    
    await vet.save();
    
    // Remove password from response
    const vetResponse = vet.toObject();
    delete vetResponse.password;
    
    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data: vetResponse
    });
    
  } catch (error) {
    console.error("Error updating vet:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update profile" },
      { status: 500 }
    );
  }
}

// DELETE - Deactivate vet account
export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();
    
    const { id } = params;
    
    // TODO: Add authentication middleware
    
    const vet = await Vet.findById(id);
    
    if (!vet) {
      return NextResponse.json(
        { success: false, message: "Vet not found" },
        { status: 404 }
      );
    }
    
    // Soft delete - deactivate instead of removing
    vet.isActive = false;
    vet.isOnline = false;
    await vet.save();
    
    return NextResponse.json({
      success: true,
      message: "Account deactivated successfully"
    });
    
  } catch (error) {
    console.error("Error deactivating vet:", error);
    return NextResponse.json(
      { success: false, message: "Failed to deactivate account" },
      { status: 500 }
    );
  }
}

// Helper functions
function checkCurrentAvailability(availability) {
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const currentTime = now.toTimeString().slice(0, 5);
  
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

function getAvailableSlots(availability, days = 7) {
  const now = new Date();
  const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const availableSlots = [];
  
  for (let i = 0; i < days; i++) {
    const checkDate = new Date(now);
    checkDate.setDate(now.getDate() + i);
    const dayName = dayNames[checkDate.getDay() === 0 ? 6 : checkDate.getDay() - 1];
    
    const daySchedule = availability[dayName];
    if (daySchedule && daySchedule.isAvailable) {
      const daySlots = daySchedule.slots
        .filter(slot => !slot.isBooked)
        .map(slot => ({
          date: checkDate.toISOString().split('T')[0],
          day: dayName,
          startTime: slot.startTime,
          endTime: slot.endTime,
          dayOfWeek: checkDate.toLocaleDateString('en-US', { weekday: 'long' })
        }));
      
      if (daySlots.length > 0) {
        availableSlots.push({
          date: checkDate.toISOString().split('T')[0],
          dayOfWeek: checkDate.toLocaleDateString('en-US', { weekday: 'long' }),
          slots: daySlots
        });
      }
    }
  }
  
  return availableSlots;
}

function formatResponseTime(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

async function getReviewStats(vetId) {
  const stats = await VetReview.aggregate([
    {
      $match: {
        vet: vetId,
        moderationStatus: "approved"
      }
    },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: "$rating" },
        ratingDistribution: {
          $push: "$rating"
        },
        averageDetailedRatings: {
          $avg: {
            communication: "$detailedRatings.communication",
            expertise: "$detailedRatings.expertise",
            timeliness: "$detailedRatings.timeliness",
            helpfulness: "$detailedRatings.helpfulness"
          }
        }
      }
    }
  ]);
  
  if (stats.length === 0) {
    return {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      averageDetailedRatings: {}
    };
  }
  
  const stat = stats[0];
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  stat.ratingDistribution.forEach(rating => {
    distribution[rating] = (distribution[rating] || 0) + 1;
  });
  
  return {
    totalReviews: stat.totalReviews,
    averageRating: Math.round(stat.averageRating * 10) / 10,
    ratingDistribution: distribution,
    averageDetailedRatings: stat.averageDetailedRatings
  };
}

async function getDetailedStats(vetId) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const stats = await Appointment.aggregate([
    {
      $match: {
        vet: vetId,
        createdAt: { $gte: thirtyDaysAgo }
      }
    },
    {
      $group: {
        _id: null,
        totalAppointments: { $sum: 1 },
        completedAppointments: {
          $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
        },
        cancelledAppointments: {
          $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] }
        },
        averageSessionDuration: {
          $avg: "$consultation.actualDuration"
        },
        totalRevenue: {
          $sum: {
            $cond: [
              { $eq: ["$payment.status", "completed"] },
              "$payment.amount",
              0
            ]
          }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    averageSessionDuration: 0,
    totalRevenue: 0
  };
} 