const User = require("../models/user");
const Course = require("../models/course");
const oAuthUser = require("../models/oAuthUser");
const Token = require("../models/token");
const Question = require("../models/question");
const Answer = require("../models/answer");
const Quiz = require("../models/quiz");
const QuizResponse = require("../models/quizResponses");
const Instructor = require("../models/instructor");
const Admin = require("../models/admin");
const Ticket = require("../models/supportTicket");
const TicketAnswer = require("../models/ticketAnswer");
const ExpressError = require("../utils/ExpressError");
const VerificationToken = require("../models/verificationToken");
const WebsiteReview = require("../models/review");
const bcrypt = require("bcrypt");
const { sendEmail } = require("../utils/sendMail");
const crypto = require("crypto");
const { cloudinary } = require("../cloudinary");

module.exports.renderHomePage = async (req, res) => {
  let studentsCount = 0;
  const localUsers = await User.find({});
  studentsCount += localUsers.length;
  const onlineAuthUsers = await oAuthUser.find({});
  studentsCount += onlineAuthUsers.length;
  const courses = await Course.find({});
  const coursesCount = courses.length;
  const instructors = await Instructor.find({});
  const instructorsCount = instructors.length;
  const reviews = await WebsiteReview.find({ rating: 5 })
    .limit(4)
    .populate("reviewedBy")
    .populate("reviewedByOAuth")
    .populate("reviewedByInstructor");

  const topRatedCourses = await Course.find({})
    .sort({ enrolled: "desc" })
    .limit(3);
  res.render("home", {
    studentsCount,
    coursesCount,
    instructorsCount,
    reviews,
    topRatedCourses,
  });
};

module.exports.renderRegister = (req, res) => {
  res.render("users/register", { title: "CentroTech - Register" });
};

module.exports.renderLogin = (req, res) => {
  // if (req.user) {
  // console.log(req.user);
  // }
  if (res.locals.currentUser) {
    req.flash(
      "error",
      "You cannot access this page, you are already logged in."
    );
    res.redirect("/");
  } else {
    res.render("users/login", { title: "CentroTech - Login" });
  }
};

module.exports.register = async (req, res, next) => {
  try {
    const { email, fullname, password } = req.body;
    const doesExistLocal = await User.findOne({ email });
    const doesExistoAuth = await oAuthUser.findOne({ email });
    if (doesExistLocal) {
      req.flash("error", "Email has been used before");
      res.redirect("/register");
    } else {
      if (doesExistoAuth) {
        req.flash("error", "Email has been used before");
        res.redirect("/register");
      } else {
        const hashed = await bcrypt.hash(password, 10);
        const user = new User({
          email,
          fullname,
          password: hashed,
          image: {
            url: "https://res.cloudinary.com/dd36t4xod/image/upload/v1656095424/CentroTech/users/blankProfile_mvm787.png",
            filename: "blankProfile",
          },
        });
        const newUser = await user.save();
        let verificationToken = await VerificationToken.findOne({
          userId: user._id,
        });
        if (!verificationToken) {
          verificationToken = await new VerificationToken({
            userId: user._id,
            token: crypto.randomBytes(32).toString("hex"),
          }).save();
        }
        const host = process.env.VERIFICATION_MAIL || `http://localhost:3000/`;
        const link = `${host}verify/${user._id}/${verificationToken.token}`;
        await sendEmail(user.email, "Email Verification", link);

        req.login(newUser, (err) => {
          if (err) return next(err);
          req.flash(
            "success",
            "A verification email has been sent to your email. Account successfully created!"
          );
          res.redirect("/login");
        });
      }
    }
  } catch (e) {
    console.log(e);
    if (e.message === "A user with the given username is already registered") {
      e.message = "The email has been registered with before";
    }
    req.flash("error", e.message);
    res.redirect("register");
  }
};

module.exports.verifyAccount = async (req, res) => {
  const { userId, verifyToken } = req.params;
  const user = await User.findById(userId);
  if (user) {
    const token = await VerificationToken.findOne({
      userId,
      token: verifyToken,
    });
    if (token) {
      user.isActivated = true;
      await user.save();
      await token.delete();
      req.flash("success", "Your account has been successfully activated.");
      res.redirect("/login");
    }
  } else {
    req.flash("error", "Invalid or expired verification link.");
    res.redirect("/");
  }
};

module.exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    req.flash("error", "Wrong username or password");
    res.redirect("/login");
  } else {
    req.session.user_id = user._id;
    req.session.cart = [];
    req.flash("success", "Welcome back!");
    const redirectUrl = req.session.returnTo || "/";
    delete req.session.returnTo;
    res.redirect(redirectUrl);
  }
};

module.exports.logout = (req, res) => {
  req.session.user_id = null;
  req.session.instructor_id = null;
  req.session.admin_id = null;
  req.session.quiz = null;
  req.session.cart = null;
  req.session.destroy();
  // req.flash("success", "Successfully logged you out, goodbye!");
  res.redirect("/");
};

module.exports.forgotRender = (req, res) => {
  res.render("users/forgot");
};

module.exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      user = await Instructor.findOne({ email });
    }
    if (!user) {
      req.flash("error", "User with given email doesn't exist");
      return res.status(400).redirect("/forgot");
    }

    let token = await Token.findOne({ userId: user._id });
    if (!token) {
      token = await new Token({
        userId: user._id,
        token: crypto.randomBytes(32).toString("hex"),
      }).save();
    }
    // const link = `${host}verify/${user._id}/${verificationToken.token}`;
    const host = process.env.VERIFICATION_MAIL || `http://localhost:3000/`;
    const link = `${host}password-reset/${user._id}/${token.token}`;
    await sendEmail(user.email, "Password reset", link);

    req.flash("success", "Successfully sent you email reset password");
    res.redirect("/login");
  } catch (error) {
    req.flash(
      "error",
      "An error has occurred, email may not be existing or token invalid."
    );
    res.redirect("/login");
    console.log(error);
  }
};

module.exports.resetRender = (req, res) => {
  const { userId, tokenId } = req.params;
  res.render("users/reset", { userId, tokenId });
};

module.exports.resetPassword = async (req, res) => {
  const { userId, tokenId } = req.params;
  let user = await User.findById(userId);
  if (!user) {
    user = await Instructor.findById(userId);
  }
  if (!user) {
    req.flash("error", "Invalid or expired link.");
    res.redirect(`/password-reset/${userId}/${tokenId}`);
  }
  const token = await Token.findOne({
    userId,
    token: tokenId,
  });
  if (!token) {
    req.flash("error", "Invalid or expred link");
    res.redirect(`/password-reset/${userId}/${tokenId}`);
  }
  const { password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  user.password = hashed;
  await user.save();
  await token.delete();
  req.flash("success", "Successfully reset your password.");
  res.redirect("/login");
};

module.exports.profileRender = async (req, res) => {
  const { id } = req.params;
  let user = await User.findById(id).select("-password");
  if (user) {
    const isInstructor = false;
    res.render("users/profile", { user, isInstructor });
  }
  if (!user) {
    user = await oAuthUser.findById(id);
    if (user) {
      const isInstructor = false;
      res.render("users/profile", { user, isInstructor });
    }
  }
  if (req.session.instructor_id) {
    if (!user) {
      user = await Instructor.findById(id);
      if (user) {
        const isInstructor = true;
        res.render("users/profile", { user, isInstructor });
      }
    }
  }
};

module.exports.updateProfile = async (req, res) => {
  const { id } = req.params;
  let user = await User.findByIdAndUpdate(id, req.body, { new: true });
  if (!user) {
    user = await oAuthUser.findByIdAndUpdate(id, req.body, { new: true });
  }
  if (req.session.instructor_id) {
    if (!user) {
      user = await Instructor.findByIdAndUpdate(id, req.body, { new: true });
    }
  }
  if (req.file) {
    if (user.image && user.image.filename !== "") {
      await cloudinary.uploader.destroy(user.image.filename);
    }
    user.image = { url: req.file.path, filename: req.file.filename };
    await user.save();
  }
  req.flash("success", "Your profile has been updated successfully!");
  res.redirect(`/profile/${id}`);
};

module.exports.renderWishlist = async (req, res) => {
  const userId = res.locals.currentUser;
  let user = await User.findById(userId).populate({
    path: "favorites",
    model: "Course",
    populate: {
      path: "instructor",
      model: "Instructor",
      select: "fullname",
    },
    select: { name: 1, price: 1 },
  });
  if (!user) {
    user = await oAuthUser.findById(userId).populate({
      path: "favorites",
      model: "Course",
      populate: {
        path: "instructor",
        model: "Instructor",
        select: "fullname",
      },
      select: { name: 1, price: 1 },
    });
  }
  const favorites = user.favorites;
  if (user) {
    res.render("users/wishlist", { favorites });
  }
};

module.exports.deleteWishlist = async (req, res) => {
  const { Id } = req.params;
  const userId = res.locals.currentUser;
  let user = await User.findById(userId);
  if (!user) {
    user = await oAuthUser.findById(userId);
  }
  const exists = user.favorites.find((el) => el == Id);
  const course = user.favorites.indexOf(exists);
  if (course !== -1) {
    user.favorites.splice(course, 1);
    await user.save();
  }
  req.flash("success", "The course has been deleted from your wishlist");
  res.redirect("/wishlist");
};

module.exports.renderCart = async (req, res) => {
  const cart = res.locals.cart;
  const courses = await Course.find({ _id: { $in: cart } }).populate({
    path: "instructor",
    model: "Instructor",
    select: "fullname",
  });
  if (courses) {
    res.render("users/cart", { courses });
  }
};

module.exports.removeCart = (req, res) => {
  const { Id } = req.params;
  const cart = res.locals.cart;
  const exists = cart.find((el) => el == Id);
  if (exists) {
    const course = cart.indexOf(exists);
    if (course !== -1) {
      cart.splice(course, 1);
      req.flash("success", "The course has been deleted from your cart");
      res.redirect("/cart");
    }
  }
};

module.exports.renderQuestions = async (req, res) => {
  const questions = await Question.find({})
    .populate("askedByOAuth")
    .populate("askedBy");
  res.render("users/questions", { questions });
};

module.exports.addNewQuestion = async (req, res) => {
  const currentUser = res.locals.currentUser;
  const { title, details } = req.body;
  const date = new Date().toLocaleString();

  const question = new Question({
    title,
    details,
    date,
  });

  const searchUser = await User.findById(currentUser);
  if (searchUser) {
    question.askedBy = currentUser;
  } else {
    question.askedByOAuth = currentUser;
  }
  await question.save();
  res.redirect("/questions");
};

module.exports.renderAnswers = async (req, res) => {
  const { Id } = req.params;
  const question = await Question.findById(Id)
    .populate("askedBy")
    .populate("askedByOAuth");
  const answers = await Answer.find({ question: Id })
    .populate("postedBy")
    .populate("postedByOAuth")
    .populate("postedByInstructor")
    .populate("postedByAdmin");
  res.render("users/answers", { question, answers });
};

module.exports.addAnswer = async (req, res) => {
  const currentUser = res.locals.currentUser;
  const { reply } = req.body;
  const { Id } = req.params;
  const date = new Date().toLocaleString();
  const question = await Question.findById(Id);
  if (question) {
    const answer = new Answer({ reply, date, question: Id });
    let searchUser = await User.findById(currentUser);
    if (searchUser) {
      answer.postedBy = currentUser;
    }
    if (!searchUser) {
      searchUser = await oAuthUser.findById(currentUser);
      if (searchUser) {
        answer.postedByOAuth = currentUser;
      }
    }
    if (!searchUser) {
      searchUser = await Instructor.findById(currentUser);
      if (searchUser) {
        answer.postedByInstructor = currentUser;
      }
    }
    if (!searchUser) {
      searchUser = await Admin.findById(currentUser);
      if (searchUser) {
        answer.postedByAdmin = currentUser;
      }
    }
    if (searchUser) {
      await answer.save();
      req.flash("success", "Your reply has been added");
      res.redirect(`/questions/${Id}`);
    } else {
      req.flash("error", "Something wrong has happened");
      res.redirect("/questions");
    }
  } else {
    req.flash("error", "Something wrong has happened");
    res.redirect("/questions");
  }
};

module.exports.renderQuizzes = async (req, res) => {
  const currentUser = res.locals.currentUser;
  let user = await User.findById(currentUser);
  let responses = await QuizResponse.find({ student: currentUser });
  const quizzesTaken = [];
  let toBeFound = {};
  if (user) {
    responses.forEach((response) => {
      quizzesTaken.push(response.quiz);
    });
    toBeFound = { _id: { $nin: quizzesTaken }, course: { $in: user.courses } };
  }
  if (!user) {
    responses = await QuizResponse.find({ studentOAuth: currentUser });
    responses.forEach((response) => {
      quizzesTaken.push(response.quiz);
    });
    user = await oAuthUser.findById(currentUser);
    if (user)
      toBeFound = {
        _id: { $nin: quizzesTaken },
        course: { $in: user.courses },
      };
  }
  if (!user) {
    user = await Instructor.findById(currentUser);
    if (user) toBeFound = { instructor: user._id };
  }
  if (!user) {
    user = await Admin.findById(currentUser);
    if (user) toBeFound = {};
  }
  const quizzes = await Quiz.find(toBeFound)
    .populate({
      path: "instructor",
      model: "Instructor",
      select: "fullname",
    })
    .populate({
      path: "course",
      model: "Course",
      select: "name",
    });
  if (req.session.isInstructor) {
    const isInstructor = req.session.isInstructor;
    const isAdmin = false;
    res.render("users/quizzesIndex", { quizzes, isAdmin, isInstructor });
  } else if (req.session.isAdmin) {
    const isAdmin = req.session.isAdmin;
    const isInstructor = false;
    res.render("users/quizzesIndex", { quizzes, isAdmin, isInstructor });
  } else if (req.session.user_id) {
    const isAdmin = false;
    const isInstructor = false;
    res.render("users/quizzesIndex", { quizzes, isAdmin, isInstructor });
  } else {
    req.flash("error", "You must be logged in to view this page");
    res.redirect("/");
  }
};

module.exports.renderQuizPage = async (req, res) => {
  const { Id } = req.params;
  const currentUser = req.session.user_id;
  let user = await User.findById(currentUser);
  if (!user) {
    user = await oAuthUser.findById(currentUser);
  }
  if (user.quizzes.includes(Id)) {
    req.flash("error", "You have taken this quiz before");
    res.redirect("/quizzes");
  }
  const quiz = await Quiz.findById(Id)
    .populate({
      path: "course",
      model: "Course",
      select: "name",
    })
    .populate("questions");
  const course = quiz.course._id;
  if (!user.courses.includes(course)) {
    req.flash("error", "You should purchase the course first");
    res.redirect(`/courses/show/${course}`);
  } else {
    res.render("users/takeQuiz", { quiz });
  }
};

module.exports.takeQuiz = async (req, res) => {
  const { Id } = req.params;
  const userResponses = req.body.correctAnswers;
  const correctAnswersArr = [];
  let marks = 0;
  const quiz = await Quiz.findById(Id).populate("questions");
  const newResponse = new QuizResponse({ quiz: quiz._id });
  quiz.questions.forEach((question) => {
    correctAnswersArr.push(question.correctAnswers[0]);
  });

  userResponses.forEach(async (response, i) => {
    newResponse.submittedAnswers.push(response);
    if (response == correctAnswersArr[i]) {
      marks += quiz.questions[i].grade;
    }
    newResponse.finalGrade = marks;
  });
  const currentUser = req.session.user_id;
  let user = await User.findById(currentUser);
  if (user) {
    newResponse.student = currentUser;
  }
  if (!user) {
    user = await oAuthUser.findById(currentUser);
    if (user) {
      newResponse.studentOAuth = currentUser;
    }
  }
  user.quizzes.push(Id);
  user.save();
  await newResponse.save();
  // console.log(correctAnswersArr);
  // console.log(quiz.questions);
  res.redirect(`/quizzes/solved/${Id}`);
};

module.exports.renderSolvedQuizzes = async (req, res) => {
  const currentUser = res.locals.currentUser;
  let user = await User.findById(currentUser);
  let responses = await QuizResponse.find({ student: currentUser });
  let toBeFound = {};
  const quizzesTaken = [];
  if (user) {
    responses.forEach((response) => {
      quizzesTaken.push(response.quiz);
    });
    toBeFound = { _id: { $in: quizzesTaken }, course: { $in: user.courses } };
  }
  if (!user) {
    user = await oAuthUser.findById(currentUser);
    if (user)
      responses = await QuizResponse.find({ studentOAuth: currentUser });
    responses.forEach((response) => {
      quizzesTaken.push(response.quiz);
    });
    toBeFound = {
      _id: { $in: quizzesTaken },
      course: { $in: user.courses },
    };
  }
  if (!user) {
    user = await Instructor.findById(currentUser);
    if (user) toBeFound = { instrucotr: user._id };
  }
  if (!user) {
    user = await Admin.findById(currentUser);
    if (user) toBeFound = {};
  }
  const quizzes = await Quiz.find(toBeFound)
    .populate({
      path: "instructor",
      model: "Instructor",
      select: "fullname",
    })
    .populate({
      path: "course",
      model: "Course",
      select: "name",
    });
  if (req.session.isInstructor) {
    const isInstructor = req.session.isInstructor;
    const isAdmin = false;
    res.render("users/solvedQuizzes", { quizzes, isAdmin, isInstructor });
  } else if (req.session.isAdmin) {
    const isAdmin = req.session.isAdmin;
    const isInstructor = false;
    res.render("users/solvedQuizzes", { quizzes, isAdmin, isInstructor });
  } else if (req.session.user_id) {
    const isAdmin = false;
    const isInstructor = false;
    res.render("users/solvedQuizzes", { quizzes, isAdmin, isInstructor });
  } else {
    req.flash("error", "You must be logged in to view this page");
    res.redirect("/");
  }
};

module.exports.renderQuizAnswers = async (req, res) => {
  const { Id } = req.params;
  const currentUser = res.locals.currentUser;
  let user = await User.findById(currentUser);
  let toBeFound = {};
  if (user) {
    toBeFound = { quiz: Id, student: currentUser };
  }
  if (!user) {
    user = await oAuthUser.findById(currentUser);
    if (user) {
      toBeFound = { quiz: Id, studentOAuth: currentUser };
    }
  }
  const quiz = await Quiz.findById(Id).populate("questions").populate("course");
  const course = quiz.course._id;
  if (!user.courses.includes(course)) {
    req.flash("error", "You should purchase the course first");
    res.redirect(`/courses/show/${course}`);
  } else {
    const quizResponse = await QuizResponse.find(toBeFound);
    const answers = quizResponse[0].submittedAnswers;
    const finalGrade = quizResponse[0].finalGrade;
    console.log(quiz);
    if (quiz) {
      res.render("users/solvedQuiz", { quiz, answers, finalGrade });
    }
  }
};

module.exports.renderSupportTickets = async (req, res) => {
  const currentUser = res.locals.currentUser;
  let user = await User.findById(currentUser);
  let toBeFound = {};
  if (user) {
    toBeFound = { sentBy: currentUser };
  }
  if (!user) {
    user = await oAuthUser.findById(currentUser);
    if (user) toBeFound = { sentByOAuth: currentUser };
  }
  if (!user) {
    user = await Instructor.findById(currentUser);
    if (user) toBeFound = { sentByInstructor: currentUser };
  }
  if (!user) {
    user = await Admin.findById(currentUser);
    if (user) toBeFound = {};
  }
  const tickets = await Ticket.find(toBeFound)
    .populate("sentBy")
    .populate("sentByOAuth")
    .populate("sentByInstructor");
  res.render("users/supportTickets", { tickets });
};

module.exports.sendSupportTicket = async (req, res) => {
  const { title, details } = req.body;
  const date = new Date().toLocaleString();
  const currentUser = res.locals.currentUser;

  const ticket = new Ticket({
    title,
    details,
    date,
  });

  let searchUser = await User.findById(currentUser);
  if (searchUser) {
    ticket.sentBy = currentUser;
  }
  if (!searchUser) {
    searchUser = await oAuthUser.findById(currentUser);
    ticket.sentByOAuth = currentUser;
  }
  if (!searchUser) {
    searchUser = await Instructor.findById(currentUser);
    ticket.sentByInstructor = currentUser;
  }
  await ticket.save();
  res.redirect("/support-tickets");
};

module.exports.renderSupportTicket = async (req, res) => {
  const { Id } = req.params;
  const ticket = await Ticket.findById(Id)
    .populate("sentBy")
    .populate("sentByOAuth")
    .populate("sentByInstructor")
    .populate({
      path: "replies",
      model: "TicketAnswer",
      select: {
        reply: 1,
        replyBy: 1,
        replyByOAuth: 1,
        replyByInstructor: 1,
        replyByAdmin: 1,
        date: 1,
      },
      populate: [
        { path: "replyBy", model: "User", select: { fullname: 1, image: 1 } },
        {
          path: "replyByOAuth",
          model: "OAuth",
          select: { fullname: 1, image: 1 },
        },
        {
          path: "replyByInstructor",
          model: "Instructor",
          select: { fullname: 1, image: 1 },
        },
        {
          path: "replyByAdmin",
          model: "Admin",
          select: { fullname: 1, image: 1 },
        },
      ],
    });
  res.render("users/ticket", { ticket });
};

module.exports.sendTicketReply = async (req, res) => {
  const { Id } = req.params;
  const { reply } = req.body;
  const currentUser = res.locals.currentUser;
  const date = new Date().toLocaleString();
  const ticket = await Ticket.findById(Id);
  if (ticket) {
    const newReply = new TicketAnswer({ reply, date, ticket: Id });
    let user = await User.findById(currentUser);
    if (user) {
      newReply.replyBy = currentUser;
    }
    if (!user) {
      user = await oAuthUser.findById(currentUser);
      if (user) newReply.replyByOAuth = currentUser;
    }
    if (!user) {
      user = await Instructor.findById(currentUser);
      if (user) newReply.replyByInstructor = currentUser;
    }
    if (!user) {
      user = await Admin.findById(currentUser);
      if (user) newReply.replyByAdmin = currentUser;
    }
    await newReply.save(async (err, reply) => {
      const supportTicket = await Ticket.findById(Id);
      supportTicket.replies.push(reply._id);
      await supportTicket.save();
    });
    req.flash("success", "Your reply has been added");
    res.redirect(`/support-tickets/${Id}`);
  } else {
    req.flash("error", "Something wrong has happened");
    res.redirect("/support-tickets");
  }
};

module.exports.lockQuestion = async (req, res) => {
  const { Id } = req.params;
  const question = await Question.findById(Id);
  question.isLocked = !question.isLocked;
  question.save();
  req.flash("success", "Question has been locked/unlocked successfully.");
  res.redirect(`/questions/${Id}`);
};

module.exports.deleteQuestion = async (req, res) => {
  const { Id } = req.params;
  await Question.findByIdAndDelete(Id);
  req.flash("success", "Successfully deleted the question");
  res.redirect("/questions");
};

module.exports.deleteReply = async (req, res) => {
  const { Id, userId, replyId } = req.params;
  const isAdmin = res.locals.loggedAdmin;
  const currentUser = res.locals.currentUser;
  let question = await Question.findById(Id);
  if (question) {
    if (userId === currentUser || isAdmin) {
      await Question.findByIdAndUpdate(Id, {
        $pull: { replies: replyId },
      });
      await Answer.findByIdAndDelete(replyId);
      // await CourseReview.findByIdAndDelete(reviewId);
      req.flash("success", "Successfully deleted the reply");
      res.redirect(`/questions/${Id}`);
    } else {
      req.flash("error", "Sorry, you are not authorized to delete the review");
      res.redirect(`/questions/${Id}`);
    }
  } else {
    req.flash("error", "Sorry, you are not authorized to delete the review");
    res.redirect(`/questions/${Id}`);
  }
};

module.exports.websiteReview = async (req, res) => {
  const currentUser = res.locals.currentUser;
  const { rating, review } = req.body;
  const userReview = new WebsiteReview({
    rating,
    review,
  });
  let user = await User.findById(currentUser);
  if (user) {
    userReview.reviewedBy = currentUser;
  }
  if (!user) {
    user = await oAuthUser.findById(currentUser);
    if (user) {
      userReview.reviewedByOAuth = currentUser;
    }
  }
  if (!user) {
    user = await Instructor.findById(currentUser);
    if (user) {
      userReview.reviewedByInstructor = currentUser;
    }
  }
  if (user) {
    userReview.save();
  }
  req.flash("success", "Successfully posted your review");
  res.redirect("/");
};

module.exports.lockTicket = async (req, res) => {
  const { Id } = req.params;
  const ticket = await Ticket.findById(Id);
  ticket.isLocked = !ticket.isLocked;
  ticket.save();
  req.flash("success", "Ticket has been locked/unlocked successfully.");
  res.redirect(`/support-tickets/${Id}`);
};
