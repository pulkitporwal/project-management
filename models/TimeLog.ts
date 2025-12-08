import mongoose, { Schema, Document } from 'mongoose';

export interface ITimeLog extends Document {
  taskId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  hours: number;
  date: Date;
  notes?: string;
  isBillable: boolean;
  hourlyRate?: number;
  approved: boolean;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  projectId?: mongoose.Types.ObjectId;
}

const timeLogSchema = new Schema<ITimeLog>({
  taskId: {
    type: Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hours: {
    type: Number,
    required: [true, 'Hours are required'],
    min: [0.01, 'Hours must be greater than 0'],
    max: [24, 'Hours cannot exceed 24 per entry']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  isBillable: {
    type: Boolean,
    default: true
  },
  hourlyRate: {
    type: Number,
    min: 0
  },
  approved: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
timeLogSchema.index({ taskId: 1 });
timeLogSchema.index({ userId: 1 });
timeLogSchema.index({ date: -1 });
timeLogSchema.index({ approved: 1 });
timeLogSchema.index({ projectId: 1 });
timeLogSchema.index({ isBillable: 1 });

// Compound indexes
timeLogSchema.index({ userId: 1, date: -1 });
timeLogSchema.index({ taskId: 1, date: -1 });
timeLogSchema.index({ projectId: 1, date: -1 });

// Virtuals
timeLogSchema.virtual('cost').get(function() {
  if (!this.hourlyRate) return 0;
  return this.hours * this.hourlyRate;
});

timeLogSchema.virtual('task', {
  ref: 'Task',
  localField: 'taskId',
  foreignField: '_id',
  justOne: true
});

timeLogSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Pre-save middleware to auto-populate projectId from task
timeLogSchema.pre('save', async function(next) {
  if (!this.projectId && this.taskId) {
    try {
      const task = await mongoose.model('Task').findById(this.taskId);
      if (task) {
        this.projectId = task.projectId;
      }
    } catch (error) {
      // Continue without projectId if task not found
    }
  }
  
});

export const TimeLog = mongoose.model<ITimeLog>('TimeLog', timeLogSchema);
