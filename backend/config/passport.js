const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value?.toLowerCase();
        if (!email) {
          return done(new Error("Google account did not return an email"), null);
        }

        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          user = await User.findOne({ email });
        }

        const photoUrl = profile.photos?.[0]?.value || "";

        if (!user) {
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName || "Google User",
            email,
            profileImage: photoUrl,
            role: "user"
          });
        } else {
          user.googleId = profile.id;
          if (!user.profileImagePath && photoUrl) {
            user.profileImage = photoUrl;
          }
          if (!user.name && profile.displayName) {
            user.name = profile.displayName;
          }
          await user.save();
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

module.exports = passport;
