"use server";

// This function will be called from client-side
export async function getGoogleAuthUrl(userType = "user") {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/auth/google?userType=${userType}`, {
      method: "GET",
      cache: "no-store",
    });

    const data = await response.json();

    if (data.success && data.authUrl) {
      return { success: true, authUrl: data.authUrl };
    } else {
      return { success: false, error: "Failed to get Google auth URL" };
    }
  } catch (error) {
    console.error("Google login initiation error:", error);
    return { success: false, error: error.message };
  }
}

