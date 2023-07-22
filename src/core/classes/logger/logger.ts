import { LogLevel } from './enums';
import { Logger, LogWriter } from './interfaces';
import { LogFunc, LoggerScope } from './types';

export class LoggerImpl implements Logger {
  static lastLogs: string[] = [];

  constructor(
    private logWriter: LogWriter,
    private maxLevel: LogLevel = LogLevel.Info,
    private scope: LoggerScope = '',
    private maxLogsToStore: number = 30000
  ) {}

  trace: LogFunc = (value: any, scope?: LoggerScope) => this.log(LogLevel.Trace, value, scope);
  debug: LogFunc = (value: any, scope?: LoggerScope) => this.log(LogLevel.Debug, value, scope);
  info: LogFunc = (value: any, scope?: LoggerScope) => this.log(LogLevel.Info, value, scope);
  warn: LogFunc = (value: any, scope?: LoggerScope) => this.log(LogLevel.Warning, value, scope);
  error: LogFunc = (value: any, scope?: LoggerScope) => this.log(LogLevel.Error, value, scope);

  clone(scope?: LoggerScope, maxLevel?: LogLevel): Logger {
    return new LoggerImpl(this.logWriter, maxLevel ?? this.maxLevel, scope ?? this.scope);
  }

  getLastLogs(count?: number): string[] {
    if (count && count < LoggerImpl.lastLogs.length) {
      return LoggerImpl.lastLogs.slice(count * -1);
    } else {
      return LoggerImpl.lastLogs;
    }
  }

  logEnv(env: any): void {
    if (env && typeof env === 'object') {
      this.debug(`Env: ${JSON.stringify(env)}`);
      this.debug(`Env Pretty: ${JSON.stringify(env, null, 2)}`);
    }
  }

  logUnhandledExceptions(): void {
    process.on('uncaughtException', (error: Error) => {
      this.error(`### UncaughtException: ${this.getErrorString(error)}`);
    });

    process.on('unhandledRejection', (error: Error) => {
      this.error(`### UnhandledRejection: ${this.getErrorString(error)}`);
    });
  }

  updateScope(scope: LoggerScope): void {
    this.scope = scope;
  }

  protected log(level: LogLevel, value: any, scope?: LoggerScope): void {
    if (this.maxLevel < level) {
      return;
    }
    const result: string | undefined = this.logWriter.write({
      timestamp: new Date(),
      level,
      scope: scope || this.scope,
      value,
    });
    if (result) {
      LoggerImpl.lastLogs.push(result);
      if (LoggerImpl.lastLogs.length > this.maxLogsToStore) {
        LoggerImpl.lastLogs.splice(0, 1);
      }
    }
  }

  private getErrorString(error: Error): string {
    const message: string = error && error.message ? error.message : 'An unknown error has happened';
    const stack: string | undefined = error && error.stack ? error.stack : undefined;
    return `${message}${stack ? `, Stack: ${stack.replace('\n', '').replace('   ', '')}` : ''}`;
  }
}
