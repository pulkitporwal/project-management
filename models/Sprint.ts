import mongoose, { Schema, Document } from 'mongoose';

export interface ISprint extends Document {
  projectId: mongoose.Types.ObjectId;
  organisationId: mongoose.Types.ObjectId;
  name: string;
  goal?: string;
  startDate: Date;
  endDate: Date;
  state: 'planned' | 'active' | 'completed' | 'cancelled';
  capacityPoints?: number;
  committedPoints?: number;
  completedPoints?: number;
}

const sprintSchema = new Schema<ISprint>({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  organisationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  goal: { type: String, trim: true, maxlength: 500 },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  state: { type: String, enum: ['planned', 'active', 'completed', 'cancelled'], default: 'planned' },
  capacityPoints: { type: Number, min: 0, default: 0 },
  committedPoints: { type: Number, min: 0, default: 0 },
  completedPoints: { type: Number, min: 0, default: 0 }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

sprintSchema.index({ projectId: 1 });
sprintSchema.index({ organisationId: 1 });
sprintSchema.index({ state: 1 });
sprintSchema.index({ startDate: 1 });
sprintSchema.index({ endDate: 1 });

export const Sprint = mongoose.models.Sprint || mongoose.model<ISprint>('Sprint', sprintSchema);

