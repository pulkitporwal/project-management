import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  userId: mongoose.Types.ObjectId;
  action: string;
  module: 'users' | 'teams' | 'projects' | 'tasks' | 'milestones' | 'timelogs' | 'comments' | 'notifications' | 'attachments' | 'performance-reviews' | 'okrs' | 'skills' | 'feedback' | 'ai-reports' | 'settings';
  entityId?: mongoose.Types.ObjectId;
  entityType?: string;
  before?: any;
  after?: any;
  ipAddress: string;
  userAgent: string;
  sessionId?: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  success: boolean;
  errorMessage?: string;
  metadata?: {
    [key: string]: any;
  };
}

const auditLogSchema = new Schema<IAuditLog>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: [true, 'Action is required'],
    trim: true,
    maxlength: [100, 'Action cannot exceed 100 characters']
  },
  module: {
    type: String,
    enum: ['users', 'teams', 'projects', 'tasks', 'milestones', 'timelogs', 'comments', 'notifications', 'attachments', 'performance-reviews', 'okrs', 'skills', 'feedback', 'ai-reports', 'settings'],
    required: true
  },
  entityId: {
    type: Schema.Types.ObjectId
  },
  entityType: {
    type: String,
    trim: true,
    maxlength: [50, 'Entity type cannot exceed 50 characters']
  },
  before: {
    type: Schema.Types.Mixed
  },
  after: {
    type: Schema.Types.Mixed
  },
  ipAddress: {
    type: String,
    required: [true, 'IP address is required'],
    trim: true,
    match: [/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$|^::1$|^localhost$/, 'Please enter a valid IP address']
  },
  userAgent: {
    type: String,
    required: [true, 'User agent is required'],
    trim: true,
    maxlength: [500, 'User agent cannot exceed 500 characters']
  },
  sessionId: {
    type: String,
    trim: true,
    maxlength: [100, 'Session ID cannot exceed 100 characters']
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  success: {
    type: Boolean,
    required: true,
    default: true
  },
  errorMessage: {
    type: String,
    trim: true,
    maxlength: [1000, 'Error message cannot exceed 1000 characters']
  },
  metadata: {
    type: Schema.Types.Mixed
  }
}, {
  timestamps: false, // We use our own timestamp field
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
auditLogSchema.index({ userId: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ module: 1 });
auditLogSchema.index({ entityId: 1 });
auditLogSchema.index({ entityType: 1 });
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ severity: 1 });
auditLogSchema.index({ success: 1 });
auditLogSchema.index({ ipAddress: 1 });

// Compound indexes for common queries
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ module: 1, timestamp: -1 });
auditLogSchema.index({ entityId: 1, action: 1 });
auditLogSchema.index({ severity: 1, timestamp: -1 });

// Virtuals
auditLogSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

auditLogSchema.virtual('isRecent').get(function() {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  return this.timestamp > oneHourAgo;
});

auditLogSchema.virtual('formattedTimestamp').get(function() {
  return this.timestamp.toISOString();
});

// Pre-save middleware to auto-detect entity type if not provided
auditLogSchema.pre('save', function(next) {
  if (this.entityId && !this.entityType) {
    // Try to infer entity type from module
    const moduleToTypeMap: { [key: string]: string } = {
      'users': 'User',
      'teams': 'Team',
      'projects': 'Project',
      'tasks': 'Task',
      'milestones': 'Milestone',
      'timelogs': 'TimeLog',
      'comments': 'Comment',
      'notifications': 'Notification',
      'attachments': 'Attachment',
      'performance-reviews': 'PerformanceReview',
      'okrs': 'OKR',
      'skills': 'Skill',
      'feedback': 'Feedback',
      'ai-reports': 'AIReport',
      'settings': 'Settings'
    };
    
    this.entityType = moduleToTypeMap[this.module];
  }
  
  // Auto-set severity based on action
  if (this.isNew && !this.severity) {
    const criticalActions = ['delete', 'remove', 'terminate', 'suspend'];
    const highSeverityActions = ['create', 'update', 'modify', 'change'];
    
    const actionLower = this.action.toLowerCase();
    if (criticalActions.some(critical => actionLower.includes(critical))) {
      this.severity = 'high';
    } else if (highSeverityActions.some(high => actionLower.includes(high))) {
      this.severity = 'medium';
    } else {
      this.severity = 'low';
    }
  }
  
  
});

// Static methods
auditLogSchema.statics.findByUser = function(userId: mongoose.Types.ObjectId, limit?: number) {
  const query = this.find({ userId }).sort({ timestamp: -1 });
  if (limit) query.limit(limit);
  return query;
};

auditLogSchema.statics.findByModule = function(module: string, limit?: number) {
  const query = this.find({ module }).sort({ timestamp: -1 });
  if (limit) query.limit(limit);
  return query;
};

auditLogSchema.statics.findFailedActions = function(limit?: number) {
  const query = this.find({ success: false }).sort({ timestamp: -1 });
  if (limit) query.limit(limit);
  return query;
};

auditLogSchema.statics.findCriticalEvents = function(limit?: number) {
  const query = this.find({ severity: 'critical' }).sort({ timestamp: -1 });
  if (limit) query.limit(limit);
  return query;
};

// Static method to clean up old logs (older than 1 year)
auditLogSchema.statics.cleanupOldLogs = function() {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  
  return this.deleteMany({
    timestamp: { $lt: oneYearAgo },
    severity: { $in: ['low', 'medium'] }
  });
};

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
