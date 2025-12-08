import mongoose, { Schema, Document } from 'mongoose';

export interface IPerformanceReview extends Document {
  userId: mongoose.Types.ObjectId;
  reviewerId: mongoose.Types.ObjectId;
  cycle: 'quarterly' | 'semi-annual' | 'annual' | 'ad-hoc';
  quarter?: number;
  year: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  goals: {
    title: string;
    description: string;
    dueDate: Date;
    status: 'pending' | 'in-progress' | 'completed';
  }[];
  score: number;
  maxScore: number;
  reviewDate: Date;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  peerFeedbackIds: mongoose.Types.ObjectId[];
  managerComment?: string;
  employeeComment?: string;
  submittedAt?: Date;
  approvedAt?: Date;
  approvedBy?: mongoose.Types.ObjectId;
  categories: {
    name: string;
    score: number;
    weight: number;
    comments?: string;
  }[];
  overallRating: 'excellent' | 'good' | 'satisfactory' | 'needs-improvement' | 'poor';
  recommendations: string[];
  scorePercentage?: number;
  nextReviewDate?: Date;
}

const performanceReviewSchema = new Schema<IPerformanceReview>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reviewerId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    cycle: {
      type: String,
      enum: ["quarterly", "semi-annual", "annual", "ad-hoc"],
      required: true,
    },

    quarter: {
      type: Number,
      min: 1,
      max: 4,
      required: function (this: IPerformanceReview) {
        return this.cycle === "quarterly";
      },
    },

    year: { type: Number, required: true, min: 2020, max: 2030 },

    summary: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    strengths: [
      { type: String, trim: true, maxlength: 500 }
    ],

    weaknesses: [
      { type: String, trim: true, maxlength: 500 }
    ],

    goals: [
      {
        title: { type: String, required: true, trim: true, maxlength: 200 },
        description: { type: String, required: true, trim: true, maxlength: 1000 },
        dueDate: { type: Date, required: true },
        status: {
          type: String,
          enum: ["pending", "in-progress", "completed"],
          default: "pending",
        },
      },
    ],

    score: { type: Number, required: true, min: 0, max: 100 },
    maxScore: { type: Number, required: true, min: 1, default: 100 },

    reviewDate: { type: Date, required: true, default: Date.now },

    status: {
      type: String,
      enum: ["draft", "submitted", "approved", "rejected"],
      default: "draft",
    },

    peerFeedbackIds: [{ type: Schema.Types.ObjectId, ref: "Feedback" }],

    managerComment: { type: String, trim: true, maxlength: 2000 },
    employeeComment: { type: String, trim: true, maxlength: 2000 },

    submittedAt: Date,
    approvedAt: Date,

    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },

    categories: [
      {
        name: { type: String, required: true, trim: true, maxlength: 100 },
        score: { type: Number, required: true, min: 0, max: 100 },
        weight: { type: Number, required: true, min: 0, max: 1 },
        comments: { type: String, trim: true, maxlength: 500 },
      },
    ],

    overallRating: {
      type: String,
      enum: ["excellent", "good", "satisfactory", "needs-improvement", "poor"],
      required: true,
    },

    recommendations: [
      { type: String, trim: true, maxlength: 500 }
    ],

    nextReviewDate: Date,
  },

  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//
// ------------- INDEXES -------------
//
performanceReviewSchema.index({ userId: 1 });
performanceReviewSchema.index({ reviewerId: 1 });
performanceReviewSchema.index({ cycle: 1 });
performanceReviewSchema.index({ year: 1 });
performanceReviewSchema.index({ quarter: 1 });
performanceReviewSchema.index({ status: 1 });
performanceReviewSchema.index({ reviewDate: -1 });

// Compound Indexes
performanceReviewSchema.index({ userId: 1, cycle: 1, year: 1 });
performanceReviewSchema.index({ userId: 1, status: 1 });

//
// ------------- VIRTUALS -------------
//
performanceReviewSchema.virtual("user", {
  ref: "User",
  localField: "userId",
  foreignField: "_id",
  justOne: true,
});

performanceReviewSchema.virtual("reviewer", {
  ref: "User",
  localField: "reviewerId",
  foreignField: "_id",
  justOne: true,
});

performanceReviewSchema.virtual("peerFeedback", {
  ref: "Feedback",
  localField: "peerFeedbackIds",
  foreignField: "_id",
});

performanceReviewSchema.virtual("scorePercentage").get(function () {
  if (!this.maxScore) return 0;
  return (this.score / this.maxScore) * 100;
});

performanceReviewSchema.virtual("weightedScore").get(function () {
  if (!this.categories || this.categories.length === 0) return this.score;

  const totalWeight = this.categories.reduce((t, c) => t + c.weight, 0);
  if (totalWeight === 0) return this.score;

  const weighted = this.categories.reduce(
    (t, c) => t + c.score * c.weight,
    0
  );

  return weighted / totalWeight;
});

//
// ------------- PRE-SAVE HOOK (FIXED) -------------
//

performanceReviewSchema.pre("save", function () {
  // Auto timestamp fields
  if (this.isModified("status")) {
    if (this.status === "submitted" && !this.submittedAt) {
      this.submittedAt = new Date();
    }
    if (this.status === "approved" && !this.approvedAt) {
      this.approvedAt = new Date();
    }
  }

  // Auto-calc overall rating
  const percent: number = this.scorePercentage as number;

  if (percent >= 90) this.overallRating = "excellent";
  else if (percent >= 80) this.overallRating = "good";
  else if (percent >= 70) this.overallRating = "satisfactory";
  else if (percent >= 60) this.overallRating = "needs-improvement";
  else this.overallRating = "poor";
});

export const PerformanceReview =
  mongoose.models.PerformanceReview ||
  mongoose.model<IPerformanceReview>(
    "PerformanceReview",
    performanceReviewSchema
  );
