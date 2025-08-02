import mongoose from "mongoose";

const vetReviewSchema = new mongoose.Schema({
  // Review Details
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
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
    required: true
  },
  
  // Rating & Review
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    required: true,
    maxlength: 1000
  },
  
  // Detailed Ratings
  detailedRatings: {
    communication: { type: Number, min: 1, max: 5 },
    expertise: { type: Number, min: 1, max: 5 },
    timeliness: { type: Number, min: 1, max: 5 },
    helpfulness: { type: Number, min: 1, max: 5 },
    followUp: { type: Number, min: 1, max: 5 }
  },
  
  // Review Categories
  tags: [{
    type: String,
    enum: [
      "Excellent Communication",
      "Very Knowledgeable", 
      "Quick Response",
      "Helpful Advice",
      "Professional",
      "Patient & Kind",
      "Thorough Examination",
      "Clear Instructions",
      "Good Follow-up",
      "Reasonable Pricing",
      "Technical Issues",
      "Late Response",
      "Unclear Advice"
    ]
  }],
  
  // Consultation Experience
  consultationExperience: {
    wouldRecommend: { type: Boolean, required: true },
    problemResolved: { type: Boolean, required: true },
    prescriptionHelpful: Boolean,
    followUpNeeded: Boolean
  },
  
  // Review Status
  isVerified: {
    type: Boolean,
    default: true // Since it's tied to an actual appointment
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  // Admin moderation
  moderationStatus: {
    type: String,
    enum: ["approved", "pending", "rejected", "flagged"],
    default: "approved"
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  moderatedAt: Date,
  moderationNotes: String,
  
  // Vet Response
  vetResponse: {
    message: String,
    respondedAt: Date,
    isPublic: { type: Boolean, default: true }
  },
  
  // Helpful votes
  helpfulVotes: {
    helpful: { type: Number, default: 0 },
    notHelpful: { type: Number, default: 0 },
    voters: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      vote: { type: String, enum: ["helpful", "not_helpful"] },
      votedAt: { type: Date, default: Date.now }
    }]
  }
}, {
  timestamps: true
});

// Indexes
vetReviewSchema.index({ vet: 1 });
vetReviewSchema.index({ user: 1 });
vetReviewSchema.index({ rating: -1 });
vetReviewSchema.index({ createdAt: -1 });
vetReviewSchema.index({ moderationStatus: 1 });

// Ensure one review per appointment (this also creates the appointment index)
vetReviewSchema.index({ appointment: 1 }, { unique: true });

export default mongoose.models.VetReview || mongoose.model("VetReview", vetReviewSchema); 