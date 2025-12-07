import mongoose from "mongoose";

const groomingAppointmentSchema = new mongoose.Schema({
  // Appointment Details
  appointmentId: {
    type: String,
    unique: true,
    required: true
  },
  
  // Participants
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  groomer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Groomer", 
    required: true
  },
  
  // Pet Information
  petDetails: {
    name: { type: String, required: true },
    species: { 
      type: String, 
      required: true,
      enum: ["Dog", "Cat", "Rabbit", "Guinea Pig", "Other"]
    },
    breed: String,
    age: { type: Number, min: 0 },
    weight: { type: Number, min: 0 },
    size: {
      type: String,
      enum: ["Small", "Medium", "Large", "Extra Large"],
      required: true
    },
    gender: { 
      type: String, 
      enum: ["Male", "Female", "Unknown"] 
    },
    temperament: {
      type: String,
      enum: ["Calm", "Anxious", "Aggressive", "Playful", "Shy", "Other"]
    },
    coatType: String,
    lastGroomed: Date,
    medicalConditions: String,
    allergies: String,
    specialInstructions: String,
    previousGroomingIssues: String
  },
  
  // Scheduling
  scheduledDate: {
    type: Date,
    required: true
  },
  scheduledTime: {
    startTime: { type: String, required: true }, // "10:00"
    endTime: { type: String, required: true },   // "12:00"
    duration: { type: Number, default: 120 }     // in minutes
  },
  timezone: {
    type: String,
    default: "UTC"
  },
  
  // Service Details
  serviceType: {
    type: String,
    enum: ["in_salon", "mobile"],
    required: true
  },
  servicesRequested: [{
    serviceName: String,
    description: String,
    price: Number,
    duration: Number, // in minutes
    isAddOn: { type: Boolean, default: false }
  }],
  totalDuration: {
    type: Number,
    required: true
  },
  
  // Grooming Preferences
  groomingStyle: {
    cut: String,
    length: String,
    style: String,
    nailLength: {
      type: String,
      enum: ["Short", "Medium", "Just tip removal"]
    },
    facialCleaning: { type: Boolean, default: true },
    earCleaning: { type: Boolean, default: true },
    teethCleaning: { type: Boolean, default: false },
    analGlands: { type: Boolean, default: false }
  },
  
  // Location Information
  location: {
    type: {
      type: String,
      enum: ["salon", "customer_home"],
      required: true
    },
    address: String,
    city: String,
    state: String,
    zipCode: String,
    parkingInstructions: String,
    accessInstructions: String,
    petLocation: String // "backyard", "garage", etc.
  },
  
  // Media Uploads (before photos, style references)
  mediaFiles: [{
    type: {
      type: String,
      enum: ["image", "video", "document"]
    },
    url: String,
    filename: String,
    uploadedAt: { type: Date, default: Date.now },
    description: String,
    category: {
      type: String,
      enum: ["before_photo", "style_reference", "medical_document", "after_photo"]
    }
  }],
  
  // Payment Information
  payment: {
    baseAmount: { type: Number, required: true },
    addOnAmount: { type: Number, default: 0 },
    travelFee: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    paymentMethod: {
      type: String,
      enum: ["stripe", "razorpay", "paypal", "cash", "mock"],
      required: true
    },
    paymentIntentId: String,
    transactionId: String,
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "refunded"],
      default: "pending"
    },
    paidAt: Date,
    refundedAt: Date,
    refundAmount: Number,
    tip: { type: Number, default: 0 }
  },
  
  // Appointment Status
  status: {
    type: String,
    enum: [
      "scheduled",     // Booked and confirmed
      "confirmed",     // Groomer confirmed
      "traveling",     // Groomer en route (mobile only)
      "in_progress",   // Grooming in progress
      "completed",     // Grooming finished
      "cancelled",     // Cancelled by user/groomer
      "no_show",       // User didn't show up
      "rescheduled"    // Appointment rescheduled
    ],
    default: "scheduled"
  },
  
  // Grooming Session Data
  groomingSession: {
    startedAt: Date,
    endedAt: Date,
    actualDuration: Number, // in minutes
    
    // Services Performed
    servicesCompleted: [{
      serviceName: String,
      completed: Boolean,
      notes: String,
      timeSpent: Number // in minutes
    }],
    
    // Pet Behavior During Session
    petBehavior: {
      cooperation: {
        type: String,
        enum: ["Excellent", "Good", "Fair", "Difficult"]
      },
      anxiety: {
        type: String,
        enum: ["None", "Mild", "Moderate", "Severe"]
      },
      aggression: {
        type: String,
        enum: ["None", "Mild", "Moderate", "Severe"]
      },
      notes: String
    },
    
    // Grooming Notes
    groomerNotes: String,
    healthObservations: String,
    recommendations: String,
    productUsed: [String],
    issuesEncountered: String,
    nextGroomingRecommendation: String,
    
    // Before/After Documentation
    beforePhotos: [String],
    afterPhotos: [String]
  },
  
  // Products Used
  productsUsed: [{
    productName: String,
    brand: String,
    purpose: String,
    reaction: String // any allergic reactions
  }],
  
  // Emergency Information
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  veterinarianContact: {
    name: String,
    phone: String,
    clinic: String
  },
  
  // Travel Information (for mobile grooming)
  travelDetails: {
    estimatedTravelTime: Number, // in minutes
    mileage: Number,
    travelFee: Number,
    departureTime: Date,
    arrivalTime: Date,
    vehicleParking: String
  },
  
  // Reminders & Notifications
  reminders: [{
    type: {
      type: String,
      enum: ["email", "sms", "push"]
    },
    sentAt: Date,
    scheduledFor: Date
  }],
  
  // Follow-up
  followUp: {
    required: { type: Boolean, default: false },
    reason: String,
    scheduledDate: Date,
    notes: String
  },
  
  // Feedback & Rating
  userFeedback: {
    rating: { type: Number, min: 1, max: 5 },
    review: String,
    wouldRecommend: Boolean,
    petSatisfaction: String,
    serviceQuality: String,
    cleanliness: String,
    timeliness: String,
    submittedAt: Date
  },
  
  groomerFeedback: {
    petBehavior: String,
    ownerCommunication: String,
    paymentExperience: String,
    recommendations: String,
    submittedAt: Date
  },
  
  // Recurring Appointment
  recurring: {
    isRecurring: { type: Boolean, default: false },
    frequency: {
      type: String,
      enum: ["weekly", "biweekly", "monthly", "quarterly"]
    },
    nextAppointment: Date,
    recurringUntil: Date
  }
}, {
  timestamps: true
});

// Indexes for better performance
groomingAppointmentSchema.index({ user: 1, scheduledDate: -1 });
groomingAppointmentSchema.index({ groomer: 1, scheduledDate: -1 });
groomingAppointmentSchema.index({ status: 1 });
groomingAppointmentSchema.index({ serviceType: 1 });
groomingAppointmentSchema.index({ scheduledDate: 1 });

// Pre-save middleware to generate appointmentId
groomingAppointmentSchema.pre('save', function(next) {
  if (!this.appointmentId) {
    this.appointmentId = `GA${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }
  next();
});

const GroomingAppointment = mongoose.models.GroomingAppointment || mongoose.model("GroomingAppointment", groomingAppointmentSchema);
export default GroomingAppointment;