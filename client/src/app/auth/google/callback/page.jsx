"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const handleGoogleCallback = async () => {
      const code = searchParams.get("code");
      const userType = searchParams.get("userType") || "user";

      if (!code) {
        setError("No authorization code received");
        setTimeout(() => router.push("/login"), 2000);
        return;
      }

      try {
        // Exchange code for token and authenticate
        const response = await fetch("/api/auth/google", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code, userType }),
        });

        const data = await response.json();

        if (!data.success) {
          setError(data.error || "Authentication failed");
          setTimeout(() => router.push(`/login?error=${encodeURIComponent(data.error)}`), 2000);
          return;
        }

        // Wait a moment to ensure cookies are set
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Refresh router to ensure cookies are read
        router.refresh();

        // Redirect based on user role
        const userRole = data.user?.role || data.user?.userType;
        if (userRole === "admin") {
          router.push("/emergency/admin");
        } else if (userRole === "seller") {
          router.push("/dashboard");
        } else {
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Google callback error:", error);
        setError("An error occurred during authentication");
        setTimeout(() => router.push("/login?error=auth_failed"), 2000);
      }
    };

    handleGoogleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary via-white to-secondary/50">
      <div className="text-center space-y-4">
        {error ? (
          <>
            <div className="text-red-600 text-lg font-semibold">{error}</div>
            <p className="text-secondary">Redirecting to login...</p>
          </>
        ) : (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
            <h2 className="text-xl font-semibold text-primary">Completing Google Sign-In...</h2>
            <p className="text-secondary">Please wait while we authenticate you</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary via-white to-secondary/50">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <h2 className="text-xl font-semibold text-primary">Loading...</h2>
        </div>
      </div>
    }>
      <GoogleCallbackContent />
    </Suspense>
  );
}

