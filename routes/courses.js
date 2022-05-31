const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
// const courses = require("../controllers/courses");
const courses = require("../controllers/courses");

const multer = require("multer");
const { videoStorage } = require("../cloudinary");
const upload = multer({ storage: videoStorage });

router
  .route("/")
  .get(catchAsync(courses.index))
  .post(catchAsync(courses.searchCourse));
router.route("/search").post(catchAsync(courses.homePageSearch));

router
  .route("/new")
  .get(catchAsync(courses.renderNewCourseForm))
  .post(catchAsync(courses.addCourse));

router.route("/delete/:Id").delete(catchAsync(courses.deleteCourse));

router
  .route("/show/:Id")
  .get(catchAsync(courses.renderCourseOverview))
  .post(catchAsync(courses.addReview));

router
  .route("/:Id")
  .get(catchAsync(courses.renderCoursePage))
  .put(upload.array("videos"), catchAsync(courses.updateCourse));

router.route("/wishlist/:Id").put(catchAsync(courses.addToWishlist));
router.route("/cart/:Id").post(catchAsync(courses.addToCart));

module.exports = router;
