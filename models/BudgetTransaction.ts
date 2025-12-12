import mongoose, { Schema, Document } from 'mongoose';

export interface IBudgetTransaction extends Document {
  projectId: mongoose.Types.ObjectId;
  organisationId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  type: 'expense' | 'income';
  category?: string;
  description?: string;
  vendor?: string;
  invoiceNumber?: string;
  date: Date;
  createdBy: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected';
  attachments: mongoose.Types.ObjectId[];
}

const budgetTransactionSchema = new Schema<IBudgetTransaction>({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  organisationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, required: true, trim: true, default: 'USD' },
  type: { type: String, enum: ['expense', 'income'], required: true },
  category: { type: String, trim: true, maxlength: 50 },
  description: { type: String, trim: true, maxlength: 500 },
  vendor: { type: String, trim: true, maxlength: 100 },
  invoiceNumber: { type: String, trim: true, maxlength: 50 },
  date: { type: Date, required: true, default: Date.now },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  attachments: [{ type: Schema.Types.ObjectId, ref: 'Attachment' }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

budgetTransactionSchema.index({ projectId: 1 });
budgetTransactionSchema.index({ organisationId: 1 });
budgetTransactionSchema.index({ type: 1 });
budgetTransactionSchema.index({ status: 1 });
budgetTransactionSchema.index({ date: -1 });

export const BudgetTransaction = mongoose.models.BudgetTransaction || mongoose.model<IBudgetTransaction>('BudgetTransaction', budgetTransactionSchema);

