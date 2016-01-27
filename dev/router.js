var express = require('express');
var debug = require('debug')('easy-server:router');

exports.getRouter = function(controllersBase, server) {
  var app = express.Router();
  app.middleware = server.middleware;
  app.debug = server.debug;

  debug('Loading controllers');
  var controllers = require('require-all')({
    dirname     :  controllersBase,
    filter      :  /^((?!\/_).)*\.js$/,
    excludeDirs :  /^\.(git|svn)$/,
    recursive   : true,
  });
  Object.keys(controllers).forEach(function (file) {
    var module = controllers[file];
    if (module.controller) {
      return module.controller(app);
    }
    console.warn('Ignored %s as no controller function was exported', file);
  });
  debug('Loaded controllers');

  return app;
}
