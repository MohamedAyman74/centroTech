const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
// const courses = require("../controllers/courses");
const courses = require("../controllers/courses");
const { isLoggedIn, isAdmin, validateCourse } = require("../middleware");

const multer = require("multer");
const { videoStorage, courseImageStorage } = require("../cloudinary");
const upload = multer({ storage: videoStorage });
const uploadImage = multer({ storage: courseImageStorage });

router
  .route("/")
  .get(catchAsync(courses.index))
  .post(catchAsync(courses.searchCourse));

router.route("/search").post(catchAsync(courses.homePageSearch));

router
  .route("/new")
  .get(isLoggedIn, isAdmin, catchAsync(courses.renderNewCourseForm))
  .post(isLoggedIn, isAdmin, validateCourse, catchAsync(courses.addCourse));

  router.route("/new/search").post(catchAsync(courses.searchCourse));

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
  .delete(isLoggedIn, catchAsync(courses.deleteReview));

router
  .route("/:Id/edit")
  .put(isLoggedIn, uploadImage.single("image"), catchAsync(courses.editCourse));

router
  .route("/:Id")
  .get(isLoggedIn, catchAsync(courses.renderCoursePage))
  .put(isLoggedIn, upload.array("videos"), catchAsync(courses.updateCourse));

router
  .route("/:Id/video/:videoNum/delete")
  .put(isLoggedIn, catchAsync(courses.deleteLecture));

router
  .route("/wishlist/:Id")
  .put(isLoggedIn, catchAsync(courses.addToWishlist));
router.route("/cart/:Id").post(isLoggedIn, catchAsync(courses.addToCart));

router.route("/:Id/add").post(isLoggedIn, courses.addQuestion);
router.route("/:Id/delete").post(isLoggedIn, courses.dismissQuiz);
router.route("/:Id/submit").post(isLoggedIn, catchAsync(courses.addQuiz));

module.exports = router;
