const Course = require("../models/course");
const User = require("../models/user");
const OAuthUser = require("../models/oAuthUser");
const Instructor = require("../models/instructor");
const CourseReview = require("../models/courseReview");

module.exports.index = async (req, res) => {
  if (req.session.courses) {
    const courses = req.session.courses;
    delete req.session.courses;
    res.render("courses/index", { courses });
  } else {
    const courses = await Course.find({}).populate({
      path: "instructor",
      model: "Instructor",
      select: "fullname",
    });
    res.render("courses/index", { courses });
  }
};

module.exports.renderNewCourseForm = async (req, res) => {
  const courses = await Course.find({}); //instructor: "62659507fc327af0b5bbe0cf"
  res.render("courses/new", { courses });
};

module.exports.addCourse = async (req, res) => {
  // console.log(req.body.course);
  const course = new Course(req.body.course);
  const { email } = req.body.course;
  const instructor = await Instructor.findOne({ email });
  if (!instructor) {
    req.flash("error", "No instructor with the submitted email.");
    res.redirect(`/courses/new`);
  } else {
    course.instructor = instructor._id;
    // let user = (course.instructor = req.user);
    // console.log(course);
    await course.save(async (err, item) => {
      instructor.ownedCourses.push(item._id);
      await instructor.save();
    });
    req.flash("success", "Successfully added a new course!");
    res.redirect(`/courses/${course._id}`);
  }
};

module.exports.searchCourse = async (req, res) => {
  const { searched } = req.body;
  const courses = await Course.find({
    $or: [{ name: { $regex: searched } }, { subject: { $regex: searched } }],
  });
  res.json(courses);
};

module.exports.renderCoursePage = async (req, res) => {
  const { Id } = req.params;
  const course = await Course.findById(Id).populate({
    path: "instructor",
    model: "Instructor",
    select: "fullname",
  });
  if (course) {
    res.render("courses/show", { course });
  }
};

module.exports.updateCourse = async (req, res) => {
  const { Id } = req.params;
  const course = await Course.findById(Id);
  if (course.videos.length > 0) {
    const vids = req.files.map((f) => ({ url: f.path, filename: f.filename }));
    course.videos.push(...vids);
  } else {
    course.videos = req.files.map((f) => ({
      url: f.path,
      filename: f.filename,
    }));
  }
  // console.log(course);
  await course.save();
  res.redirect(`/courses/${Id}`);
};

module.exports.deleteCourse = async (req, res) => {
  const { Id } = req.params;
  await Course.findByIdAndDelete(Id);
  req.flash("success", "The course has been successfully deleted");
  res.redirect("/courses/new");
};

module.exports.homePageSearch = async (req, res) => {
  const { search } = req.body;
  const courses = await Course.find({
    $or: [{ name: { $regex: search } }, { subject: { $regex: search } }],
  });
  req.session.courses = courses;
  // console.log(req.session.courses);
  res.redirect("/courses");
};

module.exports.addToWishlist = async (req, res) => {
  const { Id } = req.params;
  const userId = res.locals.currentUser;
  let user = await User.findById(userId);
  if (!user) {
    user = await OAuthUser.findById(userId);
  }
  const exists = user.favorites.find((el) => el == Id);
  if (exists) {
    req.flash("error", "The course already exists in your wishlist");
    res.redirect("/courses");
  } else {
    user.favorites.push(Id);
    await user.save();
    req.flash("success", "The course has been successfully added to wishlist");
    res.redirect("/courses");
  }
};

module.exports.addToCart = async (req, res) => {
  const { Id } = req.params;
  const cart = res.locals.cart;
  const exists = cart.find((el) => el == Id);
  if (exists) {
    req.flash("error", "The course already exists in your cart");
    res.redirect("/courses");
  } else {
    req.session.cart.push(Id);
    req.flash("success", "The course has been successfully added to your cart");
    res.redirect("/courses");
  }
};

module.exports.renderCourseOverview = async (req, res) => {
  const { Id } = req.params;
  const course = await Course.findById(Id).populate({
    path: "instructor",
    model: "Instructor",
    select: "fullname",
  });
  const reviews = await CourseReview.find({ course: Id })
    .populate("reviewedBy")
    .populate("reviewedByOAuth");
  res.render("courses/overview", { course, reviews });
};

module.exports.addReview = async (req, res) => {
  const { Id } = req.params;
  const { review } = req.body;
  const date = new Date().toLocaleString();

  const course = await Course.findById(Id);
  const userId = res.locals.currentUser;
  const courseReview = new CourseReview({ review, date, course: Id });

  let user = await User.findById(userId);
  if (!user) {
    user = await OAuthUser.findById(userId);
    courseReview.reviewedByOAuth = user._id;
  } else {
    courseReview.reviewedBy = user._id;
  }
  course.reviews.push(courseReview);
  await course.save();
  await courseReview.save();
  req.flash("success", "Your review has been submitted");
  res.redirect(`/courses/show/${Id}`);
};