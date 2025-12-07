import mongoose from "mongoose";

const { Schema } = mongoose;

const FoodDonationSchema = new Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    foodType: {
      type: String,
      required: true,
      enum: ["dry_food", "wet_food", "treats", "supplements", "raw_food", "other"],
    },
    foodName: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unit: {
      type: String,
      required: true,
      enum: ["kg", "lbs", "packets", "boxes", "cans", "pieces"],
      default: "kg",
    },
    expiryDate: {
      type: Date,
      required: false,
    },
    description: {
      type: String,
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    location: {
      address: {
        type: String,
        required: true,
      },
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
      city: {
        type: String,
      },
      state: {
        type: String,
      },
      zipCode: {
        type: String,
      },
    },
    contactInfo: {
      phone: {
        type: String,
        required: true,
      },
      email: {
        type: String,
      },
      preferredContact: {
        type: String,
        enum: ["phone", "email", "app"],
        default: "app",
      },
    },
    availability: {
      startDate: {
        type: Date,
        required: true,
        default: Date.now,
      },
      endDate: {
        type: Date,
        required: false,
      },
      pickupTime: {
        type: String,
        required: false,
      },
    },
    status: {
      type: String,
      enum: ["available", "reserved", "picked_up", "expired", "cancelled"],
      default: "available",
    },
    reservedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reservedAt: {
      type: Date,
      default: null,
    },
    pickedUpAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for location-based queries
FoodDonationSchema.index({ "location.latitude": 1, "location.longitude": 1 });
FoodDonationSchema.index({ status: 1, createdAt: -1 });
FoodDonationSchema.index({ donor: 1 });

export default mongoose.models.FoodDonation || mongoose.model("FoodDonation", FoodDonationSchema);


