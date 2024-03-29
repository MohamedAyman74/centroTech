const User = require("../models/user");
const oAuthUser = require("../models/oAuthUser");
const InstructorApp = require("../models/instructorApp");
const Instructor = require("../models/instructor");
const { sendEmail } = require("../utils/sendMail");
const bcrypt = require("bcrypt");
const instructorApp = require("../models/instructorApp");
const Admin = require("../models/admin");
const Course = require("../models/course");
const Transactions = require("../models/purchase");

module.exports.renderUsersManagement = async (req, res) => {
  const users = await User.find({});
  const authUsers = await oAuthUser.find({});
  res.render("admins/accmanagement", { users, authUsers });
};

module.exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  console.log(id);
  let user = await User.findByIdAndDelete(id);
  if (!user) {
    user = await oAuthUser.findByIdAndDelete(id);
  }
  req.flash("success", "The account has been successfully delete");
  res.json(user);
};

module.exports.suspendUser = async (req, res) => {
  const { id } = req.params;
  const { suspendReason } = req.body;
  let user = await User.findById(id);
  if (!user) {
    user = await oAuthUser.findById(id);
  }
  !user.isSuspended
    ? (user.suspendReason = suspendReason)
    : (user.suspendReason = "");
  user.isSuspended = !user.isSuspended;
  await user.save();
  req.flash(
    "success",
    "The account has been successfully suspended/unsuspended"
  );
  if (req.xhr) {
    res.json(user);
  } else {
    res.redirect("/admins/usersmanagement");
  }
};

module.exports.searchUser = async (req, res) => {
  const { searched } = req.body;
  const user = await User.find({
    $or: [
      { email: { $regex: searched, $options: "i" } },
      { fullname: { $regex: searched, $options: "i" } },
      { phone: { $regex: searched, $options: "i" } },
      { parentPhone: { $regex: searched, $options: "i" } },
    ],
  });
  const authUser = await oAuthUser.find({
    $or: [
      { email: { $regex: searched, $options: "i" } },
      { fullname: { $regex: searched, $options: "i" } },
      { phone: { $regex: searched, $options: "i" } },
      { parentPhone: { $regex: searched, $options: "i" } },
    ],
  });
  const searchedUsers = user.concat(authUser);
  res.json(searchedUsers);
};

module.exports.searchAcceptedApps = async (req, res) => {
  const { searched } = req.body;
  const acceptedApps = await InstructorApp.find({
    $and: [
      { status: "Accepted" },
      {
        $or: [
          { email: { $regex: searched, $options: "i" } },
          { fullname: { $regex: searched, $options: "i" } },
        ],
      },
    ],
  });
  res.json(acceptedApps);
};

module.exports.searchPendingApps = async (req, res) => {
  const { searched } = req.body;
  const acceptedApps = await InstructorApp.find({
    $and: [
      { status: "Pending" },
      {
        $or: [
          { email: { $regex: searched, $options: "i" } },
          { fullname: { $regex: searched, $options: "i" } },
        ],
      },
    ],
  });
  res.json(acceptedApps);
};

module.exports.searchRejectedApps = async (req, res) => {
  const { searched } = req.body;
  const acceptedApps = await InstructorApp.find({
    $and: [
      { status: "Rejected" },
      {
        $or: [
          { email: { $regex: searched, $options: "i" } },
          { fullname: { $regex: searched, $options: "i" } },
        ],
      },
    ],
  });
  res.json(acceptedApps);
};

module.exports.renderInstructorsApps = async (req, res) => {
  const apps = await InstructorApp.find({ status: "Pending" });
  res.render("admins/appmanagement", { apps });
};

module.exports.addNewInstructor = async (req, res) => {
  try {
    const { email, password, id, fullname, phone, specialization } = req.body;
    const instApp = await InstructorApp.findById(id);
    const isInstructor = await Instructor.findOne({ email });
    if (!isInstructor) {
      let isRegistered = await User.findOne({ email });
      if (isRegistered) {
        req.flash("error", "The email has been registered before as a user.");
        res.redirect("/admins/appmanagement");
      } else {
        isRegistered = await oAuthUser.findOne({ email });
        if (isRegistered) {
          req.flash("error", "The email has been registered before as a user.");
          res.redirect("/admins/appmanagement");
        } else {
          console.log(req.body);
          // const instructor = new Instructor(req.body);
          const hashed = await bcrypt.hash(password, 10);
          const instructor = new Instructor({
            email,
            fullname,
            fullname,
            phone,
            specialization,
            password: hashed,
            image: {
              url: "https://res.cloudinary.com/dd36t4xod/image/upload/v1656095424/CentroTech/users/blankProfile_mvm787.png",
              filename: "blankProfile",
            },
          });
          instApp.status = "Accepted";
          await instApp.save();
          await instructor.save();
          await sendEmail(
            email,
            "Your instructor account login information",
            `Your login email is: ${email} <br> Your login password is: ${password}`
          );
          req.flash("success", "The account has been successfully created");
          res.redirect("/admins/appmanagement/accepted");
        }
      }
    } else {
      req.flash("error", "The instructor account already exists");
      res.redirect("/admins/appmanagement");
    }
  } catch (e) {
    console.log(e);
  }
};

module.exports.rejectApplication = async (req, res) => {
  const { Id } = req.params;
  const { email, rejectReason } = req.body;
  const instApp = await InstructorApp.findById(Id);
  instApp.status = "Rejected";
  await instApp.save();
  await sendEmail(
    email,
    "Your instructor application status",
    `Your instructor application has been rejected because of: <br> ${rejectReason}`
  );
  res.redirect("/admins/appmanagement/rejected");
};

module.exports.deleteApplication = async (req, res) => {
  const { Id } = req.params;
  await instructorApp.findByIdAndDelete(Id);
  res.redirect("/admins/appmanagement");
};

module.exports.renderAcceptedApplications = async (req, res) => {
  const acceptedApps = await InstructorApp.find({ status: "Accepted" });
  res.render("admins/acceptedapps", { acceptedApps });
};
module.exports.renderRejectedApplications = async (req, res) => {
  const rejectedApps = await InstructorApp.find({ status: "Rejected" });
  res.render("admins/rejectedapps", { rejectedApps });
};

module.exports.renderDashboard = (req, res) => {
  res.render("admins");
};

module.exports.renderLogin = (req, res) => {
  if (res.locals.currentUser) {
    req.flash(
      "error",
      "You cannot access this page, you are already logged in."
    );
    res.redirect("/");
  } else {
    res.render("admins/login");
  }
};

module.exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email });
  if (admin) {
    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      req.flash("error", "Wrong username or password");
      res.redirect("/admins/login");
    } else {
      req.session.admin_id = admin._id;
      req.session.isAdmin = true;
      req.flash("success", "Welcome back!");
      const redirectUrl = req.session.returnTo || "/admins";
      delete req.session.returnTo;
      res.redirect(redirectUrl);
    }
  } else {
    req.flash("error", "Wrong username or password");
    res.redirect("/admins/login");
  }
  // const hashed = await bcrypt.hash(password, 10);
  // const admin = new Admin({
  //   email,
  //   fullname: "CentroTech",
  //   password: hashed,
  // });
  // await admin.save();
  // console.log("done");
};

module.exports.usersTransactionsRender = async (req, res) => {
  let totalProfit = 0;
  const transactions = await Transactions.find({})
    .populate("purchasedBy")
    .populate("purchasedByOAuth")
    .populate("purchasedCourse");

  transactions.forEach((transaction) => {
    totalProfit += transaction.amount;
  });
  if (transactions) {
    res.render("admins/transactions", { transactions, totalProfit });
  }
};

module.exports.refundCourse = async (req, res) => {
  const { Id } = req.params;
  const transaction = await Transactions.findById(Id);
  const course = await Course.findById(transaction.purchasedCourse);
  course.enrolled -= 1;
  let user = await User.findById(transaction.purchasedBy);
  if (!user) {
    user = await oAuthUser.findById(transaction.purchasedByOAuth);
  }
  if (user) {
    const idx = user.courses.indexOf(transaction.purchasedCourse);
    user.courses.splice(idx, 1);
    await user.save();
    await transaction.delete();
    await course.save();
    req.flash(
      "success",
      "Successfully removed course from user and refund notice sent"
    );
    res.redirect("/admins/users-transactions");
  } else {
    req.flash("error", "User not found or unauthorized.");
    res.redirect("/admins/users-transactions");
  }
};
