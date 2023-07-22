import { InfraError } from './infra-error';

export class ServerError extends InfraError {
  constructor(stack?: string) {
    super('ServerError', 'Internal server error', stack);
  }
}
