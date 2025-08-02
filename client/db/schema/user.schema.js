// user schema for database mongo

import { z } from "zod";
import mongoose from "mongoose";
import { Profiler } from "react";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "admin", "seller"],
    default: "user",
  },
  // Seller-specific fields (when role is "seller")
  storeName: {
    type: String,
    required: function() {
      return this.role === "seller";
    },
    default: ""
  },
  // Admin-specific fields (when role is "admin")
  adminLevel: {
    type: String,
    enum: ["basic", "super"],
    default: "basic",
    required: function() {
      return this.role === "admin";
    }
  },
  profilePicture: {
    type: String,
    required: false,
  },
  bio: {
    type: String,
    required: false,
  },
  lastSeen: {
    type: Date,
    default: Date.now,
  },
  isOnline: {
    type: Boolean,
    default: false,
  },
  cart: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Product",
    default: [],
  },
  productsBought: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Order",
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Virtual property for checking if user is admin
userSchema.virtual('isAdmin').get(function() {
  return this.role === 'admin';
});

// Virtual property for checking if user is seller
userSchema.virtual('isSeller').get(function() {
  return this.role === 'seller';
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
