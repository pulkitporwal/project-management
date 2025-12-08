import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'manager' | 'employee';
  teamId?: mongoose.Types.ObjectId;
  jobTitle: string;
  department: string;
  skills: mongoose.Types.ObjectId[];
  performanceScore: number;
  profileImage?: string;
  joinedAt: Date;
  lastActive: Date;
  permissions: string[];
  notificationsEnabled: boolean;
  isActive: boolean;
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
  passwordHash: {
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
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [100, 'Job title cannot exceed 100 characters']
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true,
    maxlength: [50, 'Department cannot exceed 50 characters']
  },
  skills: [{
    type: Schema.Types.ObjectId,
    ref: 'Skill'
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

// Virtuals
userSchema.virtual('fullName').get(function() {
  return this.name;
});

userSchema.virtual('isManager').get(function() {
  return this.role === 'manager' || this.role === 'admin';
});

// Pre-save middleware
userSchema.pre('save', function(next) {
  this.lastActive = new Date();
  
});

export const User = mongoose.model<IUser>('User', userSchema);
