import { BaseError } from '../../core';

export class DataNotFoundGatewayError extends BaseError {
  constructor(gatewayClass: { name: string }, dataName: string, params?: any) {
    super(
      'DataNotFoundGatewayError',
      `Data "${dataName}" was not found by gateway "${gatewayClass.name}"${
        params ? ` by params ${JSON.stringify(params)}` : ''
      }.`
    );
  }
}
