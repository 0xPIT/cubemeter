var env = process.env.NODE_ENV || 'development',
    os = require('os'),
    fs = require('fs'),
    path = require('path'),
    http = require('http'),
    config = require('./config/config')[env],
    _ = require('underscore'),
    mongoose = require('mongoose'),
    express = require('express'),
    passport = require('passport'),
    cube = require('cube'),
    Emitter = cube.emitter("ws://localhost:1080"),
    port = process.env.PORT || 3000,
    server,
    Services = [];

// Load Services
var servicesPath = path.join(__dirname, 'services');
fs.readdirSync(servicesPath).forEach(function (file) {
  if (~file.indexOf('.js')) {
    Services.push(require(path.join(servicesPath, file)));
  }
});

// Run Services
Services.forEach(function(service) {
  service.setup(Emitter, config);
});

mongoose.connect(config.db);

// Bootstrap models
var modelsPath = path.join(__dirname, 'app', 'models');
fs.readdirSync(modelsPath).forEach(function (file) {
  if (~file.indexOf('.js')) {
    require(path.join(modelsPath, file));
  }
});

var app = express();

// FIXME: auth callback uri must be generated dynamically
app.set('auth-return-uri', 'http://localhost:3000');

require('./config/passport')(app, config, passport);
require('./config/express')(app, config, passport);
require('./config/routes')(app, passport);

server = http.createServer(app);
server.listen(port);
console.log('Started on port ' + port);

// expose app
exports = module.exports = app;

function shutdown() {
  Services.forEach(function(service) {
    service.shutdown();
  });

  Emitter.close();

  process.exit();
}

process.on('SIGINT', shutdown);
