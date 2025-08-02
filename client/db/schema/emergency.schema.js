import mongoose from "mongoose";

const emergencySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  photos: {
    type: [String], // Array of Cloudinary URLs
    required: true,
    validate: {
      validator: function(photos) {
        return photos.length > 0; // At least one photo required
      },
      message: "At least one photo is required for emergency reports"
    }
  },
  location: {
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: false, // Optional human-readable address
    }
  },
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  severity: {
    type: String,
    enum: ["low", "medium", "high", "critical", "urgent"],
    default: "medium",
  },
  animalType: {
    type: String,
    required: false, // Optional: dog, cat, bird, etc.
  },
  status: {
    type: String,
    enum: ["pending", "approved", "in-progress", "investigating", "resolved", "closed", "rejected", "duplicate"],
    default: "pending",
  },
  contactInfo: {
    phone: {
      type: String,
      required: false,
    },
    preferredContact: {
      type: String,
      enum: ["phone", "email", "app"],
      default: "app",
    }
  },
  
  // Admin fields
  adminNotes: {
    type: String,
    default: ""
  },
  
  assignedTo: {
    type: String,
    default: ""
  },
  
  resolution: {
    type: String,
    default: ""
  },
  
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  adminActivity: [{
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    adminName: String,
    action: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    changes: mongoose.Schema.Types.Mixed
  }],
  
  archived: {
    type: Boolean,
    default: false
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

// Update the updatedAt field before saving
emergencySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Emergency = mongoose.models.Emergency || mongoose.model("Emergency", emergencySchema);

export default Emergency; 