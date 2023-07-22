import { LogLevel } from '../enums';
import { LogFunc, LoggerScope, LogRecord } from '../types';

export interface Logger {
  trace: LogFunc;
  debug: LogFunc;
  info: LogFunc;
  warn: LogFunc;
  error: LogFunc;

  clone(scope?: LoggerScope, maxLevel?: LogLevel): Logger;
  getLastLogs(count?: number): string[];
  logEnv(env: any): void;
  logUnhandledExceptions(): void;
  updateScope(scope: LoggerScope): void;
}

export interface LogWriter {
  write: (record: LogRecord) => string | undefined;
}
