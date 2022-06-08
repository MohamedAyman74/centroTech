const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const courseReview = require("./courseReview");
// const passportLocalMongoose = require("passport-local-mongoose");
// const bcrypt = require("bcrypt");

const ImageSchema = new Schema({
  url: String,
  filename: String,
});

const OAuthSchema = new Schema({
  authId: {
    type: String,
    required: true,
  },
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
});

// UserSchema.pre("save", async function () {
//   const salt = await bcrypt.genSalt(12);
//   this.password = await bcrypt.hash(this.password, salt);
// });

OAuthSchema.post("findOneAndDelete", async (doc) => {
  if (doc) {
    await courseReview.deleteMany({
      _id: {
        $in: doc.courseReviews,
      },
    });
  }
});

module.exports = mongoose.model("OAuth", OAuthSchema);
