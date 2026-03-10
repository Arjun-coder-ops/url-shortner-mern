const mongoose = require('mongoose');

// Each click stores timestamp + optional metadata
const clickSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  referrer: { type: String, default: '' },
  userAgent: { type: String, default: '' },
  ip: { type: String, default: '' },
});

const urlSchema = new mongoose.Schema(
  {
    originalUrl: {
      type: String,
      required: [true, 'Original URL is required'],
      trim: true,
    },
    shortCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: [3, 'Short code must be at least 3 characters'],
      maxlength: [20, 'Short code cannot exceed 20 characters'],
    },
    shortUrl: {
      type: String,
      required: true,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    // Stores per-click metadata for analytics
    clickHistory: [clickSchema],
    // Link owner
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Optional: link expires at this date
    expiresAt: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // User-supplied title for the link
    title: {
      type: String,
      default: '',
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
  },
  { timestamps: true }
);

// Index for fast lookups by user and date (shortCode index is auto-created via unique: true)
urlSchema.index({ createdBy: 1, createdAt: -1 });

// Virtual: check if link is expired
urlSchema.virtual('isExpired').get(function () {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
});

urlSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Url', urlSchema);
