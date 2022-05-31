const GoogleStrategy = require("passport-google-oauth20").Strategy;

const googleConfig = {
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback",
};

module.exports = (passport) => {
  passport.use(
    new GoogleStrategy(googleConfig, async (access, refresh, profile, done) => {
      //id displayname / photos
    })
  );
};
