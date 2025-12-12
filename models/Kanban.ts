import mongoose, { Schema, Document } from 'mongoose';

export interface IKanban extends Document {
  projectId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  columns: IKanbanColumn[];
  createdBy: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  isDefault: boolean;
  archived: boolean;
}

export interface IKanbanColumn {
  id: string;
  title: string;
  order: number;
  color?: string;
  cards: IKanbanCard[];
  limit?: number;
}

export interface IKanbanCard {
  id: string;
  title: string;
  description?: string;
  assignedTo?: mongoose.Types.ObjectId;
  priority: 'low' | 'medium' | 'high' | 'critical';
  labels: string[];
  dueDate?: Date;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: mongoose.Types.ObjectId;
  attachments: mongoose.Types.ObjectId[];
  comments: mongoose.Types.ObjectId[];
  taskId?: mongoose.Types.ObjectId;
}

const kanbanCardSchema = new Schema<IKanbanCard>({
  title: {
    type: String,
    required: [true, 'Card title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  labels: [{
    type: String,
    trim: true,
    maxlength: [30, 'Label cannot exceed 30 characters']
  }],
  dueDate: {
    type: Date
  },
  order: {
    type: Number,
    required: true,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attachments: [{
    type: Schema.Types.ObjectId,
    ref: 'Attachment'
  }],
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  taskId: {
    type: Schema.Types.ObjectId,
    ref: 'Task'
  }
}, {
  timestamps: true,
  _id: true
});

const kanbanColumnSchema = new Schema<IKanbanColumn>({
  title: {
    type: String,
    required: [true, 'Column title is required'],
    trim: true,
    maxlength: [50, 'Title cannot exceed 50 characters']
  },
  order: {
    type: Number,
    required: true
  },
  color: {
    type: String,
    default: '#6366f1'
  },
  cards: [kanbanCardSchema],
  limit: {
    type: Number,
    min: 1,
    default: null
  }
}, {
  _id: true
});

const kanbanSchema = new Schema<IKanban>({
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Kanban title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  columns: [kanbanColumnSchema],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  isDefault: {
    type: Boolean,
    default: false
  },
  archived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
kanbanSchema.index({ projectId: 1 });
kanbanSchema.index({ createdBy: 1 });
kanbanSchema.index({ archived: 1 });

// Virtuals
kanbanSchema.virtual('cardCount', {
  get: function() {
    return this.columns.reduce((total: number, column: IKanbanColumn) => total + column.cards.length, 0);
  }
});

kanbanSchema.virtual('memberCount', {
  get: function() {
    return this.members.length;
  }
});

// Pre-save middleware to update card timestamps
kanbanSchema.pre('save', function() {
  if (this.isModified('columns')) {
    this.columns.forEach((column: IKanbanColumn) => {
      column.cards.forEach((card: IKanbanCard) => {
        card.updatedAt = new Date();
      });
    });
  }
});

export const Kanban = mongoose.models.Kanban || mongoose.model<IKanban>('Kanban', kanbanSchema);
