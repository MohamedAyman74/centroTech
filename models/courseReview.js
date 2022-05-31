const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CourseReviewSchema = new Schema({
  review: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    // required: true,
  },
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  reviewedByOAuth: {
    type: Schema.Types.ObjectId,
    ref: "OAuth",
  },
  date: {
    type: String,
    required: true,
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: "Course",
  },
});

module.exports = mongoose.model("CourseReview", CourseReviewSchema);
