const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require("./user");
const courseReview = require("./courseReview");
const oAuthUser = require("./oAuthUser");
const Quiz = require("./quiz");

const ImageSchema = new Schema({
  url: String,
  filename: String,
});

const VideoSchema = new Schema({
  url: String,
  filename: String,
});

const CourseSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  image: ImageSchema,
  videos: [VideoSchema],
  price: {
    type: Number,
    required: true,
  },
  instructor: {
    type: Schema.Types.ObjectId,
    ref: "Instructor",
  },
  enrolled: {
    type: Number,
    default: 0,
  },
  reviews: [{ type: Schema.Types.ObjectId, ref: "CourseReview" }],
  about: {
    type: String,
    required: false,
  },
  //   reviews: [
  //     {
  //       type: Schema.Types.ObjectId,
  //       ref: "Review",
  //     },
  //   ],
});

CourseSchema.post("findOneAndDelete", async (doc) => {
  if (doc) {
    await courseReview.deleteMany({
      course: doc._id,
    });
    await User.updateMany(
      {},
      {
        $pull: { courses: doc._id },
      }
    );
    await oAuthUser.updateMany(
      {},
      {
        $pull: { courses: doc._id },
      }
    );
    await Quiz.deleteMany({
      course: doc._id,
    });
  }
});

module.exports = mongoose.model("Course", CourseSchema);
