import { NextResponse } from "next/server";
import { connectToDatabase } from "@/../db/dbConfig";
import Appointment from "@/../db/schema/appointment.schema";
import Vet from "@/../db/schema/vet.schema";
import User from "@/../db/schema/user.schema";

// GET - Fetch individual appointment
export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    
    const { id } = await params;
    
    // Fetch appointment with populated user and vet data
    const appointment = await Appointment.findById(id)
      .populate("user", "name email phone avatar")
      .populate("vet", "name photo specializations rating consultationFee consultationModes")
      .lean();
    
    if (!appointment) {
      return NextResponse.json(
        { success: false, message: "Appointment not found" },
        { status: 404 }
      );
    }
    
    // Add computed fields
    const enrichedAppointment = {
      ...appointment,
      timeUntilAppointment: getTimeUntilAppointment(appointment.scheduledDate, appointment.scheduledTime.startTime),
      canCancel: canCancelAppointment(appointment),
      canReschedule: canRescheduleAppointment(appointment),
      canJoin: canJoinConsultation(appointment)
    };
    
    return NextResponse.json({
      success: true,
      data: enrichedAppointment
    });
    
  } catch (error) {
    console.error("Error fetching appointment:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch appointment" },
      { status: 500 }
    );
  }
}

// PUT - Update appointment
export async function PUT(request, { params }) {
  try {
    await connectToDatabase();
    
    const { id } = await params;
    const body = await request.json();
    
    // Find appointment
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return NextResponse.json(
        { success: false, message: "Appointment not found" },
        { status: 404 }
      );
    }
    
    // Update allowed fields
    const allowedUpdates = [
      'status', 'scheduledDate', 'scheduledTime', 'reason', 
      'petDetails', 'consultation', 'prescription', 'sessionSummary'
    ];
    
    const updates = {};
    Object.keys(body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = body[key];
      }
    });
    
    // Update appointment
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate("user", "name email phone avatar")
     .populate("vet", "name photo specializations rating consultationFee");
    
    return NextResponse.json({
      success: true,
      message: "Appointment updated successfully",
      data: updatedAppointment
    });
    
  } catch (error) {
    console.error("Error updating appointment:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update appointment" },
      { status: 500 }
    );
  }
}

// DELETE - Cancel appointment
export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();
    
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const reason = searchParams.get("reason") || "User cancelled";
    const cancelledBy = searchParams.get("cancelledBy") || "user";
    
    // Find appointment
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return NextResponse.json(
        { success: false, message: "Appointment not found" },
        { status: 404 }
      );
    }
    
    // Check if appointment can be cancelled
    if (!canCancelAppointment(appointment)) {
      return NextResponse.json(
        { success: false, message: "Appointment cannot be cancelled at this time" },
        { status: 400 }
      );
    }
    
    // Update appointment status and cancellation details
    appointment.status = "cancelled";
    appointment.cancellation = {
      cancelledBy,
      reason,
      cancelledAt: new Date(),
      refundStatus: "pending"
    };
    
    await appointment.save();
    
    // Free up the time slot
    await updateVetSlotAvailability(
      appointment.vet,
      appointment.scheduledDate,
      appointment.scheduledTime,
      false
    );
    
    return NextResponse.json({
      success: true,
      message: "Appointment cancelled successfully",
      data: appointment
    });
    
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    return NextResponse.json(
      { success: false, message: "Failed to cancel appointment" },
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