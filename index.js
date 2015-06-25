var path = require('path');
var debug = require('debug')('easy-server');
var express = require('express');
var cluster = require('cluster');
var MiddlewareManager = require('middleware-manager');

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

    var middlewareBase = path.resolve(self.opts.middleware);
    require("fs").readdirSync(middlewareBase).forEach(function(file) {
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
    require("fs").readdirSync(controllersBase).forEach(function(file) {
        if(file.substr(file.length-3) == '.js') {
            var controllerFile = require(controllersBase + '/' + file);

            if(typeof(controllerFile.controller) === 'function') {
                controllerFile.controller(self);
                self.debug('Loaded controller in file', file);
            }
            else {
                self.debug('Ignored', file, 'as no controller function was exported');
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