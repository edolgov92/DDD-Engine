import { LOG_LEVEL_TO_STRING, STRING_TO_LOG_LEVEL } from '../constants';
import { LogLevel } from '../enums';

export function logLevelToString(level: LogLevel): string {
  return LOG_LEVEL_TO_STRING[level];
}

export function stringToLogLevel(str: string): LogLevel {
  return STRING_TO_LOG_LEVEL[str];
}
