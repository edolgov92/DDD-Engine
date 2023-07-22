import { InfraError } from './infra-error';

export class DataNotFoundGatewayError extends InfraError {
  constructor(gatewayClass: { name: string }, dataName: string, params?: any) {
    super(
      'DataNotFoundGatewayError',
      `Data "${dataName}" was not found by gateway "${gatewayClass.name}"${
        params ? ` by params ${JSON.stringify(params)}` : ''
      }.`
    );
  }
}
