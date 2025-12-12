import mongoose, { Schema, Document } from 'mongoose';

export interface IOrganization extends Document {
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  industry?: string;
  size: '1-10' | '11-50' | '51-200' | '201-500' | '500+' | '1000+' | '5000+';
  location: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    timezone: string;
  };
  contact: {
    email: string;
    phone?: string;
    supportEmail?: string;
  };
  settings: {
    allowUserRegistration: boolean;
    requireEmailVerification: boolean;
    defaultUserRole: 'admin' | 'manager' | 'employee';
    workingDays: number[];
    workingHours: {
      start: string;
      end: string;
    };
    dateFormat: string;
    timeFormat: '12h' | '24h';
    currency: string;
    language: string;
  };
  subscription: {
    plan: 'free' | 'starter' | 'professional' | 'enterprise';
    status: 'active' | 'cancelled' | 'suspended' | 'trial';
    trialEndsAt?: Date;
    maxUsers: number;
    features: string[];
  };
  billing?: {
    billingEmail: string;
    billingAddress?: string;
    taxId?: string;
    paymentMethod?: string;
  };
  createdBy: mongoose.Types.ObjectId;
  isActive: boolean;
  isVerified: boolean;
  verifiedAt?: Date;
}

const organizationSchema = new Schema<IOrganization>({
  name: {
    type: String,
    required: [true, 'Organization name is required'],
    trim: true,
    maxlength: [200, 'Organization name cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  logo: {
    type: String,
    default: null
  },
  website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please enter a valid website URL']
  },
  industry: {
    type: String,
    trim: true,
    maxlength: [50, 'Industry cannot exceed 50 characters']
  },
  size: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '500+', '1000+', '5000+'],
    default: '1-10'
  },
  location: {
    address: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true
    },
    timezone: {
      type: String,
      default: 'UTC',
      required: true
    }
  },
  contact: {
    email: {
      type: String,
      required: [true, 'Contact email is required'],
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
      type: String,
      trim: true
    },
    supportEmail: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid support email']
    }
  },
  settings: {
    allowUserRegistration: {
      type: Boolean,
      default: false
    },
    requireEmailVerification: {
      type: Boolean,
      default: true
    },
    defaultUserRole: {
      type: String,
      enum: ['admin', 'manager', 'employee'],
      default: 'employee'
    },
    workingDays: [{
      type: Number,
      min: 0,
      max: 6
    }],
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
    dateFormat: {
      type: String,
      default: 'MM/DD/YYYY'
    },
    timeFormat: {
      type: String,
      enum: ['12h', '24h'],
      default: '12h'
    },
    currency: {
      type: String,
      default: 'USD'
    },
    language: {
      type: String,
      default: 'en'
    }
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'starter', 'professional', 'enterprise'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'suspended', 'trial'],
      default: 'active'
    },
    trialEndsAt: {
      type: Date
    },
    maxUsers: {
      type: Number,
      default: 5,
      min: 1
    },
    features: [{
      type: String,
      trim: true
    }]
  },
  billing: {
    billingEmail: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid billing email']
    },
    billingAddress: {
      type: String,
      trim: true
    },
    taxId: {
      type: String,
      trim: true
    },
    paymentMethod: {
      type: String,
      trim: true
    }
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
organizationSchema.index({ name: 1 });
organizationSchema.index({ createdBy: 1 });
organizationSchema.index({ 'contact.email': 1 });
organizationSchema.index({ isActive: 1 });
organizationSchema.index({ 'subscription.plan': 1 });
organizationSchema.index({ 'subscription.status': 1 });

// Virtuals
organizationSchema.virtual('userCount', {
  ref: 'User',
  localField: '_id',
  foreignField: 'associatedWith.organisationId',
  count: true
});

organizationSchema.virtual('activeUserCount', {
  ref: 'User',
  localField: '_id',
  foreignField: 'associatedWith.organisationId',
  count: true,
  match: { isActive: true }
});

organizationSchema.virtual('projectCount', {
  ref: 'Project',
  localField: '_id',
  foreignField: 'organisationId',
  count: true
});

organizationSchema.virtual('teamCount', {
  ref: 'Team',
  localField: '_id',
  foreignField: 'organisationId',
  count: true
});

organizationSchema.virtual('isTrialActive').get(function() {
  return this.subscription.status === 'trial' && 
         this.subscription.trialEndsAt && 
         this.subscription.trialEndsAt > new Date();
});

// organizationSchema.virtual('isUserLimitReached').get(function() {
//   return this?.userCount  >= this?.subscription?.maxUsers;
// });

// Pre-save middleware
organizationSchema.pre('save', function(next) {
  // Set default working days if not provided
  if (!this.settings.workingDays || this.settings.workingDays.length === 0) {
    this.settings.workingDays = [1, 2, 3, 4, 5]; // Monday to Friday
  }
  
  // Set default features based on plan
  if (this.isNew && !this.subscription.features || this.subscription.features.length === 0) {
    switch (this.subscription.plan) {
      case 'free':
        this.subscription.features = ['basic_project_management', 'basic_team_management'];
        this.subscription.maxUsers = 5;
        break;
      case 'starter':
        this.subscription.features = ['basic_project_management', 'basic_team_management', 'time_tracking', 'reports'];
        this.subscription.maxUsers = 25;
        break;
      case 'professional':
        this.subscription.features = ['basic_project_management', 'basic_team_management', 'time_tracking', 'reports', 'advanced_analytics', 'custom_fields', 'integrations'];
        this.subscription.maxUsers = 100;
        break;
      case 'enterprise':
        this.subscription.features = ['basic_project_management', 'basic_team_management', 'time_tracking', 'reports', 'advanced_analytics', 'custom_fields', 'integrations', 'api_access', 'custom_workflows', 'priority_support'];
        this.subscription.maxUsers = -1; // Unlimited
        break;
    }
  }
});

// Pre-remove middleware to clean up references
organizationSchema.pre('deleteOne', { document: true, query: false }, async function() {
  // Remove organization reference from all users
  await mongoose.model('User').updateMany(
    { 'associatedWith.organisationId': this._id },
    { $pull: { associatedWith: { organisationId: this._id } } }
  );
  
  // Mark all related data as archived or delete them
  await mongoose.model('Project').updateMany(
    { organisationId: this._id },
    { archived: true }
  );
  
  await mongoose.model('Team').updateMany(
    { organisationId: this._id },
    { archived: true }
  );
});

export const Organization = mongoose.models.Organization || mongoose.model<IOrganization>('Organization', organizationSchema);
