import { NextResponse } from "next/server";
import { redirect } from "next/navigation";

// This route handles the OAuth callback redirect
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // Contains userType
  const error = searchParams.get("error");

  if (error) {
    // User denied permission or error occurred
    return redirect(`/login?error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return redirect("/login?error=no_code");
  }

  // Redirect to a page that will handle the token exchange
  // We'll use a client-side page to handle this securely
  return redirect(`/auth/google/callback?code=${code}&userType=${state || "user"}`);
}

