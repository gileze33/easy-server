if (process.env.NODE_ENV === 'production') {
  var err = new Error('You\'re using `easy-server-dev` in a production environment. You shouldn\'t. Use `easy-server` instead.');
  err.name = 'EnvWarning';
  console.warn(err.stack);
}

var path = require('path');
var fs = require('fs');
var debug = require('debug')('easy-server');
var express = require('express');
var cluster = require('cluster');
var MiddlewareManager = require('middleware-manager');
var chokidar = require('chokidar');
var debounce = require('js-debounce');

var APIServer = function constructor(opts) {
    var self = this;

    var o = this.opts = {
        middleware: './app/middleware',
        controllers: './app/controllers',
        port: 8080,
        debug: debug,
        autoStart: true
    };

    for (var p in opts) {
        if (!opts.hasOwnProperty(p)) continue;

        o[p] = opts[p];
    }

    self.debug = self.opts.debug;

    self.server = express();
    self.middleware = new MiddlewareManager();

    self.setupRouteHandlers();

    if(self.opts.autoStart === true) {
        self.start();
    }

    if (self.opts.cors === true) {
        self.server.use(require('./shared/cors.js'));
        self.debug('Added CORS middleware');
    }

    return self;
};

APIServer.prototype.start = function start() {
    var self = this;

    if(typeof(self.opts.cluster) !== 'undefined') {
        if(cluster.isMaster) {
            for (var i = 0; i < self.opts.cluster; i += 1) {
                cluster.fork();
            }
            self.debug('Started '+self.opts.cluster+' forks from master process (in cluster mode)');

            return;
        }
    }

    if(typeof(self.opts.title) !== 'undefined') {
        process.stdout.write(
            String.fromCharCode(27) + "]0;" + self.opts.title + String.fromCharCode(7)
        );
    }

    var middlewareBase = path.resolve(self.opts.middleware);
    var middleware = require('require-all')({
      dirname     :  middlewareBase,
      filter      :  /^((?!\/_).)*\.js$/,
      excludeDirs :  /^\.(git|svn)$/,
      recursive   : true,
    });
    Object.keys(middleware).forEach(function (file) {
      var module = middleware[file];
      if (typeof(module) === 'function') {
        self.middleware.register(file.substr(0, file.length-3), module);
        self.debug('Loaded middleware in file', file);
      } else {
        self.debug('Ignored %s middleware, as no function was exported', file);
      }
    });

    var controllersBase = path.resolve(self.opts.controllers);
    self.router = require('./router').getRouter(controllersBase, self);
    self.server.use(function (req, res, next) {
      self.router(req, res, next);
    });

    // Do "hot-reloading" of express stuff on the server
    // Throw away cached modules and re-require next time
    // Ensure there's no important state in there!
    var watcher = chokidar.watch(controllersBase);
    watcher.on('ready', function() {
      self.debug('Watching controllers for changes...');
      watcher.on('all', function() {
        debounce('easy-server-dev:clear-server-cache', 1000, function () {
          self.debug("Clearing server module cache");
          self.router = null;
          Object.keys(require.cache).forEach(function(id) {
            if (id.indexOf(controllersBase) > -1) delete require.cache[id];
          });
          delete require.cache[require.resolve('./router')];
          self.router = require('./router').getRouter(controllersBase, self);
        });
      });
    });

    self.server.listen(self.opts.port);
    self.debug('Listening on port '+self.opts.port);
};

// route handlers
APIServer.prototype.setupRouteHandlers = function setupRouteHandlers() {
    var methods = ['get', 'post', 'put', 'delete', 'all', 'use'];
    for(var i=0; i<methods.length; i++) {
        this[methods[i]] = this.server[methods[i]].bind(this.server);
    }
};

module.exports = APIServer;
