import {Server} from './shared/server';
import requireAll from './shared/require-all';
import cluster = require('cluster');
import path = require('path');
import http = require('http');

function start(server: Server): http.Server {
  if (typeof (server.easyOptions.cluster) !== 'undefined') {
    if (cluster.isMaster) {
      for (var i = 0; i < server.easyOptions.cluster; i += 1) {
        cluster.fork();
      }
      server.debug('Started ' + server.easyOptions.cluster + ' forks from master process (in cluster mode)');

      return;
    }
  }

  if (typeof (server.easyOptions.title) !== 'undefined') {
    process.stdout.write(
      String.fromCharCode(27) + ']0;' + server.easyOptions.title + String.fromCharCode(7)
    );
  }

  var middlewareBase = path.resolve(server.easyOptions.middleware);
  var middleware = requireAll(middlewareBase, server.easyOptions.extensions);
  Object.keys(middleware).forEach(function(file) {
    var module = middleware[file];
    if (typeof (module) === 'function') {
      server.middleware.register(file, module);
      server.debug('Loaded middleware in file', file);
    } else {
      server.debug('Ignored %s middleware, as no function was exported', file);
    }
  });

  var controllersBase = path.resolve(server.easyOptions.controllers);
  var controllers = requireAll(controllersBase, server.easyOptions.extensions);
  Object.keys(controllers).forEach(function(file) {
    var module = controllers[file];
    if (typeof (module.controller) === 'function') {
      module.controller(server);
      server.debug('Loaded controller in file', file);
    }
    else {
      server.debug('Ignored %s as no controller function was exported', file);
    }
  });

  server.debug('Listening on port ' + server.easyOptions.port);
  return server.listen(server.easyOptions.port);
}

export = start;
