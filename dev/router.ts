import {Router} from 'express';
const debug = require('debug')('easy-server:router');
import {Server} from './shared/server';

export function getRouter(controllersBase: string, server: Server): Router {
  const app: any = Router();
  app.middleware = server.middleware;
  app.debug = server.debug;
  app.easyOptions = server.easyOptions;

  debug('Loading controllers');
  const controllers = require('require-all')({
    dirname: controllersBase,
    filter: /^(((?!\/_).)*)\.js$/,
    excludeDirs: /^\.(git|svn)$/,
    recursive: true,
  });
  Object.keys(controllers).forEach(file => {
    const module = controllers[file];
    if (module.controller) {
      return module.controller(app);
    }
    console.warn('Ignored %s as no controller function was exported', file);
  });
  debug('Loaded controllers');

  return app;
}
