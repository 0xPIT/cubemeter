var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    utils = require('../../lib/utils');

var login = function (req, res) {
  if (req.session.returnTo) {
    res.redirect(req.session.returnTo);
    delete req.session.returnTo;
    return;
  }
  res.redirect('/');
};

exports.signin = function (req, res) {};

exports.authCallback = login;

// show login form
exports.login = function (req, res) {
  res.render('users/login', {
    title: 'Login',
    message: req.flash('error')
  });
};

// show sign up form
exports.signup = function (req, res) {
  res.render('users/signup', {
    title: 'Sign up',
    user: new User()
  });
};

exports.logout = function (req, res) {
  req.logout();
  res.redirect('/login');
};

exports.session = login;

exports.create = function (req, res) {
  var user = new User(req.body);
  user.provider = 'local';
  user.save(function (err) {
    if (err) {
      console.log(JSON.stringify(err.errors));
      return res.render('users/signup', {
        _errors: utils.errors(err.errors),
        errors: err.errors,
        user: user,
        title: 'Sign up'
      });
    }

    req.logIn(user, function(err) {
      if (err) return next(err);
      return res.redirect('/');
    });
  });
};

exports.show = function (req, res) {
  var user = req.profile;
  res.render('users/show', {
    title: user.name,
    user: user
  });
};

exports.user = function (req, res, next, id) {
  User
    .findOne({ _id : id })
    .exec(function (err, user) {
      if (err) return next(err);
      if (!user) return next(new Error('Failed to load User ' + id));
      req.profile = user;
      next();
    });
};
