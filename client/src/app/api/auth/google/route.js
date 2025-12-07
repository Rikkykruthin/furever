import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { connectToDatabase } from "@/../db/dbConfig";
import User from "@/../db/schema/user.schema";
import jwt from "jsonwebtoken";
import { setCookie } from "@/lib/auth";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_USER_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// Get redirect URI based on environment
const getRedirectUri = () => {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`;
  }
  return "http://localhost:3000/api/auth/google/callback";
};

const client = new OAuth2Client(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  getRedirectUri()
);

// GET - Initiate Google OAuth flow
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userType = searchParams.get("userType") || "user"; // user, seller, admin
    
    // Generate OAuth URL
    const authUrl = client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
      ],
      state: userType, // Pass userType in state
      prompt: "consent",
    });

    return NextResponse.json({
      success: true,
      authUrl,
    });
  } catch (error) {
    console.error("Google OAuth initiation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to initiate Google login" },
      { status: 500 }
    );
  }
}

// POST - Handle Google OAuth callback with token
export async function POST(request) {
  try {
    await connectToDatabase();

    const { code, userType = "user" } = await request.json();

    if (!code) {
      return NextResponse.json(
        { success: false, error: "Authorization code is required" },
        { status: 400 }
      );
    }

    // Exchange code for tokens
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    // Get user info from Google
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email not provided by Google" },
        { status: 400 }
      );
    }

    // Check if user exists with this email
    let user = await User.findOne({ email }).lean();

    if (user) {
      // User exists - check if they have Google auth or need to link it
      if (!user.googleId) {
        // Link Google account to existing user
        await User.findByIdAndUpdate(user._id, {
          googleId,
          authProvider: "google",
          profilePicture: picture || user.profilePicture,
        });
        user = await User.findById(user._id).lean();
      } else if (user.googleId !== googleId) {
        // Different Google account trying to use same email
        return NextResponse.json(
          { success: false, error: "This email is already associated with a different Google account" },
          { status: 400 }
        );
      }
    } else {
      // New user - create account
      // Check if userType is valid for Google signup (admin can't sign up via Google)
      if (userType === "admin") {
        return NextResponse.json(
          { success: false, error: "Admin accounts cannot be created via Google login" },
          { status: 400 }
        );
      }

      // Generate a unique name if the name already exists
      let userName = name || email.split("@")[0];
      let nameExists = await User.findOne({ name: userName });
      if (nameExists) {
        // Append a random number to make it unique
        userName = `${userName}${Math.floor(Math.random() * 10000)}`;
        // Double check it's still unique
        while (await User.findOne({ name: userName })) {
          userName = `${name || email.split("@")[0]}${Math.floor(Math.random() * 10000)}`;
        }
      }

      const userData = {
        name: userName,
        email,
        googleId,
        authProvider: "google",
        role: userType,
        profilePicture: picture || "",
        password: "", // No password for OAuth users
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Add role-specific fields
      if (userType === "seller") {
        // For sellers, they'll need to complete their profile later
        userData.storeName = "";
      }

      user = await User.create(userData);
      user = user.toObject();
    }

    // Check if user's role matches the requested userType
    if (user.role !== userType) {
      return NextResponse.json(
        { success: false, error: `This account is registered as ${user.role}, not ${userType}` },
        { status: 400 }
      );
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id.toString() }, JWT_SECRET, {
      expiresIn: "7d",
    });

    // Set cookie (setCookie already clears all cookies)
    await setCookie(token, user.role);

    return NextResponse.json({
      success: true,
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        userType: user.role,
        isAdmin: user.role === "admin",
        isSeller: user.role === "seller",
        storeName: user.storeName || "",
        adminLevel: user.adminLevel || "",
        profilePicture: user.profilePicture || "",
      },
      token,
    });
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to authenticate with Google: " + error.message },
      { status: 500 }
    );
  }
}

