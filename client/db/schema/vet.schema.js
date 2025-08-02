import mongoose from "mongoose";

const vetSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  
  // Profile Information
  photo: {
    type: String,
    default: "/default-vet-avatar.svg"
  },
  bio: {
    type: String,
    maxlength: 1000
  },
  
  // Professional Details
  licenseNumber: {
    type: String,
    required: true,
    unique: true
  },
  specializations: [{
    type: String,
    enum: [
      "General Practice",
      "Canine",
      "Feline", 
      "Exotic Pets",
      "Bird",
      "Reptile",
      "Livestock",
      "Large Animals",
      "Emergency Care",
      "Surgery",
      "Dermatology",
      "Cardiology",
      "Oncology",
      "Dental Care",
      "Behavioral",
      "Nutrition"
    ]
  }],
  yearsOfExperience: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Education & Certifications
  degrees: [{
    degree: String,
    institution: String,
    year: Number
  }],
  certifications: [{
    certification: String,
    issuingBody: String,
    year: Number,
    expiryDate: Date
  }],
  
  // Languages
  languages: [{
    type: String,
    default: ["English"]
  }],
  
  // Location & Availability
  location: {
    address: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Consultation Settings
  consultationModes: [{
    type: String,
    enum: ["video", "audio", "chat"],
    default: ["video", "chat"]
  }],
  consultationFee: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: "USD"
  },
  
  // Availability Schedule
  availability: {
    monday: {
      isAvailable: { type: Boolean, default: false },
      slots: [{
        startTime: String, // "09:00"
        endTime: String,   // "17:00"
        isBooked: { type: Boolean, default: false }
      }]
    },
    tuesday: {
      isAvailable: { type: Boolean, default: false },
      slots: [{
        startTime: String,
        endTime: String,
        isBooked: { type: Boolean, default: false }
      }]
    },
    wednesday: {
      isAvailable: { type: Boolean, default: false },
      slots: [{
        startTime: String,
        endTime: String,
        isBooked: { type: Boolean, default: false }
      }]
    },
    thursday: {
      isAvailable: { type: Boolean, default: false },
      slots: [{
        startTime: String,
        endTime: String,
        isBooked: { type: Boolean, default: false }
      }]
    },
    friday: {
      isAvailable: { type: Boolean, default: false },
      slots: [{
        startTime: String,
        endTime: String,
        isBooked: { type: Boolean, default: false }
      }]
    },
    saturday: {
      isAvailable: { type: Boolean, default: false },
      slots: [{
        startTime: String,
        endTime: String,
        isBooked: { type: Boolean, default: false }
      }]
    },
    sunday: {
      isAvailable: { type: Boolean, default: false },
      slots: [{
        startTime: String,
        endTime: String,
        isBooked: { type: Boolean, default: false }
      }]
    }
  },
  
  // Ratings & Reviews
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 }
  },
  
  // Statistics
  stats: {
    totalConsultations: { type: Number, default: 0 },
    totalPatients: { type: Number, default: 0 },
    responseTime: { type: Number, default: 0 }, // in minutes
    followUpRate: { type: Number, default: 0 } // percentage
  },
  
  // Account Status
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  
  // Admin fields
  approvalStatus: {
    type: String,
    enum: ["pending", "approved", "rejected", "suspended"],
    default: "pending"
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  approvedAt: Date,
  
  // Notification Preferences
  notifications: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    appointmentReminders: { type: Boolean, default: true },
    newBookings: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

// Indexes for better performance (email and licenseNumber already indexed via unique: true)
vetSchema.index({ specializations: 1 });
vetSchema.index({ "location.city": 1 });
vetSchema.index({ "rating.average": -1 });
vetSchema.index({ isVerified: 1, isActive: 1 });
vetSchema.index({ approvalStatus: 1 });

// Virtual for full name
vetSchema.virtual('profileComplete').get(function() {
  const requiredFields = ['name', 'email', 'phone', 'licenseNumber', 'specializations', 'yearsOfExperience'];
  return requiredFields.every(field => this[field] && this[field].length > 0);
});

export default mongoose.models.Vet || mongoose.model("Vet", vetSchema); 