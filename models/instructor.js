const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Course = require("./course");
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

const InstructorSchema = new Schema({
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
  specialization: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  isInstructor: {
    type: Boolean,
    default: true,
  },
  about: {
    type: String,
  },
  ownedCourses: [
    {
      type: Schema.Types.ObjectId,
      ref: "Course",
    },
  ],
  image: ImageSchema,
});

// UserSchema.pre("save", async function () {
//   const salt = await bcrypt.genSalt(12);
//   this.password = await bcrypt.hash(this.password, salt);
// });

InstructorSchema.post("findOneAndDelete", async (doc) => {
  if (doc) {
    await Course.deleteMany({
      _id: {
        $in: doc.ownedCourses,
      },
    });
  }
});

module.exports = mongoose.model("Instructor", InstructorSchema);
