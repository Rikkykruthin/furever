"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MedicalCareRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to vet consultation page
    router.replace("/vet-consultation");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary via-white to-secondary/50">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 border-4 border-accent/30 border-t-primary rounded-full animate-spin mx-auto"></div>
        <h2 className="text-xl font-semibold text-primary">Redirecting to Vet Consultation...</h2>
        <p className="text-secondary">Please wait</p>
      </div>
    </div>
  );
}

