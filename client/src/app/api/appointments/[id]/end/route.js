import { NextResponse } from "next/server";
import { connectToDatabase } from "@/../db/dbConfig";
import Appointment from "@/../db/schema/appointment.schema";

// POST - End consultation
export async function POST(request, { params }) {
  try {
    await connectToDatabase();
    
    const { id } = await params;
    const body = await request.json();
    const {
      vetNotes,
      diagnosis,
      recommendations,
      actualDuration,
      prescriptionNeeded,
      sessionSummary,
      followUpRequired,
      followUpDate
    } = body;
    
    // Find appointment
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return NextResponse.json(
        { success: false, message: "Appointment not found" },
        { status: 404 }
      );
    }
    
    // Check if consultation can be ended
    if (appointment.status !== "in_progress") {
      return NextResponse.json(
        { success: false, message: "Consultation is not in progress" },
        { status: 400 }
      );
    }
    
    // Calculate actual duration if not provided
    let calculatedDuration = actualDuration;
    if (!calculatedDuration && appointment.consultation?.startedAt) {
      const startTime = new Date(appointment.consultation.startedAt);
      const endTime = new Date();
      calculatedDuration = Math.floor((endTime - startTime) / (1000 * 60)); // in minutes
    }
    
    // Update appointment status and consultation details
    appointment.status = "completed";
    appointment.consultation = {
      ...appointment.consultation,
      endedAt: new Date(),
      actualDuration: calculatedDuration,
      vetNotes: vetNotes || appointment.consultation?.vetNotes || "",
      diagnosis: diagnosis || appointment.consultation?.diagnosis || "",
      recommendations: recommendations || appointment.consultation?.recommendations || "",
      followUpRequired: followUpRequired || false,
      followUpDate: followUpDate ? new Date(followUpDate) : null
    };
    
    // Add session summary
    if (sessionSummary) {
      appointment.sessionSummary = sessionSummary;
    }
    
    // Handle prescription if needed
    if (prescriptionNeeded) {
      appointment.prescription = {
        ...appointment.prescription,
        isIssued: true,
        prescriptionId: generatePrescriptionId(),
        issuedAt: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days validity
      };
    }
    
    // Update payment status to completed if it was pending
    if (appointment.payment.status === "pending") {
      appointment.payment.status = "completed";
      appointment.payment.paidAt = new Date();
    }
    
    await appointment.save();
    
    // Update vet statistics
    await updateVetStats(appointment.vet, calculatedDuration);
    
    // Populate appointment for response
    const populatedAppointment = await Appointment.findById(id)
      .populate("user", "name email phone avatar")
      .populate("vet", "name photo specializations rating consultationFee")
      .lean();
    
    return NextResponse.json({
      success: true,
      message: "Consultation ended successfully",
      data: populatedAppointment
    });
    
  } catch (error) {
    console.error("Error ending consultation:", error);
    return NextResponse.json(
      { success: false, message: "Failed to end consultation" },
      { status: 500 }
    );
  }
}

// Helper functions
function generatePrescriptionId() {
  return 'RX-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
}

async function updateVetStats(vetId, duration) {
  try {
    const Vet = (await import("@/../db/schema/vet.schema")).default;
    
    await Vet.updateOne(
      { _id: vetId },
      { 
        $inc: { 
          "stats.totalConsultations": 1,
          "stats.totalPatients": 1
        }
      }
    );
  } catch (error) {
    console.error("Error updating vet stats:", error);
  }
} 