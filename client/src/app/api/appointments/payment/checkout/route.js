import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

import { NextResponse } from "next/server";
import { connectToDatabase } from "@/../db/dbConfig";
import Appointment from "@/../db/schema/appointment.schema";

export async function POST(request) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { appointmentId, userId, vetId, amount, currency = "USD" } = body;
    
    if (!appointmentId || !amount) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Verify appointment exists and populate vet
    const appointment = await Appointment.findById(appointmentId)
      .populate("vet", "name");
    
    if (!appointment) {
      return NextResponse.json(
        { success: false, message: "Appointment not found" },
        { status: 404 }
      );
    }
    
    const vetName = appointment.vet?.name || 'Veterinarian';
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `Veterinary Consultation - Appointment ${appointment.appointmentId}`,
              description: `Consultation with Dr. ${vetName}`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_URL}/appointments/payment/success?session_id={CHECKOUT_SESSION_ID}&appointment_id=${appointmentId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/appointments/payment/cancel?appointment_id=${appointmentId}`,
      metadata: {
        appointmentId: appointmentId,
        userId: userId || appointment.user.toString(),
        vetId: vetId || appointment.vet.toString(),
      },
    });
    
    // Update appointment with payment intent ID
    await Appointment.findByIdAndUpdate(appointmentId, {
      "payment.paymentIntentId": session.id,
      "payment.status": "processing"
    });
    
    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url
    });
    
  } catch (error) {
    console.error("Error creating Stripe checkout session:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

