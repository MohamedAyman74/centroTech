require("dotenv").config();
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
const bcrypt = require("bcrypt");
// require("./config/passport")(passport);

//USER MODEL
const User = require("./models/user");
const OAuth = require("./models/oAuthUser");

// ROUTES
const userRoutes = require("./routes/users");
const courseRoutes = require("./routes/courses");
const adminRoutes = require("./routes/admins");
const instructorRoutes = require("./routes/instructors");

mongoose.connect("mongodb://localhost:27017/centroTech", {
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

const sessionConfig = {
  secret: "changetobettersecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    // httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //1000 sanya fe 60 d2ee2a, etc
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));
app.use(flash());

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
            message: "Sorry, your account has been suspended",
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

//GOOGLE LOGIN PASSPORT
const googleConfig = {
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_SECRET,
  callbackURL: "http://localhost:3000/auth/google/callback",
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
  const localUser = await User.findById(user);
  if (!localUser) {
    // console.log(user);
    const oAuthUser = await OAuth.findById(user);
    // console.log(oAuthUser);
    done(null, oAuthUser);
  } else {
    // console.log(localUser);
    done(null, localUser);
  }
});

//ITEMS WITH ACCESS TO IN EACH PAGE
app.use((req, res, next) => {
  res.locals.title = "CentroTech";
  res.locals.currentUser = req.session.user_id;
  if (!res.locals.currentUser) {
    res.locals.currentUser = req.session.instructor_id;
  }
  if (!res.locals.currentUser) {
    res.locals.currentUser = req.session.admin_id;
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

app.get("/", (req, res) => {
  res.render("home");
});

app.get("*", (req, res) => {
  res.send("ERROR 404 NOT FOUND");
});

app.use((err, req, res, next) => {
  const { statusCode = "500" } = err;
  if (!err.message) err.message = "Something went wrong!";
  res.status(statusCode).render("error", { err });
});

app.listen(3000, () => {
  console.log("Server started successfully");
});
