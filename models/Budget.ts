import mongoose, { Schema, Document } from 'mongoose';

export interface IBudget extends Document {
  projectId: mongoose.Types.ObjectId;
  organisationId: mongoose.Types.ObjectId;
  totalBudget: number;
  currency: string;
  allocatedBy: mongoose.Types.ObjectId;
  notes?: string;
  categories: {
    name: string;
    allocatedAmount: number;
    spentAmount: number;
    description?: string;
  }[];
  period: {
    startDate: Date;
    endDate: Date;
    type: 'monthly' | 'quarterly' | 'yearly' | 'project';
  };
  alertThresholds: {
    warningAt: number; // percentage
    criticalAt: number; // percentage
  };
  status: 'active' | 'completed' | 'suspended';
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
}

const budgetSchema = new Schema<IBudget>({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  organisationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  totalBudget: { type: Number, required: true, min: 0 },
  currency: { type: String, required: true, trim: true, default: 'USD' },
  allocatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  notes: { type: String, trim: true, maxlength: 1000 },
  categories: [{
    name: { type: String, required: true, trim: true, maxlength: 50 },
    allocatedAmount: { type: Number, required: true, min: 0 },
    spentAmount: { type: Number, default: 0, min: 0 },
    description: { type: String, trim: true, maxlength: 200 }
  }],
  period: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    type: { type: String, enum: ['monthly', 'quarterly', 'yearly', 'project'], default: 'project' }
  },
  alertThresholds: {
    warningAt: { type: Number, default: 80, min: 1, max: 100 },
    criticalAt: { type: Number, default: 95, min: 1, max: 100 }
  },
  status: { type: String, enum: ['active', 'completed', 'suspended'], default: 'active' },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

budgetSchema.index({ projectId: 1 });
budgetSchema.index({ organisationId: 1 });
budgetSchema.index({ status: 1 });
budgetSchema.index({ 'period.startDate': 1 });
budgetSchema.index({ 'period.endDate': 1 });

// Virtuals
budgetSchema.virtual('totalSpent', {
  ref: 'BudgetTransaction',
  localField: '_id',
  foreignField: 'budgetId',
  match: { status: 'approved' },
  select: 'amount'
});

budgetSchema.virtual('totalSpentAmount').get(function() {
  return (this as any).categories.reduce((total, category) => total + category.spentAmount, 0);
});

budgetSchema.virtual('remainingBudget').get(function() {
  return (this as any).totalBudget - (this as any).totalSpentAmount;
});

budgetSchema.virtual('utilizationPercentage').get(function() {
  if ((this as any).totalBudget === 0) return 0;
  return ((this as any).totalSpentAmount / (this as any).totalBudget) * 100;
});

budgetSchema.virtual('isOverBudget').get(function() {
  return (this as any).totalSpentAmount > (this as any).totalBudget;
});

budgetSchema.virtual('alertLevel').get(function() {
  const utilization = (this as any).utilizationPercentage;
  if (utilization >= (this as any).alertThresholds.criticalAt) return 'critical';
  if (utilization >= (this as any).alertThresholds.warningAt) return 'warning';
  return 'normal';
});

budgetSchema.virtual('isExpired').get(function() {
  return new Date() > (this as any).period.endDate;
});

// Pre-save middleware
budgetSchema.pre('save', function(next) {
  // Ensure categories don't exceed total budget
  const totalAllocated = (this as any).categories.reduce((sum, cat) => sum + cat.allocatedAmount, 0);
  if (totalAllocated > (this as any).totalBudget) {
    throw (new Error('Total allocated to categories cannot exceed total budget'));
  }
  
  // Ensure end date is after start date
  if ((this as any).period.endDate <= (this as any).period.startDate) {
    throw (new Error('End date must be after start date'));
  }
  
});

export const Budget = mongoose.models.Budget || mongoose.model<IBudget>('Budget', budgetSchema);

