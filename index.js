var path = require('path');
var fs = require('fs');
var debug = require('debug')('easy-server');
var express = require('express');
var cluster = require('cluster');
var MiddlewareManager = require('middleware-manager');

// Walk a directory to find all files inside.
var walk = function(dir, base) {
    base = base ? base + '/' : '';

    var results = [];
    var list = fs.readdirSync(dir);

    list.forEach(function(file) {
        var stat = fs.statSync(dir + '/' + file);
        if (stat && stat.isDirectory()) results = results.concat(walk(dir + '/' + file, base + file));
        else results.push(base + file);
    });

    return results;
}

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
    walk(middlewareBase).forEach(function(file) {
        if(file.substr(file.length-3) == '.js') {
            var middleware = require(middlewareBase + '/' + file);

            if(typeof(middleware) === 'function') {
                self.middleware.register(file.substr(0, file.length-3), middleware);

                self.debug('Loaded middleware in file', file);
            }
            else {
                self.debug('Ignored', file, 'middleware, as no function was exported');
            }
        }
    });

    var controllersBase = path.resolve(self.opts.controllers);
    walk(controllersBase).forEach(function(file) {
        if(file.substr(file.length-3) == '.js') {
            var controllerFile = require(controllersBase + '/' + file);
            
            if( /(\/|^)_/.test(file) ) {
                // Ignore files and directories beginning with _
                return self.debug('Ignored private file %s', file);
            }

            if(typeof(controllerFile.controller) === 'function') {
                controllerFile.controller(self);
                self.debug('Loaded controller in file', file);
            }
            else {
                self.debug('Ignored %s as no controller function was exported', file);
            }
        }
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