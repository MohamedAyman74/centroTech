const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const VerificationToken = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "user",
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400000,
  },
});

module.exports = mongoose.model("VerificationToken", VerificationToken);
