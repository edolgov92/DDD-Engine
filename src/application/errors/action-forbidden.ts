import { ApplicationError } from './application-error';

export class ActionForbiddenApplicationError extends ApplicationError {
  constructor(action?: string) {
    super('ActionForbiddenApplicationError', `Action forbidden${action ? ` - ${action}` : ''}`);
  }
}
