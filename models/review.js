const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const WebsiteReview = new Schema({
  review: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  reviewedByOAuth: {
    type: Schema.Types.ObjectId,
    ref: "OAuth",
  },
  reviewedByInstructor: {
    type: Schema.Types.ObjectId,
    ref: "Instructor",
  },
});

module.exports = mongoose.model("WebsiteReview", WebsiteReview);
