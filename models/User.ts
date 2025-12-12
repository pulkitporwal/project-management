import mongoose, { Schema, Document } from 'mongoose';

export interface IOrganizationAssociation {
  organisationId: mongoose.Types.ObjectId;
  role: 'admin' | 'manager' | 'employee';
  joinedAt: Date;
  isActive: boolean;
  permissions?: string[];
  banned?: boolean;
  bannedAt?: Date;
  bannedBy?: mongoose.Types.ObjectId;
  banReason?: string;
  banExpiresAt?: Date;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string; // Changed from passwordHash to password
  role: 'admin' | 'manager' | 'employee';
  teamId?: mongoose.Types.ObjectId;
  jobTitle?: string; // Made optional
  department?: string; // Made optional
  skills: string[]; // Changed to string array
  performanceScore?: number; // Made optional
  profileImage?: string;
  joinedAt: Date;
  lastActive?: Date;
  permissions?: string[]; // Made optional
  notificationsEnabled?: boolean; // Made optional
  isActive: boolean;
  phone?: string; // Added
  location?: string; // Added
  status?: 'active' | 'pending'; // Added
  associatedWith: IOrganizationAssociation[];
  currentOrganization?: mongoose.Types.ObjectId;
  emailVerified?: boolean;
  emailVerification?: {
    otpHash?: string;
    expiresAt?: Date;
    attempts?: number;
    lastSentAt?: Date;
  };
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'employee'],
    default: 'employee',
    required: true
  },
  teamId: {
    type: Schema.Types.ObjectId,
    ref: 'Team'
  },
  jobTitle: {
    type: String,
    trim: true,
    maxlength: [100, 'Job title cannot exceed 100 characters']
  },
  department: {
    type: String,
    trim: true,
    maxlength: [50, 'Department cannot exceed 50 characters']
  },
  skills: [{
    type: String
  }],
  performanceScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  profileImage: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'pending'],
    default: 'active'
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerification: {
    otpHash: { type: String },
    expiresAt: { type: Date },
    attempts: { type: Number, default: 0 },
    lastSentAt: { type: Date }
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  permissions: [{
    type: String,
    trim: true
  }],
  notificationsEnabled: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  associatedWith: [{
    organisationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'manager', 'employee'],
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    },
    permissions: [{
      type: String,
      trim: true
    }],
    banned: {
      type: Boolean,
      default: false
    },
    bannedAt: {
      type: Date
    },
    bannedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    banReason: {
      type: String,
      trim: true,
      maxlength: [500, 'Ban reason cannot exceed 500 characters']
    },
    banExpiresAt: {
      type: Date
    }
  }],
  currentOrganization: {
    type: Schema.Types.ObjectId,
    ref: 'Organization'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
userSchema.index({ teamId: 1 });
userSchema.index({ role: 1 });
userSchema.index({ department: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ lastActive: -1 });
userSchema.index({ 'associatedWith.organisationId': 1 });
userSchema.index({ 'associatedWith.role': 1 });
userSchema.index({ currentOrganization: 1 });

// Virtuals
userSchema.virtual('fullName').get(function () {
  return this.name;
});

userSchema.virtual('isManager').get(function () {
  return this.role === 'manager' || this.role === 'admin';
});

userSchema.virtual('organizations', {
  ref: 'Organization',
  localField: 'associatedWith.organisationId',
  foreignField: '_id'
});

userSchema.virtual('activeOrganizations', {
  ref: 'Organization',
  localField: 'associatedWith.organisationId',
  foreignField: '_id',
  match: { isActive: true }
});

userSchema.virtual('currentOrganizationDetails', {
  ref: 'Organization',
  localField: 'currentOrganization',
  foreignField: '_id',
  justOne: true
});

userSchema.virtual('roleInCurrentOrganization').get(function () {
  if (!this.currentOrganization) return null;
  const association = this.associatedWith.find(
    assoc => assoc.organisationId.toString() === this.currentOrganization?.toString() && assoc.isActive
  );
  return association ? association.role : null;
});

userSchema.virtual('hasOrganization').get(function () {
  return this.associatedWith && this.associatedWith.length > 0;
});

// Instance methods for ban functionality
userSchema.methods.banFromOrganization = function (
  organisationId: mongoose.Types.ObjectId,
  bannedBy: mongoose.Types.ObjectId,
  reason: string,
  expiresAt?: Date
) {
  const association = this.associatedWith.find(
    (assoc: any) => assoc.organisationId.toString() === organisationId.toString()
  );

  if (!association) {
    throw new Error('User is not a member of this organization');
  }

  association.banned = true;
  association.bannedAt = new Date();
  association.bannedBy = bannedBy;
  association.banReason = reason;
  association.banExpiresAt = expiresAt;
  association.isActive = false;

  return this.save();
};

userSchema.methods.unbanFromOrganization = function (organisationId: mongoose.Types.ObjectId) {
  const association = this.associatedWith.find(
    (assoc: any) => assoc.organisationId.toString() === organisationId.toString()
  );

  if (!association) {
    throw new Error('User is not a member of this organization');
  }

  association.banned = false;
  association.bannedAt = undefined;
  association.bannedBy = undefined;
  association.banReason = undefined;
  association.banExpiresAt = undefined;
  association.isActive = true;

  return this.save();
};

userSchema.methods.isBannedFromOrganization = function (organisationId: mongoose.Types.ObjectId) {
  const association = this.associatedWith.find(
    (assoc: any) => assoc.organisationId.toString() === organisationId.toString()
  );

  if (!association || !association.banned) {
    return false;
  }

  // Check if ban has expired
  if (association.banExpiresAt && new Date() > association.banExpiresAt) {
    // Auto-unban if expired
    association.banned = false;
    association.bannedAt = undefined;
    association.bannedBy = undefined;
    association.banReason = undefined;
    association.banExpiresAt = undefined;
    association.isActive = true;
    this.save();
    return false;
  }

  return true;
};

// Static method to get banned users in an organization
userSchema.statics.getBannedUsers = function (organisationId: mongoose.Types.ObjectId) {
  return this.find({
    'associatedWith.organisationId': organisationId,
    'associatedWith.banned': true
  }).populate('associatedWith.bannedBy', 'name email');
};

// Pre-save middleware
userSchema.pre('save', function (next) {
  this.lastActive = new Date();

});

export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
