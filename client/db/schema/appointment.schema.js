import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
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
  vet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vet", 
    required: true
  },
  
  // Pet Information
  petDetails: {
    name: { type: String, required: true },
    species: { 
      type: String, 
      required: true,
      enum: ["Dog", "Cat", "Bird", "Rabbit", "Hamster", "Guinea Pig", "Fish", "Reptile", "Other"]
    },
    breed: String,
    age: { type: Number, min: 0 },
    weight: { type: Number, min: 0 },
    gender: { 
      type: String, 
      enum: ["Male", "Female", "Unknown"] 
    },
    medicalHistory: String,
    currentSymptoms: String,
    urgencyLevel: {
      type: String,
      enum: ["Low", "Medium", "High", "Emergency"],
      default: "Medium"
    }
  },
  
  // Scheduling
  scheduledDate: {
    type: Date,
    required: true
  },
  scheduledTime: {
    startTime: { type: String, required: true }, // "14:00"
    endTime: { type: String, required: true },   // "14:30"
    duration: { type: Number, default: 30 }      // in minutes
  },
  timezone: {
    type: String,
    default: "UTC"
  },
  
  // Consultation Details
  consultationType: {
    type: String,
    enum: ["video", "audio", "chat"],
    required: true
  },
  reason: {
    type: String,
    required: true,
    maxlength: 500
  },
  
  // Media Uploads (symptoms, pet photos)
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
  
  // Appointment Status
  status: {
    type: String,
    enum: [
      "scheduled",    // Booked and confirmed
      "confirmed",    // Vet confirmed
      "in_progress",  // Consultation ongoing
      "completed",    // Consultation finished
      "cancelled",    // Cancelled by user/vet
      "no_show",      // User didn't show up
      "missed"        // Technical issues or other reasons
    ],
    default: "scheduled"
  },
  
  // Consultation Session Data
  consultation: {
    startedAt: Date,
    endedAt: Date,
    actualDuration: Number, // in minutes
    sessionId: String,      // for video/chat platform
    roomId: String,
    connectionQuality: {
      type: String,
      enum: ["excellent", "good", "fair", "poor"]
    },
    
    // Chat Messages (if chat consultation)
    messages: [{
      sender: {
        type: String,
        enum: ["user", "vet"]
      },
      message: String,
      timestamp: { type: Date, default: Date.now },
      messageType: {
        type: String,
        enum: ["text", "image", "file"],
        default: "text"
      },
      fileUrl: String
    }],
    
    // Session Notes
    vetNotes: String,
    diagnosis: String,
    recommendations: String,
    followUpRequired: { type: Boolean, default: false },
    followUpDate: Date
  },
  
  // Prescription & Documents
  prescription: {
    isIssued: { type: Boolean, default: false },
    prescriptionId: String,
    medications: [{
      name: String,
      dosage: String,
      frequency: String,
      duration: String,
      instructions: String
    }],
    pdfUrl: String,
    issuedAt: Date,
    validUntil: Date
  },
  
  // Post-Consultation
  sessionSummary: String,
  userFeedback: {
    rating: { type: Number, min: 1, max: 5 },
    review: String,
    submittedAt: Date
  },
  
  // Follow-up
  followUpAppointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment"
  },
  isFollowUp: { type: Boolean, default: false },
  parentAppointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment"
  },
  
  // Cancellation
  cancellation: {
    cancelledBy: {
      type: String,
      enum: ["user", "vet", "admin"]
    },
    reason: String,
    cancelledAt: Date,
    refundStatus: {
      type: String,
      enum: ["not_applicable", "pending", "processed", "failed"]
    }
  },
  
  // Notifications
  notifications: {
    bookingConfirmation: { sent: Boolean, sentAt: Date },
    reminder24h: { sent: Boolean, sentAt: Date },
    reminder1h: { sent: Boolean, sentAt: Date },
    consultationReady: { sent: Boolean, sentAt: Date },
    prescriptionReady: { sent: Boolean, sentAt: Date },
    followUpReminder: { sent: Boolean, sentAt: Date }
  },
  
  // Admin & System Fields
  createdBy: {
    type: String,
    enum: ["user", "vet", "admin"],
    default: "user"
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "lastUpdatedByModel"
  },
  lastUpdatedByModel: {
    type: String,
    enum: ["User", "Vet", "Admin"]
  }
}, {
  timestamps: true
});

// Indexes for performance (appointmentId already indexed via unique: true)
appointmentSchema.index({ user: 1 });
appointmentSchema.index({ vet: 1 });
appointmentSchema.index({ scheduledDate: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ "payment.status": 1 });
appointmentSchema.index({ createdAt: -1 });

// Generate unique appointment ID
appointmentSchema.pre('save', function(next) {
  if (!this.appointmentId) {
    this.appointmentId = 'APT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
  next();
});

// Virtual for appointment duration in human readable format
appointmentSchema.virtual('formattedDuration').get(function() {
  const duration = this.scheduledTime.duration;
  if (duration < 60) {
    return `${duration} minutes`;
  } else {
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return `${hours}h ${minutes}m`;
  }
});

// Virtual for time until appointment
appointmentSchema.virtual('timeUntilAppointment').get(function() {
  const now = new Date();
  const appointmentTime = new Date(this.scheduledDate);
  const [hours, minutes] = this.scheduledTime.startTime.split(':');
  appointmentTime.setHours(hours, minutes);
  
  const diffMs = appointmentTime - now;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (diffMs < 0) return 'Past';
  if (diffHours < 1) return `${diffMinutes}m`;
  if (diffHours < 24) return `${diffHours}h ${diffMinutes}m`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ${diffHours % 24}h`;
});

export default mongoose.models.Appointment || mongoose.model("Appointment", appointmentSchema); 