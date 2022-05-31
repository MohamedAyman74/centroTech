const mongoose = require("mongoose");
const Schema = mongoose.Schema;
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
});

// UserSchema.pre("save", async function () {
//   const salt = await bcrypt.genSalt(12);
//   this.password = await bcrypt.hash(this.password, salt);
// });

module.exports = mongoose.model("OAuth", OAuthSchema);
