import mongoose, { Schema, Document } from 'mongoose';

export interface IAttachment extends Document {
    fileName: string;
    originalName: string;
    url: string;
    type: string;
    mimeType: string;
    size: number;
    uploadedBy: mongoose.Types.ObjectId;
    taskId?: mongoose.Types.ObjectId;
    projectId?: mongoose.Types.ObjectId;
    commentId?: mongoose.Types.ObjectId;
    description?: string;
    tags: string[];
    isPublic: boolean;
    downloadCount: number;
    lastDownloadedAt?: Date;
    expiresAt?: Date;
}

const attachmentSchema = new Schema<IAttachment>({
    fileName: {
        type: String,
        required: [true, 'File name is required'],
        trim: true,
        maxlength: [255, 'File name cannot exceed 255 characters']
    },
    originalName: {
        type: String,
        required: [true, 'Original file name is required'],
        trim: true,
        maxlength: [255, 'Original file name cannot exceed 255 characters']
    },
    url: {
        type: String,
        required: [true, 'File URL is required'],
        trim: true
    },
    type: {
        type: String,
        required: [true, 'File type is required'],
        enum: ['image', 'document', 'video', 'audio', 'archive', 'other']
    },
    mimeType: {
        type: String,
        required: [true, 'MIME type is required'],
        trim: true
    },
    size: {
        type: Number,
        required: [true, 'File size is required'],
        min: [0, 'File size cannot be negative'],
        max: [100 * 1024 * 1024, 'File size cannot exceed 100MB'] // 100MB limit
    },
    uploadedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
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
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    tags: [{
        type: String,
        trim: true,
        maxlength: [30, 'Tag cannot exceed 30 characters']
    }],
    isPublic: {
        type: Boolean,
        default: false
    },
    downloadCount: {
        type: Number,
        min: 0,
        default: 0
    },
    lastDownloadedAt: {
        type: Date
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
attachmentSchema.index({ uploadedBy: 1 });
attachmentSchema.index({ taskId: 1 });
attachmentSchema.index({ projectId: 1 });
attachmentSchema.index({ commentId: 1 });
attachmentSchema.index({ type: 1 });
attachmentSchema.index({ createdAt: -1 });
attachmentSchema.index({ expiresAt: 1 });

// Virtuals
attachmentSchema.virtual('uploader', {
    ref: 'User',
    localField: 'uploadedBy',
    foreignField: '_id',
    justOne: true
});

attachmentSchema.virtual('isExpired').get(function () {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
});

attachmentSchema.virtual('formattedSize').get(function () {
    const bytes = this.size;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
});

attachmentSchema.virtual('fileExtension').get(function () {
    const parts = this.fileName.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
});

// Validation to ensure attachment belongs to exactly one entity
attachmentSchema.pre('validate', function (next) {
    const entityCount = [this.taskId, this.projectId, this.commentId].filter(Boolean).length;
    if (entityCount !== 1) {
        throw new Error('Attachment must belong to exactly one entity (task, project, or comment)')
    }
});

// Static method to increment download count
attachmentSchema.statics.incrementDownload = function (attachmentId: mongoose.Types.ObjectId) {
    return this.findByIdAndUpdate(attachmentId, {
        $inc: { downloadCount: 1 },
        lastDownloadedAt: new Date()
    });
};

// Static method to clean up expired files
attachmentSchema.statics.cleanupExpired = function () {
    return this.deleteMany({
        expiresAt: { $lt: new Date() }
    });
};

export const Attachment = mongoose.models.Attachment || mongoose.model<IAttachment>('Attachment', attachmentSchema);
