const User = require("../models/User");
const GitHubStrategy = require('passport-github2').Strategy;
var crypto = require("crypto");

module.exports = function (passport) {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: '/auth/github/callback',
  },
    function (accessToken, refreshToken, profile, cb) {
      User.findById(profile.id, (err, user) => {
        if (err) return cb(err, user);
        if (!user) return User.create({
          _id: profile.id,
          token: crypto.randomBytes(20).toString('hex')
        }).then((err, user) => cb(err, user));
        user.token = crypto.randomBytes(20).toString('hex');
        return user.save((err, user) => cb(err, user))
      });
    }));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => done(err, user));
  });
};
