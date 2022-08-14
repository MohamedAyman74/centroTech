const express = require("express");
const router = express.Router();
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");
const instructors = require("../controllers/instructors");

const { isLoggedIn } = require("../middleware");

router
  .route("/apply")
  .get(instructors.renderApplicationForm)
  .post(catchAsync(instructors.sendApplication));

router
  .route("/login")
  .get(instructors.renderLogin)
  .post(
    passport.authenticate("instructor-local", {
      failureFlash: true,
      failureRedirect: "/instructor/login",
    }),
    catchAsync(instructors.login)
  );

router
  .route("/profile/:Id")
  .get(isLoggedIn, catchAsync(instructors.renderInstructorProfile));

module.exports = router;
