import mongoose from "mongoose";

const trainerSchema = new mongoose.Schema({
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
    default: "/default-avatar.svg"
  },
  bio: {
    type: String,
    maxlength: 1000
  },
  
  // Professional Details
  certificationNumber: {
    type: String,
    required: true,
    unique: true
  },
  trainingSpecialties: [{
    type: String,
    enum: [
      "Basic Obedience",
      "Advanced Obedience", 
      "Puppy Training",
      "Behavioral Modification",
      "Aggression Training",
      "Anxiety Training",
      "Service Dog Training",
      "Trick Training",
      "Agility Training",
      "Guard Dog Training",
      "Therapy Dog Training",
      "Socialization",
      "Leash Training",
      "House Training",
      "Clicker Training"
    ]
  }],
  yearsOfExperience: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Education & Certifications
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
  
  // Training Settings
  trainingModes: [{
    type: String,
    enum: ["video", "in_person", "group_video"],
    default: ["video"]
  }],
  sessionFee: {
    type: Number,
    required: true,
    min: 0
  },
  groupSessionFee: {
    type: Number,
    min: 0
  },
  currency: {
    type: String,
    default: "USD"
  },
  
  // Pet Types Trained
  petTypesSupported: [{
    type: String,
    enum: ["Dog", "Cat", "Bird", "Rabbit", "Other"],
    default: ["Dog"]
  }],
  
  // Training Programs Offered
  trainingPrograms: [{
    name: String,
    description: String,
    duration: Number, // in weeks
    sessionsPerWeek: Number,
    totalSessions: Number,
    price: Number,
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"]
    }
  }],
  
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
    totalSessions: { type: Number, default: 0 },
    totalPets: { type: Number, default: 0 },
    responseTime: { type: Number, default: 0 }, // in minutes
    successRate: { type: Number, default: 0 } // percentage
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
    sessionReminders: { type: Boolean, default: true },
    newBookings: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

// Indexes for better performance
trainerSchema.index({ trainingSpecialties: 1 });
trainerSchema.index({ "location.city": 1 });
trainerSchema.index({ sessionFee: 1 });
trainerSchema.index({ rating: 1 });

const Trainer = mongoose.models.Trainer || mongoose.model("Trainer", trainerSchema);
export default Trainer;