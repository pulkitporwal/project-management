import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
    title: string;
    description?: string;
    status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'critical';
    createdBy: mongoose.Types.ObjectId;
    assignedTeams: mongoose.Types.ObjectId[];
    members: mongoose.Types.ObjectId[];
    milestones: mongoose.Types.ObjectId[];
    startDate?: Date;
    endDate?: Date;
    tags: string[];
    progress: number;
    archived: boolean;
    visibility: 'public' | 'private' | 'team-only';
    budget?: number;
    actualCost?: number;
    client?: string;
}

const projectSchema = new Schema<IProject>({
    title: {
        type: String,
        required: [true, 'Project title is required'],
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
        enum: ['planning', 'active', 'on-hold', 'completed', 'cancelled'],
        default: 'planning',
        required: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium',
        required: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedTeams: [{
        type: Schema.Types.ObjectId,
        ref: 'Team'
    }],
    members: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    milestones: [{
        type: Schema.Types.ObjectId,
        ref: 'Milestone'
    }],
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    tags: [{
        type: String,
        trim: true,
        maxlength: [30, 'Tag cannot exceed 30 characters']
    }],
    progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    archived: {
        type: Boolean,
        default: false
    },
    visibility: {
        type: String,
        enum: ['public', 'private', 'team-only'],
        default: 'team-only'
    },
    budget: {
        type: Number,
        min: 0
    },
    actualCost: {
        type: Number,
        min: 0,
        default: 0
    },
    client: {
        type: String,
        trim: true,
        maxlength: [100, 'Client name cannot exceed 100 characters']
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
projectSchema.index({ title: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ priority: 1 });
projectSchema.index({ createdBy: 1 });
projectSchema.index({ assignedTeams: 1 });
projectSchema.index({ members: 1 });
projectSchema.index({ startDate: 1 });
projectSchema.index({ endDate: 1 });
projectSchema.index({ archived: 1 });
projectSchema.index({ visibility: 1 });

// Virtuals
projectSchema.virtual('taskCount', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'projectId',
    count: true
});

projectSchema.virtual('completedTaskCount', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'projectId',
    count: true,
    match: { status: 'completed' }
});

projectSchema.virtual('isOverdue').get(function () {
    if (!this.endDate || this.status === 'completed') return false;
    return new Date() > this.endDate;
});

projectSchema.virtual('duration').get(function () {
    if (!this.startDate || !this.endDate) return null;
    return Math.ceil((this.endDate.getTime() - this.startDate.getTime()) / (1000 * 60 * 60 * 24));
});

projectSchema.virtual('budgetUtilization').get(function () {
    if (!this.budget || this.budget === 0) return 0;
    return (this.actualCost || 0) / this.budget * 100;
});

// Validation for dates
projectSchema.pre('save', function (next) {
    if (this.startDate && this.endDate && this.startDate >= this.endDate) {
        throw new Error('Start date must be before end date')
  }
});

export const Project = mongoose.model<IProject>('Project', projectSchema);
