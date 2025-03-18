import mongoose from "mongoose";

const visitSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    page: {
      type: String,
      required: true,
      index: true,
    },
    duration: {
      type: Number,
      default: 0,
    },
    country: {
      type: String,
      default: "Unknown",
      index: true,
    },
    device: {
      type: String,
      enum: ["desktop", "mobile", "tablet"],
      default: "desktop",
      index: true,
    },
    browser: {
      type: String,
      default: "Unknown",
      index: true,
    },
    referrer: {
      type: String,
      default: "",
    },
    userAgent: {
      type: String,
      default: "",
    },
    ip: {
      type: String,
      default: "",
    },
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index composé pour les requêtes courantes
visitSchema.index({ timestamp: -1, page: 1 });
visitSchema.index({ sessionId: 1, page: 1 });

const Visit = mongoose.model("Visit", visitSchema);

export default Visit;
