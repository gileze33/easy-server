import {Express} from 'express';
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
}

export interface Server extends Express {
  easyOptions: Options;
  debug: Function;
  middleware: MiddlewareManager;
  start: Function;
}
