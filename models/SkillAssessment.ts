import mongoose, { Schema, Document } from 'mongoose';

export interface ISkillAssessment extends Document {
  userId: mongoose.Types.ObjectId;
  skillId: mongoose.Types.ObjectId;
  level: number;
  selfRating: number;
  managerRating?: number;
  assessmentDate: Date;
  nextReviewDate?: Date;
  notes?: string;
  evidence: {
    description: string;
    attachmentId?: mongoose.Types.ObjectId;
    date: Date;
  }[];
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  goals: {
    title: string;
    description: string;
    targetLevel: number;
    dueDate: Date;
    status: 'pending' | 'in-progress' | 'completed';
  }[];
}

const skillAssessmentSchema = new Schema<ISkillAssessment>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skillId: {
    type: Schema.Types.ObjectId,
    ref: 'Skill',
    required: true
  },
  level: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  selfRating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  managerRating: {
    type: Number,
    min: 1,
    max: 5
  },
  assessmentDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  nextReviewDate: {
    type: Date
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  evidence: [{
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Evidence description cannot exceed 500 characters']
    },
    attachmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Attachment'
    },
    date: {
      type: Date,
      required: true,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'expired'],
    default: 'pending'
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  goals: [{
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Goal title cannot exceed 200 characters']
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, 'Goal description cannot exceed 1000 characters']
    },
    targetLevel: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    dueDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending'
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
skillAssessmentSchema.index({ userId: 1 });
skillAssessmentSchema.index({ skillId: 1 });
skillAssessmentSchema.index({ assessmentDate: -1 });
skillAssessmentSchema.index({ status: 1 });
skillAssessmentSchema.index({ nextReviewDate: 1 });

// Compound indexes
skillAssessmentSchema.index({ userId: 1, skillId: 1 });
skillAssessmentSchema.index({ userId: 1, assessmentDate: -1 });

// Virtuals
skillAssessmentSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

skillAssessmentSchema.virtual('skill', {
  ref: 'Skill',
  localField: 'skillId',
  foreignField: '_id',
  justOne: true
});

skillAssessmentSchema.virtual('approver', {
  ref: 'User',
  localField: 'approvedBy',
  foreignField: '_id',
  justOne: true
});

skillAssessmentSchema.virtual('ratingDifference').get(function() {
  if (!this.managerRating) return null;
  return this.selfRating - this.managerRating;
});

skillAssessmentSchema.virtual('isOverdue').get(function() {
  if (!this.nextReviewDate) return false;
  return new Date() > this.nextReviewDate;
});

skillAssessmentSchema.virtual('completedGoals').get(function() {
  return this.goals.filter(goal => goal.status === 'completed').length;
});

skillAssessmentSchema.virtual('totalGoals').get(function() {
  return this.goals.length;
});

// Pre-save middleware
skillAssessmentSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'approved' && !this.approvedAt) {
    this.approvedAt = new Date();
  }
  
  // Set next review date to 6 months from assessment date if not set
  if (!this.nextReviewDate && this.assessmentDate) {
    const nextReview = new Date(this.assessmentDate);
    nextReview.setMonth(nextReview.getMonth() + 6);
    this.nextReviewDate = nextReview;
  }
  
  
});

// Static method to find overdue assessments
skillAssessmentSchema.statics.findOverdue = function() {
  return this.find({
    nextReviewDate: { $lt: new Date() },
    status: { $ne: 'expired' }
  }).populate('user skill');
};

export const SkillAssessment = mongoose.models.SkillAssessment || mongoose.model<ISkillAssessment>('SkillAssessment', skillAssessmentSchema);
