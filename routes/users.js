const express = require("express");
const router = express.Router();
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");
const users = require("../controllers/users");
const { isLoggedIn, isAdmin, isAuthorized } = require("../middleware");

const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

router
  .route("/")
  .get(catchAsync(users.renderHomePage))
  .post(catchAsync(users.websiteReview));

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

router
  .route("/verify/:userId/:verifyToken")
  .get(catchAsync(users.verifyAccount));

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

router.route("/wishlist").get(isLoggedIn, catchAsync(users.renderWishlist));

router
  .route("/wishlist/delete/:Id")
  .delete(isLoggedIn, catchAsync(users.deleteWishlist));

router.route("/cart").get(isLoggedIn, catchAsync(users.renderCart));
router.route("/cart/delete/:Id").post(isLoggedIn, users.removeCart);

router
  .route("/questions")
  .get(isLoggedIn, catchAsync(users.renderQuestions))
  .post(isLoggedIn, catchAsync(users.addNewQuestion));

router
  .route("/support-tickets")
  .get(isLoggedIn, catchAsync(users.renderSupportTickets))
  .post(isLoggedIn, catchAsync(users.sendSupportTicket));

router
  .route("/support-tickets/:Id")
  .get(isLoggedIn, catchAsync(users.renderSupportTicket))
  .post(isLoggedIn, catchAsync(users.sendTicketReply));

router
  .route("/questions/:Id")
  .get(isLoggedIn, catchAsync(users.renderAnswers))
  .post(isLoggedIn, catchAsync(users.addAnswer));

router
  .route("/questions/:Id/lock")
  .post(isLoggedIn, isAdmin, catchAsync(users.lockQuestion));

router
  .route("/questions/:Id/delete")
  .delete(isLoggedIn, isAdmin, catchAsync(users.deleteQuestion));

router
  .route("/questions/:Id/:replyId/:userId/delete")
  .delete(isLoggedIn, catchAsync(users.deleteReply));

router.route("/quizzes").get(isLoggedIn, catchAsync(users.renderQuizzes));

router
  .route("/quizzes/solved")
  .get(isLoggedIn, catchAsync(users.renderSolvedQuizzes));
router
  .route("/quizzes/solved/:Id")
  .get(isLoggedIn, catchAsync(users.renderQuizAnswers));

router
  .route("/quiz/:Id")
  .get(isLoggedIn, catchAsync(users.renderQuizPage))
  .post(isLoggedIn, catchAsync(users.takeQuiz));
module.exports = router;
