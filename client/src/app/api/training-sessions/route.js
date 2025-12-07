import { NextResponse } from "next/server";
import { connectToDatabase } from "@/../db/dbConfig";
import TrainingSession from "@/../db/schema/trainingSession.schema";
import Trainer from "@/../db/schema/trainer.schema";
import User from "@/../db/schema/user.schema";

// GET - Fetch training sessions with filtering
export async function GET(request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    
    // Query parameters
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const userId = searchParams.get("userId");
    const trainerId = searchParams.get("trainerId");
    const status = searchParams.get("status");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const upcoming = searchParams.get("upcoming") === "true";
    
    // Build filter
    const filter = {};
    
    if (userId) filter.user = userId;
    if (trainerId) filter.trainer = trainerId;
    if (status) filter.status = status;
    
    // Date filtering
    if (dateFrom || dateTo) {
      filter.scheduledDate = {};
      if (dateFrom) filter.scheduledDate.$gte = new Date(dateFrom);
      if (dateTo) filter.scheduledDate.$lte = new Date(dateTo);
    }
    
    // Upcoming sessions only
    if (upcoming) {
      filter.scheduledDate = { $gte: new Date() };
      filter.status = { $in: ["scheduled", "confirmed"] };
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Fetch training sessions
    const sessions = await TrainingSession.find(filter)
      .populate("user", "name email phone")
      .populate("trainer", "name photo trainingSpecialties rating sessionFee")
      .sort({ scheduledDate: upcoming ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Get total count
    const totalSessions = await TrainingSession.countDocuments(filter);
    const totalPages = Math.ceil(totalSessions / limit);
    
    // Enrich sessions with computed fields
    const enrichedSessions = sessions.map(session => ({
      ...session,
      timeUntilSession: getTimeUntilSession(session.scheduledDate, session.scheduledTime.startTime),
      canCancel: canCancelSession(session),
      canReschedule: canRescheduleSession(session),
      canJoin: canJoinSession(session)
    }));
    
    return NextResponse.json({
      success: true,
      data: {
        sessions: enrichedSessions,
        pagination: {
          currentPage: page,
          totalPages,
          totalSessions,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
    
  } catch (error) {
    console.error("Error fetching training sessions:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch training sessions" },
      { status: 500 }
    );
  }
}

// POST - Create new training session (booking)
export async function POST(request) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const {
      userId,
      trainerId,
      petDetails,
      scheduledDate,
      scheduledTime,
      trainingType,
      trainingCategory,
      sessionObjectives,
      paymentMethod,
      location,
      specialRequirements
    } = body;
    
    // Validation
    if (!userId || !trainerId || !petDetails || !scheduledDate || !scheduledTime || 
        !trainingType || !trainingCategory || !sessionObjectives) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Verify user and trainer exist
    const [user, trainer] = await Promise.all([
      User.findById(userId),
      Trainer.findById(trainerId)
    ]);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }
    
    if (!trainer || !trainer.isActive || trainer.approvalStatus !== "approved") {
      return NextResponse.json(
        { success: false, message: "Trainer not available" },
        { status: 404 }
      );
    }
    
    // Check if slot is available
    const isSlotAvailable = await checkSlotAvailability(trainerId, scheduledDate, scheduledTime);
    if (!isSlotAvailable) {
      return NextResponse.json(
        { success: false, message: "Selected time slot is not available. Please choose a different time." },
        { status: 400 }
      );
    }
    
    // Validate session time is in the future
    const sessionDateTime = new Date(scheduledDate);
    const [hours, minutes] = scheduledTime.startTime.split(':');
    sessionDateTime.setHours(hours, minutes);
    
    if (sessionDateTime <= new Date()) {
      return NextResponse.json(
        { success: false, message: "Session time must be in the future" },
        { status: 400 }
      );
    }
    
    // Create training session
    const session = new TrainingSession({
      user: userId,
      trainer: trainerId,
      petDetails,
      scheduledDate: new Date(scheduledDate),
      scheduledTime,
      trainingType,
      trainingCategory,
      sessionObjectives,
      location: location || { type: "online" },
      specialRequirements: specialRequirements || {},
      payment: {
        amount: trainer.sessionFee,
        currency: trainer.currency || "USD",
        paymentMethod: paymentMethod || "mock",
        status: "pending"
      }
    });
    
    await session.save();
    
    // Mark slot as booked in trainer's availability
    await updateTrainerSlotAvailability(trainerId, scheduledDate, scheduledTime, true);
    
    // Populate session for response
    const populatedSession = await TrainingSession.findById(session._id)
      .populate("user", "name email phone")
      .populate("trainer", "name photo trainingSpecialties rating sessionFee")
      .lean();
    
    return NextResponse.json({
      success: true,
      message: "Training session booked successfully",
      data: populatedSession
    }, { status: 201 });
    
  } catch (error) {
    console.error("Error creating training session:", error);
    return NextResponse.json(
      { success: false, message: "Failed to book training session" },
      { status: 500 }
    );
  }
}

// Helper functions
function getTimeUntilSession(scheduledDate, startTime) {
  const now = new Date();
  const sessionDate = new Date(scheduledDate);
  const [hours, minutes] = startTime.split(':');
  sessionDate.setHours(hours, minutes);
  
  const timeDiff = sessionDate.getTime() - now.getTime();
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hoursLeft = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutesLeft = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (timeDiff < 0) return "Past";
  if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
  if (hoursLeft > 0) return `${hoursLeft} hour${hoursLeft > 1 ? 's' : ''}`;
  return `${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}`;
}

function canCancelSession(session) {
  const now = new Date();
  const sessionDate = new Date(session.scheduledDate);
  const [hours, minutes] = session.scheduledTime.startTime.split(':');
  sessionDate.setHours(hours, minutes);
  
  // Can cancel if session is more than 24 hours away and not already started
  const hoursUntilSession = (sessionDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  return hoursUntilSession > 24 && session.status === "scheduled";
}

function canRescheduleSession(session) {
  const now = new Date();
  const sessionDate = new Date(session.scheduledDate);
  const [hours, minutes] = session.scheduledTime.startTime.split(':');
  sessionDate.setHours(hours, minutes);
  
  // Can reschedule if session is more than 48 hours away
  const hoursUntilSession = (sessionDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  return hoursUntilSession > 48 && session.status === "scheduled";
}

function canJoinSession(session) {
  const now = new Date();
  const sessionDate = new Date(session.scheduledDate);
  const [hours, minutes] = session.scheduledTime.startTime.split(':');
  sessionDate.setHours(hours, minutes);
  
  // Can join 15 minutes before until session end time
  const minutesUntilSession = (sessionDate.getTime() - now.getTime()) / (1000 * 60);
  const sessionEndTime = new Date(sessionDate.getTime() + (session.scheduledTime.duration * 60 * 1000));
  
  return minutesUntilSession <= 15 && 
         now <= sessionEndTime && 
         session.status === "confirmed" &&
         session.trainingType === "video";
}

async function checkSlotAvailability(trainerId, scheduledDate, scheduledTime) {
  // Check if trainer has availability for this slot
  const trainer = await Trainer.findById(trainerId);
  if (!trainer) return false;
  
  const dayOfWeek = new Date(scheduledDate).toLocaleDateString('en-US', { weekday: 'lowercase' });
  const dayAvailability = trainer.availability[dayOfWeek];
  
  if (!dayAvailability || !dayAvailability.isAvailable) {
    return false;
  }
  
  // Check if the specific time slot is available
  const isTimeSlotAvailable = dayAvailability.slots.some(slot => {
    return scheduledTime.startTime >= slot.startTime && 
           scheduledTime.endTime <= slot.endTime && 
           !slot.isBooked;
  });
  
  if (!isTimeSlotAvailable) {
    return false;
  }
  
  // Check if there's already a session booked at this time
  const existingSession = await TrainingSession.findOne({
    trainer: trainerId,
    scheduledDate: new Date(scheduledDate),
    "scheduledTime.startTime": scheduledTime.startTime,
    status: { $in: ["scheduled", "confirmed", "in_progress"] }
  });
  
  return !existingSession;
}

async function updateTrainerSlotAvailability(trainerId, scheduledDate, scheduledTime, isBooked) {
  const dayOfWeek = new Date(scheduledDate).toLocaleDateString('en-US', { weekday: 'lowercase' });
  
  await Trainer.updateOne(
    {
      _id: trainerId,
      [`availability.${dayOfWeek}.slots`]: {
        $elemMatch: {
          startTime: { $lte: scheduledTime.startTime },
          endTime: { $gte: scheduledTime.endTime }
        }
      }
    },
    {
      $set: { [`availability.${dayOfWeek}.slots.$.isBooked`]: isBooked }
    }
  );
}