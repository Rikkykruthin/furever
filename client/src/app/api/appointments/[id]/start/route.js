import { NextResponse } from "next/server";
import { connectToDatabase } from "@/../db/dbConfig";
import Appointment from "@/../db/schema/appointment.schema";

// POST - Start consultation
export async function POST(request, { params }) {
  try {
    await connectToDatabase();
    
    const { id } = await params;
    
    // Find appointment
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return NextResponse.json(
        { success: false, message: "Appointment not found" },
        { status: 404 }
      );
    }
    
    // Check if appointment can be started
    if (!canStartConsultation(appointment)) {
      return NextResponse.json(
        { success: false, message: "Consultation cannot be started at this time" },
        { status: 400 }
      );
    }
    
    // Update appointment status and consultation details
    appointment.status = "in_progress";
    appointment.consultation = {
      ...appointment.consultation,
      startedAt: new Date(),
      sessionId: generateSessionId(),
      roomId: `room_${appointment.appointmentId}`,
      connectionQuality: "good"
    };
    
    await appointment.save();
    
    // Populate appointment for response
    const populatedAppointment = await Appointment.findById(id)
      .populate("user", "name email phone avatar")
      .populate("vet", "name photo specializations rating consultationFee")
      .lean();
    
    return NextResponse.json({
      success: true,
      message: "Consultation started successfully",
      data: populatedAppointment
    });
    
  } catch (error) {
    console.error("Error starting consultation:", error);
    return NextResponse.json(
      { success: false, message: "Failed to start consultation" },
      { status: 500 }
    );
  }
}

// Helper functions
function canStartConsultation(appointment) {
  const now = new Date();
  const appointmentDate = new Date(appointment.scheduledDate);
  const [hours, minutes] = appointment.scheduledTime.startTime.split(':');
  appointmentDate.setHours(hours, minutes);
  
  // Can start consultation 10 minutes before scheduled time
  const minutesUntilAppointment = (appointmentDate - now) / (1000 * 60);
  const startableStatuses = ["scheduled", "confirmed"];
  
  return minutesUntilAppointment <= 10 && minutesUntilAppointment >= -30 && startableStatuses.includes(appointment.status);
}

function generateSessionId() {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
} 