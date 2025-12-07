import mongoose from "mongoose";

const trainingSessionSchema = new mongoose.Schema({
  // Session Details
  sessionId: {
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
  trainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Trainer", 
    required: true
  },
  
  // Pet Information
  petDetails: {
    name: { type: String, required: true },
    species: { 
      type: String, 
      required: true,
      enum: ["Dog", "Cat", "Bird", "Rabbit", "Other"]
    },
    breed: String,
    age: { type: Number, min: 0 },
    weight: { type: Number, min: 0 },
    gender: { 
      type: String, 
      enum: ["Male", "Female", "Unknown"] 
    },
    temperament: String,
    trainingHistory: String,
    currentBehaviors: String,
    trainingGoals: String,
    specialNeeds: String
  },
  
  // Scheduling
  scheduledDate: {
    type: Date,
    required: true
  },
  scheduledTime: {
    startTime: { type: String, required: true }, // "14:00"
    endTime: { type: String, required: true },   // "15:00"
    duration: { type: Number, default: 60 }      // in minutes
  },
  timezone: {
    type: String,
    default: "UTC"
  },
  
  // Training Details
  trainingType: {
    type: String,
    enum: ["video", "in_person", "group_video"],
    required: true
  },
  trainingCategory: {
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
    ],
    required: true
  },
  sessionObjectives: {
    type: String,
    required: true,
    maxlength: 500
  },
  
  // Training Program (if part of a program)
  trainingProgram: {
    programName: String,
    sessionNumber: Number,
    totalSessions: Number,
    programId: String
  },
  
  // Media Uploads (before/after videos, photos)
  mediaFiles: [{
    type: {
      type: String,
      enum: ["image", "video", "document"]
    },
    url: String,
    filename: String,
    uploadedAt: { type: Date, default: Date.now },
    description: String
  }],
  
  // Payment Information
  payment: {
    amount: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    paymentMethod: {
      type: String,
      enum: ["stripe", "razorpay", "paypal", "mock"],
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
    refundAmount: Number
  },
  
  // Session Status
  status: {
    type: String,
    enum: [
      "scheduled",    // Booked and confirmed
      "confirmed",    // Trainer confirmed
      "in_progress",  // Session ongoing
      "completed",    // Session finished
      "cancelled",    // Cancelled by user/trainer
      "no_show",      // User didn't show up
      "missed"        // Technical issues or other reasons
    ],
    default: "scheduled"
  },
  
  // Training Session Data
  session: {
    startedAt: Date,
    endedAt: Date,
    actualDuration: Number, // in minutes
    sessionId: String,      // for video platform
    roomId: String,
    connectionQuality: {
      type: String,
      enum: ["excellent", "good", "fair", "poor"]
    },
    
    // Session Notes
    trainerNotes: String,
    skillsWorkedOn: [String],
    petProgress: String,
    homeworkAssigned: String,
    nextSessionFocus: String,
    followUpRequired: { type: Boolean, default: false },
    nextSessionDate: Date,
    
    // Session Evaluation
    petBehaviorRating: {
      type: Number,
      min: 1,
      max: 5
    },
    ownerParticipation: {
      type: Number,
      min: 1,
      max: 5
    },
    sessionGoalsAchieved: {
      type: Boolean,
      default: false
    }
  },
  
  // Training Materials & Resources
  resources: [{
    type: {
      type: String,
      enum: ["video", "document", "link", "exercise"]
    },
    title: String,
    url: String,
    description: String,
    isHomework: { type: Boolean, default: false }
  }],
  
  // Location (for in-person sessions)
  location: {
    type: {
      type: String,
      enum: ["trainer_location", "customer_location", "neutral_location", "online"]
    },
    address: String,
    city: String,
    state: String,
    zipCode: String,
    specialInstructions: String
  },
  
  // Emergency Contacts
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  
  // Special Requirements
  specialRequirements: {
    equipment: [String],
    space: String,
    otherPets: { type: Boolean, default: false },
    allergies: String,
    medicalConditions: String
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
  
  // Feedback & Rating
  userFeedback: {
    rating: { type: Number, min: 1, max: 5 },
    review: String,
    wouldRecommend: Boolean,
    submittedAt: Date
  },
  
  trainerFeedback: {
    petProgress: String,
    ownerEngagement: String,
    recommendations: String,
    submittedAt: Date
  }
}, {
  timestamps: true
});

// Indexes for better performance
trainingSessionSchema.index({ user: 1, scheduledDate: -1 });
trainingSessionSchema.index({ trainer: 1, scheduledDate: -1 });
trainingSessionSchema.index({ status: 1 });
trainingSessionSchema.index({ trainingCategory: 1 });
trainingSessionSchema.index({ scheduledDate: 1 });

// Pre-save middleware to generate sessionId
trainingSessionSchema.pre('save', function(next) {
  if (!this.sessionId) {
    this.sessionId = `TS${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }
  next();
});

const TrainingSession = mongoose.models.TrainingSession || mongoose.model("TrainingSession", trainingSessionSchema);
export default TrainingSession;