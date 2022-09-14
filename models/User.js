const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  token: { type: String, required: true }
}, { timestamps: { updatedAt: true } });
UserSchema.virtual('data', {
  ref: 'Data',
  localField: '_id',
  foreignField: 'ownerId'
});


module.exports = mongoose.model("User", UserSchema);
