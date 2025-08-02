import { NextResponse } from "next/server";
import { connectToDatabase } from "@/../db/dbConfig";
import Appointment from "@/../db/schema/appointment.schema";

// POST - Send message during consultation
export async function POST(request, { params }) {
  try {
    await connectToDatabase();
    
    const { id } = await params;
    const body = await request.json();
    const {
      sender,
      message,
      messageType = "text",
      fileUrl,
      timestamp = new Date()
    } = body;
    
    // Validate required fields
    if (!sender || !message) {
      return NextResponse.json(
        { success: false, message: "Sender and message are required" },
        { status: 400 }
      );
    }
    
    // Find appointment
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return NextResponse.json(
        { success: false, message: "Appointment not found" },
        { status: 404 }
      );
    }
    
    // Check if consultation is active
    if (appointment.status !== "in_progress") {
      return NextResponse.json(
        { success: false, message: "Consultation is not active" },
        { status: 400 }
      );
    }
    
    // Create message object
    const newMessage = {
      sender,
      message,
      messageType,
      timestamp: new Date(timestamp),
      fileUrl: fileUrl || null
    };
    
    // Initialize consultation.messages if it doesn't exist
    if (!appointment.consultation) {
      appointment.consultation = {};
    }
    if (!appointment.consultation.messages) {
      appointment.consultation.messages = [];
    }
    
    // Add message to consultation
    appointment.consultation.messages.push(newMessage);
    
    // Update last activity
    appointment.consultation.lastActivity = new Date();
    
    await appointment.save();
    
    return NextResponse.json({
      success: true,
      message: "Message sent successfully",
      data: {
        messageId: newMessage._id,
        message: newMessage,
        totalMessages: appointment.consultation.messages.length
      }
    });
    
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send message" },
      { status: 500 }
    );
  }
}

// GET - Fetch consultation messages
export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit")) || 50;
    const skip = parseInt(searchParams.get("skip")) || 0;
    
    // Find appointment
    const appointment = await Appointment.findById(id)
      .select("consultation.messages")
      .lean();
    
    if (!appointment) {
      return NextResponse.json(
        { success: false, message: "Appointment not found" },
        { status: 404 }
      );
    }
    
    // Get messages with pagination
    const messages = appointment.consultation?.messages || [];
    const paginatedMessages = messages
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .slice(skip, skip + limit);
    
    return NextResponse.json({
      success: true,
      data: {
        messages: paginatedMessages,
        totalMessages: messages.length,
        hasMore: skip + limit < messages.length
      }
    });
    
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch messages" },
      { status: 500 }
    );
  }
} 