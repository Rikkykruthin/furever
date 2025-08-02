"use server";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectToDatabase } from "@/../db/dbConfig";
import User from "../db/schema/user.schema";
import { z } from "zod";
import { setCookie } from "@/lib/auth";

const JWT_SECRET = process.env.JWT_USER_SECRET;
const saltRounds = 10;

const registerValidationSchema = z.object({
  name: z.string().min(3, "Username must be at least 3 characters long"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  userType: z.enum(["user", "seller"], {
    errorMap: () => ({
      message: "User type must be 'user' or 'seller'",
    }),
  }),
  storeName: z.string().optional(), // Required for sellers
});

export async function registerAction(formData) {
  try {
    const parsedData = registerValidationSchema.safeParse(formData);

    if (!parsedData.success) {
      return {
        success: false,
        error: parsedData.error.errors.map((e) => e.message).join(", "),
      };
    }

    const { name, email, password, userType, storeName } = parsedData.data;

    // Validate seller-specific requirements
    if (userType === "seller" && (!storeName || storeName.trim() === "")) {
      return {
        success: false,
        error: "Store name is required for seller accounts",
      };
    }

    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return {
        success: false,
        error: "Account with this email already exists",
      };
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create user data based on role
    const userData = {
      name,
      email,
      password: hashedPassword,
      role: userType,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add role-specific fields
    if (userType === "seller") {
      userData.storeName = storeName;
    }

    const user = await User.create(userData);

    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: "7d",
    });
    await setCookie(token, userType);

    return {
      success: true,
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        userType: user.role,
        isAdmin: user.role === "admin",
        isSeller: user.role === "seller",
        storeName: user.storeName,
        adminLevel: user.adminLevel,
      },
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      error: "An error occurred during registration",
    };
  }
}
