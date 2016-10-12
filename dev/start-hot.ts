import {Server} from './shared/server';
import requireAll from './shared/require-all';
import path = require('path');
import http = require('http');

const chokidar = require('chokidar');
const debounce = require('js-debounce');

function start(server: Server): http.Server {
  if (typeof (server.easyOptions.title) !== 'undefined') {
    process.stdout.write(
      String.fromCharCode(27) + ']0;' + server.easyOptions.title + String.fromCharCode(7)
    );
  }

  const middlewareBase = path.resolve(server.easyOptions.middleware);
  const middleware = requireAll(middlewareBase, server.easyOptions.extensions);
  Object.keys(middleware).forEach(function(file) {
    const module = middleware[file];
    if (typeof (module) === 'function') {
      server.middleware.register(file, module);
      server.debug('Loaded middleware in file', file);
    } else {
      server.debug('Ignored %s middleware, as no function was exported', file);
    }
  });

  const controllersBase = path.resolve(server.easyOptions.controllers);
  let router = require('./router').getRouter(controllersBase, server);
  server.use(function(req, res, next) {
    router(req, res, next);
  });

  // Do "hot-reloading" of express stuff on the server
  // Throw away cached modules and re-require next time
  // Ensure there's no important state in there!
  const watcher = chokidar.watch(controllersBase);
  watcher.on('ready', function() {
    server.debug('Watching controllers for changes...');
    watcher.on('all', function() {
      debounce('easy-server-dev:clear-server-cache', 1000, function() {
        server.debug('Clearing server module cache');
        router = null;
        Object.keys(require.cache).forEach(function(id) {
          if (id.indexOf(controllersBase) > -1) delete require.cache[id];
        });
        delete require.cache[require.resolve('./router')];
        router = require('./router').getRouter(controllersBase, server);
      });
    });
  });

  server.debug('Listening on port ' + server.easyOptions.port);
  return server.listen(server.easyOptions.port);
}

export = start;
