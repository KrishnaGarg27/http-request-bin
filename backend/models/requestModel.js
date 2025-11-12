const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
  binDocumentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bin",
    required: true,
  },
  method: { type: String, required: true },
  header: { type: Object, required: true },
  query: { type: Object },
  body: { type: Object },
  ip: { type: String },
  createdAt: { type: Date, default: Date.now },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
  },
});

// Setting expiry on requests
requestSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Request = mongoose.model("Requests", requestSchema);

module.exports = Request;
