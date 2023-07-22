import type { Logger } from '../logger';
import { getLogger } from '../logger';

export abstract class WithLogger {
  protected constructor() {
    this._logger = getLogger(this.constructor.name);
  }

  protected get logger(): Logger {
    if (!this._logger) {
      this._logger = getLogger(this.constructor.name);
    }
    return this._logger;
  }

  private _logger: Logger;
}
