const express = require("express");
const router = express.Router();
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");
const admins = require("../controllers/admins");

const { isLoggedIn, isAdmin } = require("../middleware");

router.route("/").get(isAdmin, admins.renderDashboard);

router
  .route("/login")
  .get(admins.renderLogin)
  .post(
    passport.authenticate("admin-local", {
      failureFlash: true,
      failureRedirect: "/admins/login",
    }),
    catchAsync(admins.loginAdmin)
  );

router
  .route("/usersmanagement")
  .get(isLoggedIn, isAdmin, catchAsync(admins.renderUsersManagement))
  .post(isLoggedIn, isAdmin, catchAsync(admins.searchUser));

router
  .route("/usersmanagement/:id")
  .delete(isLoggedIn, isAdmin, catchAsync(admins.deleteUser))
  .put(isLoggedIn, isAdmin, catchAsync(admins.suspendUser));

router
  .route("/appmanagement")
  .get(isLoggedIn, isAdmin, catchAsync(admins.renderInstructorsApps))
  .post(isLoggedIn, isAdmin, catchAsync(admins.searchPendingApps));

router
  .route("/appmanagement/accept")
  .post(isLoggedIn, isAdmin, catchAsync(admins.addNewInstructor));

router
  .route("/appmanagement/accepted")
  .get(isLoggedIn, isAdmin, catchAsync(admins.renderAcceptedApplications))
  .post(isAdmin, catchAsync(admins.searchAcceptedApps));

router
  .route("/appmanagement/rejected")
  .get(isLoggedIn, isAdmin, catchAsync(admins.renderRejectedApplications))
  .post(isLoggedIn, isAdmin, catchAsync(admins.searchRejectedApps));

router
  .route("/appmanagement/reject/:Id")
  .put(isLoggedIn, isAdmin, catchAsync(admins.rejectApplication));

router
  .route("/appmanagement/delete/:Id")
  .delete(isLoggedIn, isAdmin, catchAsync(admins.deleteApplication));

router
  .route("/users-transactions")
  .get(catchAsync(admins.usersTransactionsRender));

router
  .route("/users-transactions/refund/:Id")
  .put(catchAsync(admins.refundCourse));

module.exports = router;
