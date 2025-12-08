import mongoose, { Schema, Document } from 'mongoose';

export interface IMilestone extends Document {
  projectId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  dueDate?: Date;
  completed: boolean;
  completedAt?: Date;
  tasks: mongoose.Types.ObjectId[];
  progress: number;
  priority: 'low' | 'medium' | 'high';
  assignedTo?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
}

const milestoneSchema = new Schema<IMilestone>({
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Milestone title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  dueDate: {
    type: Date
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  tasks: [{
    type: Schema.Types.ObjectId,
    ref: 'Task'
  }],
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
milestoneSchema.index({ projectId: 1 });
milestoneSchema.index({ dueDate: 1 });
milestoneSchema.index({ completed: 1 });
milestoneSchema.index({ assignedTo: 1 });
milestoneSchema.index({ createdBy: 1 });

// Virtuals
milestoneSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate || this.completed) return false;
  return new Date() > this.dueDate;
});

milestoneSchema.virtual('completedTaskCount', {
  ref: 'Task',
  localField: 'tasks',
  foreignField: '_id',
  count: true,
  match: { status: 'completed' }
});

milestoneSchema.virtual('totalTaskCount', {
  ref: 'Task',
  localField: 'tasks',
  foreignField: '_id',
  count: true
});

// Pre-save middleware
milestoneSchema.pre('save', function(next) {
  if (this.isModified('completed') && this.completed && !this.completedAt) {
    this.completedAt = new Date();
    this.progress = 100;
  }
  
});

export const Milestone = mongoose.model<IMilestone>('Milestone', milestoneSchema);
