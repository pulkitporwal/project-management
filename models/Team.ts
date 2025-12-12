import mongoose, { Schema, Document } from 'mongoose';

export interface ITeam extends Document {
  name: string;
  description?: string;
  members: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
  organisationId: mongoose.Types.ObjectId;
  settings: {
    allowSelfAssign: boolean;
    requireApprovalForTasks: boolean;
    workingHours: {
      start: string;
      end: string;
    };
    timezone: string;
  };
  departments: string[];
  archived: boolean;
}

const teamSchema = new Schema<ITeam>({
  name: {
    type: String,
    required: [true, 'Team name is required'],
    trim: true,
    maxlength: [100, 'Team name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organisationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  settings: {
    allowSelfAssign: {
      type: Boolean,
      default: true
    },
    requireApprovalForTasks: {
      type: Boolean,
      default: false
    },
    workingHours: {
      start: {
        type: String,
        default: '09:00'
      },
      end: {
        type: String,
        default: '17:00'
      }
    },
    timezone: {
      type: String,
      default: 'UTC'
    }
  },
  departments: [{
    type: String,
    trim: true,
    maxlength: [50, 'Department name cannot exceed 50 characters']
  }],
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
teamSchema.index({ name: 1 });
teamSchema.index({ createdBy: 1 });
teamSchema.index({ organisationId: 1 });
teamSchema.index({ departments: 1 });
teamSchema.index({ archived: 1 });

// Virtuals
teamSchema.virtual('memberCount', {
  ref: 'User',
  localField: 'members',
  foreignField: '_id',
  count: true
});

teamSchema.virtual('activeProjects', {
  ref: 'Project',
  localField: '_id',
  foreignField: 'assignedTeams',
  count: true,
  match: { status: 'active', archived: false }
});

// Pre-remove middleware to clean up references
teamSchema.pre('deleteOne', { document: true, query: false }, async function() {
  // Remove team reference from users
  await mongoose.model('User').updateMany(
    { teamId: this._id },
    { $unset: { teamId: 1 } }
  );
});

export const Team = mongoose.models.Team || mongoose.model<ITeam>('Team', teamSchema);
