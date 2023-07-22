import { BaseError } from '../../core';

export class ServerError extends BaseError {
  constructor(stack?: string) {
    super('ServerError', 'Internal server error', stack);
  }
}
