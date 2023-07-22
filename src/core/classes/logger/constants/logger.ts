import { LogLevel } from '../enums';

export const LOG_LEVEL_TO_STRING: { [level in LogLevel]: string } = {
  [LogLevel.None]: 'NONE',
  [LogLevel.Error]: 'ERROR',
  [LogLevel.Warning]: 'WARNING',
  [LogLevel.Info]: 'INFO',
  [LogLevel.Debug]: 'DEBUG',
  [LogLevel.Trace]: 'TRACE',
};

export const STRING_TO_LOG_LEVEL: { [str: string]: LogLevel } = {
  NONE: LogLevel.None,
  ERROR: LogLevel.Error,
  WARNING: LogLevel.Warning,
  INFO: LogLevel.Info,
  DEBUG: LogLevel.Debug,
  TRACE: LogLevel.Trace,
};
