const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
// const courses = require("../controllers/courses");
const courses = require("../controllers/courses");
const { isLoggedIn, isAdmin, validateCourse } = require("../middleware");

const multer = require("multer");
const { videoStorage } = require("../cloudinary");
const upload = multer({ storage: videoStorage });

router
  .route("/")
  .get(isLoggedIn, catchAsync(courses.index))
  .post(isLoggedIn, catchAsync(courses.searchCourse));

router.route("/search").post(isLoggedIn, catchAsync(courses.homePageSearch));

router
  .route("/new")
  .get(isLoggedIn, isAdmin, catchAsync(courses.renderNewCourseForm))
  .post(isLoggedIn, isAdmin, validateCourse, catchAsync(courses.addCourse));

router
  .route("/purchase")
  .get(isLoggedIn, courses.renderPurchasePage)
  .post(isLoggedIn, courses.makePurchase);

router.route("/mycourses").get(isLoggedIn, courses.renderUserCourses);

router
  .route("/delete/:Id")
  .delete(isLoggedIn, catchAsync(courses.deleteCourse));

router
  .route("/show/:Id")
  .get(isLoggedIn, catchAsync(courses.renderCourseOverview))
  .post(isLoggedIn, catchAsync(courses.addReview));

router
  .route("/show/:Id/reviews/:userId/delete/:reviewId")
  .delete(catchAsync(isLoggedIn, courses.deleteReview));

router
  .route("/:Id")
  .get(isLoggedIn, catchAsync(courses.renderCoursePage))
  .put(isLoggedIn, upload.array("videos"), catchAsync(courses.updateCourse));

router
  .route("/wishlist/:Id")
  .put(isLoggedIn, catchAsync(courses.addToWishlist));
router.route("/cart/:Id").post(isLoggedIn, catchAsync(courses.addToCart));

router.route("/:Id/add").post(isLoggedIn, courses.addQuestion);
router.route("/:Id/delete").post(isLoggedIn, courses.dismissQuiz);
router.route("/:Id/submit").post(isLoggedIn, catchAsync(courses.addQuiz));

module.exports = router;
