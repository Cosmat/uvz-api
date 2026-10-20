const { model, Schema } = require("mongoose");

// Site visit stats: one doc with total + per-day map.
// Incremented by POST /api/stats/visit (beacon from front once per browser session).
const siteStatsSchema = new Schema({
  key: { type: String, default: "visits", unique: true },
  total: { type: Number, default: 0 },
  daily: { type: Map, of: Number, default: {} },
  lastVisit: { type: Date, default: null },
});

siteStatsSchema.statics.addVisit = async function () {
  const day = new Date().toISOString().slice(0, 10);
  return this.findOneAndUpdate(
    { key: "visits" },
    {
      $inc: { total: 1, [`daily.${day}`]: 1 },
      $set: { lastVisit: new Date() },
    },
    { upsert: true, new: true, projection: { total: 1, daily: 1, lastVisit: 1 } }
  );
};

module.exports = model("site_stats", siteStatsSchema);
