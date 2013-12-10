var express = require('express'),
    mongoStore = require('connect-mongo')(express),
    flash = require('connect-flash'),
    helpers = require('view-helpers'),
    pkg = require('../package.json');

module.exports = function(app, config, passport) {
  "use strict";

  app.set('showStackError', true);

  // should be placed before express.static
  app.use(express.compress({
    filter: function(req, res) {
      return /json|text|javascript|css/.test(res.getHeader('Content-Type'))
    },
    level: 9
  }));

  app.use(express.favicon());
  app.use(express.static(config.root + '/public'));

  if (process.env.NODE_ENV !== 'test') {
    app.use(express.logger('dev'));
  }

  app.set('views', config.root + '/app/views');
  app.set('view engine', 'jade');

  app.configure(function() {
    // expose package.json to views
    app.use(function(req, res, next) {
      res.locals.pkg = pkg;
      next();
    });

    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.methodOverride());

    app.use(express.session({
      secret: 'F88442DF-83FE-4DBB-8175-C53DED6EBCD9',
      store: new mongoStore({
        url: config.db,
        collection : 'sessions'
      })
    }));

    app.use(passport.initialize());
    app.use(passport.session());
    app.use(flash());
    app.use(helpers(pkg.name));

    if (process.env.NODE_ENV !== 'test') {
      app.use(express.csrf());
      app.use(function (req, res, next){
        res.locals.csrf_token = req.csrfToken();
        next();
      })
    }

    app.use(app.router);

    // assume "not found" in the error msgs
    // is a 404. this is somewhat silly, but
    // valid, you can do whatever you like, set
    // properties, use instanceof etc.
    app.use(function(err, req, res, next) {
      if (err.message
          && (~err.message.indexOf('not found')
          || (~err.message.indexOf('Cast to ObjectId failed'))))
      {
        return next();
      }

      console.error(err.stack);

      // error page
      res.status(500).render('500', { error: err.stack });
    });

    // assume 404 since no middleware responded
    app.use(function(req, res, next) {
      res.status(404).render('404', {
        url: req.originalUrl,
        error: 'Not found'
      });
    });
  });

  // development env config
  app.configure('development', function () {
    app.locals.pretty = true;
  });
};
