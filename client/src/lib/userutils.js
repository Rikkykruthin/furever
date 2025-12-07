// user utils

// import { cookies } from "next/headers"; // for server-side cookie management

import Cookies from "js-cookie"; // for client-side cookie management
import { redirect } from "next/navigation";

export function getUser() {
  const token = Cookies.get("token");
  const user = Cookies.get("user");

  if (!user) {
    return new Error("User not found");
  }

  return JSON.parse(user);
}

export async function logout() {
  try {
    // Clear all auth cookies
    Cookies.remove("userToken", { path: "/" });
    Cookies.remove("sellerToken", { path: "/" });
    Cookies.remove("adminToken", { path: "/" });
    Cookies.remove("token", { path: "/" });
    Cookies.remove("user", { path: "/" });
    
    // Call logout API
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include"
    });
    
    // Redirect happens in the component
  } catch (error) {
    console.error("Logout error:", error);
  }
}
