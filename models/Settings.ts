import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  userId?: mongoose.Types.ObjectId;
  teamId?: mongoose.Types.ObjectId;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
    dateFormat: string;
    timeFormat: '12h' | '24h';
    weekStartsOn: 'sunday' | 'monday';
  };
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
    taskAssigned: boolean;
    taskCompleted: boolean;
    projectUpdates: boolean;
    deadlineReminders: boolean;
    performanceReviews: boolean;
    teamUpdates: boolean;
    mentions: boolean;
    weeklyDigest: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'team-only' | 'private';
    showEmail: boolean;
    showDepartment: boolean;
    showJoinedDate: boolean;
    allowDirectMessages: boolean;
  };
  dashboard: {
    layout: 'grid' | 'list' | 'kanban';
    widgets: {
      type: string;
      enabled: boolean;
      position: number;
      size: 'small' | 'medium' | 'large';
    }[];
    defaultView: string;
  };
  productivity: {
    workingHours: {
      start: string;
      end: string;
    };
    breakReminders: boolean;
    breakInterval: number; // minutes
    focusMode: boolean;
    pomodoroSettings: {
      workDuration: number; // minutes
      breakDuration: number; // minutes
      longBreakDuration: number; // minutes
      sessionsUntilLongBreak: number;
    };
  };
  integrations: {
    slack: {
      enabled: boolean;
      webhookUrl?: string;
      channel?: string;
    };
    calendar: {
      enabled: boolean;
      provider: 'google' | 'outlook' | 'apple';
      calendarId?: string;
    };
    email: {
      enabled: boolean;
      provider: string;
      signature?: string;
    };
  };
  accessibility: {
    fontSize: 'small' | 'medium' | 'large' | 'extra-large';
    highContrast: boolean;
    reduceMotion: boolean;
    screenReader: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number; // minutes
    loginNotifications: boolean;
    requirePasswordChange: boolean;
    lastPasswordChange?: Date;
  };
}

const settingsSchema = new Schema<ISettings>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  teamId: {
    type: Schema.Types.ObjectId,
    ref: 'Team'
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    language: {
      type: String,
      default: 'en',
      maxlength: [10, 'Language code cannot exceed 10 characters']
    },
    timezone: {
      type: String,
      default: 'UTC',
      maxlength: [50, 'Timezone cannot exceed 50 characters']
    },
    dateFormat: {
      type: String,
      default: 'MM/DD/YYYY',
      maxlength: [20, 'Date format cannot exceed 20 characters']
    },
    timeFormat: {
      type: String,
      enum: ['12h', '24h'],
      default: '12h'
    },
    weekStartsOn: {
      type: String,
      enum: ['sunday', 'monday'],
      default: 'monday'
    }
  },
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: true
    },
    inApp: {
      type: Boolean,
      default: true
    },
    taskAssigned: {
      type: Boolean,
      default: true
    },
    taskCompleted: {
      type: Boolean,
      default: true
    },
    projectUpdates: {
      type: Boolean,
      default: true
    },
    deadlineReminders: {
      type: Boolean,
      default: true
    },
    performanceReviews: {
      type: Boolean,
      default: true
    },
    teamUpdates: {
      type: Boolean,
      default: true
    },
    mentions: {
      type: Boolean,
      default: true
    },
    weeklyDigest: {
      type: Boolean,
      default: false
    }
  },
  privacy: {
    profileVisibility: {
      type: String,
      enum: ['public', 'team-only', 'private'],
      default: 'team-only'
    },
    showEmail: {
      type: Boolean,
      default: false
    },
    showDepartment: {
      type: Boolean,
      default: true
    },
    showJoinedDate: {
      type: Boolean,
      default: true
    },
    allowDirectMessages: {
      type: Boolean,
      default: true
    }
  },
  dashboard: {
    layout: {
      type: String,
      enum: ['grid', 'list', 'kanban'],
      default: 'grid'
    },
    widgets: [{
      type: {
        type: String,
        required: true,
        trim: true,
        maxlength: [50, 'Widget type cannot exceed 50 characters']
      },
      enabled: {
        type: Boolean,
        default: true
      },
      position: {
        type: Number,
        default: 0
      },
      size: {
        type: String,
        enum: ['small', 'medium', 'large'],
        default: 'medium'
      }
    }],
    defaultView: {
      type: String,
      default: 'overview',
      maxlength: [50, 'Default view cannot exceed 50 characters']
    }
  },
  productivity: {
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
    breakReminders: {
      type: Boolean,
      default: true
    },
    breakInterval: {
      type: Number,
      default: 60,
      min: 15,
      max: 240
    },
    focusMode: {
      type: Boolean,
      default: false
    },
    pomodoroSettings: {
      workDuration: {
        type: Number,
        default: 25,
        min: 5,
        max: 60
      },
      breakDuration: {
        type: Number,
        default: 5,
        min: 1,
        max: 30
      },
      longBreakDuration: {
        type: Number,
        default: 15,
        min: 5,
        max: 60
      },
      sessionsUntilLongBreak: {
        type: Number,
        default: 4,
        min: 2,
        max: 8
      }
    }
  },
  integrations: {
    slack: {
      enabled: {
        type: Boolean,
        default: false
      },
      webhookUrl: {
        type: String,
        trim: true
      },
      channel: {
        type: String,
        trim: true,
        maxlength: [50, 'Slack channel cannot exceed 50 characters']
      }
    },
    calendar: {
      enabled: {
        type: Boolean,
        default: false
      },
      provider: {
        type: String,
        enum: ['google', 'outlook', 'apple'],
        default: 'google'
      },
      calendarId: {
        type: String,
        trim: true
      }
    },
    email: {
      enabled: {
        type: Boolean,
        default: false
      },
      provider: {
        type: String,
        trim: true,
        maxlength: [50, 'Email provider cannot exceed 50 characters']
      },
      signature: {
        type: String,
        trim: true,
        maxlength: [500, 'Email signature cannot exceed 500 characters']
      }
    }
  },
  accessibility: {
    fontSize: {
      type: String,
      enum: ['small', 'medium', 'large', 'extra-large'],
      default: 'medium'
    },
    highContrast: {
      type: Boolean,
      default: false
    },
    reduceMotion: {
      type: Boolean,
      default: false
    },
    screenReader: {
      type: Boolean,
      default: false
    }
  },
  security: {
    twoFactorAuth: {
      type: Boolean,
      default: false
    },
    sessionTimeout: {
      type: Number,
      default: 480, // 8 hours
      min: 15,
      max: 1440 // 24 hours
    },
    loginNotifications: {
      type: Boolean,
      default: true
    },
    requirePasswordChange: {
      type: Boolean,
      default: false
    },
    lastPasswordChange: {
      type: Date
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
settingsSchema.index({ userId: 1 });
settingsSchema.index({ teamId: 1 });

// Virtuals
settingsSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

settingsSchema.virtual('team', {
  ref: 'Team',
  localField: 'teamId',
  foreignField: '_id',
  justOne: true
});

// Validation to ensure settings belong to either user or team, not both
settingsSchema.pre('validate', function(next) {
  if (!this.userId && !this.teamId) {
    next(new Error('Settings must belong to either a user or team'));
  } else if (this.userId && this.teamId) {
    next(new Error('Settings cannot belong to both user and team'));
  } 
});

// Static methods
settingsSchema.statics.findByUser = function(userId: mongoose.Types.ObjectId) {
  return this.findOne({ userId });
};

settingsSchema.statics.findByTeam = function(teamId: mongoose.Types.ObjectId) {
  return this.findOne({ teamId });
};

settingsSchema.statics.createDefaultForUser = function(userId: mongoose.Types.ObjectId) {
  return this.create({ userId });
};

settingsSchema.statics.createDefaultForTeam = function(teamId: mongoose.Types.ObjectId) {
  return this.create({ teamId });
};

export const Settings = mongoose.model<ISettings>('Settings', settingsSchema);
