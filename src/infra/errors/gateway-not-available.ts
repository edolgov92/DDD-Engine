import { BaseError } from '../../core';

export class GatewayNotAvailableError extends BaseError {
  constructor(gatewayClass: { name: string }, error?: any) {
    super(
      'GatewayNotAvailableError',
      `Was not able to retrieve data from gateway "${gatewayClass.name}".${
        error ? `\n${JSON.stringify(error, null, 2)}` : ''
      }`
    );
  }
}
