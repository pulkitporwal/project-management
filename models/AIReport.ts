import mongoose, { Schema, Document } from 'mongoose';

export interface IAIReport extends Document {
    userId?: mongoose.Types.ObjectId;
    projectId?: mongoose.Types.ObjectId;
    type: 'task-analysis' | 'performance-summary' | 'risk-prediction' | 'productivity-insights' | 'team-health' | 'project-forecast';
    content: {
        summary: string;
        insights: {
            title: string;
            description: string;
            confidence: number;
            data?: any;
            recommendations?: string[];
        }[];
    };
    metadata: {
        period: {
            start: Date;
            end: Date;
        };
        dataSource: string[];
        modelVersion: string;
        processingTime: number;
        confidence: number;
    };
    generatedAt: Date;
    expiresAt?: Date;
    status: 'generating' | 'completed' | 'failed' | 'archived';
    errorMessage?: string;
    sharedWith: mongoose.Types.ObjectId[];
    tags: string[];
    priority: 'low' | 'medium' | 'high';
}

const aiReportSchema = new Schema<IAIReport>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    projectId: {
        type: Schema.Types.ObjectId,
        ref: 'Project'
    },
    type: {
        type: String,
        enum: ['task-analysis', 'performance-summary', 'risk-prediction', 'productivity-insights', 'team-health', 'project-forecast'],
        required: true
    },
    content: {
        summary: {
            type: String,
            required: [true, 'Report summary is required'],
            trim: true,
            maxlength: [2000, 'Summary cannot exceed 2000 characters']
        },
        insights: [{
            title: {
                type: String,
                required: true,
                trim: true,
                maxlength: [200, 'Insight title cannot exceed 200 characters']
            },
            description: {
                type: String,
                required: true,
                trim: true,
                maxlength: [1000, 'Insight description cannot exceed 1000 characters']
            },
            confidence: {
                type: Number,
                required: true,
                min: 0,
                max: 1
            },
            data: {
                type: Schema.Types.Mixed
            },
            recommendations: [{
                type: String,
                trim: true,
                maxlength: [500, 'Recommendation cannot exceed 500 characters']
            }]
        }]
    },
    metadata: {
        period: {
            start: {
                type: Date,
                required: true
            },
            end: {
                type: Date,
                required: true
            }
        },
        dataSource: [{
            type: String,
            trim: true,
            maxlength: [50, 'Data source cannot exceed 50 characters']
        }],
        modelVersion: {
            type: String,
            required: true,
            trim: true,
            maxlength: [20, 'Model version cannot exceed 20 characters']
        },
        processingTime: {
            type: Number,
            required: true,
            min: 0
        },
        confidence: {
            type: Number,
            required: true,
            min: 0,
            max: 1
        }
    },
    generatedAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    expiresAt: {
        type: Date
    },
    status: {
        type: String,
        enum: ['generating', 'completed', 'failed', 'archived'],
        default: 'generating'
    },
    errorMessage: {
        type: String,
        trim: true,
        maxlength: [1000, 'Error message cannot exceed 1000 characters']
    },
    sharedWith: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
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
aiReportSchema.index({ userId: 1 });
aiReportSchema.index({ projectId: 1 });
aiReportSchema.index({ type: 1 });
aiReportSchema.index({ status: 1 });
aiReportSchema.index({ generatedAt: -1 });
aiReportSchema.index({ expiresAt: 1 });
aiReportSchema.index({ priority: 1 });

// Compound indexes
aiReportSchema.index({ userId: 1, type: 1, generatedAt: -1 });
aiReportSchema.index({ projectId: 1, type: 1, generatedAt: -1 });

// Virtuals
aiReportSchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true
});

aiReportSchema.virtual('project', {
    ref: 'Project',
    localField: 'projectId',
    foreignField: '_id',
    justOne: true
});

aiReportSchema.virtual('sharedUsers', {
    ref: 'User',
    localField: 'sharedWith',
    foreignField: '_id'
});

aiReportSchema.virtual('isExpired').get(function () {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
});

aiReportSchema.virtual('insightCount').get(function () {
    return this.content.insights.length;
});

aiReportSchema.virtual('highConfidenceInsights').get(function () {
    return this.content.insights.filter(insight => insight.confidence >= 0.8).length;
});

aiReportSchema.virtual('averageConfidence').get(function () {
    if (this.content.insights.length === 0) return 0;
    const totalConfidence = this.content.insights.reduce((sum, insight) => sum + insight.confidence, 0);
    return totalConfidence / this.content.insights.length;
});

// Validation to ensure report belongs to either user or project, not both
aiReportSchema.pre('validate', function (next) {
    if (!this.userId && !this.projectId) {
        throw new Error('AI Report must belong to either a user or project')
    } else if (this.userId && this.projectId) {
        throw new Error('AI Report cannot belong to both user and project')
    }
});

// Pre-save middleware to set expiration date (30 days from generation)
aiReportSchema.pre('save', function (next) {
    if (this.isNew && !this.expiresAt) {
        const expiresAt = new Date(this.generatedAt);
        expiresAt.setDate(expiresAt.getDate() + 30);
        this.expiresAt = expiresAt;
    }
});

// Static methods
aiReportSchema.statics.findActive = function (userId?: mongoose.Types.ObjectId, projectId?: mongoose.Types.ObjectId) {
    const query: any = {
        status: 'completed',
        $or: [
            { expiresAt: { $exists: false } },
            { expiresAt: { $gt: new Date() } }
        ]
    };

    if (userId) query.userId = userId;
    if (projectId) query.projectId = projectId;

    return this.find(query).sort({ generatedAt: -1 });
};

aiReportSchema.statics.cleanupExpired = function () {
    return this.deleteMany({
        expiresAt: { $lt: new Date() }
    });
};

export const AIReport = mongoose.models.AIReport || mongoose.model<IAIReport>('AIReport', aiReportSchema);
