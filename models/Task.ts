import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description?: string;
  status: 'backlog' | 'todo' | 'in-progress' | 'in-review' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  startDate?: Date;
  labels: string[];
  projectId: mongoose.Types.ObjectId;
  organisationId: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  dependencies: mongoose.Types.ObjectId[];
  order: number;
  estimatedHours?: number;
  loggedHours: number;
  attachments: mongoose.Types.ObjectId[];
  comments: mongoose.Types.ObjectId[];
  blockers: string[];
  recurring?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    interval: number;
    endDate?: Date;
  };
  parentTaskId?: mongoose.Types.ObjectId;
  sprintId?: mongoose.Types.ObjectId;
  completionPercentage: number;
  actualStartDate?: Date;
  actualEndDate?: Date;
}

const taskSchema = new Schema<ITask>({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  status: {
    type: String,
    enum: ['backlog', 'todo', 'in-progress', 'in-review', 'done', 'cancelled'],
    default: 'todo',
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    required: true
  },
  dueDate: {
    type: Date
  },
  startDate: {
    type: Date
  },
  labels: [{
    type: String,
    trim: true,
    maxlength: [30, 'Label cannot exceed 30 characters']
  }],
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  organisationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dependencies: [{
    type: Schema.Types.ObjectId,
    ref: 'Task'
  }],
  order: {
    type: Number,
    default: 0
  },
  estimatedHours: {
    type: Number,
    min: 0,
    max: 1000
  },
  loggedHours: {
    type: Number,
    min: 0,
    default: 0
  },
  attachments: [{
    type: Schema.Types.ObjectId,
    ref: 'Attachment'
  }],
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  blockers: [{
    type: String,
    trim: true,
    maxlength: [200, 'Blocker description cannot exceed 200 characters']
  }],
  recurring: {
    enabled: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'quarterly'],
      default: 'weekly'
    },
    interval: {
      type: Number,
      min: 1,
      default: 1
    },
    endDate: {
      type: Date
    }
  },
  parentTaskId: {
    type: Schema.Types.ObjectId,
    ref: 'Task'
  },
  sprintId: {
    type: Schema.Types.ObjectId,
    ref: 'Sprint'
  },
  completionPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  actualStartDate: {
    type: Date
  },
  actualEndDate: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ projectId: 1 });
taskSchema.index({ organisationId: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ createdBy: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ startDate: 1 });
taskSchema.index({ parentTaskId: 1 });
taskSchema.index({ sprintId: 1 });
taskSchema.index({ order: 1 });

// Compound indexes
taskSchema.index({ projectId: 1, status: 1 });
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ projectId: 1, assignedTo: 1 });

// Virtuals
taskSchema.virtual('isOverdue').get(function () {
  if (!this.dueDate || this.status === 'done') return false;
  return new Date() > this.dueDate;
});

taskSchema.virtual('timeTrackingEfficiency').get(function () {
  if (!this.estimatedHours || this.estimatedHours === 0) return null;
  return this.estimatedHours / this.loggedHours;
});

taskSchema.virtual('subtasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'parentTaskId'
});

taskSchema.virtual('timeLogs', {
  ref: 'TimeLog',
  localField: '_id',
  foreignField: 'taskId'
});

// Pre-save middleware
taskSchema.pre('save', function (next) {
  // Update actual dates based on status changes
  if (this.isModified('status')) {
    if (this.status === 'in-progress' && !this.actualStartDate) {
      this.actualStartDate = new Date();
    }
    if (this.status === 'done' && !this.actualEndDate) {
      this.actualEndDate = new Date();
      this.completionPercentage = 100;
    }
  }

  // Validate dates
  if (this.startDate && this.dueDate && this.startDate >= this.dueDate) {
    new Error('Start date must be before due date')
  }
});

export const Task = mongoose.models.Task || mongoose.model<ITask>('Task', taskSchema);
