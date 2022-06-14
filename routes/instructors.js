const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const instructors = require("../controllers/instructors");

router
  .route("/apply")
  .get(instructors.renderApplicationForm)
  .post(catchAsync(instructors.sendApplication));

router
  .route("/login")
  .get(instructors.renderLogin)
  .post(catchAsync(instructors.login));

router
  .route("/profile/:Id")
  .get(catchAsync(instructors.renderInstructorProfile));

module.exports = router;
