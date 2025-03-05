import mongoose from 'mongoose';

const pageSchema = new mongoose.Schema({
  path: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    default: ''
  },
  views: {
    type: Number,
    default: 0
  },
  uniqueVisitors: {
    type: Number,
    default: 0
  },
  avgTimeOnPage: {
    type: Number,
    default: 0
  },
  bounceRate: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
pageSchema.index({ path: 1 }, { unique: true });
pageSchema.index({ views: -1 });

const Page = mongoose.model('Page', pageSchema);

export default Page;