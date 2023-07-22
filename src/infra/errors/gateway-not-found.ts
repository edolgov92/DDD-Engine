import { BaseError } from '../../core';

export class GatewayNotFoundInfraError extends BaseError {
  constructor(gatewayName: string, ref: string) {
    super('GatewayNotFoundError', `Gateway "${gatewayName}" not found for ref "${ref}".`);
  }
}
