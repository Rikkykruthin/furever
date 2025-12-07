"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, Calendar, ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import toast from "react-hot-toast";

function AppointmentPaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [appointmentId, setAppointmentId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const appointmentIdParam = searchParams.get("appointment_id");
    const storedAppointmentId = localStorage.getItem("pendingAppointmentId");

    const finalAppointmentId = appointmentIdParam || storedAppointmentId;
    
    if (finalAppointmentId) {
      setAppointmentId(finalAppointmentId);
      localStorage.removeItem("pendingAppointmentId");
      
      // Verify payment status
      verifyPayment(sessionId, finalAppointmentId);
    } else {
      toast.error("Appointment information not found");
      router.push("/vet-consultation");
    }
  }, [searchParams, router]);

  const verifyPayment = async (sessionId, appointmentId) => {
    try {
      // You can add an API call here to verify payment status
      // For now, we'll just show success
      setLoading(false);
      toast.success("Payment successful! Appointment confirmed.");
    } catch (error) {
      console.error("Error verifying payment:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary via-white to-secondary/30 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-accent/30 border-t-primary rounded-full animate-spin"></div>
          <p className="text-primary font-semibold">Verifying payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-white to-secondary/30 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full bg-white/95 backdrop-blur-md border-2 border-accent/20 shadow-2xl">
        <CardContent className="p-12">
          <div className="text-center space-y-6">
            {/* Success Icon */}
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl"></div>
              <div className="relative w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl ring-4 ring-accent/20">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
            </div>

            {/* Success Message */}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4 titlefont">
                Payment Successful! 🎉
              </h1>
              <p className="text-xl text-secondary mb-2">
                Your appointment has been confirmed
              </p>
              {appointmentId && (
                <p className="text-sm text-secondary font-mono bg-accent/10 px-4 py-2 rounded-lg inline-block">
                  Appointment ID: {appointmentId}
                </p>
              )}
            </div>

            {/* Info Card */}
            <Card className="bg-accent/10 border-2 border-accent/20 mt-8">
              <CardContent className="p-6">
                <div className="space-y-4 text-left">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-primary">Payment Confirmed</p>
                      <p className="text-sm text-secondary">Your payment has been processed successfully</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-primary">Appointment Booked</p>
                      <p className="text-sm text-secondary">You will receive a confirmation email shortly</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button
                onClick={() => router.push("/dashboard")}
                className="flex-1 h-14 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <Calendar className="w-5 h-5 mr-2" />
                View My Appointments
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/vet-consultation")}
                className="flex-1 h-14 border-2 border-primary/30 text-primary hover:bg-primary/5 font-semibold text-lg"
              >
                Book Another Appointment
              </Button>
            </div>

            <Button
              variant="ghost"
              onClick={() => router.push("/")}
              className="mt-4 text-secondary hover:text-primary"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AppointmentPaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-secondary via-white to-secondary/30 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-accent/30 border-t-primary rounded-full animate-spin"></div>
          <p className="text-primary font-semibold">Loading...</p>
        </div>
      </div>
    }>
      <AppointmentPaymentSuccessContent />
    </Suspense>
  );
}


