import mongoose, { Schema, Document } from 'mongoose';

export interface IBudget extends Document {
  projectId: mongoose.Types.ObjectId;
  organisationId: mongoose.Types.ObjectId;
  totalBudget: number;
  currency: string;
  allocatedBy: mongoose.Types.ObjectId;
  notes?: string;
}

const budgetSchema = new Schema<IBudget>({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  organisationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  totalBudget: { type: Number, required: true, min: 0 },
  currency: { type: String, required: true, trim: true, default: 'USD' },
  allocatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  notes: { type: String, trim: true, maxlength: 1000 }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

budgetSchema.index({ projectId: 1 });
budgetSchema.index({ organisationId: 1 });

export const Budget = mongoose.models.Budget || mongoose.model<IBudget>('Budget', budgetSchema);

