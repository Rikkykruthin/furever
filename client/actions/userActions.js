"use server";
import { connectToDatabase } from "@/../db/dbConfig";
import User from "../db/schema/user.schema";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function getUserByToken(token, userType = null) {
  const JWT_SECRET = process.env.JWT_USER_SECRET;
  
  if (!JWT_SECRET) {
    console.error("JWT_USER_SECRET environment variable is missing");
    return { success: false, message: "Server configuration error" };
  }
  
  if (!token) {
    return { success: false, message: "No token provided" };
  }
  
  try {
    await connectToDatabase();
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).lean();
    
    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Optional: Only validate userType if specifically provided and needed for strict checking
    // For now, we'll be permissive since we have a unified user model
    if (userType && user.role !== userType) {
      return { success: false, message: `Invalid credentials for ${userType} access` };
    }
    
    return {
      success: true,
      user: {
        ...user,
        _id: user._id.toString(),
        userType: user.role, // Map role to userType for backward compatibility
        isAdmin: user.role === "admin",
        isSeller: user.role === "seller",
      },
    };
  } catch (error) {
    console.error("Error in getUserByToken:", error);
    
    if (error.name === 'JsonWebTokenError') {
      return { success: false, message: "Invalid token" };
    }
    if (error.name === 'TokenExpiredError') {
      return { success: false, message: "Token expired" };
    }
    return { success: false, message: "Error fetching user by token: " + error.message };
  }
}

export async function getToken(cookieName) {
  if (typeof window !== "undefined") {
    // Client-side - dynamically import js-cookie
    const Cookies = (await import("js-cookie")).default;
    return Cookies.get(cookieName);
  } else {
    // Server-side
    const cookieStore = await cookies();
    return cookieStore.get(cookieName)?.value;
  }
}

export async function getUserById(userId) {
  try {
    await connectToDatabase();
    const user = await User.findById(userId).lean();
    
    if (!user) {
      return { success: false, message: "User not found" };
    }
    
    return {
      success: true,
      user: {
        ...user,
        _id: user._id.toString(),
        userType: user.role,
        isAdmin: user.role === "admin",
        isSeller: user.role === "seller",
      },
    };
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return { success: false, message: "Error fetching user by ID" };
  }
}
