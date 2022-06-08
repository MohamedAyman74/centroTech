const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const admins = require("../controllers/admins");

router.route("/").get(admins.renderDashboard);

router
  .route("/login")
  .get(admins.renderLogin)
  .post(catchAsync(admins.loginAdmin));

router
  .route("/usersmanagement")
  .get(catchAsync(admins.renderUsersManagement))
  .post(catchAsync(admins.searchUser));

router
  .route("/usersmanagement/:id")
  .delete(catchAsync(admins.deleteUser))
  .put(catchAsync(admins.suspendUser));

router
  .route("/appmanagement")
  .get(catchAsync(admins.renderInstructorsApps))
  .post(catchAsync(admins.addNewInstructor));

router
  .route("/appmanagement/accepted")
  .get(catchAsync(admins.renderAcceptedApplications));

router
  .route("/appmanagement/rejected")
  .get(catchAsync(admins.renderRejectedApplications));

router
  .route("/appmanagement/rejected/:Id")
  .put(catchAsync(admins.rejectApplication));

router
  .route("/appmanagement/delete/:Id")
  .delete(catchAsync(admins.deleteApplication));

module.exports = router;
