import mongoose, { Schema, Document } from 'mongoose';

export interface IFeedback extends Document {
  givenBy: mongoose.Types.ObjectId;
  givenTo: mongoose.Types.ObjectId;
  message: string;
  tags: string[];
  rating: number;
  anonymous: boolean;
  type: 'peer' | 'manager' | 'self' | '360-degree';
  category: 'performance' | 'behavior' | 'skills' | 'collaboration' | 'leadership' | 'general';
  context?: {
    projectId?: mongoose.Types.ObjectId;
    taskId?: mongoose.Types.ObjectId;
    reviewId?: mongoose.Types.ObjectId;
    period?: string;
  };
  status: 'pending' | 'acknowledged' | 'actioned';
  response?: string;
  respondedBy?: mongoose.Types.ObjectId;
  respondedAt?: Date;
  visibility: 'private' | 'manager-only' | 'shared-with-recipient' | 'public';
  actionable: boolean;
  actionItems: {
    description: string;
    dueDate?: Date;
    status: 'pending' | 'in-progress' | 'completed';
    assignedTo?: mongoose.Types.ObjectId;
  }[];
}

const feedbackSchema = new Schema<IFeedback>({
  givenBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  givenTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: [true, 'Feedback message is required'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  anonymous: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    enum: ['peer', 'manager', 'self', '360-degree'],
    required: true
  },
  category: {
    type: String,
    enum: ['performance', 'behavior', 'skills', 'collaboration', 'leadership', 'general'],
    required: true
  },
  context: {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project'
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task'
    },
    reviewId: {
      type: Schema.Types.ObjectId,
      ref: 'PerformanceReview'
    },
    period: {
      type: String,
      trim: true,
      maxlength: [50, 'Period cannot exceed 50 characters']
    }
  },
  status: {
    type: String,
    enum: ['pending', 'acknowledged', 'actioned'],
    default: 'pending'
  },
  response: {
    type: String,
    trim: true,
    maxlength: [2000, 'Response cannot exceed 2000 characters']
  },
  respondedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  respondedAt: {
    type: Date
  },
  visibility: {
    type: String,
    enum: ['private', 'manager-only', 'shared-with-recipient', 'public'],
    default: 'shared-with-recipient'
  },
  actionable: {
    type: Boolean,
    default: true
  },
  actionItems: [{
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Action item description cannot exceed 500 characters']
    },
    dueDate: {
      type: Date
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending'
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
feedbackSchema.index({ givenBy: 1 });
feedbackSchema.index({ givenTo: 1 });
feedbackSchema.index({ rating: 1 });
feedbackSchema.index({ type: 1 });
feedbackSchema.index({ category: 1 });
feedbackSchema.index({ status: 1 });
feedbackSchema.index({ createdAt: -1 });

// Compound indexes
feedbackSchema.index({ givenTo: 1, createdAt: -1 });
feedbackSchema.index({ givenBy: 1, givenTo: 1 });

// Virtuals
feedbackSchema.virtual('giver', {
  ref: 'User',
  localField: 'givenBy',
  foreignField: '_id',
  justOne: true
});

feedbackSchema.virtual('receiver', {
  ref: 'User',
  localField: 'givenTo',
  foreignField: '_id',
  justOne: true
});

feedbackSchema.virtual('responder', {
  ref: 'User',
  localField: 'respondedBy',
  foreignField: '_id',
  justOne: true
});

feedbackSchema.virtual('completedActionItems').get(function () {
  return this.actionItems.filter(item => item.status === 'completed').length;
});

feedbackSchema.virtual('totalActionItems').get(function () {
  return this.actionItems.length;
});

feedbackSchema.virtual('hasResponse').get(function () {
  return !!this.response;
});

// Validation to prevent self-feedback unless type is 'self'
feedbackSchema.pre('validate', function (next) {
  if (this.givenBy.toString() === this.givenTo.toString() && this.type !== 'self') {
    throw new Error('Self-feedback is only allowed for feedback type "self"')
  }
});

// Pre-save middleware
feedbackSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status !== 'pending' && !this.respondedAt) {
    this.respondedAt = new Date();
  }

});

// Static methods
feedbackSchema.statics.findByRecipient = function (userId: mongoose.Types.ObjectId, limit?: number) {
  const query = this.find({ givenTo: userId })
    .populate('giver', 'name email profileImage')
    .sort({ createdAt: -1 });

  if (limit) {
    query.limit(limit);
  }

  return query;
};

feedbackSchema.statics.findPendingFeedback = function (userId: mongoose.Types.ObjectId) {
  return this.find({
    givenTo: userId,
    status: 'pending'
  }).populate('giver', 'name email profileImage');
};

export const Feedback = mongoose.models.Feedback || mongoose.model<IFeedback>('Feedback', feedbackSchema);
