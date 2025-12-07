import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

import { NextResponse } from "next/server";
import { connectToDatabase } from "@/../db/dbConfig";
import Appointment from "@/../db/schema/appointment.schema";

export async function POST(request) {
  try {
    await connectToDatabase();
    
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");
    
    if (!signature) {
      return NextResponse.json(
        { success: false, message: "No signature provided" },
        { status: 400 }
      );
    }
    
    let event;
    
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return NextResponse.json(
        { success: false, message: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }
    
    // Handle the event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      
      // Find appointment by payment intent ID
      const appointment = await Appointment.findOne({
        "payment.paymentIntentId": session.id
      });
      
      if (appointment) {
        // Update appointment payment status
        await Appointment.findByIdAndUpdate(appointment._id, {
          "payment.status": "completed",
          "payment.transactionId": session.payment_intent,
          "payment.paidAt": new Date(),
          status: "confirmed"
        });
        
        console.log(`Payment confirmed for appointment ${appointment.appointmentId}`);
      }
    } else if (event.type === "checkout.session.async_payment_failed") {
      const session = event.data.object;
      
      const appointment = await Appointment.findOne({
        "payment.paymentIntentId": session.id
      });
      
      if (appointment) {
        await Appointment.findByIdAndUpdate(appointment._id, {
          "payment.status": "failed"
        });
        
        console.log(`Payment failed for appointment ${appointment.appointmentId}`);
      }
    }
    
    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}


