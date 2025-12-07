import { NextResponse } from "next/server";
import { connectToDatabase } from "@/../db/dbConfig";
import Trainer from "@/../db/schema/trainer.schema";
import TrainingSession from "@/../db/schema/trainingSession.schema";

// GET - Fetch individual trainer profile
export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const includeReviews = searchParams.get("includeReviews") === "true";
    const includeStats = searchParams.get("includeStats") === "true";
    
    // Fetch trainer
    const trainer = await Trainer.findById(id)
      .select("-password")
      .lean();
    
    if (!trainer) {
      return NextResponse.json(
        { success: false, message: "Trainer not found" },
        { status: 404 }
      );
    }
    
    // Check if trainer is active and approved
    if (!trainer.isActive || trainer.approvalStatus !== "approved") {
      return NextResponse.json(
        { success: false, message: "Trainer profile not available" },
        { status: 403 }
      );
    }
    
    let enrichedTrainer = {
      ...trainer,
      isAvailableNow: checkCurrentAvailability(trainer.availability),
      nextAvailableSlot: getNextAvailableSlot(trainer.availability),
      responseTimeFormatted: formatResponseTime(trainer.stats.responseTime),
      availableSlots: getAvailableSlots(trainer.availability, 7) // Next 7 days
    };
    
    // Include reviews if requested
    if (includeReviews) {
      const reviews = await getTrainerReviews(id);
      enrichedTrainer.reviews = reviews;
      enrichedTrainer.reviewStats = await getReviewStats(id);
    }
    
    // Include detailed stats if requested
    if (includeStats) {
      enrichedTrainer.detailedStats = await getDetailedStats(id);
    }
    
    return NextResponse.json({
      success: true,
      data: enrichedTrainer
    });
    
  } catch (error) {
    console.error("Error fetching trainer:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch trainer" },
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

function getAvailableSlots(availability, days = 7) {
  const slots = [];
  const today = new Date();
  
  for (let i = 0; i < days; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() + i);
    const dayName = checkDate.toLocaleDateString('en-US', { weekday: 'lowercase' });
    
    const dayAvailability = availability[dayName];
    if (dayAvailability && dayAvailability.isAvailable) {
      dayAvailability.slots.forEach(slot => {
        if (!slot.isBooked) {
          slots.push({
            date: checkDate.toISOString().split('T')[0],
            day: dayName,
            startTime: slot.startTime,
            endTime: slot.endTime
          });
        }
      });
    }
  }
  
  return slots;
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

async function getTrainerReviews(trainerId) {
  // This would typically come from a reviews collection
  // For now, we'll get reviews from training sessions
  const sessions = await TrainingSession.find({
    trainer: trainerId,
    status: "completed",
    "userFeedback.rating": { $exists: true }
  })
  .populate("user", "name")
  .select("userFeedback petDetails.name createdAt")
  .sort({ createdAt: -1 })
  .limit(10)
  .lean();
  
  return sessions.map(session => ({
    user: session.user,
    rating: session.userFeedback.rating,
    review: session.userFeedback.review,
    petName: session.petDetails.name,
    date: session.createdAt,
    wouldRecommend: session.userFeedback.wouldRecommend
  }));
}

async function getReviewStats(trainerId) {
  const stats = await TrainingSession.aggregate([
    {
      $match: {
        trainer: mongoose.Types.ObjectId(trainerId),
        status: "completed",
        "userFeedback.rating": { $exists: true }
      }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$userFeedback.rating" },
        totalReviews: { $sum: 1 },
        ratings: {
          $push: "$userFeedback.rating"
        }
      }
    }
  ]);
  
  if (stats.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    };
  }
  
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  stats[0].ratings.forEach(rating => {
    distribution[rating] = (distribution[rating] || 0) + 1;
  });
  
  return {
    averageRating: stats[0].averageRating,
    totalReviews: stats[0].totalReviews,
    distribution
  };
}

async function getDetailedStats(trainerId) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const stats = await TrainingSession.aggregate([
    {
      $match: {
        trainer: mongoose.Types.ObjectId(trainerId),
        createdAt: { $gte: thirtyDaysAgo }
      }
    },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        completedSessions: {
          $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
        },
        cancelledSessions: {
          $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] }
        },
        averageSessionDuration: { $avg: "$session.actualDuration" },
        totalRevenue: { $sum: "$payment.amount" }
      }
    }
  ]);
  
  return stats[0] || {
    totalSessions: 0,
    completedSessions: 0,
    cancelledSessions: 0,
    averageSessionDuration: 0,
    totalRevenue: 0
  };
}