const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const blockedIPSchema = new Schema({
  ip: {
    type: String,
    required: true,
    unique: true
  },
  reason: {
    type: String,
    required: true,
    enum: ['rate_limit', 'suspicious_activity', 'manual_block', 'ddos_attack']
  },
  blockedBy: {
    type: String,
    required: true,
    enum: ['system', 'admin']
  },
  adminId: {
    type: Schema.Types.ObjectId,
    ref: 'Admin',
    required: function() {
      return this.blockedBy === 'admin';
    }
  },
  blockedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: null // null means permanent block
  },
  isActive: {
    type: Boolean,
    default: true
  },
  hitCount: {
    type: Number,
    default: 0
  },
  lastHitAt: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

// Add indexes for better performance
blockedIPSchema.index({ ip: 1 });
blockedIPSchema.index({ isActive: 1, expiresAt: 1 });
blockedIPSchema.index({ blockedAt: -1 });

// Method to check if IP is currently blocked
blockedIPSchema.methods.isCurrentlyBlocked = function() {
  if (!this.isActive) return false;
  if (!this.expiresAt) return true; // Permanent block
  return new Date() < this.expiresAt;
};

// Static method to find active blocked IP
blockedIPSchema.statics.findActiveBlock = function(ip) {
  return this.findOne({
    ip: ip,
    isActive: true,
    $or: [
      { expiresAt: null }, // Permanent block
      { expiresAt: { $gt: new Date() } } // Not expired
    ]
  });
};

module.exports = mongoose.model('BlockedIP', blockedIPSchema, 'blocked_ips'); 