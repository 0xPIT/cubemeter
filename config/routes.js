
var async = require('async'),
    _ = require('underscore'),
    auth = require('./middlewares/authorization'),
    root = require('../app/controllers/root'),
    users = require('../app/controllers/users'),
    cube = require('../app/controllers/cube'),
    port = process.env.PORT || 3000;


function makeCallbackUrl(req, service) {
  "use strict";
  return req.protocol + '://' + req.host + ':' + port + '/auth/'+ service + '/callback';
}

module.exports = function (app, passport) {
  "use strict";

  // user routes
  app.get('/login', users.login);
  app.get('/signup', users.signup);
  app.get('/logout', users.logout);

  app.post('/users', users.create);
  app.post('/users/session',
    passport.authenticate('local', {
      failureRedirect: '/login',
      failureFlash: 'Invalid email or password.'
    }), users.session);
  app.get('/users/:userId', users.show);


  function authMethodFactory(service, extraoptions) {
    var options = {
      successRedirect: '/auth/' + service + '/callback',
      failureRedirect: '/login',
      failureFlash: true 
    };

    if (extraoptions) {
      options = _.extend(options, extraoptions);
    }

    app.get(
      '/auth/' + service,
      function(req, res, next) {
        return passport.authenticate(
          service,
          _.extend(options, { callbackURL: makeCallbackUrl(req, service) }),
          users.signin
        )(req, res, next);
      }
    );

    app.get(
      '/auth/' + service + '/callback',
      passport.authenticate(service, {
        failureRedirect: '/login'
      }),
      users.authCallback
    );
  }

  authMethodFactory('github');
  authMethodFactory('twitter');
  authMethodFactory('facebook');
  authMethodFactory('xing');
  authMethodFactory('google', { scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ]}
  );
  authMethodFactory('linkedin', { scope: [
      'r_emailaddress',
      'r_basicprofile'
    ]}
  );

  app.param('userId', users.user)

  app.get('/', root.index);
  app.get('/cube', auth.requiresLogin, cube.index);
  app.get('/meter', auth.requiresLogin, cube.meter);
};
