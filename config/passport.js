var _ = require('underscore'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    LocalStrategy = require('passport-local').Strategy,
    TwitterStrategy = require('passport-twitter').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy,
    GitHubStrategy = require('passport-github').Strategy,
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
    LinkedinStrategy = require('passport-linkedin').Strategy,
    XingStrategy = require('passport-xing').Strategy;
  
module.exports = function (app, config, passport) {
  "use strict";

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  passport.deserializeUser(function(id, done) {
    User.findOne({ _id: id }, function (err, user) {
      done(err, user);
    });
  });

  passport.use(new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password'
    },
    function(email, password, done) {
      User.findOne({ email: email }, function (err, user) {
        if (err) return done(err);
        
        if (!user) {
          return done(null, false, { message: 'Unknown user' });
        }
        
        if (!user.authenticate(password)) {
          return done(null, false, { message: 'Invalid password' });
        }
        
        return done(null, user);
      })
    }
  ));

  // FIXME: refactor for dynamic callback uri
  function strategyFactory(provider, Strategy, createUserCallback) {
    if (config.auth[provider].enable) {
      passport.use(new Strategy(
        _.extend(config.auth[provider].options, { callbackURL: app.get('auth-return-uri') + '/auth/' + provider + '/callback' }),
        function(accessToken, refreshToken, profile, done) {
          User.findOne({ idField: profile.id }, function (err, user) {
            if (!user) {
              user = createUserCallback(profile);
              user.save(function (err) {
                if (err) console.log(err);
                return done(err, user);
              });
            } else {
              return done(err, user);
            }
          });
        }
      ));
    }
  }

  // use twitter strategy
  strategyFactory('twitter', TwitterStrategy, 
    function(profile) {
      return new User({
        name: profile.displayName,
        username: profile.username,
        provider: 'twitter',
        twitter: profile._json
    });
  });

  // use facebook strategy
  strategyFactory('facebook', FacebookStrategy,
    function(profile) {
      return new User({
        name: profile.displayName,
        email: profile.emails[0].value,
        username: profile.username,
        provider: 'facebook',
        facebook: profile._json
      });
  });

  // use github strategy
  strategyFactory('github', GitHubStrategy,
    function(profile) {
      return new User({
        name: profile.displayName,
        email: profile.emails[0].value,
        username: profile.username,
        provider: 'github',
        github: profile._json
      });
  });

  // use google strategy
  strategyFactory('google', GoogleStrategy,
    function(profile) {
      return new User({
        name: profile.displayName,
        email: profile.emails[0].value,
        username: profile.username,
        provider: 'google',
        google: profile._json
      });
  });

  // use linkedin strategy
  strategyFactory('linkedin', LinkedinStrategy,
    function(profile) {
      return new User({
        name: profile.displayName,
        email: profile.emails[0].value,
        username: profile.emails[0].value,
        provider: 'linkedin',
        linkedin: profile._json
      });
  });

  // use xing strategy
  strategyFactory('xing', XingStrategy,
    function(profile) {
      return new User({
        name: profile.displayName,
        email: profile.emails[0].value,
        username: profile.emails[0].value,
        provider: 'xing',
        xing: profile._json
      });
  });

};
