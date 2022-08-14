const ExpressError = require("./utils/ExpressError");
const { courseSchema } = require("./schemas");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    // console.log("NOT AUTH");
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You must be signed in first.");
    return res.redirect("/login");
  }
  next();
};

module.exports.isAuthorized = (req, res, next) => {
  const { id } = req.params;
  const user = req.user._id.valueOf();
  if (user !== id) {
    req.flash("error", "You are not authorized to access this page.");
    return res.redirect("/");
  }
  next();
};

module.exports.isAdmin = (req, res, next) => {
  if (!req.session.admin_id) {
    req.flash("error", "You are not authorized to access this page.");
    return res.redirect("/");
  }
  next();
};

module.exports.validateCourse = (req, res, next) => {
  const { error } = courseSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(", ");
    // console.log(msg);
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};
