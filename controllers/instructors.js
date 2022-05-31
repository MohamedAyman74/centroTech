const InstructorApp = require("../models/instructorApp");
const Instructor = require("../models/instructor");
const cloudinary = require("cloudinary").v2;
const bcrypt = require("bcrypt");

module.exports.renderApplicationForm = (req, res) => {
  res.render("instructors/instructorApp");
};

module.exports.sendApplication = async (req, res) => {
  try {
    const { email } = req.body;
    const doesExist = await Instructor.findOne({ email });
    console.log(doesExist);
    if (doesExist) {
      req.flash("error", "The email already exists as an instructor");
      res.redirect("/instructor/apply");
    } else {
      const application = new InstructorApp(req.body);
      await application.save();
      // cloudinary.uploader.upload(file, options, callback);
      req.flash("success", "Successfully submitted your application.");
      res.redirect("/");
    }
  } catch (e) {
    console.log(e);
    req.flash("error", "Failed to submit your application.");
    res.redirect("/instructor/apply");
  }
};

module.exports.renderLogin = (req, res) => {
  res.render("instructors/login");
};

module.exports.login = async (req, res) => {
  const { email, password } = req.body;
  const instructor = await Instructor.findOne({ email });
  const validPassword = await bcrypt.compare(password, instructor.password);
  if (!validPassword) {
    req.flash("error", "Wrong username or password");
    res.redirect("/instructor/login");
  } else {
    req.session.instructor_id = instructor._id;
    req.session.isInstructor = true;
    req.flash("success", "Welcome back!");
    const redirectUrl = req.session.returnTo || "/";
    delete req.session.returnTo;
    res.redirect(redirectUrl);
  }
};
