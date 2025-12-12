import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'task_assigned' | 'task_completed' | 'comment_added' | 'mention' | 'project_updated' | 'deadline_reminder' | 'performance_review' | 'okr_update' | 'system';
  title: string;
  message: string;
  metadata: {
    taskId?: mongoose.Types.ObjectId;
    projectId?: mongoose.Types.ObjectId;
    commentId?: mongoose.Types.ObjectId;
    reviewId?: mongoose.Types.ObjectId;
    okrId?: mongoose.Types.ObjectId;
    teamId?: mongoose.Types.ObjectId;
    [key: string]: any;
  };
  read: boolean;
  readAt?: Date;
  priority: 'low' | 'medium' | 'high';
  actionRequired: boolean;
  actionUrl?: string;
  expiresAt?: Date;
}

const notificationSchema = new Schema<INotification>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['task_assigned', 'task_completed', 'comment_added', 'mention', 'project_updated', 'deadline_reminder', 'performance_review', 'okr_update', 'system'],
    required: true
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  metadata: {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task'
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project'
    },
    commentId: {
      type: Schema.Types.ObjectId,
      ref: 'Comment'
    },
    reviewId: {
      type: Schema.Types.ObjectId,
      ref: 'PerformanceReview'
    },
    okrId: {
      type: Schema.Types.ObjectId,
      ref: 'OKR'
    },
    teamId: {
      type: Schema.Types.ObjectId,
      ref: 'Team'
    }
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  actionRequired: {
    type: Boolean,
    default: false
  },
  actionUrl: {
    type: String,
    trim: true
  },
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
notificationSchema.index({ userId: 1 });
notificationSchema.index({ read: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ expiresAt: 1 });

// Compound indexes
notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

// Virtuals
notificationSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

notificationSchema.virtual('isExpired').get(function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
});

// Pre-save middleware for read tracking
notificationSchema.pre('save', function(next) {
  if (this.isModified('read') && this.read && !this.readAt) {
    this.readAt = new Date();
  }
  
});

// Static method to mark notifications as read
notificationSchema.statics.markAsRead = function(userId: mongoose.Types.ObjectId, notificationIds?: mongoose.Types.ObjectId[]) {
  const query: any = { userId, read: false };
  if (notificationIds && notificationIds.length > 0) {
    query._id = { $in: notificationIds };
  }
  
  return this.updateMany(query, { 
    read: true, 
    readAt: new Date() 
  });
};

// Static method to clean up expired notifications
notificationSchema.statics.cleanupExpired = function() {
  return this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
};

export const Notification = mongoose.models.Notification || mongoose.model<INotification>('Notification', notificationSchema);
