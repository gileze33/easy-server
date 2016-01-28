import {Express} from 'express';

export interface Options {
  middleware?: string;
  controllers?: string;
  port?: number;
  debug?: Function;
  autoStart?: boolean;
  cors?: boolean;
  cluster?: number;

  /** tab title */
  title?: string;
}

export interface Server extends Express {
  easyOptions: Options;
  debug: Function;
  middleware: any;
  start: Function;
}
