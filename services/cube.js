var os = require('os'),
    _ = require('underscore'),
    cube = require('cube'),
    collectorServer,
    evaluatorServer;

function CubeService(options) {
  "use strict";
  if (options) {
    this.options = options;
  }
}

CubeService.prototype.setup = function (emitter, config)
{
  "use strict";
  collectorServer = cube.server(config.cube.collector);
  evaluatorServer = cube.server(config.cube.evaluator);

  collectorServer.register = function(db, endpoints) {
    cube.collector.register(db, endpoints);
  };

  evaluatorServer.register = function(db, endpoints) {
    cube.evaluator.register(db, endpoints);
  };

  collectorServer.start();
  evaluatorServer.start();
}

CubeService.prototype.shutdown = function () {
  "use strict";
}

exports = module.exports = new CubeService();
exports.CubeService = CubeService;
exports.ServiceName = 'CubeService';
