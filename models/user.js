const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const courseReview = require("./courseReview");
// const passportLocalMongoose = require("passport-local-mongoose");
// const bcrypt = require("bcrypt");

const ImageSchema = new Schema({
  url: {
    type: String,
    default:
      "https://res.cloudinary.com/dd36t4xod/image/upload/v1656095424/CentroTech/users/blankProfile_mvm787.png",
  },
  filename: { type: String, default: "blankProfile" },
});
ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  fullname: {
    type: String,
    required: true,
    unique: false,
  },
  password: {
    type: String,
    required: true,
  },
  isSuspended: {
    type: Boolean,
    default: false,
  },
  suspendReason: {
    type: String,
  },
  phone: {
    type: String,
  },
  parentPhone: {
    type: String,
  },
  provider: {
    type: String,
    default: "local",
  },
  image: ImageSchema,
  favorites: [
    {
      type: Schema.Types.ObjectId,
      ref: "Course",
    },
  ],
  quizzes: [
    {
      type: Schema.Types.ObjectId,
      ref: "Quiz",
    },
  ],
  courses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
  courseReviews: [{ type: Schema.Types.ObjectId, ref: "CourseReview" }],
  isActivated: {
    type: Boolean,
    default: false,
  },
});

UserSchema.post("findOneAndDelete", async (doc) => {
  if (doc) {
    await courseReview.deleteMany({
      _id: {
        $in: doc.courseReviews,
      },
    });
  }
});

module.exports = mongoose.model("User", UserSchema);
