const express = require("express");
const router = express.Router();
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");
const users = require("../controllers/users");
const { isLoggedIn, isAuthorized } = require("../middleware");

const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

router
  .route("/register")
  .get(users.renderRegister)
  .post(catchAsync(users.register));

router
  .route("/login")
  .get(users.renderLogin)
  .post(
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    users.login
  );

router.post("/logout", users.logout);

router.get("/forgot", users.forgotRender).post("/forgot", users.forgotPassword);

router
  .route("/password-reset/:userId/:tokenId")
  .get(users.resetRender)
  .post(users.resetPassword);

router
  .route("/profile/:id")
  .get(isLoggedIn, isAuthorized, users.profileRender)
  .put(isLoggedIn, isAuthorized, upload.single("image"), users.updateProfile);

router.route("/wishlist").get(catchAsync(users.renderWishlist));

router.route("/wishlist/delete/:Id").delete(catchAsync(users.deleteWishlist));

router.route("/cart").get(catchAsync(users.renderCart));
router.route("/cart/delete/:Id").post(users.removeCart);

router
  .route("/questions")
  .get(catchAsync(users.renderQuestions))
  .post(catchAsync(users.addNewQuestion));

router
  .route("/questions/:Id")
  .get(catchAsync(users.renderAnswers))
  .post(catchAsync(users.addAnswer));

module.exports = router;
