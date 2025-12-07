"use server";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectToDatabase } from "@/../db/dbConfig";
import User from "../db/schema/user.schema";
import { z } from "zod";
import { setCookie } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import mongoose from "mongoose";

const JWT_SECRET = process.env.JWT_USER_SECRET;

// Ensure database is connected before proceeding
try {
  connectToDatabase();
} catch (error) {
  console.error("Initial database connection failed:", error);
}

const loginValidationSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  userType: z.enum(["user", "seller", "admin"], {
    errorMap: () => ({
      message: "User type must be 'user', 'seller', or 'admin'",
    }),
  }),
});

export async function loginAction(formData) {
  try {
    // Validate form data
    const parsedData = loginValidationSchema.safeParse(formData);

    if (!parsedData.success) {
      console.log("Invalid parse of user data");
      return {
        success: false,
        error: parsedData.error.errors.map((e) => e.message).join(", "),
      };
    }

    const { email, password, userType } = parsedData.data;

    // Ensure DB connection is active
    await connectToDatabase();

    // Find user in the unified User model
    let user;
    try {
      user = await User.findOne({ email }).select("+password").lean().exec();
    } catch (dbError) {
      console.error("Database query failed:", dbError);
      if (dbError instanceof mongoose.Error.MongooseServerSelectionError) {
        return {
          success: false,
          error: "Could not connect to database. Please check if MongoDB is running.",
        };
      }
      return {
        success: false,
        error: "Database error occurred: " + dbError.message,
      };
    }

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Check if user's role matches the requested userType
    if (user.role !== userType) {
      return {
        success: false,
        error: `Invalid credentials for ${userType} access`,
      };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return {
        success: false,
        error: "Invalid password",
      };
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: "7d",
    });
    await clearAllCookies();
    await setCookie(token, user.role);

    // Remove password from returned user object
    delete user.password;

    return {
      success: true,
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        userType: user.role, // Keep userType for backward compatibility
        isAdmin: user.role === "admin",
        isSeller: user.role === "seller",
        storeName: user.storeName,
        adminLevel: user.adminLevel,
      },
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      error: "An error occurred during login: " + error.message,
    };
  }
}

let authenticateUser = null;

export async function getAuthenticatedUser() {
  try {
    if (authenticateUser) {
      return authenticateUser;
    }
    const cookieStore = await cookies();
    const userToken = cookieStore.get("userToken")?.value;
    const sellerToken = cookieStore.get("sellerToken")?.value;
    const adminToken = cookieStore.get("adminToken")?.value;

    const token = userToken || sellerToken || adminToken;
    
    if (!token) {
      console.log("No authentication token found");
      return null;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_USER_SECRET);
      const user = await User.findById(decoded.id).select("-password -__v").lean();

      console.log("User from database:", user);

      if (user) {
        authenticateUser = {
          _id: user._id.toString(),
          userType: user.role, // Map role to userType for backward compatibility
          role: user.role,
          isAdmin: user.role === "admin",
          isSeller: user.role === "seller",
          token: token,
          name: user.name,
          email: user.email,
          storeName: user.storeName,
          adminLevel: user.adminLevel,
        };
        return {
          _id: user._id.toString(),
          userType: user.role,
          role: user.role,
          isAdmin: user.role === "admin",
          isSeller: user.role === "seller",
          token: token,
          name: user.name,
          email: user.email,
          storeName: user.storeName,
          adminLevel: user.adminLevel,
        };
      }
    } catch (error) {
      console.error("Token verification failed:", error);
      return null;
    }

    return null;
  } catch (error) {
    console.error("Auth check error:", error);
    return null;
  }
}

export async function clearAllCookies() {
  const cookieStore = await cookies();
  cookieStore.delete("userToken");
  cookieStore.delete("sellerToken");
  cookieStore.delete("adminToken");
}

export async function logoutAction() {
  try {
    await clearAllCookies();
    return { success: true, message: "Logged out successfully" };
  } catch (error) {
    console.error("Logout error:", error);
    return { success: false, message: "Failed to logout" };
  }
}
