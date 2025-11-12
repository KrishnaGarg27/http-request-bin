const mongoose = require("mongoose");

const binSchema = new mongoose.Schema({
  binId: { type: String, unique: true, required: true },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
  },
});

binSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Bin = mongoose.model("Bin", binSchema);

module.exports = Bin;
