if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const engine = require("ejs-mate");
const flash = require("connect-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
// require("./config/passport")(passport);

//MMONGO SESSION STORE
// const MongoStore = require("connect-mongo");

//USER MODEL
const User = require("./models/user");
const OAuth = require("./models/oAuthUser");

//Courses Model
const Course = require("./models/course");

// Instructor Model
const Instructor = require("./models/instructor");

//User Model
const Admin = require("./models/admin");

// ROUTES
const userRoutes = require("./routes/users");
const courseRoutes = require("./routes/courses");
const adminRoutes = require("./routes/admins");
const instructorRoutes = require("./routes/instructors");

//Helmet
const helmet = require("helmet");

//Mongo Injection Prevention -- Sanitization
const mongoSanitize = require("express-mongo-sanitize");

const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/centroTech";
mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  // useCreateIndex: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
  console.log("Connected to database successfully");
});

const app = express();

app.engine("ejs", engine);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(mongoSanitize());

const secret = process.env.SECRET || "changetobettersecret";

// const store = MongoStore.create({
//   mongoUrl: dbUrl,
//   touchAfter: 24 * 60 * 60,
//   crypto: {
//     secret,
//   },
// });

// store.on("error", function (e) {
//   console.log("Session store error", e);
// });

const sessionConfig = {
  name: "session",
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //1000 sanya fe 60 d2ee2a, etc
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));
app.use(flash());
app.use(
  helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false })
);

// PASSPORT CONFIGURATION
app.use(passport.initialize());
app.use(passport.session());
//PASSPORT LOCAL SESSION
passport.use(
  "local",
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          // console.log(user);
          return done(null, false, { message: "Wrong username or password" });
        }
        if (user.isSuspended) {
          return done(null, false, {
            message: `Sorry, your account has been suspended. Suspend reason is: ${user.suspendReason}.`,
          });
        }
        if (!user.isActivated) {
          return done(null, false, {
            message: "Sorry, your account has not been activated yet.",
          });
        }
        // console.log(user);
        // const matchPassword = await bcrypt.compare(password, user.password);
        // if (!matchPassword) {
        // return done(null, false,
        // message: "Wrong username or password",
        // });
        // }
        return done(null, user);
      } catch (e) {
        done(e);
      }
    }
  )
);

passport.use(
  "instructor-local",
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (email, password, done) => {
      try {
        const instructor = await Instructor.findOne({ email });
        if (!instructor) {
          // console.log(user);
          return done(null, false, { message: "Wrong username or password" });
        }
        return done(null, instructor);
      } catch (e) {
        done(e);
      }
    }
  )
);

passport.use(
  "admin-local",
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (email, password, done) => {
      try {
        const admin = await Admin.findOne({ email });
        if (!admin) {
          // console.log(user);
          return done(null, false, { message: "Wrong username or password" });
        }
        return done(null, admin);
      } catch (e) {
        done(e);
      }
    }
  )
);

const callbackURL =
  process.env.GOOGLE_CALLBACK || "http://localhost:3000/auth/google/callback";
//GOOGLE LOGIN PASSPORT
const googleConfig = {
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_SECRET,
  callbackURL,
};

passport.use(
  new GoogleStrategy(
    googleConfig,
    async (accessToken, refreshToken, profile, done) => {
      const { id, displayName, photos, provider } = profile;
      const newUser = {
        authId: id,
        fullname: displayName,
        email: profile.emails[0].value,
        image: { url: photos[0].value, filename: "" },
        provider: provider,
      };
      try {
        const localUser = await User.findOne({
          email: profile.emails[0].value,
        });
        console.log(localUser);
        if (!localUser) {
          let user = await OAuth.findOne({ authId: id });
          if (user) {
            // console.log(user);
            done(null, user);
          } else {
            user = await OAuth.create(newUser);
            done(null, user);
          }
        } else {
          return done(null, false);
        }
      } catch (e) {
        console.log(e);
      }
      // return done(null, user);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (user, done) => {
  let loggedUser = await User.findById(user);
  if (loggedUser) {
    done(null, loggedUser);
  }
  if (!loggedUser) {
    loggedUser = await OAuth.findById(user);
    if (loggedUser) {
      done(null, loggedUser);
    }
  }
  if (!loggedUser) {
    loggedUser = await Instructor.findById(user);
    if (loggedUser) {
      done(null, loggedUser);
    }
  }
  if (!loggedUser) {
    loggedUser = await Admin.findById(user);
    if (loggedUser) {
      done(null, loggedUser);
    }
  }
  // if (!localUser) {
  // console.log(user);
  // const oAuthUser = await OAuth.findById(user);
  // console.log(oAuthUser);
  // done(null, oAuthUser);
  // } else {
  // console.log(localUser);
  // done(null, localUser);
  // }
});

//ITEMS WITH ACCESS TO IN EACH PAGE
app.use((req, res, next) => {
  res.locals.title = "CentroTech";
  res.locals.currentUser = req.session.user_id;
  res.locals.loggedAdmin = false;
  res.locals.loggedInstructor = false;
  if (!res.locals.currentUser) {
    res.locals.currentUser = req.session.instructor_id;
    if (res.locals.currentUser) {
      res.locals.loggedInstructor = true;
    }
  }
  if (!res.locals.currentUser) {
    res.locals.currentUser = req.session.admin_id;
    if (res.locals.currentUser) {
      res.locals.loggedAdmin = true;
    }
  }
  // if (res.locals.currentUser) {
  res.locals.cart = req.session.cart;
  // }
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// ------------- STARTING OF THE ROUTES -------------
// USER ROUTES
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    failureFlash: "The email has been registered with before.",
  }),
  (req, res) => {
    if (!req.user.isSuspended) {
      req.session.user_id = req.user._id;
      req.session.cart = [];
      req.flash("success", "Welcome back!");
      res.redirect("/");
    } else {
      req.flash("error", "Your account is suspended");
      // req.session.destroy();
      res.redirect("/login");
    }
    // console.log(req.session.user_id);
    // console.log("reached this");
  }
);

app.use("/", userRoutes);
app.use("/courses", courseRoutes);
app.use("/admins", adminRoutes);
app.use("/instructor", instructorRoutes);

// app.get("/auth/google/callback", passport.authenticate("google"));

app.get("/", async (req, res) => {
  let studentsCount = 0;
  const localUsers = await User.find({});
  studentsCount += localUsers.length;
  const onlineAuthUsers = await OAuth.find({});
  studentsCount += onlineAuthUsers.length;
  const courses = await Course.find({});
  const coursesCount = courses.length;
  const instructors = await Instructor.find({});
  const instructorsCount = instructors.length;
  res.render("home", { studentsCount, coursesCount, instructorsCount });
});

app.get("*", (req, res) => {
  res.render("notFound");
});

app.use((err, req, res, next) => {
  const { statusCode = "500" } = err;
  if (!err.message) err.message = "Something went wrong!";
  if (err) res.status(statusCode).render("error", { err });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server started successfully on port ${port}`);
});
