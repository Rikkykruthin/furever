import { cookies } from "next/headers";

export const setCookie = async (token, role) => {
  const cookieStore = await cookies();
  
  // Clear all auth cookies first
  cookieStore.delete("userToken");
  cookieStore.delete("sellerToken");
  cookieStore.delete("adminToken");
  
  // Set the appropriate cookie based on role
  const cookieName = role === "user" ? "userToken" : 
                     role === "seller" ? "sellerToken" : 
                     role === "admin" ? "adminToken" : "userToken";
  
  cookieStore.set(cookieName, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax", // Changed from "strict" to "lax" for better compatibility
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });
  console.log(`Cookie set for ${role}:`, cookieName);
};
