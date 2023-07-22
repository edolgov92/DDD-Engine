import { LOG_LEVEL_TO_STRING } from '../constants';
import { LogLevel } from '../enums';
import { LogWriter } from '../interfaces';
import { LogRecord } from '../types';

type LevelToColor = {
  [level in LogLevel]: string | undefined;
};

const levelToColor: LevelToColor = {
  [LogLevel.None]: undefined,
  [LogLevel.Error]: '\x1b[31m',
  [LogLevel.Warning]: '\x1b[33m',
  [LogLevel.Info]: '\x1b[36m',
  [LogLevel.Debug]: undefined,
  [LogLevel.Trace]: undefined,
};

export class ConsoleLogWriter implements LogWriter {
  write(record: LogRecord): string | undefined {
    const datetime: string = this.getDateTimeString(record.timestamp);
    let scope: string = '-';
    if (record.scope) {
      const scopes: string[] = Array.isArray(record.scope)
        ? record.scope
        : [typeof record.scope === 'string' ? record.scope : record.scope.name];
      scope = `[${scopes.join(' / ')}]`;
    }
    let logLevel: string = LOG_LEVEL_TO_STRING[record.level];
    for (let i = 0; i < 7; i++) {
      if (!logLevel[i]) {
        logLevel += ' ';
      }
    }
    const color: string | undefined = levelToColor[record.level as keyof LevelToColor];
    if (color) {
      logLevel = `${color}${logLevel}\x1b[0m`;
    }
    const line: string = `${logLevel} \x1b[2m- ${datetime}\x1b[0m \x1b[1m${scope}\x1b[0m ${record.value}`;
    if (record.level > LogLevel.None) {
      console.log(line);
      return `${logLevel} ${datetime} ${scope} ${record.value}`;
    }
  }

  private getDateTimeString(d?: Date): string {
    d ??= new Date();
    return `${d.getFullYear()}-${('00' + (d.getMonth() + 1)).slice(-2)}-${('00' + d.getDate()).slice(-2)} ${(
      '00' + d.getHours()
    ).slice(-2)}:${('00' + d.getMinutes()).slice(-2)}:${('00' + d.getSeconds()).slice(-2)}.${(
      '000' + d.getMilliseconds()
    ).slice(-3)}`;
  }
}
