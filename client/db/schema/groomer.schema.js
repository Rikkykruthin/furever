import mongoose from "mongoose";

const groomerSchema = new mongoose.Schema({
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
  licenseNumber: {
    type: String,
    required: true,
    unique: true
  },
  groomingSpecialties: [{
    type: String,
    enum: [
      "Full Grooming",
      "Bath & Brush",
      "Nail Trimming",
      "Ear Cleaning",
      "Teeth Cleaning",
      "De-shedding",
      "Flea Treatment",
      "Breed-specific Cuts",
      "Show Grooming",
      "Creative Grooming",
      "Senior Pet Care",
      "Spa Treatments",
      "Mobile Grooming",
      "Express Grooming"
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
  
  // Location & Business Info
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
  
  // Service Settings
  serviceTypes: [{
    type: String,
    enum: ["in_salon", "mobile", "both"],
    default: ["in_salon"]
  }],
  travelRadius: {
    type: Number, // in miles for mobile service
    default: 0
  },
  
  // Pet Types Serviced
  petTypesSupported: [{
    type: String,
    enum: ["Dog", "Cat", "Rabbit", "Guinea Pig", "Other"],
    default: ["Dog", "Cat"]
  }],
  petSizeLimit: [{
    type: String,
    enum: ["Small (under 25lbs)", "Medium (25-60lbs)", "Large (60-100lbs)", "Extra Large (100lbs+)"],
    default: ["Small (under 25lbs)", "Medium (25-60lbs)", "Large (60-100lbs)"]
  }],
  
  // Services & Pricing
  services: [{
    name: String,
    description: String,
    duration: Number, // in minutes
    basePrice: Number,
    prices: [{
      size: {
        type: String,
        enum: ["Small", "Medium", "Large", "Extra Large"]
      },
      price: Number
    }],
    isPopular: { type: Boolean, default: false }
  }],
  
  // Salon Information (if applicable)
  salon: {
    name: String,
    address: String,
    photos: [String],
    amenities: [{
      type: String,
      enum: ["Air Conditioning", "Heating", "Separate Cat Area", "Nail Trimming Station", "Dental Care", "Flea Treatment", "Pickup/Dropoff"]
    }],
    parkingAvailable: { type: Boolean, default: false }
  },
  
  // Mobile Service Info (if applicable)
  mobileService: {
    vehicleType: String,
    isFullyEquipped: { type: Boolean, default: false },
    waterSource: {
      type: String,
      enum: ["Self-contained", "Customer water hookup", "Both"]
    },
    powerSource: {
      type: String,
      enum: ["Generator", "Customer power", "Both"]
    }
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
    totalGroomings: { type: Number, default: 0 },
    totalPets: { type: Number, default: 0 },
    responseTime: { type: Number, default: 0 }, // in minutes
    repeatCustomers: { type: Number, default: 0 } // percentage
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
  
  // Business Settings
  currency: {
    type: String,
    default: "USD"
  },
  advanceBookingDays: {
    type: Number,
    default: 30
  },
  cancellationPolicy: {
    hoursRequired: { type: Number, default: 24 },
    refundPolicy: String
  },
  
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

// Indexes for better performance
groomerSchema.index({ groomingSpecialties: 1 });
groomerSchema.index({ "location.city": 1 });
groomerSchema.index({ serviceTypes: 1 });
groomerSchema.index({ rating: 1 });

const Groomer = mongoose.models.Groomer || mongoose.model("Groomer", groomerSchema);
export default Groomer;