const Course = require("../models/course");
const User = require("../models/user");
const OAuthUser = require("../models/oAuthUser");
const Instructor = require("../models/instructor");
const Admin = require("../models/admin");
const CourseReview = require("../models/courseReview");
const QuizQuestion = require("../models/quizQuestion");
const Quiz = require("../models/quiz");
const Purchase = require("../models/purchase");
const { cloudinary } = require("../cloudinary");

module.exports.index = async (req, res) => {
  const currentUser = res.locals.currentUser;
  let user = await User.findById(currentUser);
  if (!user) {
    user = await OAuthUser.findById(currentUser);
  }
  if (!user) {
    user = await Instructor.findById(currentUser);
  }
  if (req.session.courses) {
    const courses = req.session.courses;
    delete req.session.courses;
    if (req.session.isInstructor) {
      const isInstructor = req.session.isInstructor;
      const isAdmin = false;
      res.render("courses/index", { courses, user, isInstructor, isAdmin });
    } else if (req.session.isAdmin) {
      const isAdmin = req.session.isAdmin;
      const isInstructor = false;
      res.render("courses/index", { courses, user, isInstructor, isAdmin });
    } else if (req.session.user_id) {
      const isInstructor = false;
      const isAdmin = false;
      res.render("courses/index", { courses, user, isInstructor, isAdmin });
    }
  } else {
    const courses = await Course.find({}).populate({
      path: "instructor",
      model: "Instructor",
      select: { fullname: 1, _id: 1 },
    });
    if (req.session.isInstructor) {
      const isInstructor = req.session.isInstructor;
      const isAdmin = false;
      res.render("courses/index", { courses, user, isInstructor, isAdmin });
    } else if (req.session.isAdmin) {
      const isAdmin = req.session.isAdmin;
      const isInstructor = false;
      res.render("courses/index", { courses, user, isInstructor, isAdmin });
    } else if (req.session.user_id) {
      const isInstructor = false;
      const isAdmin = false;
      res.render("courses/index", { courses, user, isInstructor, isAdmin });
    } else {
      const isInstructor = false;
      const isAdmin = false;
      user = false;
      res.render("courses/index", { courses, user, isInstructor, isAdmin });
    }
  }
};

module.exports.renderNewCourseForm = async (req, res) => {
  const courses = await Course.find({}).populate("instructor"); //instructor: "62659507fc327af0b5bbe0cf"
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
  const currentUser = res.locals.currentUser;
  const { searched } = req.body;
  let courses;
  if (searched.length > 0) {
    courses = await Course.find({
      $or: [
        { name: { $regex: searched, $options: "i" } },
        { subject: { $regex: searched, $options: "i" } },
      ],
    }).populate({
      path: "instructor",
      model: "Instructor",
      select: { fullname: 1, _id: 1 },
    });
  } else {
    courses = await Course.find({}).populate({
      path: "instructor",
      model: "Instructor",
      select: { fullname: 1, _id: 1 },
    });
  }
  let user = await User.findById(currentUser);
  if (!user) {
    user = await OAuthUser.findById(currentUser);
  }
  if (req.session.isInstructor) {
    const isInstructor = req.session.isInstructor;
    const isAdmin = false;
    res.json({ courses, user, isInstructor, isAdmin });
  } else if (req.session.isAdmin) {
    const isAdmin = req.session.isAdmin;
    const isInstructor = false;
    res.json({ courses, user, isInstructor, isAdmin });
  } else if (req.session.user_id) {
    const isInstructor = false;
    const isAdmin = false;
    // res.render("courses/index", { courses, user, isInstructor, isAdmin });
    res.json({ courses, user, isInstructor, isAdmin });
    // res.send();
  } else {
    const isAdmin = false;
    const isInstructor = false;
    user = false;
    res.json({ courses, user, isInstructor, isAdmin });
  }
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
    $or: [
      { name: { $regex: search, $options: "i" } },
      { subject: { $regex: search, $options: "i" } },
    ],
  }).populate({
    path: "instructor",
    model: "Instructor",
    select: { fullname: 1, _id: 1 },
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
    if (req.session.cart.push(Id)) {
      req.flash(
        "success",
        "The course has been successfully added to your cart"
      );
      res.redirect("/courses");
    }
  }
};

module.exports.renderCourseOverview = async (req, res) => {
  const currentUser = res.locals.currentUser;
  let user = await User.findById(currentUser);
  if (!user) {
    user = await OAuthUser.findById(currentUser);
  }
  if (!user) {
    user = await Instructor.findById(currentUser);
  }
  const { Id } = req.params;
  const course = await Course.findById(Id).populate({
    path: "instructor",
    model: "Instructor",
    select: { fullname: 1, _id: 1 },
  });
  const reviews = await CourseReview.find({ course: Id })
    .populate("reviewedBy")
    .populate("reviewedByOAuth");
  if (req.session.isInstructor) {
    const isInstructor = req.session.isInstructor;
    const isAdmin = false;
    user.courses = [];
    res.render("courses/overview", {
      course,
      reviews,
      user,
      isInstructor,
      isAdmin,
    });
  } else if (req.session.isAdmin) {
    const isAdmin = req.session.isAdmin;
    const isInstructor = false;
    res.render("courses/overview", {
      course,
      reviews,
      user,
      isInstructor,
      isAdmin,
    });
  } else if (req.session.user_id) {
    const isInstructor = false;
    const isAdmin = false;
    res.render("courses/overview", {
      course,
      reviews,
      user,
      isInstructor,
      isAdmin,
    });
  } else {
    req.flash("error", "You must be logged in to view this page");
    res.redirect("/");
  }
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
  user.courseReviews.push(courseReview);
  await user.save();
  await course.save();
  await courseReview.save();
  req.flash("success", "Your review has been submitted");
  res.redirect(`/courses/show/${Id}`);
};

module.exports.addQuestion = (req, res) => {
  if (req.xhr) {
    if (!req.session.quiz) {
      req.session.quiz = [];
    }
    const { Id } = req.params;
    console.log("the req.body.quiz", req.body.quiz);
    console.log("the session before", req.session.quiz);
    req.session.quiz.push(req.body.quiz);
    console.log(req.session.quiz);
    res.json(req.session.quiz);
  }
};

module.exports.dismissQuiz = (req, res) => {
  const { Id } = req.params;
  req.session.quiz = null;
  delete req.session.quiz;
  res.redirect(`/courses/${Id}`);
};

module.exports.addQuiz = async (req, res) => {
  const { Id } = req.params;
  const questions = req.session.quiz;
  const instructor = req.session.instructor_id;
  let totalGrade = 0;
  const newQuiz = new Quiz({
    instructor,
    course: Id,
  });
  const savedQuiz = await newQuiz.save();
  questions.forEach(async (question) => {
    {
      // const correctAnswers
      const newQuestion = new QuizQuestion({
        ...question,
        quiz: savedQuiz._id,
      });
      totalGrade += parseInt(question.grade);
      // e3mel push gowa el array le kol correct answers.
      await newQuestion.save(async (err, savedQuestion) => {
        const updatedQuiz = await Quiz.findById(savedQuiz._id);
        updatedQuiz.questions.push(savedQuestion._id);
        updatedQuiz.totalGrade = totalGrade;
        await updatedQuiz.save();
      });
      // console.log(newQuestion);
    }
  });
  req.session.quiz = null;
  delete req.session.quiz;
  res.redirect(`/courses/${Id}`);
};

module.exports.renderPurchasePage = (req, res) => {
  const cart = res.locals.cart;
  if (cart.length <= 0) {
    req.flash("error", "You haven't added any item in your cart yet");
    res.redirect("/cart");
  } else {
    res.render("courses/purchase");
  }
};

module.exports.makePurchase = async (req, res) => {
  const { payMethod } = req.body;
  const cart = res.locals.cart;
  const currentUser = res.locals.currentUser;
  const toPurchase = [];
  const date = new Date().toLocaleString();

  let user = await User.findById(currentUser);
  if (user) {
    cart.forEach(async (purchasedCourse) => {
      const transaction = new Purchase({ date, paymentMethod: payMethod });
      const course = await Course.findById(purchasedCourse);
      transaction.purchasedCourse = purchasedCourse;
      transaction.purchasedBy = currentUser;
      transaction.amount = course.price;
      await transaction.save();
    });
  }
  if (!user) {
    user = await OAuthUser.findById(currentUser);
    if (user) {
      cart.forEach(async (purchasedCourse) => {
        const transaction = new Purchase({ date, paymentMethod: payMethod });
        const course = await Course.findById(purchasedCourse);
        transaction.purchasedCourse = purchasedCourse;
        transaction.purchasedByOAuth = currentUser;
        transaction.amount = course.price;
        await transaction.save();
      });
    }
  }
  if (user) {
    cart.forEach((purchasedCourse) => {
      const isFound = user.courses.includes(purchasedCourse);
      if (!isFound) {
        toPurchase.push(purchasedCourse);
      }
    });
    if (toPurchase.length === cart.length) {
      toPurchase.forEach(async (item, i) => {
        const idx = user.favorites.indexOf(item);
        user.favorites.splice(idx, 1);
        const course = await Course.findById(item);
        course.enrolled++;
        await course.save();
        if (i === toPurchase.length - 1) {
        }
      });
      user.courses.push(...toPurchase);
      await user.save();
      req.session.cart = [];
      req.flash("success", "Courses purchased successfully");
      res.redirect("/courses/mycourses");
    } else {
      req.flash(
        "error",
        "A course you are trying to purchase is already owned"
      );
      res.redirect("/courses");
    }
  } else {
    req.flash("error", "You must be logged in first");
    res.redirect("/courses");
  }
};

// module.exports.makePurchase = async (req, res) => {
//   const cart = res.locals.cart;
//   const currentUser = res.locals.currentUser;
//   const isOkay = [];

//   cart.forEach(async (purchasedCourse) => {
//     let user = await User.findById(currentUser);
//     if (!user) {
//       user = await OAuthUser.findById(currentUser);
//     }
//     if (user) {
//       const course = await Course.findById(purchasedCourse);
//       // const isFound = user.courses.includes(purchasedCourse);
//       // console.log(user.courses);
//       // console.log(isFound);
//       const enroll = ++course.enrolled;
//       course.enrolled = enroll;
//       await course.save();
//       // delete req.session.cart;
//       user.courses.push(purchasedCourse);
//       await user.save();
//     }
//   });
//   req.flash("success", "Courses purchased successfully");
//   res.redirect("/courses");
// };

module.exports.renderUserCourses = async (req, res) => {
  const currentUser = res.locals.currentUser;
  let user = await User.findById(currentUser).populate({
    path: "courses",
    model: "Course",
    populate: {
      path: "instructor",
      model: "Instructor",
      select: "fullname",
    },
    select: {},
  });
  if (user) {
    const courses = user.courses;
    res.render("courses/userCourses", { courses });
  }
  if (!user) {
    user = await OAuthUser.findById(currentUser).populate({
      path: "courses",
      model: "Course",
      populate: {
        path: "instructor",
        model: "Instructor",
        select: "fullname",
      },
      select: {},
    });
    if (user) {
      const courses = user.courses;
      res.render("courses/userCourses", { courses });
    }
  }
  if (!user) {
    user = await Instructor.findById(currentUser).populate("ownedCourses");
    if (user) {
      const courses = user.ownedCourses;
      res.render("courses/userCourses", { courses });
    }
  }
};

module.exports.deleteReview = async (req, res) => {
  const { Id, userId, reviewId } = req.params;
  const isAdmin = res.locals.loggedAdmin;
  const currentUser = res.locals.currentUser;
  let user = await User.findById(userId);
  if (user) {
    if (userId === currentUser || isAdmin) {
      await User.findByIdAndUpdate(userId, {
        $pull: { courseReviews: reviewId },
      });
      await Course.findByIdAndUpdate(Id, {
        $pull: { reviews: reviewId },
      });
      await CourseReview.findByIdAndDelete(reviewId);
      req.flash("success", "Successfully deleted the review");
      res.redirect(`/courses/show/${Id}`);
    } else {
      req.flash("error", "Sorry, you are not authorized to delete the review");
      res.redirect(`/courses/show/${Id}`);
    }
  }
  if (!user) {
    user = await OAuthUser.findById(currentUser);
    if (userId === currentUser || isAdmin) {
      await OAuthUser.findByIdAndUpdate(currentUser, {
        $pull: { courseReviews: reviewId },
      });
      await Course.findByIdAndUpdate(Id, {
        $pull: { reviews: reviewId },
      });
      await CourseReview.findByIdAndDelete(reviewId);
      req.flash("success", "Successfully deleted the review");
      res.redirect(`/courses/show/${Id}`);
    } else {
      req.flash("error", "Sorry, you are not authorized to delete the review");
      res.redirect(`/courses/show/${Id}`);
    }
  }
};

module.exports.editCourse = async (req, res) => {
  const { Id } = req.params;
  const course = await Course.findById(Id);
  const currentUser = res.locals.currentUser;
  const isAdmin = await Admin.findById(currentUser);
  if (course.instructor.equals(currentUser) || isAdmin) {
    const isInstructor = res.locals.loggedInstructor;
    if (isInstructor) {
      req.body.price = course.price;
    }
    let updatedCourse = await Course.findByIdAndUpdate(Id, req.body, {
      new: true,
    });
    if (req.file) {
      if (updatedCourse.image && updatedCourse.image.filename !== "") {
        await cloudinary.uploader.destroy(updatedCourse.image.filename);
      }
      updatedCourse.image = { url: req.file.path, filename: req.file.filename };
      await updatedCourse.save();
    }
    req.flash("success", "Course has been updated successfully!");
    res.redirect(`/courses/${Id}`);
  } else {
    req.flash("error", "Unauthorized.");
    res.redirect(`/courses/${Id}`);
  }
};

module.exports.deleteLecture = async (req, res) => {
  const { Id, videoNum } = req.params;
  const arrIdx = parseInt(videoNum) - 1;
  let course = await Course.findById(Id);
  const currentUser = res.locals.currentUser;
  const isAdmin = await Admin.findById(currentUser);
  if (course.instructor.equals(currentUser) || isAdmin) {
    await cloudinary.uploader.destroy(course.videos[arrIdx].filename);
    course.videos.splice(arrIdx, 1);
    await course.save();
    req.flash("success", "Course has been updated successfully!");
    res.redirect(`/courses/${Id}`);
  } else {
    req.flash("error", "Unauthorized.");
    res.redirect(`/courses/${Id}`);
  }
};
