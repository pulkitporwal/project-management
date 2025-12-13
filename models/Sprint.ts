import mongoose, { Schema, Document } from 'mongoose';

export interface ISprint extends Document {
  projectId: mongoose.Types.ObjectId;
  organisationId: mongoose.Types.ObjectId;
  name: string;
  goal?: string;
  startDate: Date;
  endDate: Date;
  state: 'planned' | 'active' | 'completed' | 'cancelled';
  capacityPoints?: number;
  committedPoints?: number;
  completedPoints?: number;
  velocity?: number;
  burndownChart?: {
    date: Date;
    remainingWork: number;
  }[];
  retrospective?: {
    whatWentWell?: string;
    whatCouldBeImproved?: string;
    actionItems?: string;
  };
  sprintReview?: {
    demoLink?: string;
    stakeholderFeedback?: string;
    achievements?: string[];
  };
  dailyStandups?: {
    date: Date;
    blockers?: string;
    notes?: string;
  }[];
}

const sprintSchema = new Schema<ISprint>({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  organisationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  goal: { type: String, trim: true, maxlength: 500 },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  state: { type: String, enum: ['planned', 'active', 'completed', 'cancelled'], default: 'planned' },
  capacityPoints: { type: Number, min: 0, default: 0 },
  committedPoints: { type: Number, min: 0, default: 0 },
  completedPoints: { type: Number, min: 0, default: 0 },
  velocity: { type: Number, min: 0 },
  burndownChart: [{
    date: { type: Date, required: true },
    remainingWork: { type: Number, required: true, min: 0 }
  }],
  retrospective: {
    whatWentWell: { type: String, trim: true, maxlength: 1000 },
    whatCouldBeImproved: { type: String, trim: true, maxlength: 1000 },
    actionItems: { type: String, trim: true, maxlength: 1000 }
  },
  sprintReview: {
    demoLink: { type: String, trim: true },
    stakeholderFeedback: { type: String, trim: true, maxlength: 1000 },
    achievements: [{ type: String, trim: true, maxlength: 200 }]
  },
  dailyStandups: [{
    date: { type: Date, required: true },
    blockers: { type: String, trim: true, maxlength: 500 },
    notes: { type: String, trim: true, maxlength: 1000 }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

sprintSchema.index({ projectId: 1 });
sprintSchema.index({ organisationId: 1 });
sprintSchema.index({ state: 1 });
sprintSchema.index({ startDate: 1 });
sprintSchema.index({ endDate: 1 });

// Virtuals
sprintSchema.virtual('duration').get(function() {
  return Math.ceil((this.endDate.getTime() - this.startDate.getTime()) / (1000 * 60 * 60 * 24));
});

sprintSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  if (this.state === 'completed' || this.state === 'cancelled') return 0;
  return Math.ceil((this.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
});

sprintSchema.virtual('isOverdue').get(function() {
  return new Date() > this.endDate && this.state === 'active';
});

sprintSchema.virtual('completionPercentage').get(function() {
  if (this.committedPoints === 0) return 0;
  return (this.completedPoints / this.committedPoints) * 100;
});

sprintSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'sprintId'
});

sprintSchema.virtual('completedTasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'sprintId',
  match: { status: 'completed' }
});

// Pre-save middleware
sprintSchema.pre('save', function(next) {
  // Ensure end date is after start date
  if (this.endDate <= this.startDate) {
    return next(new Error('End date must be after start date'));
  }
  
  // Calculate velocity for completed sprints
  if (this.isModified('state') && this.state === 'completed' && this.committedPoints > 0) {
    this.velocity = this.completedPoints;
  }
  
  next();
});

export const Sprint = mongoose.models.Sprint || mongoose.model<ISprint>('Sprint', sprintSchema);

