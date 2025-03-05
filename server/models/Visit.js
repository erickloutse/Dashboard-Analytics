import mongoose from 'mongoose';

const visitSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  page: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 0
  },
  country: {
    type: String,
    default: 'Unknown'
  },
  device: {
    type: String,
    enum: ['desktop', 'mobile', 'tablet'],
    default: 'desktop'
  },
  browser: {
    type: String,
    default: 'Unknown'
  },
  referrer: {
    type: String,
    default: ''
  },
  userAgent: {
    type: String,
    default: ''
  },
  ip: {
    type: String,
    default: ''
  },
  sessionId: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
visitSchema.index({ timestamp: -1 });
visitSchema.index({ page: 1 });
visitSchema.index({ country: 1 });
visitSchema.index({ device: 1 });
visitSchema.index({ sessionId: 1 });

const Visit = mongoose.model('Visit', visitSchema);

export default Visit;