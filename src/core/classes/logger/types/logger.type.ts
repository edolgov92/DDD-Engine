import { LogLevel } from '../enums';

export type LogFunc = (value: any, scope?: LoggerScope) => void;

export type LogRecord = {
  timestamp: Date;
  level: LogLevel;
  scope?: LoggerScope;
  value: any;
};

export type LoggerScope = string | string[] | { name: string };
