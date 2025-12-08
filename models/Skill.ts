import mongoose, { Schema, Document } from 'mongoose';

export interface ISkill extends Document {
  name: string;
  category: string;
  description: string;
  levels: {
    level: number;
    title: string;
    description: string;
    criteria: string[];
  }[];
  tags: string[];
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
}

const skillSchema = new Schema<ISkill>({
  name: {
    type: String,
    required: [true, 'Skill name is required'],
    trim: true,
    maxlength: [100, 'Skill name cannot exceed 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Skill category is required'],
    trim: true,
    maxlength: [50, 'Category cannot exceed 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Skill description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  levels: [{
    level: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [50, 'Level title cannot exceed 50 characters']
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Level description cannot exceed 500 characters']
    },
    criteria: [{
      type: String,
      trim: true,
      maxlength: [200, 'Criterion cannot exceed 200 characters']
    }]
  }],
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
skillSchema.index({ name: 1 });
skillSchema.index({ category: 1 });
skillSchema.index({ isActive: 1 });
skillSchema.index({ createdBy: 1 });

// Virtuals
skillSchema.virtual('creator', {
  ref: 'User',
  localField: 'createdBy',
  foreignField: '_id',
  justOne: true
});

skillSchema.virtual('assessments', {
  ref: 'SkillAssessment',
  localField: '_id',
  foreignField: 'skillId'
});

// Pre-save middleware to ensure levels are sorted
skillSchema.pre('save', function(next) {
  if (this.isModified('levels')) {
    this.levels.sort((a, b) => a.level - b.level);
  }
  
});

export const Skill = mongoose.model<ISkill>('Skill', skillSchema);
