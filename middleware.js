module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
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
