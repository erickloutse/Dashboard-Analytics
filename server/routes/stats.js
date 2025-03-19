import express from "express";
import Visit from "../models/Visit.js";
import Page from "../models/Page.js";

const router = express.Router();

// Get overview statistics
router.get("/overview", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Set default date range to last 7 days if not provided
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Query filters
    const dateFilter = {
      timestamp: {
        $gte: start,
        $lte: end,
      },
    };

    // Get total visits
    const totalVisits = await Visit.countDocuments(dateFilter);

    // Get unique visitors (by sessionId)
    const uniqueVisitors = (await Visit.distinct("sessionId", dateFilter))
      .length;

    // Get average session duration
    const visits = await Visit.find(dateFilter);
    const totalDuration = visits.reduce(
      (sum, visit) => sum + (visit.duration || 0),
      0
    );
    const avgSessionDuration =
      totalVisits > 0 ? totalDuration / totalVisits : 0;

    // Calculate bounce rate
    const sessions = new Map();
    visits.forEach((visit) => {
      if (!sessions.has(visit.sessionId)) {
        sessions.set(visit.sessionId, []);
      }
      sessions.get(visit.sessionId).push(visit);
    });

    let bounceCount = 0;
    sessions.forEach((sessionVisits) => {
      if (sessionVisits.length === 1 && sessionVisits[0].duration < 30) {
        bounceCount++;
      }
    });

    const bounceRate =
      sessions.size > 0 ? (bounceCount / sessions.size) * 100 : 0;

    // Get top pages
    const topPages = await Page.find().sort({ views: -1 }).limit(10);

    // Get device breakdown
    const devices = await Visit.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$device",
          count: { $sum: 1 },
        },
      },
    ]);

    const deviceStats = {
      desktop: 0,
      mobile: 0,
      tablet: 0,
    };

    devices.forEach((device) => {
      deviceStats[device._id] = device.count;
    });

    // Get browser breakdown
    const browsers = await Visit.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$browser",
          count: { $sum: 1 },
        },
      },
    ]);

    const browserStats = {
      chrome: 0,
      firefox: 0,
      safari: 0,
      edge: 0,
      other: 0,
    };

    browsers.forEach((browser) => {
      const name = browser._id.toLowerCase();
      if (name.includes("chrome")) {
        browserStats.chrome += browser.count;
      } else if (name.includes("firefox")) {
        browserStats.firefox += browser.count;
      } else if (name.includes("safari")) {
        browserStats.safari += browser.count;
      } else if (name.includes("edge")) {
        browserStats.edge += browser.count;
      } else {
        browserStats.other += browser.count;
      }
    });

    // Get country breakdown
    const countries = await Visit.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$country",
          visitors: { $sum: 1 },
        },
      },
      { $sort: { visitors: -1 } },
      { $limit: 10 },
    ]);

    const geoData = countries.map((country) => ({
      country: country._id || "Unknown",
      visitors: country.visitors,
    }));

    // Get daily visits
    const dailyVisits = await Visit.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            year: { $year: "$timestamp" },
            month: { $month: "$timestamp" },
            day: { $dayOfMonth: "$timestamp" },
          },
          visitors: { $addToSet: "$sessionId" },
          pageviews: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    const formattedDailyVisits = dailyVisits.map((day) => ({
      date: new Date(day._id.year, day._id.month - 1, day._id.day),
      visitors: day.visitors.length,
      pageviews: day.pageviews,
    }));

    // Return all statistics
    res.status(200).json({
      totalVisits,
      uniqueVisitors,
      avgSessionDuration,
      bounceRate,
      topPages,
      devices: deviceStats,
      browsers: browserStats,
      geoData,
      dailyVisits: formattedDailyVisits,
    });
  } catch (error) {
    console.error("Error fetching overview statistics:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get real-time active users (last 5 minutes)
router.get("/active-users", async (req, res) => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const activeUsers = await Visit.distinct("sessionId", {
      timestamp: { $gte: fiveMinutesAgo },
    });

    res.status(200).json({ activeUsers: activeUsers.length });
  } catch (error) {
    console.error("Error fetching active users:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
