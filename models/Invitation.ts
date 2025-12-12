import mongoose, { Schema, Document } from 'mongoose'

export interface IInvitation extends Document {
  token: string
  email: string
  name: string
  role: 'admin' | 'manager' | 'employee'
  department?: string
  inviterId: mongoose.Types.ObjectId
  inviterName: string
  inviterEmail: string
  organisationId: mongoose.Types.ObjectId
  status: 'pending' | 'accepted' | 'expired' | 'revoked'
  isNewUser: boolean
  customMessage?: string
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
  acceptedAt?: Date
}

const InvitationSchema: Schema = new Schema({
  token: {
    type: String,
    required: true,
    unique: true,
    index: true,
    default: () => generateUniqueToken()
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'manager', 'employee'],
    default: 'employee'
  },
  department: {
    type: String,
    trim: true,
    maxlength: [50, 'Department cannot exceed 50 characters']
  },
  inviterId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  inviterName: {
    type: String,
    required: true,
    trim: true
  },
  inviterEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  organisationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'accepted', 'expired', 'revoked'],
    default: 'pending'
  },
  isNewUser: {
    type: Boolean,
    required: true,
    default: true
  },
  customMessage: {
    type: String,
    trim: true,
    maxlength: [500, 'Custom message cannot exceed 500 characters']
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  },
  acceptedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Compound indexes for better query performance
InvitationSchema.index({ email: 1, organisationId: 1, status: 1 })
InvitationSchema.index({ status: 1, expiresAt: 1 })
InvitationSchema.index({ token: 1, status: 1 })
InvitationSchema.index({ organisationId: 1, status: 1 })

// Virtuals
InvitationSchema.virtual('isExpired').get(function() {
  return new Date() > (this.expiresAt as Date)
})

InvitationSchema.virtual('isValid').get(function() {
  return this.status === 'pending' && !this.isExpired
})

// Static methods
InvitationSchema.statics.findValidInvitation = function(token: string, email?: string) {
  const query: any = { token, status: 'pending', expiresAt: { $gt: new Date() } }
  if (email) {
    query.email = email.toLowerCase()
  }
  return this.findOne(query).populate('inviterId', 'name email').populate('organisationId', 'name')
}

InvitationSchema.statics.createInvitation = async function(invitationData: Partial<IInvitation>) {
  // Check for existing pending invitation
  const existingInvitation = await this.findOne({
    email: invitationData.email?.toLowerCase(),
    organisationId: invitationData.organisationId,
    status: 'pending',
    expiresAt: { $gt: new Date() }
  })

  if (existingInvitation) {
    throw new Error('A pending invitation already exists for this email in this organization')
  }

  return this.create(invitationData)
}

// Instance methods
InvitationSchema.methods.accept = async function() {
  this.status = 'accepted'
  this.acceptedAt = new Date()
  return this.save()
}

InvitationSchema.methods.expire = async function() {
  this.status = 'expired'
  return this.save()
}

InvitationSchema.methods.revoke = async function() {
  this.status = 'revoked'
  return this.save()
}

// Helper function to generate unique token
function generateUniqueToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

export const Invitation = mongoose.models.Invitation || mongoose.model<IInvitation>('Invitation', InvitationSchema)
