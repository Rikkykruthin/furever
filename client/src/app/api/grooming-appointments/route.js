import { NextResponse } from "next/server";
import { connectToDatabase } from "@/../db/dbConfig";
import GroomingAppointment from "@/../db/schema/groomingAppointment.schema";
import Groomer from "@/../db/schema/groomer.schema";
import User from "@/../db/schema/user.schema";

// GET - Fetch grooming appointments with filtering
export async function GET(request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    
    // Query parameters
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const userId = searchParams.get("userId");
    const groomerId = searchParams.get("groomerId");
    const status = searchParams.get("status");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const upcoming = searchParams.get("upcoming") === "true";
    const serviceType = searchParams.get("serviceType");
    
    // Build filter
    const filter = {};
    
    if (userId) filter.user = userId;
    if (groomerId) filter.groomer = groomerId;
    if (status) filter.status = status;
    if (serviceType) filter.serviceType = serviceType;
    
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
    
    // Fetch grooming appointments
    const appointments = await GroomingAppointment.find(filter)
      .populate("user", "name email phone")
      .populate("groomer", "name photo groomingSpecialties rating salon.name")
      .sort({ scheduledDate: upcoming ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Get total count
    const totalAppointments = await GroomingAppointment.countDocuments(filter);
    const totalPages = Math.ceil(totalAppointments / limit);
    
    // Enrich appointments with computed fields
    const enrichedAppointments = appointments.map(appointment => ({
      ...appointment,
      timeUntilAppointment: getTimeUntilAppointment(appointment.scheduledDate, appointment.scheduledTime.startTime),
      canCancel: canCancelAppointment(appointment),
      canReschedule: canRescheduleAppointment(appointment),
      estimatedCompletion: getEstimatedCompletion(appointment)
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
    console.error("Error fetching grooming appointments:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch grooming appointments" },
      { status: 500 }
    );
  }
}

// POST - Create new grooming appointment (booking)
export async function POST(request) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const {
      userId,
      groomerId,
      petDetails,
      scheduledDate,
      scheduledTime,
      serviceType,
      servicesRequested,
      groomingStyle,
      location,
      paymentMethod,
      specialInstructions
    } = body;
    
    // Validation
    if (!userId || !groomerId || !petDetails || !scheduledDate || !scheduledTime || 
        !serviceType || !servicesRequested || servicesRequested.length === 0) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Verify user and groomer exist
    const [user, groomer] = await Promise.all([
      User.findById(userId),
      Groomer.findById(groomerId)
    ]);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }
    
    if (!groomer || !groomer.isActive || groomer.approvalStatus !== "approved") {
      return NextResponse.json(
        { success: false, message: "Groomer not available" },
        { status: 404 }
      );
    }
    
    // Check if groomer provides the requested service type
    if (!groomer.serviceTypes.includes(serviceType) && !groomer.serviceTypes.includes("both")) {
      return NextResponse.json(
        { success: false, message: "Groomer does not provide the requested service type" },
        { status: 400 }
      );
    }
    
    // Check if slot is available
    const isSlotAvailable = await checkSlotAvailability(groomerId, scheduledDate, scheduledTime);
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
    
    // Calculate pricing
    const totalDuration = servicesRequested.reduce((sum, service) => sum + (service.duration || 60), 0);
    const baseAmount = servicesRequested.reduce((sum, service) => sum + (service.price || 0), 0);
    const addOnAmount = servicesRequested.filter(s => s.isAddOn).reduce((sum, service) => sum + (service.price || 0), 0);
    
    // Calculate travel fee for mobile service
    let travelFee = 0;
    if (serviceType === "mobile" && location && location.address) {
      travelFee = calculateTravelFee(groomer.location, location);
    }
    
    const totalAmount = baseAmount + addOnAmount + travelFee;
    
    // Generate appointment ID before creating
    const appointmentId = 'GRM-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    // Create grooming appointment
    const appointment = new GroomingAppointment({
      appointmentId, // Explicitly set appointmentId
      user: userId,
      groomer: groomerId,
      petDetails: {
        ...petDetails,
        specialInstructions: specialInstructions || ""
      },
      scheduledDate: new Date(scheduledDate),
      scheduledTime,
      serviceType,
      servicesRequested,
      totalDuration,
      groomingStyle: groomingStyle || {},
      location: location || (serviceType === "mobile" ? {} : { type: "salon" }),
      payment: {
        baseAmount,
        addOnAmount,
        travelFee,
        totalAmount,
        currency: groomer.currency || "USD",
        paymentMethod: paymentMethod || "stripe",
        status: "pending"
      }
    });
    
    await appointment.save();
    
    // Mark slot as booked in groomer's availability
    await updateGroomerSlotAvailability(groomerId, scheduledDate, scheduledTime, true);
    
    // Populate appointment for response
    const populatedAppointment = await GroomingAppointment.findById(appointment._id)
      .populate("user", "name email phone")
      .populate("groomer", "name photo groomingSpecialties rating salon.name")
      .lean();
    
    return NextResponse.json({
      success: true,
      message: "Grooming appointment booked successfully",
      data: populatedAppointment
    }, { status: 201 });
    
  } catch (error) {
    console.error("Error creating grooming appointment:", error);
    return NextResponse.json(
      { success: false, message: "Failed to book grooming appointment" },
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
  
  const timeDiff = appointmentDate.getTime() - now.getTime();
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hoursLeft = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutesLeft = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (timeDiff < 0) return "Past";
  if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
  if (hoursLeft > 0) return `${hoursLeft} hour${hoursLeft > 1 ? 's' : ''}`;
  return `${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}`;
}

function canCancelAppointment(appointment) {
  const now = new Date();
  const appointmentDate = new Date(appointment.scheduledDate);
  const [hours, minutes] = appointment.scheduledTime.startTime.split(':');
  appointmentDate.setHours(hours, minutes);
  
  // Can cancel if appointment is more than 24 hours away and not already started
  const hoursUntilAppointment = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  return hoursUntilAppointment > 24 && appointment.status === "scheduled";
}

function canRescheduleAppointment(appointment) {
  const now = new Date();
  const appointmentDate = new Date(appointment.scheduledDate);
  const [hours, minutes] = appointment.scheduledTime.startTime.split(':');
  appointmentDate.setHours(hours, minutes);
  
  // Can reschedule if appointment is more than 48 hours away
  const hoursUntilAppointment = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  return hoursUntilAppointment > 48 && appointment.status === "scheduled";
}

function getEstimatedCompletion(appointment) {
  const startDate = new Date(appointment.scheduledDate);
  const [hours, minutes] = appointment.scheduledTime.startTime.split(':');
  startDate.setHours(hours, minutes);
  
  const endTime = new Date(startDate.getTime() + (appointment.totalDuration * 60 * 1000));
  return endTime.toTimeString().slice(0, 5);
}

async function checkSlotAvailability(groomerId, scheduledDate, scheduledTime) {
  // Check if groomer has availability for this slot
  const groomer = await Groomer.findById(groomerId);
  if (!groomer) return false;
  
  const dayOfWeek = new Date(scheduledDate).toLocaleDateString('en-US', { weekday: 'lowercase' });
  const dayAvailability = groomer.availability[dayOfWeek];
  
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
  
  // Check if there's already an appointment booked at this time
  const existingAppointment = await GroomingAppointment.findOne({
    groomer: groomerId,
    scheduledDate: new Date(scheduledDate),
    "scheduledTime.startTime": scheduledTime.startTime,
    status: { $in: ["scheduled", "confirmed", "in_progress"] }
  });
  
  return !existingAppointment;
}

async function updateGroomerSlotAvailability(groomerId, scheduledDate, scheduledTime, isBooked) {
  const dayOfWeek = new Date(scheduledDate).toLocaleDateString('en-US', { weekday: 'lowercase' });
  
  await Groomer.updateOne(
    {
      _id: groomerId,
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

function calculateTravelFee(groomerLocation, appointmentLocation) {
  // Simplified travel fee calculation
  // In real app, would use Google Maps API or similar
  return 15; // Base travel fee
}