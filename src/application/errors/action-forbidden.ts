import { BaseError } from '../../core';

export class ActionForbiddenApplicationError extends BaseError {
  constructor(action?: string) {
    super('ActionForbiddenApplicationError', `Action forbidden${action ? ` - ${action}` : ''}`);
  }
}
