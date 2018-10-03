import { Express } from 'express';
import * as MiddlewareManager from 'middleware-manager';

export interface Options {
  middleware?: string;
  controllers?: string;
  port?: number;
  debug?: Function;
  autoStart?: boolean;
  cors?: boolean;
  cluster?: number;

  extensions?: string[];

  /** tab title */
  title?: string;

  /** sets the node keepalive timeout on sockets */
  keepAliveTimeout?: number;
}

export interface Server extends Express {
  easyOptions: Options;
  debug: Function;
  middleware: MiddlewareManager;
  start: Function;
}
