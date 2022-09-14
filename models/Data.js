const mongoose = require("mongoose");

const DataSchema = new mongoose.Schema({
  authorId: { type: String, required: true },
  owner: { type: String, required: true },
  repository: { type: String, required: true },
  slug: { type: String, required: true},
  content: { type: Object, required: true, select: false }
});

module.exports = mongoose.model("Data", DataSchema);