import { NextResponse } from "next/server";
import { connectToDatabase } from "@/../db/dbConfig";
import Vet from "@/../db/schema/vet.schema";
import Appointment from "@/../db/schema/appointment.schema";
import VetReview from "@/../db/schema/vetReview.schema";

// GET - Fetch vet statistics for dashboard
export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "month"; // week, month, quarter, year
    
    // Find vet
    const vet = await Vet.findById(id);
    if (!vet) {
      return NextResponse.json(
        { success: false, message: "Vet not found" },
        { status: 404 }
      );
    }
    
    // Calculate date range based on period
    const now = new Date();
    let startDate;
    
    switch (period) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "quarter":
        const quarterStart = Math.floor(now.getMonth() / 3) * 3;
        startDate = new Date(now.getFullYear(), quarterStart, 1);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    
    // Fetch appointments for the period
    const appointments = await Appointment.find({
      vet: id,
      createdAt: { $gte: startDate }
    }).lean();
    
    // Fetch all-time appointments for overall stats
    const allAppointments = await Appointment.find({ vet: id }).lean();
    
    // Fetch reviews for the period
    const reviews = await VetReview.find({
      vet: id,
      createdAt: { $gte: startDate }
    }).lean();
    
    // Calculate statistics
    const stats = {
      // Period stats
      period: {
        totalAppointments: appointments.length,
        completedAppointments: appointments.filter(a => a.status === "completed").length,
        cancelledAppointments: appointments.filter(a => a.status === "cancelled").length,
        totalEarnings: appointments
          .filter(a => a.status === "completed")
          .reduce((sum, a) => sum + (a.payment?.amount || 0), 0),
        averageRating: reviews.length > 0 
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
          : 0,
        newReviews: reviews.length,
        totalPatients: new Set(appointments.map(a => a.user.toString())).size
      },
      
      // All-time stats
      allTime: {
        totalAppointments: allAppointments.length,
        completedAppointments: allAppointments.filter(a => a.status === "completed").length,
        totalEarnings: allAppointments
          .filter(a => a.status === "completed")
          .reduce((sum, a) => sum + (a.payment?.amount || 0), 0),
        totalPatients: new Set(allAppointments.map(a => a.user.toString())).size,
        averageRating: vet.rating?.average || 0,
        totalReviews: vet.rating?.totalReviews || 0
      },
      
      // Consultation type breakdown
      consultationTypes: {
        video: appointments.filter(a => a.consultationType === "video").length,
        audio: appointments.filter(a => a.consultationType === "audio").length,
        chat: appointments.filter(a => a.consultationType === "chat").length
      },
      
      // Status breakdown
      statusBreakdown: {
        scheduled: appointments.filter(a => a.status === "scheduled").length,
        confirmed: appointments.filter(a => a.status === "confirmed").length,
        in_progress: appointments.filter(a => a.status === "in_progress").length,
        completed: appointments.filter(a => a.status === "completed").length,
        cancelled: appointments.filter(a => a.status === "cancelled").length,
        no_show: appointments.filter(a => a.status === "no_show").length
      },
      
      // Urgency level breakdown
      urgencyBreakdown: {
        Low: appointments.filter(a => a.petDetails?.urgencyLevel === "Low").length,
        Medium: appointments.filter(a => a.petDetails?.urgencyLevel === "Medium").length,
        High: appointments.filter(a => a.petDetails?.urgencyLevel === "High").length,
        Emergency: appointments.filter(a => a.petDetails?.urgencyLevel === "Emergency").length
      },
      
      // Daily appointments for the period (for charts)
      dailyAppointments: getDailyAppointments(appointments, startDate, now),
      
      // Recent activity
      recentAppointments: appointments
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(a => ({
          id: a._id,
          appointmentId: a.appointmentId,
          petName: a.petDetails?.name,
          petSpecies: a.petDetails?.species,
          status: a.status,
          consultationType: a.consultationType,
          scheduledDate: a.scheduledDate,
          scheduledTime: a.scheduledTime,
          urgencyLevel: a.petDetails?.urgencyLevel
        })),
      
      // Performance metrics
      performance: {
        completionRate: allAppointments.length > 0 
          ? (allAppointments.filter(a => a.status === "completed").length / allAppointments.length) * 100 
          : 0,
        cancellationRate: allAppointments.length > 0 
          ? (allAppointments.filter(a => a.status === "cancelled").length / allAppointments.length) * 100 
          : 0,
        noShowRate: allAppointments.length > 0 
          ? (allAppointments.filter(a => a.status === "no_show").length / allAppointments.length) * 100 
          : 0,
        averageConsultationDuration: calculateAverageConsultationDuration(allAppointments),
        responseTime: vet.stats?.responseTime || 0
      }
    };
    
    return NextResponse.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error("Error fetching vet stats:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}

// Helper functions
function getDailyAppointments(appointments, startDate, endDate) {
  const dailyStats = {};
  const currentDate = new Date(startDate);
  
  // Initialize all days with 0
  while (currentDate <= endDate) {
    const dateKey = currentDate.toISOString().split('T')[0];
    dailyStats[dateKey] = 0;
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Count appointments by day
  appointments.forEach(appointment => {
    const appointmentDate = new Date(appointment.createdAt).toISOString().split('T')[0];
    if (dailyStats.hasOwnProperty(appointmentDate)) {
      dailyStats[appointmentDate]++;
    }
  });
  
  return Object.entries(dailyStats).map(([date, count]) => ({
    date,
    appointments: count
  }));
}

function calculateAverageConsultationDuration(appointments) {
  const completedAppointments = appointments.filter(a => 
    a.status === "completed" && 
    a.consultation?.actualDuration
  );
  
  if (completedAppointments.length === 0) return 0;
  
  const totalDuration = completedAppointments.reduce((sum, a) => 
    sum + (a.consultation.actualDuration || 0), 0
  );
  
  return Math.round(totalDuration / completedAppointments.length);
} 