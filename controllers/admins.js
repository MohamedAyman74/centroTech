const User = require("../models/user");
const oAuthUser = require("../models/oAuthUser");
const InstructorApp = require("../models/instructorApp");
const Instructor = require("../models/instructor");
const { sendEmail } = require("../utils/sendMail");
const bcrypt = require("bcrypt");
const instructorApp = require("../models/instructorApp");
const Admin = require("../models/admin");

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
  req.flash("success", "The account has been successfully suspended");
  if (req.xhr) {
    res.json(user);
  } else {
    res.redirect("/admins/usersmanagement");
  }
};

module.exports.searchUser = async (req, res) => {
  const { searched } = req.body;
  // await User.find;
  const user = await User.find({
    $or: [
      { email: { $regex: searched } },
      { fullname: { $regex: searched } },
      { phone: { $regex: searched } },
      { parentPhone: { $regex: searched } },
    ],
  });
  const authUser = await oAuthUser.find({
    $or: [
      { email: { $regex: searched } },
      { fullname: { $regex: searched } },
      { phone: { $regex: searched } },
      { parentPhone: { $regex: searched } },
    ],
  });
  // console.log("auth user", authUser);
  const searchedUsers = user.concat(authUser);
  // if (user.length <= 0) {
  //   user = await User.find({ fullname: { $regex: searched } });
  // }
  // if (user.length <= 0) {
  //   user = await oAuthUser.find({ fullname: { $regex: searched } });
  // }
  // console.log(searchedUsers);
  // res.redirect("/admins/usersmanagement");
  res.json(searchedUsers);
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
  const instApp = await InstructorApp.findById(Id);
  instApp.status = "Rejected";
  await instApp.save();
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
  res.render("admins/login");
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
};
