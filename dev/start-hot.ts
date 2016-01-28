import {Server} from './shared/server';
import cluster = require('cluster');
import path = require('path');
import http = require('http');

const chokidar = require('chokidar');
const debounce = require('js-debounce');

function start(server: Server): http.Server {
  if (typeof (server.easyOptions.cluster) !== 'undefined') {
    if (cluster.isMaster) {
      for (let i = 0; i < server.easyOptions.cluster; i += 1) {
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

  const middlewareBase = path.resolve(server.easyOptions.middleware);
  const middleware = require('require-all')({
    dirname: middlewareBase,
    filter: /^((?!\/_).)*\.js$/,
    excludeDirs: /^\.(git|svn)$/,
    recursive: true,
  });
  Object.keys(middleware).forEach(function(file) {
    const module = middleware[file];
    if (typeof (module) === 'function') {
      server.middleware.register(file.substr(0, file.length - 3), module);
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
        router = require('./router').getRouter(controllersBase, self);
      });
    });
  });

  server.debug('Listening on port ' + server.easyOptions.port);
  return server.listen(server.easyOptions.port);
}

export = start;
