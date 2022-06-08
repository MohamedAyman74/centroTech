const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
// const courses = require("../controllers/courses");
const courses = require("../controllers/courses");
const { validateCourse } = require("../middleware");

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
  .post(validateCourse, catchAsync(courses.addCourse));

router
  .route("/purchase")
  .get(courses.renderPurchasePage)
  .post(courses.makePurchase);

router.route("/mycourses").get(courses.renderUserCourses);

router.route("/delete/:Id").delete(catchAsync(courses.deleteCourse));

router
  .route("/show/:Id")
  .get(catchAsync(courses.renderCourseOverview))
  .post(catchAsync(courses.addReview));

router
  .route("/show/:Id/reviews/:userId/delete/:reviewId")
  .delete(catchAsync(courses.deleteReview));

router
  .route("/:Id")
  .get(catchAsync(courses.renderCoursePage))
  .put(upload.array("videos"), catchAsync(courses.updateCourse));

router.route("/wishlist/:Id").put(catchAsync(courses.addToWishlist));
router.route("/cart/:Id").post(catchAsync(courses.addToCart));

router.route("/:Id/add").post(courses.addQuestion);
router.route("/:Id/delete").post(courses.dismissQuiz);
router.route("/:Id/submit").post(catchAsync(courses.addQuiz));

module.exports = router;
