const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const InstructorAppSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  fullname: {
    type: String,
    required: true,
    unique: false,
  },
  phone: {
    type: String,
    required: true,
  },
  specialization: {
    type: String,
    required: true,
  },
  appReason: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: "Pending",
  },
});

module.exports = mongoose.model("instructorApp", InstructorAppSchema);
