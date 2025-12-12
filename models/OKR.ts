import mongoose, { Schema, Document } from 'mongoose';

export interface IOKR extends Document {
  userId?: mongoose.Types.ObjectId;
  teamId?: mongoose.Types.ObjectId;
  objective: string;
  keyResults: {
    title: string;
    description: string;
    targetValue: number;
    currentValue: number;
    unit: string;
    dueDate: Date;
    status: 'not-started' | 'in-progress' | 'completed' | 'at-risk';
  }[];
  progress: number;
  quarter: number;
  year: number;
  status: 'active' | 'completed' | 'archived' | 'cancelled';
  alignment: 'individual' | 'team' | 'company';
  parentOKRId?: mongoose.Types.ObjectId;
  childOKRIds: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewComments?: string;
  lastUpdated: Date;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
}

const okrSchema = new Schema<IOKR>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  teamId: {
    type: Schema.Types.ObjectId,
    ref: 'Team'
  },
  objective: {
    type: String,
    required: [true, 'Objective is required'],
    trim: true,
    maxlength: [500, 'Objective cannot exceed 500 characters']
  },
  keyResults: [{
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Key result title cannot exceed 200 characters']
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, 'Key result description cannot exceed 1000 characters']
    },
    targetValue: {
      type: Number,
      required: true,
      min: 0
    },
    currentValue: {
      type: Number,
      default: 0,
      min: 0
    },
    unit: {
      type: String,
      required: true,
      trim: true,
      maxlength: [50, 'Unit cannot exceed 50 characters']
    },
    dueDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'completed', 'at-risk'],
      default: 'not-started'
    }
  }],
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  quarter: {
    type: Number,
    required: true,
    min: 1,
    max: 4
  },
  year: {
    type: Number,
    required: true,
    min: 2020,
    max: 2030
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'archived', 'cancelled'],
    default: 'active'
  },
  alignment: {
    type: String,
    enum: ['individual', 'team', 'company'],
    required: true
  },
  parentOKRId: {
    type: Schema.Types.ObjectId,
    ref: 'OKR'
  },
  childOKRIds: [{
    type: Schema.Types.ObjectId,
    ref: 'OKR'
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewComments: {
    type: String,
    trim: true,
    maxlength: [1000, 'Review comments cannot exceed 1000 characters']
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
okrSchema.index({ userId: 1 });
okrSchema.index({ teamId: 1 });
okrSchema.index({ quarter: 1 });
okrSchema.index({ year: 1 });
okrSchema.index({ status: 1 });
okrSchema.index({ progress: 1 });
okrSchema.index({ alignment: 1 });
okrSchema.index({ createdBy: 1 });

// Compound indexes
okrSchema.index({ userId: 1, quarter: 1, year: 1 });
okrSchema.index({ teamId: 1, quarter: 1, year: 1 });
okrSchema.index({ alignment: 1, quarter: 1, year: 1 });

// Virtuals
okrSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

okrSchema.virtual('team', {
  ref: 'Team',
  localField: 'teamId',
  foreignField: '_id',
  justOne: true
});

okrSchema.virtual('creator', {
  ref: 'User',
  localField: 'createdBy',
  foreignField: '_id',
  justOne: true
});

okrSchema.virtual('parentOKR', {
  ref: 'OKR',
  localField: 'parentOKRId',
  foreignField: '_id',
  justOne: true
});

okrSchema.virtual('childOKRs', {
  ref: 'OKR',
  localField: 'childOKRIds',
  foreignField: '_id'
});

okrSchema.virtual('completedKeyResults').get(function () {
  return this.keyResults.filter(kr => kr.status === 'completed').length;
});

okrSchema.virtual('totalKeyResults').get(function () {
  return this.keyResults.length;
});

okrSchema.virtual('isOnTrack').get(function () {
  if (this.keyResults.length === 0) return false;

  const atRiskCount = this.keyResults.filter(kr => kr.status === 'at-risk').length;
  const notStartedCount = this.keyResults.filter(kr => kr.status === 'not-started').length;

  // Consider on track if less than 30% are at-risk and less than 50% haven't started
  return (atRiskCount / this.keyResults.length) < 0.3 && (notStartedCount / this.keyResults.length) < 0.5;
});

// Validation to ensure OKR belongs to either user or team, not both
okrSchema.pre('validate', function (next) {
  if (!this.userId && !this.teamId) {
    throw new Error('OKR must belong to either a user or team')
  } else if (this.userId && this.teamId) {
    throw new Error('OKR cannot belong to both user and team')
  }
});

// Pre-save middleware to calculate progress
okrSchema.pre('save', function (next) {
  if (this.isModified('keyResults') || this.isNew) {
    if (this.keyResults.length === 0) {
      this.progress = 0;
    } else {
      const totalProgress = this.keyResults.reduce((sum, kr) => {
        const krProgress = kr.targetValue > 0 ? (kr.currentValue / kr.targetValue) * 100 : 0;
        return sum + Math.min(krProgress, 100);
      }, 0);

      this.progress = totalProgress / this.keyResults.length;
    }

    // Auto-update status based on progress
    if (this.progress >= 100 && this.keyResults.every(kr => kr.status === 'completed')) {
      this.status = 'completed';
    }
  }

  this.lastUpdated = new Date();

});

export const OKR = mongoose.models.OKR || mongoose.model<IOKR>('OKR', okrSchema);
