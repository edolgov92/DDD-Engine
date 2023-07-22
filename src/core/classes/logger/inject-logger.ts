import { getContainer } from '../../dependency-injection';
import { LoggerToken } from './constants';
import { LogLevel } from './enums';
import { Logger } from './interfaces';
import { ConsoleLogWriter } from './log-writers';
import { LoggerImpl } from './logger';
import { LoggerScope } from './types';

export function getLogger(scope?: LoggerScope): Logger {
  try {
    const mainLogger = getContainer().resolve<Logger>(LoggerToken);
    if (!scope) {
      return mainLogger;
    }
    return mainLogger.clone(scope);
  } catch (ex) {
    return new LoggerImpl(new ConsoleLogWriter(), LogLevel.Trace);
  }
}

export function getLastLogs(count?: number): string[] {
  const mainLogger: Logger = getContainer().resolve<Logger>(LoggerToken);
  return mainLogger ? mainLogger.getLastLogs(count) : [];
}
