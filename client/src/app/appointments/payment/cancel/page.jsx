"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { XCircle, AlertCircle, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import toast from "react-hot-toast";

function AppointmentPaymentCancelContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [appointmentId, setAppointmentId] = useState(null);

  useEffect(() => {
    const appointmentIdParam = searchParams.get("appointment_id");
    const storedAppointmentId = localStorage.getItem("pendingAppointmentId");

    const finalAppointmentId = appointmentIdParam || storedAppointmentId;
    
    if (finalAppointmentId) {
      setAppointmentId(finalAppointmentId);
      // Optionally cancel the appointment if payment was cancelled
      cancelPendingAppointment(finalAppointmentId);
    }
    
    localStorage.removeItem("pendingAppointmentId");
  }, [searchParams]);

  const cancelPendingAppointment = async (appointmentId) => {
    try {
      // You can add an API call here to cancel the appointment
      // For now, we'll just show the cancel message
      toast.error("Payment was cancelled. Appointment not confirmed.");
    } catch (error) {
      console.error("Error cancelling appointment:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-white to-secondary/30 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full bg-white/95 backdrop-blur-md border-2 border-red-200 shadow-2xl">
        <CardContent className="p-12">
          <div className="text-center space-y-6">
            {/* Cancel Icon */}
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-red-100 rounded-full blur-2xl"></div>
              <div className="relative w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl ring-4 ring-red-200">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
            </div>

            {/* Cancel Message */}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-red-600 mb-4 titlefont">
                Payment Cancelled
              </h1>
              <p className="text-xl text-secondary mb-2">
                Your payment was not processed
              </p>
              {appointmentId && (
                <p className="text-sm text-secondary font-mono bg-red-50 px-4 py-2 rounded-lg inline-block border border-red-200">
                  Appointment ID: {appointmentId}
                </p>
              )}
            </div>

            {/* Info Card */}
            <Card className="bg-red-50 border-2 border-red-200 mt-8">
              <CardContent className="p-6">
                <div className="space-y-4 text-left">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-100 p-2 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-bold text-red-800">Payment Not Processed</p>
                      <p className="text-sm text-red-700">No charges were made to your account</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-red-100 p-2 rounded-lg">
                      <XCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-bold text-red-800">Appointment Not Confirmed</p>
                      <p className="text-sm text-red-700">You can try booking again</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button
                onClick={() => router.back()}
                className="flex-1 h-14 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/vet-consultation")}
                className="flex-1 h-14 border-2 border-primary/30 text-primary hover:bg-primary/5 font-semibold text-lg"
              >
                Browse Veterinarians
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

export default function AppointmentPaymentCancelPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-secondary via-white to-secondary/30 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-accent/30 border-t-primary rounded-full animate-spin"></div>
          <p className="text-primary font-semibold">Loading...</p>
        </div>
      </div>
    }>
      <AppointmentPaymentCancelContent />
    </Suspense>
  );
}


