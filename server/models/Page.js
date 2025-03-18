import mongoose from "mongoose";

const pageSchema = new mongoose.Schema(
  {
    path: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      default: "",
    },
    views: {
      type: Number,
      default: 0,
      index: true,
    },
    uniqueVisitors: {
      type: Number,
      default: 0,
    },
    avgTimeOnPage: {
      type: Number,
      default: 0,
    },
    bounceRate: {
      type: Number,
      default: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Méthodes statiques
pageSchema.statics.updateStats = async function (pageData) {
  const { path, sessionId, duration } = pageData;

  const page = await this.findOne({ path });

  if (!page) {
    return this.create({
      path,
      views: 1,
      uniqueVisitors: 1,
      avgTimeOnPage: duration,
      lastUpdated: new Date(),
    });
  }

  // Vérifier si c'est un visiteur unique
  const isNewVisitor =
    (await mongoose.model("Visit").countDocuments({
      page: path,
      sessionId,
      createdAt: { $lt: new Date() },
    })) === 0;

  // Mettre à jour les statistiques
  const updates = {
    $inc: {
      views: 1,
      uniqueVisitors: isNewVisitor ? 1 : 0,
    },
    $set: {
      avgTimeOnPage:
        (page.avgTimeOnPage * page.views + duration) / (page.views + 1),
      lastUpdated: new Date(),
    },
  };

  return this.findOneAndUpdate({ path }, updates, { new: true });
};

const Page = mongoose.model("Page", pageSchema);

export default Page;
