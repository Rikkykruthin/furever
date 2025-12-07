import { NextResponse } from "next/server";
import { connectToDatabase } from "@/../db/dbConfig";
import Appointment from "@/../db/schema/appointment.schema";
import Vet from "@/../db/schema/vet.schema";
import User from "@/../db/schema/user.schema";

// GET - Fetch appointments with filtering
export async function GET(request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    
    // Query parameters
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const userId = searchParams.get("userId");
    const vetId = searchParams.get("vetId");
    const status = searchParams.get("status");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const upcoming = searchParams.get("upcoming") === "true";
    
    // Build filter
    const filter = {};
    
    if (userId) filter.user = userId;
    if (vetId) filter.vet = vetId;
    if (status) filter.status = status;
    
    // Date filtering
    if (dateFrom || dateTo) {
      filter.scheduledDate = {};
      if (dateFrom) filter.scheduledDate.$gte = new Date(dateFrom);
      if (dateTo) filter.scheduledDate.$lte = new Date(dateTo);
    }
    
    // Upcoming appointments only
    if (upcoming) {
      filter.scheduledDate = { $gte: new Date() };
      filter.status = { $in: ["scheduled", "confirmed"] };
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Fetch appointments
    const appointments = await Appointment.find(filter)
      .populate("user", "name email phone")
      .populate("vet", "name photo specializations rating consultationFee")
      .sort({ scheduledDate: upcoming ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Get total count
    const totalAppointments = await Appointment.countDocuments(filter);
    const totalPages = Math.ceil(totalAppointments / limit);
    
    // Enrich appointments with computed fields
    const enrichedAppointments = appointments.map(appointment => ({
      ...appointment,
      timeUntilAppointment: getTimeUntilAppointment(appointment.scheduledDate, appointment.scheduledTime.startTime),
      canCancel: canCancelAppointment(appointment),
      canReschedule: canRescheduleAppointment(appointment),
      canJoin: canJoinConsultation(appointment)
    }));
    
    return NextResponse.json({
      success: true,
      data: {
        appointments: enrichedAppointments,
        pagination: {
          currentPage: page,
          totalPages,
          totalAppointments,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
    
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}

// POST - Create new appointment (booking)
export async function POST(request) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const {
      userId,
      vetId,
      petDetails,
      scheduledDate,
      scheduledTime,
      consultationType,
      reason,
      mediaFiles,
      paymentMethod,
      urgencyLevel
    } = body;
    
    // Validation
    if (!userId || !vetId || !petDetails || !scheduledDate || !scheduledTime || !consultationType || !reason) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Verify user and vet exist
    const [user, vet] = await Promise.all([
      User.findById(userId),
      Vet.findById(vetId)
    ]);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }
    
    if (!vet || !vet.isActive || vet.approvalStatus !== "approved") {
      return NextResponse.json(
        { success: false, message: "Vet not available" },
        { status: 404 }
      );
    }
    
    // Check if slot is available
    const isSlotAvailable = await checkSlotAvailability(vetId, scheduledDate, scheduledTime);
    if (!isSlotAvailable) {
      return NextResponse.json(
        { success: false, message: "Selected time slot is not available. Please choose a different time." },
        { status: 400 }
      );
    }
    
    // Validate appointment time is in the future
    const appointmentDateTime = new Date(scheduledDate);
    const [hours, minutes] = scheduledTime.startTime.split(':');
    appointmentDateTime.setHours(hours, minutes);
    
    if (appointmentDateTime <= new Date()) {
      return NextResponse.json(
        { success: false, message: "Appointment time must be in the future" },
        { status: 400 }
      );
    }
    
    // Generate appointment ID before creating
    const appointmentId = 'APT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    // Create appointment
    const appointment = new Appointment({
      appointmentId, // Explicitly set appointmentId
      user: userId,
      vet: vetId,
      petDetails: {
        ...petDetails,
        urgencyLevel: urgencyLevel || "Medium"
      },
      scheduledDate: new Date(scheduledDate),
      scheduledTime,
      consultationType,
      reason,
      mediaFiles: mediaFiles || [],
      payment: {
        amount: vet.consultationFee,
        currency: vet.currency || "USD",
        paymentMethod: paymentMethod || "stripe",
        status: "pending"
      }
    });
    
    await appointment.save();
    
    // Mark slot as booked in vet's availability
    await updateVetSlotAvailability(vetId, scheduledDate, scheduledTime, true);
    
    // Populate appointment for response
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate("user", "name email phone")
      .populate("vet", "name photo specializations rating consultationFee")
      .lean();
    
    return NextResponse.json({
      success: true,
      message: "Appointment booked successfully",
      data: populatedAppointment
    }, { status: 201 });
    
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { success: false, message: "Failed to book appointment" },
      { status: 500 }
    );
  }
}

// Helper functions
function getTimeUntilAppointment(scheduledDate, startTime) {
  const now = new Date();
  const appointmentDate = new Date(scheduledDate);
  const [hours, minutes] = startTime.split(':');
  appointmentDate.setHours(hours, minutes);
  
  const diffMs = appointmentDate - now;
  
  if (diffMs < 0) return 'Past';
  
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMinutes < 60) return `${diffMinutes}m`;
  if (diffHours < 24) return `${diffHours}h ${diffMinutes % 60}m`;
  return `${diffDays}d ${diffHours % 24}h`;
}

function canCancelAppointment(appointment) {
  const now = new Date();
  const appointmentDate = new Date(appointment.scheduledDate);
  const [hours, minutes] = appointment.scheduledTime.startTime.split(':');
  appointmentDate.setHours(hours, minutes);
  
  // Can cancel if appointment is at least 2 hours away and status allows
  const hoursUntilAppointment = (appointmentDate - now) / (1000 * 60 * 60);
  const cancellableStatuses = ["scheduled", "confirmed"];
  
  return hoursUntilAppointment >= 2 && cancellableStatuses.includes(appointment.status);
}

function canRescheduleAppointment(appointment) {
  const now = new Date();
  const appointmentDate = new Date(appointment.scheduledDate);
  const [hours, minutes] = appointment.scheduledTime.startTime.split(':');
  appointmentDate.setHours(hours, minutes);
  
  // Can reschedule if appointment is at least 4 hours away and status allows
  const hoursUntilAppointment = (appointmentDate - now) / (1000 * 60 * 60);
  const reschedulableStatuses = ["scheduled", "confirmed"];
  
  return hoursUntilAppointment >= 4 && reschedulableStatuses.includes(appointment.status);
}

function canJoinConsultation(appointment) {
  const now = new Date();
  const appointmentDate = new Date(appointment.scheduledDate);
  const [hours, minutes] = appointment.scheduledTime.startTime.split(':');
  appointmentDate.setHours(hours, minutes);
  
  // Can join 10 minutes before appointment time
  const minutesUntilAppointment = (appointmentDate - now) / (1000 * 60);
  const joinableStatuses = ["confirmed", "in_progress"];
  
  return minutesUntilAppointment <= 10 && minutesUntilAppointment >= -30 && joinableStatuses.includes(appointment.status);
}

async function checkSlotAvailability(vetId, scheduledDate, scheduledTime) {
  const appointmentDate = new Date(scheduledDate);
  const dayName = appointmentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  
  // Check vet's availability schedule
  const vet = await Vet.findById(vetId);
  if (!vet) return false;
  
  const daySchedule = vet.availability[dayName];
  if (!daySchedule || !daySchedule.isAvailable) return false;
  
  // Check if specific slot exists and is not booked
  const slot = daySchedule.slots.find(s => 
    s.startTime === scheduledTime.startTime && 
    s.endTime === scheduledTime.endTime
  );
  
  if (!slot || slot.isBooked) return false;
  
  // Check if there's no conflicting appointment
  const conflictingAppointment = await Appointment.findOne({
    vet: vetId,
    scheduledDate: {
      $gte: new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate()),
      $lt: new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate() + 1)
    },
    $or: [
      {
        "scheduledTime.startTime": { $lte: scheduledTime.startTime },
        "scheduledTime.endTime": { $gt: scheduledTime.startTime }
      },
      {
        "scheduledTime.startTime": { $lt: scheduledTime.endTime },
        "scheduledTime.endTime": { $gte: scheduledTime.endTime }
      },
      {
        "scheduledTime.startTime": { $gte: scheduledTime.startTime },
        "scheduledTime.endTime": { $lte: scheduledTime.endTime }
      }
    ],
    status: { $nin: ["cancelled", "completed", "no_show"] }
  });
  
  return !conflictingAppointment;
}

async function updateVetSlotAvailability(vetId, scheduledDate, scheduledTime, isBooked) {
  const appointmentDate = new Date(scheduledDate);
  const dayName = appointmentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  
  await Vet.updateOne(
    {
      _id: vetId,
      [`availability.${dayName}.slots`]: {
        $elemMatch: {
          startTime: scheduledTime.startTime,
          endTime: scheduledTime.endTime
        }
      }
    },
    {
      $set: {
        [`availability.${dayName}.slots.$.isBooked`]: isBooked
      }
    }
  );
} 