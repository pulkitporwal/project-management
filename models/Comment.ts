import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
  taskId?: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  content: string;
  attachments: mongoose.Types.ObjectId[];
  mentions: mongoose.Types.ObjectId[];
  edited: boolean;
  editedAt?: Date;
  parentCommentId?: mongoose.Types.ObjectId;
  reactions: {
    emoji: string;
    userId: mongoose.Types.ObjectId;
  }[];
  resolved: boolean;
  resolvedBy?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
}

const commentSchema = new Schema<IComment>({
  taskId: {
    type: Schema.Types.ObjectId,
    ref: 'Task'
  },
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project'
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    maxlength: [2000, 'Comment cannot exceed 2000 characters']
  },
  attachments: [{
    type: Schema.Types.ObjectId,
    ref: 'Attachment'
  }],
  mentions: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  edited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  parentCommentId: {
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  },
  reactions: [{
    emoji: {
      type: String,
      required: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }],
  resolved: {
    type: Boolean,
    default: false
  },
  resolvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
commentSchema.index({ taskId: 1 });
commentSchema.index({ projectId: 1 });
commentSchema.index({ userId: 1 });
commentSchema.index({ parentCommentId: 1 });
commentSchema.index({ createdAt: -1 });

// Virtuals
commentSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

commentSchema.virtual('replies', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentCommentId'
});

commentSchema.virtual('parentComment', {
  ref: 'Comment',
  localField: 'parentCommentId',
  foreignField: '_id',
  justOne: true
});

// Validation to ensure comment belongs to either task or project
commentSchema.pre('validate', function(next) {
  if (!this.taskId && !this.projectId) {
    throw new Error('Comment must belong to either a task or project')
  } else if (this.taskId && this.projectId) {
    throw new Error('Comment cannot belong to both task and project')
  } 
});

// Pre-save middleware for editing tracking
commentSchema.pre('save', function(next) {
  if (this.isModified('content') && !this.isNew) {
    this.edited = true;
    this.editedAt = new Date();
  }
  
});

export const Comment = mongoose.models.Comment || mongoose.model<IComment>('Comment', commentSchema);
