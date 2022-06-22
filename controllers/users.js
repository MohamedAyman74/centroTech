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
const bcrypt = require("bcrypt");
const { sendEmail } = require("../utils/sendMail");
const crypto = require("crypto");

const { cloudinary } = require("../cloudinary");

module.exports.renderRegister = (req, res) => {
  res.render("users/register", { title: "CentroTech - Register" });
};

module.exports.renderLogin = (req, res) => {
  // if (req.user) {
  // console.log(req.user);
  // }
  res.render("users/login", { title: "CentroTech - Login" });
};
module.exports.register = async (req, res, next) => {
  // console.log(req.body);
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
        });
        // console.log(user);
        // res.redirect("/register");
        // console.log(user);
        // const registeredUser = await User.register(user, password);
        const newUser = await user.save();
        // // console.log(registeredUser);
        req.login(newUser, (err) => {
          if (err) return next(err);
          req.flash("success", "Your account has been successfully created!");
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
    // next(new ExpressError("Cannot find the required page destination.", 404));
    res.redirect("register");
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
    if (!user)
      return res.status(400).send("user with given email doesn't exist");

    let token = await Token.findOne({ userId: user._id });
    if (!token) {
      token = await new Token({
        userId: user._id,
        token: crypto.randomBytes(32).toString("hex"),
      }).save();
    }

    const link = `http://localhost:3000/password-reset/${user._id}/${token.token}`;
    await sendEmail(user.email, "Password reset", link);

    res.send("password reset link sent to your email account");
  } catch (error) {
    res.send("An error occured");
    console.log(error);
  }
};

module.exports.resetRender = (req, res) => {
  const { userId, tokenId } = req.params;
  res.render("users/reset", { userId, tokenId });
};

module.exports.resetPassword = async (req, res) => {
  try {
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
    res.redirect(`/password-reset/${userId}/${tokenId}`);
  } catch (e) {
    console.log(error, "error occured");
  }
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
    .populate("postedByOAuth");
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
    const searchUser = await User.findById(currentUser);
    if (searchUser) {
      answer.postedBy = currentUser;
    } else {
      answer.postedByOAuth = currentUser;
    }
    await answer.save();
    req.flash("success", "Your reply has been added");
    res.redirect(`/questions/${Id}`);
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
  const quiz = await Quiz.findById(Id).populate("questions");
  const course = quiz.course;
  if (!user.courses.includes(course)) {
    req.flash("error", "You should purchase the course first");
    res.redirect(`/courses/show/${course}`);
  } else {
    const quizResponse = await QuizResponse.find(toBeFound);
    const answers = quizResponse[0].submittedAnswers;
    const finalGrade = quizResponse[0].finalGrade;
    console.log(answers);
    res.render("users/solvedQuiz", { quiz, answers, finalGrade });
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
        { path: "replyBy", model: "User", select: "fullname" },
        { path: "replyByOAuth", model: "OAuth", select: "fullname" },
        { path: "replyByInstructor", model: "Instructor", select: "fullname" },
        { path: "replyByAdmin", model: "Admin", select: "fullname" },
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
